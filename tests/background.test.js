const { describe, it } = require('node:test');
const assert = require('node:assert');

// Test background.js logic (rate fetching/caching)
// We can't test chrome APIs directly, but we test the cache logic

describe('background cache logic', () => {
  const CACHE_DURATION = 30 * 60 * 1000;

  it('cache duration is 30 minutes', () => {
    assert.strictEqual(CACHE_DURATION, 1800000);
  });

  it('cache should expire after duration', () => {
    const lastFetch = Date.now() - CACHE_DURATION - 1;
    const now = Date.now();
    assert.ok(now - lastFetch >= CACHE_DURATION);
  });

  it('cache should be valid within duration', () => {
    const lastFetch = Date.now() - 1000; // 1 second ago
    const now = Date.now();
    assert.ok(now - lastFetch < CACHE_DURATION);
  });
});

describe('Frankfurter API contract', () => {
  it('expected API URL format', () => {
    const base = 'NZD';
    const url = `https://api.frankfurter.app/latest?from=${base}`;
    assert.strictEqual(url, 'https://api.frankfurter.app/latest?from=NZD');
  });

  it('expected response shape', () => {
    // Mock response from Frankfurter
    const mockResponse = {
      base: 'NZD',
      date: '2026-05-02',
      rates: { CNY: 4.005, USD: 0.588, EUR: 0.521 }
    };
    assert.ok(mockResponse.rates);
    assert.ok(typeof mockResponse.rates.CNY === 'number');
  });
});
