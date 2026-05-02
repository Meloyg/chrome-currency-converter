# Currency Converter - Chrome Extension

自动检测网页上的价格，并在旁边显示转换后的目标货币金额。

## 功能

- 🔍 自动识别页面上的价格（支持 $, €, £, ¥, NZ$, A$, US$, CA$ 等）
- 💱 实时汇率转换（使用 [Frankfurter API](https://www.frankfurter.app/)）
- 🏷️ 在原始价格旁边注入小标签显示转换结果（如 `≈ ¥123.45`）
- ⚙️ 点击插件图标可选择目标货币（默认：CNY 人民币）

## 支持的货币

| 符号 | 货币 |
|------|------|
| $ / US$ | 美元 USD |
| NZ$ | 新西兰元 NZD |
| A$ | 澳元 AUD |
| CA$ | 加元 CAD |
| € | 欧元 EUR |
| £ | 英镑 GBP |
| ¥ | 日元 JPY |

## 安装

1. 下载或 clone 本仓库
2. 打开 Chrome，访问 `chrome://extensions/`
3. 右上角开启 **开发者模式**
4. 点击 **加载已解压的扩展程序**
5. 选择本项目文件夹

## 使用

- 安装后自动生效，浏览网页时会自动检测价格并显示转换
- 点击浏览器工具栏的插件图标，可以切换目标货币

## 技术栈

- Chrome Extension Manifest V3
- Frankfurter API（免费、无需 API key）
- 纯 JavaScript，无外部依赖

## License

MIT
