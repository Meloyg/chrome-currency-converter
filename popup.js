const targetSelect = document.getElementById('target');
const saveBtn = document.getElementById('save');
const statusEl = document.getElementById('status');

const rateEl = document.getElementById('rate');

function updateRate() {
  const target = targetSelect.value;
  chrome.runtime.sendMessage({ type: 'getRates', base: target }, (resp) => {
    if (resp && resp.rates) {
      // We have rates FROM target, so 1 NZD = ? target
      // But rates are from target as base, so NZD rate means 1 target = X NZD
      // We want 1 NZD = ? target, so it's 1/rates.NZD
      if (resp.rates.NZD) {
        const rate = (1 / resp.rates.NZD).toFixed(4);
        rateEl.textContent = `1 NZD = ${rate} ${target}`;
      } else if (target === 'NZD') {
        rateEl.textContent = '1 NZD = 1 NZD 😅';
      } else {
        rateEl.textContent = 'Rate unavailable';
      }
    } else {
      rateEl.textContent = 'Rate unavailable';
    }
  });
}

// Load current settings
chrome.storage.sync.get({ targetCurrency: 'CNY' }, (data) => {
  targetSelect.value = data.targetCurrency;
  updateRate();
});

targetSelect.addEventListener('change', updateRate);

saveBtn.addEventListener('click', () => {
  const targetCurrency = targetSelect.value;
  chrome.storage.sync.set({ targetCurrency }, () => {
    statusEl.textContent = 'Saved! Reloading...';
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) chrome.tabs.reload(tabs[0].id);
    });
    setTimeout(() => window.close(), 500);
  });
});
