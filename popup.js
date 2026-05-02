const targetSelect = document.getElementById('target');
const saveBtn = document.getElementById('save');
const statusEl = document.getElementById('status');

// Load current settings
chrome.storage.sync.get({ targetCurrency: 'CNY' }, (data) => {
  targetSelect.value = data.targetCurrency;
});

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
