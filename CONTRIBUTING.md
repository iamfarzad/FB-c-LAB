# Contributing to F.B/c AI Assistant & Portfolio

Welcome to the F.B/c AI Assistant & Portfolio project! This guide will help you get started with development, understand our codebase structure, and follow our contribution guidelines.

## Table of Contents
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Import Path Conventions](#import-path-conventions)
- [Code Style & Best Practices](#code-style--best-practices)
- [TypeScript Guidelines](#typescript-guidelines)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## Development Setup

### Prerequisites
- Node.js 18+
- npm 9+ or yarn 1.22+
- Git

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ai-assistant-pro-fb_c_aistudio.git
   cd ai-assistant-pro-fb_c_aistudio
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables (see [Environment Variables](#environment-variables))

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Project Structure

```
/
├── src/                    # Source files
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React contexts
│   ├── lib/                # Utility functions and libraries
│   ├── pages/              # Page components
│   └── types/              # TypeScript type definitions
├── public/                 # Static files
├── services/               # API and service layer
├── test/                   # Test files
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Import Path Conventions

### Path Aliases
- `@/*` - Points to `src/*`
  ```typescript
  import { Button } from '@/components/ui/Button';
  import { useAuth } from '@/contexts/AuthContext';
  ```

- `~/*` - Points to project root `./*`
  ```typescript
  import { API_URL } from '~/config/constants';
  ```

### Best Practices
1. Always use path aliases instead of relative paths
2. Group related imports together:
   ```typescript
   // External dependencies
   import React from 'react';
   
   // Internal components
   import { Button } from '@/components/ui/Button';
   
   // Utilities
   import { formatDate } from '@/lib/date-utils';
   
   // Types
   import type { User } from '@/types';
   ```

## Code Style & Best Practices

### Formatting
We use ESLint and Prettier for code formatting:
```bash
# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utility files**: kebab-case (e.g., `date-utils.ts`)
- **Variables and functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase (preferred without `I` prefix)

## TypeScript Guidelines

1. Always provide types for function parameters and return values
2. Use interfaces for object types and type aliases for unions/intersections
3. Avoid using `any` - use `unknown` instead when the type is truly unknown
4. Use TypeScript's utility types when appropriate (e.g., `Partial<T>`, `Pick<T, K>`)

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run coverage report
npm test -- --coverage
```

### Writing Tests
- Place test files next to the code they test with `.test.ts` or `.test.tsx` extension
- Use `describe` blocks to group related tests
- Follow the "Arrange-Act-Assert" pattern
- Mock external dependencies

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the code style guidelines
3. Add or update tests as needed
4. Ensure all tests pass
5. Update documentation if necessary
6. Submit a pull request with a clear description of changes

### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code changes that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_URL=your_api_url_here
# Add other environment variables as needed
```

## Troubleshooting

### Common Issues

#### TypeScript Errors
- Run `npx tsc --noEmit` to check for TypeScript errors
- Ensure all types are properly imported and exported

#### Dependency Issues
- Delete `node_modules` and `package-lock.json`
- Run `npm install`

#### Build Issues
- Clear Vite's cache: `rm -rf node_modules/.vite`
- Ensure all environment variables are properly set

---

Thank you for contributing to F.B/c AI Assistant & Portfolio! Your contributions help make this project better.