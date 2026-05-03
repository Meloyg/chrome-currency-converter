# 💱 货币转换器 — 浏览器扩展

**[English](README.md)**

自动识别网页上的价格，以小标签形式内联显示转换后的金额。

![Chrome](https://img.shields.io/badge/Chrome-✓-green?logo=googlechrome) ![Edge](https://img.shields.io/badge/Edge-✓-green?logo=microsoftedge) ![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue) ![Tests](https://img.shields.io/badge/tests-33%20passed-brightgreen)

## 功能

- 🔍 **自动识别** — 自动识别页面上的 USD、NZD、EUR、GBP、AUD、CAD、JPY 价格
- 🏷️ **内联标签** — 在原始价格旁边直接显示转换金额
- 🧩 **拆分价格支持** — 处理价格被拆分到多个 HTML 元素的情况（如 PB Tech）
- 💾 **智能缓存** — 汇率缓存 30 分钟，减少 API 调用
- ⚡ **动态页面** — 通过 MutationObserver 监听新内容
- 🌏 **裸 `$` = NZD** — 不带前缀的 `$` 默认识别为新西兰元

## 支持的货币

| 符号 | 货币 |
|--------|----------|
| `$` | NZD（默认） |
| `US$` | USD 美元 |
| `A$` | AUD 澳元 |
| `CA$` | CAD 加元 |
| `€` | EUR 欧元 |
| `£` | GBP 英镑 |
| `¥` | JPY 日元 |

## 安装

### Chrome / Edge（从源码安装）

1. 克隆或下载本仓库
2. 打开 `chrome://extensions`（Chrome）或 `edge://extensions`（Edge）
3. 开启 **开发者模式**
4. 点击 **加载已解压的扩展程序** → 选择仓库文件夹
5. 完成！访问任意有价格的页面即可看到转换结果

### Chrome Web Store / Edge Add-ons

即将上架。

## 配置

点击扩展图标打开弹窗：

- **转换为** — 选择目标货币（默认：CNY 人民币）
- **汇率** — 显示当前汇率（如 "1 NZD = 4.82 CNY"）
- **保存并刷新** — 应用更改并刷新页面

## 汇率来源

汇率数据来自 [Frankfurter API](https://api.frankfurter.app)，其数据源为 **欧洲中央银行 (ECB)**——每个工作日更新，免费，无需 API key。

## 开发

```bash
npm install
npm test        # 运行 33 个单元测试
npm run package # 打包
```

## 项目结构

```
├── manifest.json      # 扩展清单 (V3)
├── background.js      # Service Worker — 汇率获取与缓存
├── content.js         # Content Script — 价格检测与标签注入
├── popup.html/js      # 扩展弹窗界面
├── styles.css         # 标签样式
├── tests/             # 单元测试
└── package.json       # 项目配置
```

## 贡献

1. Fork 本仓库
2. 创建功能分支
3. 运行 `npm test` 确保测试通过
4. 提交 PR

## 许可证

MIT — 见 [LICENSE](LICENSE)
