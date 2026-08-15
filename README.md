# 租迹

租迹是面向真实租客转租场景的小程序项目。当前主客户端是 `miniapp/` 中的 uni-app 微信小程序；仓库根目录保留 Web/API 支撑工程，为小程序提供房源、定位等接口。

## 项目边界

| 目录 | 用途 | 技术栈 |
| --- | --- | --- |
| `miniapp/` | 当前主客户端，日常产品开发入口 | uni-app、Vue 3、TypeScript、Vite |
| `app/` | Web 页面与小程序复用的 API | React、Next/vinext |
| `db/`、`drizzle/` | 数据模型和迁移 | Drizzle、D1/SQLite |
| `tests/` | Web/API 自动检查 | Node test |

旧 Expo 客户端已经退出主开发流程，不再纳入版本控制。构建产物、截图输出、旧缓存和本地日志也不应提交。

## 启动微信小程序

环境要求：Node.js 22 或更高版本、微信开发者工具。

```bash
# 1. 安装 Web/API 依赖
npm install

# 2. 安装小程序依赖
npm run miniapp:install

# 3. 启动 Web/API（终端一）
npm run dev

# 4. 启动 uni-app 微信小程序编译（终端二）
npm run miniapp:dev
```

在微信开发者工具中导入：

```text
miniapp/dist/dev/mp-weixin
```

小程序 AppID 配置在 `miniapp/src/manifest.json`。模拟器调试可关闭合法域名校验；真机调试必须使用手机可访问的 HTTPS API，不能使用电脑的 `localhost`。

## 常用检查

```bash
# uni-app 类型检查
npm run miniapp:type-check

# 微信小程序生产构建
npm run miniapp:build

# Web/API 构建
npm run build
```

## 开发约定

- 小程序页面、组件和状态逻辑统一放在 `miniapp/src/`。
- 不在页面中新增裸写的存储 key；统一通过小程序的数据访问层使用。
- 公共业务类型放在 `miniapp/src/types/`。
- 不提交 `dist/`、本地日志、截图输出、压缩包或依赖目录。
- Demo 本地数据用于产品走查，正式接口接入时通过 `miniapp/src/services/` 替换。
