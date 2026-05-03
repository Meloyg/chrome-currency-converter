# 💱 Currency Converter — Browser Extension

Automatically detects prices on any web page and shows converted amounts in your preferred currency, inline as a small badge.

![Chrome](https://img.shields.io/badge/Chrome-✓-green?logo=googlechrome) ![Edge](https://img.shields.io/badge/Edge-✓-green?logo=microsoftedge) ![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)

## Features

- 🔍 **Auto-detection** — Finds prices in USD, NZD, EUR, GBP, AUD, CAD, JPY on any page
- 🏷️ **Inline badges** — Shows converted amount right next to the original price
- 🧩 **Split-price support** — Handles prices split across multiple HTML elements (e.g. PB Tech)
- 💾 **Smart caching** — Rates cached for 30 minutes to reduce API calls
- ⚡ **Dynamic pages** — Watches for new content via MutationObserver
- 🌏 **Bare `$` = NZD** — Defaults to NZD for unqualified dollar signs (configurable)

## Supported Currencies

| Symbol | Currency |
|--------|----------|
| `$` | NZD (default) |
| `US$` | USD |
| `A$` | AUD |
| `CA$` | CAD |
| `€` | EUR |
| `£` | GBP |
| `¥` | JPY |

## Installation

### Chrome / Edge (from source)

1. Clone or download this repo
2. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge)
3. Enable **Developer mode**
4. Click **Load unpacked** → select the repo folder
5. Done! Visit any page with prices to see conversions.

### Chrome Web Store / Edge Add-ons

Coming soon.

## Configuration

Click the extension icon to open the popup:

- **Convert to** — Select your target currency (default: CNY)
- **Exchange rate** — Shows current rate (e.g. "1 NZD = 4.82 CNY")
- **Save & Reload** — Applies the change and refreshes the page

## Exchange Rate Source

Rates come from the [Frankfurter API](https://api.frankfurter.app), which sources data from the **European Central Bank (ECB)** — updated every working day, free, no API key required.

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Package for distribution
npm run package
```

## Project Structure

```
├── manifest.json      # Extension manifest (V3)
├── background.js      # Service worker — rate fetching & caching
├── content.js         # Content script — price detection & badge injection
├── popup.html/js      # Extension popup UI
├── styles.css         # Badge styling
├── tests/             # Unit tests
└── package.json       # Node project config
```

## Contributing

1. Fork the repo
2. Create a feature branch
3. Run `npm test` to ensure tests pass
4. Submit a PR

## License

MIT — see [LICENSE](LICENSE)
