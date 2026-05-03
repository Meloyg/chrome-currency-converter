const { describe, it } = require('node:test');
const assert = require('node:assert');

// Extract testable functions from content.js by evaluating a stripped version
// Since content.js is an IIFE with browser APIs, we extract the pure logic

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

const CURRENCY_PATTERNS = [
  { regex: /US\$\s?([\d,]+\.?\d*)/g, currency: 'USD' },
  { regex: /A\$\s?([\d,]+\.?\d*)/g, currency: 'AUD' },
  { regex: /CA\$\s?([\d,]+\.?\d*)/g, currency: 'CAD' },
  { regex: /NZ\$\s?([\d,]+\.?\d*)/g, currency: 'NZD' },
  { regex: /€\s?([\d,]+\.?\d*)/g, currency: 'EUR' },
  { regex: /([\d,]+\.?\d*)\s?€/g, currency: 'EUR', amountGroup: 1 },
  { regex: /£\s?([\d,]+\.?\d*)/g, currency: 'GBP' },
  { regex: /¥\s?([\d,]+\.?\d*)/g, currency: 'JPY' },
  { regex: /\$\s?([\d,]+\.?\d*)/g, currency: 'NZD' },
];

function detectPrices(text) {
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
  // Deduplicate overlapping
  matches.sort((a, b) => a.index - b.index);
  const filtered = [];
  let lastEnd = -1;
  for (const m of matches) {
    if (m.index >= lastEnd) {
      filtered.push(m);
      lastEnd = m.index + m.length;
    }
  }
  return filtered;
}

// --- Tests ---

describe('parseAmount', () => {
  it('parses simple number', () => {
    assert.strictEqual(parseAmount('84.99'), 84.99);
  });
  it('parses number with commas', () => {
    assert.strictEqual(parseAmount('1,057.63'), 1057.63);
  });
  it('parses large number', () => {
    assert.strictEqual(parseAmount('12,345,678.90'), 12345678.9);
  });
  it('parses integer', () => {
    assert.strictEqual(parseAmount('62'), 62);
  });
});

describe('convert', () => {
  const rates = { CNY: 4.005, USD: 0.588, EUR: 0.521 };

  it('converts NZD to CNY', () => {
    assert.strictEqual(convert(100, 'NZD', 'CNY', rates), 400.5);
  });
  it('returns null for same currency', () => {
    assert.strictEqual(convert(100, 'NZD', 'NZD', rates), null);
  });
  it('returns null for missing rates', () => {
    assert.strictEqual(convert(100, 'NZD', 'CNY', null), null);
  });
  it('returns null for missing target in rates', () => {
    assert.strictEqual(convert(100, 'NZD', 'GBP', { CNY: 4.0 }), null);
  });
});

describe('formatConverted', () => {
  it('formats CNY', () => {
    assert.strictEqual(formatConverted(580.37, 'CNY'), '≈ ¥580.37');
  });
  it('formats USD', () => {
    assert.strictEqual(formatConverted(58.8, 'USD'), '≈ $58.80');
  });
  it('rounds JPY', () => {
    assert.strictEqual(formatConverted(8765.4, 'JPY'), '≈ ¥8765');
  });
  it('formats EUR', () => {
    assert.strictEqual(formatConverted(52.1, 'EUR'), '≈ €52.10');
  });
});

describe('detectPrices', () => {
  it('detects bare $ as NZD', () => {
    const result = detectPrices('Price: $84.99');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].currency, 'NZD');
    assert.strictEqual(result[0].amount, 84.99);
  });

  it('detects US$', () => {
    const result = detectPrices('US$49.99');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].currency, 'USD');
  });

  it('detects A$', () => {
    const result = detectPrices('A$120.00');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].currency, 'AUD');
  });

  it('detects NZ$', () => {
    const result = detectPrices('NZ$84.99');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].currency, 'NZD');
  });

  it('detects EUR with symbol before', () => {
    const result = detectPrices('€199.99');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].currency, 'EUR');
  });

  it('detects EUR with symbol after', () => {
    const result = detectPrices('199.99€');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].currency, 'EUR');
    assert.strictEqual(result[0].amount, 199.99);
  });

  it('detects GBP', () => {
    const result = detectPrices('£75.50');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].currency, 'GBP');
  });

  it('detects multiple prices in text', () => {
    const result = detectPrices('Was $100.00, now $79.99');
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].amount, 100);
    assert.strictEqual(result[1].amount, 79.99);
  });

  it('handles prices with commas', () => {
    const result = detectPrices('$1,129.00');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].amount, 1129);
  });

  it('NZ$ takes priority over bare $ for NZ$84.99', () => {
    const result = detectPrices('NZ$84.99');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].currency, 'NZD');
  });

  it('rejects zero amounts', () => {
    const result = detectPrices('$0.00');
    assert.strictEqual(result.length, 0);
  });

  it('rejects negative-looking patterns', () => {
    const result = detectPrices('$');
    assert.strictEqual(result.length, 0);
  });

  it('handles integer prices', () => {
    const result = detectPrices('You save $62');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].amount, 62);
  });
});

describe('split price text matching', () => {
  // Simulates the processSplitPrices regex
  const splitRegex = /^(NZ\$|US\$|A\$|CA\$|\$|€|£|¥)([\d,]+\.?\d*)$/;

  it('matches collapsed split price text', () => {
    const text = '$1,057.63'; // after .replace(/\\s+/g, '').trim()
    const m = text.match(splitRegex);
    assert.ok(m);
    assert.strictEqual(m[1], '$');
    assert.strictEqual(m[2], '1,057.63');
  });

  it('matches NZ$ prefix', () => {
    const m = 'NZ$84.99'.match(splitRegex);
    assert.ok(m);
    assert.strictEqual(m[1], 'NZ$');
  });

  it('rejects text with extra content', () => {
    const m = 'Was$84.99extra'.match(splitRegex);
    assert.strictEqual(m, null);
  });
});
