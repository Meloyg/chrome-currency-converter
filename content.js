(() => {
  const CURRENCY_PATTERNS = [
    { regex: /US\$\s?([\d,]+\.?\d*)/g, currency: 'USD' },
    { regex: /A\$\s?([\d,]+\.?\d*)/g, currency: 'AUD' },
    { regex: /CA\$\s?([\d,]+\.?\d*)/g, currency: 'CAD' },
    { regex: /NZ\$\s?([\d,]+\.?\d*)/g, currency: 'NZD' },
    { regex: /€\s?([\d,]+\.?\d*)/g, currency: 'EUR' },
    { regex: /([\d,]+\.?\d*)\s?€/g, currency: 'EUR', amountGroup: 1 },
    { regex: /£\s?([\d,]+\.?\d*)/g, currency: 'GBP' },
    { regex: /¥\s?([\d,]+\.?\d*)/g, currency: 'JPY' },
    { regex: /\$\s?([\d,]+\.?\d*)/g, currency: 'NZD' }, // bare $ defaults to NZD
  ];

  const BADGE_CLASS = 'cc-ext-badge';
  const PROCESSED_ATTR = 'data-cc-processed';

  let settings = { targetCurrency: 'CNY', autoDetect: true };
  let allRates = {};

  function parseAmount(str) {
    return parseFloat(str.replace(/,/g, ''));
  }

  function convert(amount, fromCurrency, toCurrency, rates) {
    if (fromCurrency === toCurrency) return null;
    if (!rates) return null;
    const rate = rates[toCurrency];
    if (!rate) return null;
    return amount * rate;
  }

  function formatConverted(amount, currency) {
    const symbols = { CNY: '¥', USD: '$', EUR: '€', GBP: '£', JPY: '¥', NZD: 'NZ$', AUD: 'A$', CAD: 'CA$' };
    const sym = symbols[currency] || currency + ' ';
    if (currency === 'JPY') return `≈ ${sym}${Math.round(amount)}`;
    return `≈ ${sym}${amount.toFixed(2)}`;
  }

  function getTextNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest('script, style, textarea, input, [contenteditable], .' + BADGE_CLASS)) return NodeFilter.FILTER_REJECT;
        if (parent.hasAttribute(PROCESSED_ATTR)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }

  function processTextNode(node) {
    const text = node.textContent;
    let matches = [];

    for (const pattern of CURRENCY_PATTERNS) {
      const re = new RegExp(pattern.regex.source, pattern.regex.flags);
      let m;
      while ((m = re.exec(text)) !== null) {
        const amountStr = m[pattern.amountGroup || 1];
        if (!amountStr) continue;
        const amount = parseAmount(amountStr);
        if (isNaN(amount) || amount <= 0 || amount > 999999999) continue;
        matches.push({ index: m.index, length: m[0].length, amount, currency: pattern.currency });
      }
    }

    if (matches.length === 0) return;

    // Deduplicate overlapping matches (keep first/longest)
    matches.sort((a, b) => a.index - b.index);
    const filtered = [];
    let lastEnd = -1;
    for (const m of matches) {
      if (m.index >= lastEnd) {
        filtered.push(m);
        lastEnd = m.index + m.length;
      }
    }

    if (filtered.length === 0) return;

    const parent = node.parentElement;
    if (!parent) return;
    parent.setAttribute(PROCESSED_ATTR, '1');

    const frag = document.createDocumentFragment();
    let cursor = 0;

    for (const match of filtered) {
      if (match.index > cursor) {
        frag.appendChild(document.createTextNode(text.slice(cursor, match.index)));
      }
      frag.appendChild(document.createTextNode(text.slice(match.index, match.index + match.length)));

      const rates = allRates[match.currency];
      const converted = convert(match.amount, match.currency, settings.targetCurrency, rates);
      if (converted !== null) {
        const badge = document.createElement('span');
        badge.className = BADGE_CLASS;
        badge.textContent = formatConverted(converted, settings.targetCurrency);
        frag.appendChild(badge);
      }

      cursor = match.index + match.length;
    }

    if (cursor < text.length) {
      frag.appendChild(document.createTextNode(text.slice(cursor)));
    }

    node.replaceWith(frag);
  }

  async function loadRatesForCurrency(currency) {
    if (allRates[currency]) return;
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ type: 'getRates', base: currency }, resp => {
        if (resp && resp.rates) allRates[currency] = resp.rates;
        resolve();
      });
    });
  }

  // Handle split-span prices like: <span>$</span><span>1,057</span><span>.63</span>
  function processSplitPrices(root) {
    // Look for containers with multiple child spans that together form a price
    const containers = root.querySelectorAll('.item-price-amount, .d-flex, [class*="price"]');
    for (const container of containers) {
      if (container.hasAttribute(PROCESSED_ATTR)) continue;
      if (container.querySelector('.' + BADGE_CLASS)) continue;
      // Collect text from all child elements
      const text = container.textContent.replace(/\s+/g, '').trim();
      // Try to match a price pattern
      const m = text.match(/^(NZ\$|US\$|A\$|CA\$|\$|€|£|¥)([\d,]+\.?\d*)$/);
      if (!m) continue;
      const symbol = m[1];
      const amount = parseAmount(m[2]);
      if (isNaN(amount) || amount <= 0 || amount > 999999999) continue;
      // Determine currency from symbol
      let currency = 'NZD';
      if (symbol === 'US$') currency = 'USD';
      else if (symbol === 'A$') currency = 'AUD';
      else if (symbol === 'CA$') currency = 'CAD';
      else if (symbol === '€') currency = 'EUR';
      else if (symbol === '£') currency = 'GBP';
      else if (symbol === '¥') currency = 'JPY';
      // Convert
      const rates = allRates[currency];
      const converted = convert(amount, currency, settings.targetCurrency, rates);
      if (converted === null) continue;
      // Add badge
      container.setAttribute(PROCESSED_ATTR, '1');
      const badge = document.createElement('span');
      badge.className = BADGE_CLASS;
      badge.textContent = formatConverted(converted, settings.targetCurrency);
      container.appendChild(badge);
    }
  }

  async function run() {
    // Get settings
    const s = await new Promise(resolve => {
      chrome.runtime.sendMessage({ type: 'getSettings' }, resolve);
    });
    if (s) Object.assign(settings, s);

    // Preload rates for common currencies
    const currencies = ['USD', 'EUR', 'GBP', 'NZD', 'AUD', 'CAD', 'JPY'];
    await Promise.all(currencies.map(c => loadRatesForCurrency(c)));

    // Process page - text nodes first, then split-span prices
    const textNodes = getTextNodes(document.body);
    for (const node of textNodes) {
      processTextNode(node);
    }
    processSplitPrices(document.body);
  }

  // Run on load
  run();

  // Observe DOM changes for dynamic pages
  const observer = new MutationObserver(mutations => {
    for (const mut of mutations) {
      for (const node of mut.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE && !node.classList?.contains(BADGE_CLASS)) {
          const textNodes = getTextNodes(node);
          for (const tn of textNodes) processTextNode(tn);
          processSplitPrices(node);
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
