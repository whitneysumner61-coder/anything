# Productivity Dashboard

A comprehensive, full-featured productivity application built with Next.js, TypeScript, and Tailwind CSS. This app helps you manage your tasks, stay focused with the Pomodoro Technique, and organize your notes - all in one beautiful, modern interface.

## 🎯 Features

### Task Management
- **Create and organize tasks** with titles, descriptions, categories, and priorities
- **Filter tasks** by status (all, active, completed)
- **Visual statistics** showing total, active, and completed tasks
- **Color-coded categories**: Work, Personal, Urgent, Other
- **Priority levels**: High, Medium, Low
- **Mark tasks as complete** with a single click
- **Delete tasks** when no longer needed

### Pomodoro Timer
- **Classic Pomodoro Technique** implementation
- **Customizable durations** for work sessions, short breaks, and long breaks
- **Session tracking** to monitor your productivity
- **Automatic transitions** between work and break periods
- **Browser notifications** when sessions complete
- **Pause, reset, and skip** functionality
- **Visual indicators** for different timer modes

### Note Taking
- **Create unlimited notes** with titles and content
- **Quick note preview** in the sidebar
- **Full-screen note editor** for focused writing
- **Auto-save** functionality
- **Timestamps** showing when notes were created and updated
- **Easy navigation** between notes
- **Delete notes** when no longer needed

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed on your machine
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/whitneysumner61-coder/anything.git
cd anything
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## 💾 Data Storage

All data (tasks, notes, and Pomodoro settings) is stored locally in your browser's localStorage. This means:
- ✅ Your data is private and never leaves your device
- ✅ No account or login required
- ✅ Works completely offline
- ⚠️ Data is browser-specific (different browsers = different data)
- ⚠️ Clearing browser data will remove your information

## 🛠️ Technology Stack

- **Next.js 16** - React framework for production
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React 19** - UI library
- **LocalStorage API** - Client-side data persistence

## 📱 Features in Detail

### Task Manager
The task manager helps you organize your work with a comprehensive system:
- Add tasks with detailed information
- Categorize by type (Work, Personal, Urgent, Other)
- Prioritize (High, Medium, Low)
- Track completion status
- View statistics at a glance

### Pomodoro Timer
Based on the famous Pomodoro Technique:
- Default: 25 minutes work, 5 minutes short break
- Long breaks after every 4 work sessions
- Fully customizable durations
- Visual and audio notifications
- Track your completed sessions

### Notes
A simple but powerful note-taking system:
- Markdown-friendly (preserves formatting)
- Fast and responsive interface
- Organized by most recently updated
- Easy to search and navigate

## 🎨 Design Philosophy

- **Clean and Modern**: Minimalist design that doesn't distract
- **Dark Mode Support**: Automatically adapts to your system preference
- **Responsive**: Works on desktop, tablet, and mobile
- **Accessible**: Built with accessibility in mind
- **Fast**: Optimized for performance

## 🔒 Privacy & Security

- No data collection
- No analytics or tracking
- No external API calls
- 100% client-side application
- Open source - verify the code yourself

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## ⭐ Support

If you find this project useful, please consider giving it a star on GitHub!

## 🚀 Future Enhancements

Potential features for future versions:
- Data export/import functionality
- Cloud sync options
- Collaborative features
- Mobile app versions
- Calendar integration
- Advanced analytics and insights
- Custom themes
- Keyboard shortcuts
- Tags and advanced filtering

## 📞 Contact

For questions or feedback, please open an issue on GitHub.

---

Built with ❤️ using Next.js and TypeScript
