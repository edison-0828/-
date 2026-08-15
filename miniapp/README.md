# 租迹小程序

基于 uni-app、Vue 3、TypeScript 和 Vite。当前第一阶段复用仓库根目录的房源 API，已迁移找房、详情、行情、发布入口和个人中心页面。

## 本地运行

1. 先在仓库根目录运行 Web/API 服务：`npm run dev`
2. 进入 `miniapp` 目录运行：`npm install`
3. 启动微信小程序编译：`npm run dev:mp-weixin`
4. 在微信开发者工具中导入：`miniapp/dist/dev/mp-weixin`

首次调试可使用测试号，并关闭“校验合法域名”。正式 AppID 请填写到 `src/manifest.json`。

## 手机真机调试

开发者工具模拟器通过 `http://localhost:3000` 访问本机 API。手机真机无法访问电脑的 `localhost`，需要换成可从手机访问的 HTTPS 测试 API，并在微信公众平台配置 request/downloadFile/uploadFile 合法域名。

## 迁移状态

- 已完成：小程序工程、原生 TabBar、找房列表、城市定位、基础筛选、房源详情、行情摘要。
- 进行中：发布表单的图片与合同上传。
- 待接入：微信登录、手机号绑定、收藏、消息、预约看房和订阅通知。
