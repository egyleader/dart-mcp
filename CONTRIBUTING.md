# Contributing to Dart MCP Server

Thank you for considering contributing to the Dart MCP server! This document outlines the process and guidelines for contributing to this project.

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dart_mcp.git
   cd dart_mcp
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

## Commit Guidelines

We follow a structured commit format to maintain a readable git history and to automate versioning and changelog generation.

### Commit Format

```
<type>[optional scope]: [JIRA-123(optional)] <description>
```

- **Type**: Indicates the kind of change (required). Must be one of:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation only changes
  - `style`: Changes that do not affect the meaning of the code (formatting, etc.)
  - `refactor`: A code change that neither fixes a bug nor adds a feature
  - `perf`: A code change that improves performance
  - `test`: Adding missing tests or correcting existing tests
  - `build`: Changes to the build system or external dependencies
  - `ci`: Changes to CI configuration files and scripts
  - `chore`: Other changes that don't modify src or test files
  - `revert`: Reverts a previous commit

- **Scope**: Optional, in parentheses. Specifies the section of the codebase that is affected.

- **JIRA ticket**: Optional, in square brackets. References the relevant JIRA ticket.

- **Description**: A concise description of the change. Use the imperative mood ("add" not "added").

### Examples

```
feat(analyze): [DART-123] add support for null safety analysis
fix: [TOOLS-456] resolve output encoding issue in dart run
docs: update tool documentation with new options
style: format code according to dart conventions
refactor(tools): improve error handling in pub command
```

## Pull Request Process

1. Fork the repository and create your branch from `main`.
2. Make your changes following the coding style of the project.
3. Add tests for any new features or fixes.
4. Ensure all tests pass locally before submitting a PR.
5. Update the documentation if necessary.
6. Submit a pull request to the `main` branch.

## Code Style

- Follow TypeScript best practices and use strict type checking
- Use async/await for asynchronous operations
- Include comprehensive error handling
- Document public APIs with JSDoc comments

## Testing

- Write tests for new features and bug fixes
- Run existing tests before submitting pull requests:
  ```bash
  pnpm test
  ```

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
