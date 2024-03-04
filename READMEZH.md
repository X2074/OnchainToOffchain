# OnchainToOffchain

## 介绍
OnchainToOffchain 是一个面向区块链的数据同步工具，它将链上的交易数据同步到离线数据库中，以便于进一步开发复杂的业务场景。这个工具使用 Node.js 构建，支持多种数据库，并且可以轻松集成到现有的区块链项目中。

## 特性
- 数据同步：实时同步链上数据到离线数据库。
- 支持多种数据库：兼容主流的数据库系统，如 MongoDB。
- 高可配置性：通过简单的配置，即可根据需求调整同步逻辑。
- 容易集成：设计简洁，易于与现有系统集成。

## 快速开始
### 安装
- 确保您已经安装了 Node.js 和 npm。然后运行以下命令来安装依赖项：
```bash
yarn
```
### 运行
- 在生产环境中运行：
```bash
yarn run start
```
- 在开发环境中运行（支持热重载）：
```bash
yarn run start:dev
```
## 依赖

本项目使用了以下主要的依赖：

- **@nestjs/common, @nestjs/core, and other @nestjs modules**：用于构建模块化且易于维护的 web 服务。

- **mongoose**：用于 MongoDB 数据交互。

- **web3**：用于与 Ethereum 兼容的区块链交互。

- **cron**：用于定时任务。

- **dayjs**：用于日期处理。

## 开发依赖

- **@typescript-eslint/eslint-plugin and @typescript-eslint/parser**: 用于强制执行特定于TypeScript的代码样式和质量控制。

- **eslint-config-prettier and eslint-plugin-prettier**: 将ESLint与Prettier集成以进行代码格式化。

- **nodemon**：用于开发环境的热重载。

- **cross-env**：用于设置环境变量。

## 贡献

欢迎通过 GitHub issues 或者 Pull Requests 来贡献代码。

## 许可证

本项目使用 MIT 许可证。

## 更多信息

更多关于本项目的信息，请访问[ GitHub 主页](https://github.com/X2074/OnchainToOffchain#readme)。

## 路线图
### 短期规划：
- [X] 将 npm 的包管理方式更换为 yarn，以提高依赖管理效率。
- [X] 从 koa2 迁移到 Nest.js 框架，以利用其更强大的模块化和微服务支持。
### 中期规划：
- [X] 完善接口文档和日志系统，提高开发和调试效率。
- [ ] 增加区块数据和交易数据的记录功能，完善链上账户地址资产信息的同步。
### 长期规划：
- [ ] 开发简洁的前端操作界面，配合接口实现快速使用，提高用户体验。
