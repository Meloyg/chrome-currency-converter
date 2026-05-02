// Cache exchange rates in memory and storage
let ratesCache = {};
let lastFetch = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

async function fetchRates(base) {
  const now = Date.now();
  if (ratesCache[base] && now - lastFetch < CACHE_DURATION) {
    return ratesCache[base];
  }
  try {
    const resp = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
    const data = await resp.json();
    ratesCache[base] = data.rates;
    lastFetch = now;
    // Also cache in storage for content script access
    await chrome.storage.local.set({ rates: ratesCache, lastFetch });
    return data.rates;
  } catch (e) {
    console.error('Currency Converter: failed to fetch rates', e);
    // Try storage fallback
    const stored = await chrome.storage.local.get(['rates']);
    if (stored.rates && stored.rates[base]) return stored.rates[base];
    return null;
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'getRates') {
    fetchRates(msg.base).then(rates => sendResponse({ rates }));
    return true; // async response
  }
  if (msg.type === 'getSettings') {
    chrome.storage.sync.get({ targetCurrency: 'CNY', autoDetect: true }, sendResponse);
    return true;
  }
});

// Fetch default rates on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ targetCurrency: 'CNY', autoDetect: true });
});
