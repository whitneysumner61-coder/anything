# CLAUDE.md - AI Assistant Guide

This document provides comprehensive guidance for AI assistants working on the "anything" repository.

## Repository Overview

**Repository:** anything
**Owner:** whitneysumner61-coder
**License:** MIT License (2025)
**Current State:** Fresh repository with minimal setup

### Project Status

This is a newly initialized repository with basic scaffolding:
- Minimal README
- MIT License
- .gitignore configured for Next.js/TypeScript/Node.js projects
- No source code or dependencies yet

## Inferred Tech Stack

Based on the .gitignore configuration, this repository appears to be intended for:

- **Frontend Framework:** Next.js
- **Runtime:** Node.js
- **Likely Language:** TypeScript (*.tsbuildinfo, next-env.d.ts ignored)
- **Deployment:** Vercel (.vercel directory ignored)
- **Package Manager:** npm/yarn/pnp

## Repository Structure

```
/home/user/anything/
├── .git/                 # Git repository data
├── .gitignore           # Ignore patterns for Next.js/Node.js
├── LICENSE              # MIT License
├── README.md            # Minimal project description
└── CLAUDE.md            # This file
```

### Expected Future Structure

When development begins, expect to see:

```
anything/
├── src/ or app/         # Source code (Next.js App Router or Pages)
│   ├── components/      # React components
│   ├── pages/           # Next.js pages (if using Pages Router)
│   ├── app/             # Next.js app directory (if using App Router)
│   ├── lib/             # Utility functions and helpers
│   ├── hooks/           # Custom React hooks
│   └── styles/          # CSS/SCSS/styled-components
├── public/              # Static assets
├── tests/ or __tests__/ # Test files
├── node_modules/        # Dependencies (gitignored)
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── next.config.js       # Next.js configuration
└── .env.local           # Environment variables (gitignored)
```

## Development Workflows

### Initial Setup (Not Yet Done)

When beginning development, the following steps should be taken:

1. **Initialize Node.js Project**
   ```bash
   npm init -y
   # or
   yarn init -y
   ```

2. **Install Next.js and Dependencies**
   ```bash
   npx create-next-app@latest . --typescript --tailwind --app --src-dir
   # or manually install:
   npm install next react react-dom
   npm install -D typescript @types/react @types/node
   ```

3. **Set Up Development Scripts**
   Ensure package.json includes:
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint",
       "test": "jest"
     }
   }
   ```

### Git Workflow

**Branch Strategy:**
- Main branch: `main` (or default branch)
- Feature branches: Use pattern `claude/claude-md-*` for AI-assisted development
- Current working branch: `claude/claude-md-mhzwtxqhaqni0a7c-01D7WmXGzMqwHRuxuEqQb3Y9`

**Commit Practices:**
- Write clear, descriptive commit messages
- Use conventional commits format when applicable:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `refactor:` for code refactoring
  - `test:` for test additions/modifications
  - `chore:` for maintenance tasks

**Push Protocol:**
- Always use: `git push -u origin <branch-name>`
- Branch names must start with 'claude/' and end with session ID
- Retry on network failures: up to 4 times with exponential backoff (2s, 4s, 8s, 16s)

### Code Quality Standards

1. **TypeScript:**
   - Use strict mode when configuring tsconfig.json
   - Define proper types; avoid `any` unless absolutely necessary
   - Use interfaces for object shapes
   - Leverage type inference where appropriate

2. **React/Next.js:**
   - Prefer functional components with hooks
   - Use Next.js App Router (app/ directory) for new projects
   - Implement proper error boundaries
   - Follow React best practices for performance (memo, useMemo, useCallback)

3. **Code Style:**
   - Use consistent formatting (set up Prettier)
   - Follow ESLint recommendations
   - Keep functions small and focused
   - Write self-documenting code with clear variable names

4. **Security:**
   - Never commit sensitive data (.env files, API keys, credentials)
   - Validate user inputs
   - Prevent XSS, SQL injection, and other OWASP Top 10 vulnerabilities
   - Use environment variables for configuration

### Testing Strategy

When implementing tests:

1. **Unit Tests:**
   - Test individual functions and components
   - Use Jest and React Testing Library
   - Aim for high coverage on critical paths

2. **Integration Tests:**
   - Test component interactions
   - Test API routes (when implemented)

3. **E2E Tests (if needed):**
   - Consider Playwright or Cypress for full user flows

### File Organization Conventions

1. **Component Files:**
   - One component per file
   - Co-locate styles if using CSS modules
   - Structure: ComponentName/index.tsx, ComponentName.module.css

2. **Naming Conventions:**
   - Components: PascalCase (e.g., `UserProfile.tsx`)
   - Utilities: camelCase (e.g., `formatDate.ts`)
   - Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
   - Files/directories: kebab-case or PascalCase (be consistent)

3. **Import Order:**
   ```typescript
   // 1. External dependencies
   import React from 'react';
   import { useState } from 'react';

   // 2. Internal absolute imports
   import { Button } from '@/components/Button';

   // 3. Relative imports
   import { helper } from './utils';

   // 4. Styles
   import styles from './Component.module.css';
   ```

## AI Assistant Guidelines

### Before Starting Work

1. **Check for existing files:**
   - Always use `Read` to check existing files before modifying
   - Use `Glob` to find relevant files
   - Understand the current state before making changes

2. **Plan complex tasks:**
   - Use `TodoWrite` for multi-step tasks
   - Break down large features into smaller, manageable pieces
   - Update todos as work progresses

3. **Research before implementing:**
   - Check existing patterns in the codebase
   - Look for similar implementations to maintain consistency
   - Review documentation and comments

### During Development

1. **Make incremental changes:**
   - Commit logical units of work
   - Test after each significant change
   - Don't batch unrelated changes

2. **Maintain code quality:**
   - Follow existing patterns and conventions
   - Add comments for complex logic
   - Keep functions focused and modular

3. **Handle errors gracefully:**
   - If a build fails, fix errors before proceeding
   - Don't mark todos as complete if errors exist
   - Report blocking issues to the user

### Communication

1. **Be concise:**
   - Provide clear, actionable information
   - Avoid unnecessary verbosity
   - Use markdown for formatting

2. **Reference code properly:**
   - Use `file_path:line_number` format
   - Example: "The error handling is in src/utils/api.ts:45"

3. **Ask when uncertain:**
   - Don't assume requirements
   - Clarify ambiguous requests
   - Propose options when multiple approaches exist

## Common Tasks Reference

### Creating a New Component

```typescript
// src/components/ExampleComponent/index.tsx
import React from 'react';
import styles from './ExampleComponent.module.css';

interface ExampleComponentProps {
  title: string;
  onAction?: () => void;
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  onAction
}) => {
  return (
    <div className={styles.container}>
      <h2>{title}</h2>
      {onAction && <button onClick={onAction}>Action</button>}
    </div>
  );
};
```

### Creating an API Route (Next.js App Router)

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Implementation
    return NextResponse.json({ data: 'success' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### Environment Variables

```bash
# .env.local (never commit this file!)
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
```

Access in code:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Public, available in browser
const dbUrl = process.env.DATABASE_URL;          // Server-side only
```

## Documentation Requirements

1. **Update README.md:**
   - Add project description
   - Include setup instructions
   - Document available scripts
   - Add usage examples

2. **Code Comments:**
   - Document complex algorithms
   - Explain non-obvious decisions
   - Add JSDoc for public APIs

3. **Keep CLAUDE.md Updated:**
   - Update when architecture changes
   - Document new conventions
   - Add lessons learned

## Troubleshooting

### Common Issues

1. **Module not found:**
   - Check that dependencies are installed: `npm install`
   - Verify import paths
   - Ensure TypeScript paths are configured correctly

2. **Build failures:**
   - Check TypeScript errors: `npm run build`
   - Review ESLint warnings: `npm run lint`
   - Clear Next.js cache: `rm -rf .next`

3. **Git push failures:**
   - Ensure branch name follows pattern: `claude/claude-md-*-<session-id>`
   - Check network connection
   - Verify remote repository access

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vercel Deployment](https://vercel.com/docs)

## Changelog

### 2025-11-15
- Initial CLAUDE.md created
- Repository analyzed in fresh state
- Established conventions for future development

---

**Note:** This document should be updated as the project evolves and new patterns emerge. When making significant architectural decisions or establishing new conventions, update this file to keep it current.
