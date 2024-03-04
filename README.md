# OnchainToOffchain
OnchainToOffchain: A blockchain oriented data synchronization tool that synchronizes on chain transaction data to offline databases, facilitating further development of complex business scenarios.

## Introduction
OnchainToOffchain is a blockchain-oriented data synchronization tool that synchronizes on-chain transaction data to offline databases, facilitating the further development of complex business scenarios. Built with Node.js, it supports various databases and can be easily integrated into existing blockchain projects.

## Features
- Data Synchronization: Real-time synchronization of on-chain data to offline databases.
- Multiple Database Support: Compatible with mainstream database systems, such as MongoDB.
- High Configurability: Simple configuration adjustments to meet specific synchronization needs.
- Easy Integration: Designed for simplicity, making it easy to integrate with existing systems.

## Quick Start
### Installation
Ensure you have Node.js and npm installed. Then, run the following command to install dependencies:
```bash
yarn
```
### Running
- To run in production:
```bash
yarn run start
```
- To run in development mode (with hot reload):
```bash
yarn run start:dev
```
## Dependencies

This project utilizes the following key dependencies:

- **@nestjs/common, @nestjs/core, and other @nestjs modules**: For building modular and easily maintainable web services.
- **mongoose**: For MongoDB data interaction.
- **web3**: For interacting with Ethereum-compatible blockchains.
- **cron**: For scheduling tasks.
- **dayjs**: For handling dates.

## Development Dependencies

- **@typescript-eslint/eslint-plugin and @typescript-eslint/parser**: For enforcing code style and quality control specific to TypeScript. 
- **eslint-config-prettier and eslint-plugin-prettier**: Integrates ESLint with Prettier for code formatting.
- **nodemon**: For hot reloading in the development environment.
- **cross-env**: For setting environment variables.

## Contributing

Contributions are welcome via GitHub issues and Pull Requests.

## License

This project is licensed under the MIT License.

## More Information

For more information about this project, please visit the [GitHub page](https://github.com/X2074/OnchainToOffchain#readme).

## Roadmap
### Short-term Goals:
- [X] Switch from npm to yarn for dependency management to improve efficiency.
- [X] Migrate from koa2 to the Nest.js framework to leverage its more robust modularization and microservices support.

### Mid-term Goals:
- [X] Improve the API documentation and logging system to enhance development and debugging efficiency.
- [ ] Add recording features for block and transaction data, and improve synchronization of on-chain account address asset information.

### Long-term Goals:
- [ ] Develop a simple frontend interface to work alongside the API for quick utilization, improving user experience.

