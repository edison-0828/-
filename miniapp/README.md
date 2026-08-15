# 租迹小程序

本目录是租迹当前唯一的小程序客户端，基于 uni-app、Vue 3、TypeScript 和 Vite。房源与定位读取仓库根目录的 API；登录、收藏、消息、预约和发布审核暂时使用设备本地 Demo 数据。

## 本地运行

1. 先在仓库根目录运行 Web/API 服务：`npm run dev`
2. 在仓库根目录安装小程序依赖：`npm run miniapp:install`
3. 在仓库根目录启动小程序编译：`npm run miniapp:dev`
4. 在微信开发者工具中导入：`miniapp/dist/dev/mp-weixin`

首次调试可使用测试号，并关闭“校验合法域名”。正式 AppID 请填写到 `src/manifest.json`。

## 手机真机调试

开发者工具模拟器通过 `http://localhost:3000` 访问本机 API。手机真机无法访问电脑的 `localhost`，需要换成可从手机访问的 HTTPS 测试 API，并在微信公众平台配置 request/downloadFile/uploadFile 合法域名。

## 已有页面

- 找房列表、定位、筛选与房源详情
- 收藏、在线咨询与看房预约
- 行情和最近成交展示
- 手机号/微信 Demo 登录与独立注册入口
- 发布草稿、实名认证、合同和租金证明上传
- 我的收藏、我的发布、预约记录和认证状态

## 目录约定

- `src/pages/`：页面，只负责页面状态与交互编排
- `src/services/`：接口、本地存储和会话访问
- `src/types/`：跨页面共享的业务类型
- `src/data/`：静态城市等基础数据
- `src/composables/`：可复用页面行为
