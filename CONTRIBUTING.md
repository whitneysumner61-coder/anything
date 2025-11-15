# Contributing to Productivity Dashboard

Thank you for your interest in contributing to the Productivity Dashboard! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/anything.git`
3. Install dependencies: `npm install`
4. Run the development server: `npm run dev`
5. Make your changes
6. Test your changes thoroughly
7. Submit a pull request

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code structure and naming conventions
- Use functional components with hooks
- Keep components small and focused on a single responsibility
- Use Tailwind CSS utility classes for styling

### Component Structure

```
components/
  ├── TaskManager.tsx      # Task management component
  ├── PomodoroTimer.tsx    # Pomodoro timer component
  └── NoteTaking.tsx       # Note-taking component

lib/
  ├── types.ts             # TypeScript type definitions
  └── utils.ts             # Utility functions and storage

app/
  ├── layout.tsx           # Root layout
  ├── page.tsx             # Main page
  └── globals.css          # Global styles
```

### Testing Your Changes

1. Run the development server: `npm run dev`
2. Test all affected features manually
3. Verify responsive design (desktop, tablet, mobile)
4. Test dark mode compatibility
5. Build for production: `npm run build`
6. Test the production build: `npm start`

### Adding New Features

When adding new features:

1. Create a new component in the `components/` directory
2. Add necessary types to `lib/types.ts`
3. Add utility functions to `lib/utils.ts` if needed
4. Update the main page (`app/page.tsx`) to include your feature
5. Update the README.md with documentation
6. Test thoroughly

### Storage

All data is stored in localStorage. When adding new data:

1. Add types to `lib/types.ts`
2. Add storage functions to `lib/utils.ts`
3. Use the storage functions in your components
4. Ensure data persists across page refreshes

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Ensure your code builds successfully: `npm run build`
3. Test your changes thoroughly
4. Create a pull request with a clear description of changes
5. Reference any related issues

## Feature Ideas

Looking for something to work on? Here are some ideas:

- [ ] Data export/import (JSON format)
- [ ] Keyboard shortcuts
- [ ] Task search and filtering
- [ ] Task due dates and reminders
- [ ] Pomodoro statistics and history
- [ ] Note categories and tags
- [ ] Markdown support for notes
- [ ] Custom color themes
- [ ] Task templates
- [ ] Calendar view
- [ ] Mobile PWA support
- [ ] Cloud sync (optional)

## Questions?

Feel free to open an issue for any questions or suggestions!

## License

By contributing, you agree that your contributions will be licensed under the ISC License.
