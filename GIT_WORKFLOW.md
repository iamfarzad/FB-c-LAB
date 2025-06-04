# Git Workflow Guide

## Overview
This document outlines the Git workflow and development practices for the AI Assistant Pro project. The workflow is designed to ensure code quality, enable parallel development, and maintain a stable main branch.

## Branching Strategy

### Main Branches
- `main` - Production-ready code (protected)
  - Always deployable
  - Direct commits not allowed
  - Only updated via pull requests from `develop`
  
- `develop` - Integration branch (protected)
  - Contains the latest delivered development changes
  - Source for feature branches
  - Only updated via pull requests from feature/bugfix branches

### Supporting Branches
- `feature/*` - New features and enhancements
  - Branch from: `develop`
  - Merge back to: `develop`
  - Naming: `feature/descriptive-name` (e.g., `feature/user-authentication`)

- `bugfix/*` - Bug fixes
  - Branch from: `develop`
  - Merge back to: `develop`
  - Naming: `bugfix/issue-description`

- `hotfix/*` - Critical production fixes
  - Branch from: `main`
  - Merge back to: `main` and `develop`
  - Naming: `hotfix/issue-description`

## Development Workflow

### Starting a New Feature
```bash
# Ensure you have the latest develop branch
git checkout develop
git pull origin develop

# Create and switch to a new feature branch
git checkout -b feature/your-feature-name

# Make your changes
git add .
git commit -m "feat: add your feature"

# Push to remote
git push -u origin feature/your-feature-name
```

### Creating a Pull Request
1. Push your feature branch to GitHub
2. Create a Pull Request (PR) from `feature/your-feature-name` to `develop`
3. Add a clear description of changes
4. Request reviews from team members
5. Address any feedback
6. Ensure all CI checks pass
7. Merge when approved

### Code Review Process
- All changes require at least one approved review
- CI must pass before merging
- Keep PRs focused and small when possible
- Resolve merge conflicts in the feature branch

### Releasing to Production
```bash
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Create a release branch
git checkout -b release/x.y.z

# Update version in package.json if needed
# Create PR from release/x.y.z to main
# After approval and merge, the CI will create a tag
```

## Automated Checks

### Pre-commit Hooks
- Linting with auto-fix
- Unit tests
- Commit message format validation

### CI/CD Pipeline
Triggered on every push to `main` and `develop` branches:
1. Install dependencies
2. Run linter
3. Run tests
4. Build the project
5. (On main) Create release tag

## Commit Message Convention

Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or modifying tests
- `chore`: Changes to build process or auxiliary tools

Example:
```
feat(auth): add Google OAuth login
fix(api): handle null response in user service
docs(readme): update installation instructions
```

## Handling Hotfixes

1. Create a hotfix branch from main:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/issue-description
   ```

2. Make necessary changes and commit:
   ```bash
   git commit -m "fix(scope): fix critical issue"
   ```

3. Create a PR to main and get it reviewed
4. After merging to main, merge main back into develop
5. Delete the hotfix branch

## Best Practices
- Always pull the latest changes before starting work
- Keep commits small and focused
- Write meaningful commit messages
- Never push directly to main or develop
- Delete merged branches (except main and develop)
- Keep your feature branches up to date with develop
- Use `.gitignore` to exclude unnecessary files

## Troubleshooting

### Fixing a Failed Build
1. Check the CI logs to identify the issue
2. Make necessary changes in your branch
3. Push the fixes to trigger a new build

### Resolving Merge Conflicts
1. Update your branch with latest changes from develop:
   ```bash
   git checkout your-feature-branch
   git pull origin develop
   ```
2. Resolve conflicts in your code
3. Test your changes
4. Commit the resolved conflicts
5. Push your changes

## Versioning
We follow [Semantic Versioning](https://semver.org/):
- MAJOR version for incompatible API changes
- MINOR version for added functionality in a backward-compatible manner
- PATCH version for backward-compatible bug fixes
