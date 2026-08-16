# 租迹业务插件

该模块承载小程序对应的租迹业务，不修改 Snowy 通用模块。

## 初始化

先执行 Snowy 基础 SQL，再执行：

`snowy-web-app/src/main/resources/_sql/zuji_mysql.sql`

## 第一阶段接口

- `GET /api/zj/listings`：公开房源分页
- `GET /api/zj/listings/detail?id=...`：公开房源详情
- `POST /api/zj/listings`：发布房源（C 端登录）
- `GET /api/zj/listings/mine`：我的发布（C 端登录）
- `POST /api/zj/listings/review`：后台审核房源
- `GET /api/zj/identity`：实名认证状态（C 端登录）
- `POST /api/zj/identity`：提交实名认证（C 端登录）
- `POST /api/zj/listing-evidence`：提交当前房源合同与租金证明（C 端登录）
- `POST /api/zj/favorites/toggle`：收藏/取消收藏（C 端登录）
- `GET /api/zj/favorites`：我的收藏（C 端登录）
- `POST /api/zj/viewings`：提交看房预约（C 端登录）
- `GET /api/zj/viewings`：我的看房预约（C 端登录）

发布后的房源默认为 `PENDING_REVIEW`，审核通过后变为 `PUBLISHED`，才会出现在公开列表。

实名认证属于用户并只需完成一次；合同和租金证明属于具体房源，每次发布新房源都要重新提交。文件本体复用 Snowy 文件服务，本模块保存上传完成后的文件地址。
