# 💱 Currency Converter — Browser Extension

Automatically detects prices on any web page and shows converted amounts in your preferred currency, inline as a small badge.

自动识别网页上的价格，以小标签形式内联显示转换后的金额。

![Chrome](https://img.shields.io/badge/Chrome-✓-green?logo=googlechrome) ![Edge](https://img.shields.io/badge/Edge-✓-green?logo=microsoftedge) ![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue) ![Tests](https://img.shields.io/badge/tests-33%20passed-brightgreen)

## Features / 功能

- 🔍 **Auto-detection / 自动识别** — Finds prices in USD, NZD, EUR, GBP, AUD, CAD, JPY on any page / 自动识别页面上的各币种价格
- 🏷️ **Inline badges / 内联标签** — Shows converted amount right next to the original price / 在原始价格旁边直接显示转换金额
- 🧩 **Split-price support / 拆分价格支持** — Handles prices split across multiple HTML elements (e.g. PB Tech) / 处理价格被拆分到多个 HTML 元素的情况
- 💾 **Smart caching / 智能缓存** — Rates cached for 30 minutes to reduce API calls / 汇率缓存 30 分钟，减少 API 调用
- ⚡ **Dynamic pages / 动态页面** — Watches for new content via MutationObserver / 通过 MutationObserver 监听新内容
- 🌏 **Bare `$` = NZD** — Defaults to NZD for unqualified dollar signs / 裸 `$` 符号默认识别为 NZD

## Supported Currencies / 支持的货币

| Symbol / 符号 | Currency / 货币 |
|--------|----------|
| `$` | NZD (default / 默认) |
| `US$` | USD |
| `A$` | AUD |
| `CA$` | CAD |
| `€` | EUR |
| `£` | GBP |
| `¥` | JPY |

## Installation / 安装

### Chrome / Edge (from source / 从源码安装)

1. Clone or download this repo / 克隆或下载本仓库
2. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge) / 打开扩展管理页面
3. Enable **Developer mode** / 开启 **开发者模式**
4. Click **Load unpacked** → select the repo folder / 点击 **加载已解压的扩展程序** → 选择仓库文件夹
5. Done! Visit any page with prices to see conversions. / 完成！访问任意有价格的页面即可看到转换结果。

### Chrome Web Store / Edge Add-ons

Coming soon. / 即将上架。

## Configuration / 配置

Click the extension icon to open the popup: / 点击扩展图标打开弹窗：

- **Convert to / 转换为** — Select your target currency (default: CNY) / 选择目标货币（默认：人民币）
- **Exchange rate / 汇率** — Shows current rate (e.g. "1 NZD = 4.82 CNY") / 显示当前汇率
- **Save & Reload / 保存并刷新** — Applies the change and refreshes the page / 应用更改并刷新页面

## Exchange Rate Source / 汇率来源

Rates come from the [Frankfurter API](https://api.frankfurter.app), which sources data from the **European Central Bank (ECB)** — updated every working day, free, no API key required.

汇率数据来自 [Frankfurter API](https://api.frankfurter.app)，其数据源为**欧洲中央银行 (ECB)**——每个工作日更新，免费，无需 API key。

## Development / 开发

```bash
# Install dependencies / 安装依赖
npm install

# Run tests / 运行测试
npm test

# Package for distribution / 打包
npm run package
```

## Project Structure / 项目结构

```
├── manifest.json      # Extension manifest (V3) / 扩展清单
├── background.js      # Service worker — rate fetching & caching / 汇率获取与缓存
├── content.js         # Content script — price detection & badge injection / 价格检测与标签注入
├── popup.html/js      # Extension popup UI / 扩展弹窗界面
├── styles.css         # Badge styling / 标签样式
├── tests/             # Unit tests / 单元测试
└── package.json       # Node project config / 项目配置
```

## Contributing / 贡献

1. Fork the repo / Fork 本仓库
2. Create a feature branch / 创建功能分支
3. Run `npm test` to ensure tests pass / 确保测试通过
4. Submit a PR / 提交 PR

## License / 许可证

MIT — see [LICENSE](LICENSE)
