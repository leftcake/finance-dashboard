# Finance Dashboard — 项目说明（中文版）

个人财务仪表盘：记录收入、支出与储蓄，按月份查看汇总与图表，并管理储蓄目标。数据保存在 **PostgreSQL**（通过 Prisma），前端为 **Next.js App Router** 单页应用。

---

## 功能概览

| 模块 | 说明 |
|------|------|
| **用户注册 / 登录** | 邮箱 + 密码；可选用户名。密码使用 bcrypt 哈希后入库。注册成功后会自动登录。 |
| **会话状态** | 登录后在前端 `localStorage` 中保存当前用户基本信息（`id`、`email`、`username` 等），刷新页面仍保持登录态。 |
| **交易记录** | 支持三类：`income`（收入）、`expense`（支出）、`savings`（储蓄）。可新增、按月份筛选展示、删除。 |
| **指标卡片** | 按所选月份汇总收入、支出、储蓄及结余（收入 − 支出 − 储蓄）。 |
| **图表** | 使用 Recharts：近若干月份收入/支出趋势；当前月份结构占比（收入/支出/储蓄）。 |
| **储蓄目标** | 创建目标（名称 + 目标金额）、向目标「入账」增加已存金额（不超过目标）、删除目标。 |

界面文案以英文为主；金额格式为 **新加坡元（S$）**（见 `lib/utils.ts` 中的 `formatCurrency`）。

---

## 技术栈

- **框架**：Next.js 16（App Router）、React 19  
- **语言**：TypeScript（`"type": "module"`）  
- **样式**：Tailwind CSS 4、全局变量与工具类（`app/globals.css`）  
- **数据库**：PostgreSQL + Prisma 5  
- **图表**：Recharts  
- **安全相关**：bcryptjs（注册哈希、登录校验）  

> 本仓库的 `AGENTS.md` 提醒：所用 Next.js 版本可能与常见文档有差异，改框架相关代码前建议查阅项目内 `node_modules/next/dist/docs/` 的说明。

---

## 目录结构（核心部分）

```
finance-dashboard/
├── app/
│   ├── layout.tsx          # 根布局与站点 metadata
│   ├── page.tsx            # 首页：未登录落地页 / 已登录仪表盘
│   ├── globals.css         # 全局样式
│   └── api/
│       ├── register/route.ts   # POST 注册
│       ├── login/route.ts      # POST 登录
│       ├── transactions/route.ts  # GET/POST/DELETE 交易
│       └── goals/route.ts         # GET/POST/PUT/DELETE 目标
├── components/             # Charts、Metrics、表单、列表、登录弹窗等
├── lib/
│   ├── auth.ts             # 调用注册/登录 API；localStorage 读写封装
│   ├── database.ts         # 封装对交易与目标 API 的请求
│   ├── prisma.ts           # Prisma 单例
│   ├── types.ts            # 前端使用的 Transaction、Goal 等类型
│   └── utils.ts            # 月份筛选、指标计算、图表数据、货币格式
├── prisma/
│   ├── schema.prisma       # 数据模型
│   └── migrations/         # 数据库迁移
├── public/                 # 静态资源
├── styles/                 # 补充样式（若与 app 下样式并存，以实际引用为准）
├── package.json
├── next.config.mjs / next.config.ts
├── vercel.json             # Vercel 构建命令含 prisma generate
└── README.md               # 英文模板说明（create-next-app）
```

---

## 环境要求

- Node.js（建议与 Next 16 兼容的当前 LTS 版本）  
- 可访问的 **PostgreSQL** 实例  

---

## 环境变量

在项目根目录创建 `.env`（或 `.env.local`，按 Next.js 惯例加载），至少包含：

| 变量名 | 说明 |
|--------|------|
| `DATABASE_URL` | PostgreSQL 连接串，供 Prisma 使用（格式如 `postgresql://用户:密码@主机:端口/数据库?schema=public`） |

**请勿**将含有真实密码的 `.env` / `.env.local` 提交到 Git。仓库中应通过 `.gitignore` 忽略这些文件。

---

## 安装与本地运行

```bash
# 安装依赖（postinstall 会执行 prisma generate）
npm install

# 配置好 DATABASE_URL 后，应用迁移（开发环境也可用 prisma migrate dev，见 Prisma 文档）
npm run db:migrate

# 开发模式
npm run dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)。

常用脚本（摘自 `package.json`）：

| 命令 | 作用 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | `prisma generate` + `next build` |
| `npm run start` | 生产模式启动（需先 build） |
| `npm run lint` | ESLint |
| `npm run db:generate` | 仅生成 Prisma Client |
| `npm run db:migrate` | `prisma migrate deploy`（适合 CI/生产） |

---

## 数据模型（Prisma 摘要）

- **User**：用户；关联 `Transaction`、`Goal`；另有 `Account`、`Session`、`VerificationToken` 等字段，schema 上兼容常见 OAuth/会话扩展，当前业务路由主要使用邮箱密码。  
- **Transaction**：`date`、`description`、`category`（枚举：`income` | `expense` | `savings`）、`amount`，按 `userId` 归属。  
- **Goal**：`name`、`target`、`saved`（默认 0），按 `userId` 归属。  

详细字段与索引见 `prisma/schema.prisma`。

---

## HTTP API 约定

除另有说明外，请求/响应多为 JSON。

### `POST /api/register`

- Body：`{ email, password, username? }`  
- 成功：201，返回用户摘要；邮箱或用户名冲突时 400。

### `POST /api/login`

- Body：`{ email, password }`  
- 成功：返回用户摘要；失败 401。

### `/api/transactions`

- `GET ?userId=`：列出该用户的交易（按日期降序）。  
- `POST`：`{ userId, date, desc, cat, amt }`（与前端 `lib/types` 字段名一致）。  
- `DELETE ?id=&userId=`：删除指定交易。

### `/api/goals`

- `GET ?userId=`：列出目标。  
- `POST`：`{ userId, name, target }`。  
- `PUT`：`{ id, userId, saved }`（更新已存金额）。  
- `DELETE ?id=&userId=`：删除目标。

---

## 安全与架构说明（阅读部署前必读）

1. **无服务端 Session / JWT**  
   登录成功后仅返回用户信息，前端写入 `localStorage`。后续请求交易与目标接口时，**`userId` 由客户端传入**。API 层未校验「当前请求是否属于已登录会话」，因此**不适合作为面向公网的多用户高安全场景**；更适合个人学习、内网或受控环境。若需对外上线，应增加 Cookie Session、JWT 或 NextAuth 等机制，并在服务端根据会话解析 `userId`，禁止客户端随意指定他人 `userId`。

2. **密码**  
   注册时使用 bcrypt 哈希存储；登录时 `bcrypt.compare` 校验。传输层在生产环境应始终使用 HTTPS。

3. **Prisma 中的 OAuth 相关表**  
   `Account`、`Session` 等已建模，是否与具体 OAuth 流程打通取决于后续实现；当前页面流程以邮箱注册登录为主。

---

## 部署提示（Vercel）

`vercel.json` 中 `buildCommand` 为 `prisma generate && next build`，与 `package.json` 的 `build` 一致。部署时请：

1. 在平台配置 `DATABASE_URL`（例如 Vercel Environment Variables）。  
2. 对生产数据库执行迁移（如 `prisma migrate deploy` 或平台推荐的 Prisma 集成流程）。  

---

## 相关文件索引

- 页面与状态：`app/page.tsx`  
- 注册/登录实现：`app/api/register/route.ts`、`app/api/login/route.ts`  
- 前端 API 封装：`lib/auth.ts`、`lib/database.ts`  
- 数据库：`prisma/schema.prisma`、`lib/prisma.ts`  

---

## 许可证

见仓库根目录 `LICENSE` 文件。
