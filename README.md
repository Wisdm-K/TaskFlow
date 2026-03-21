# TaskFlow

A lightweight desktop widget for tracking time-sensitive tasks with visual progress indicators. Built with Electron + React.

## Features

- **Task Countdown** - Real-time countdown display for deadline-based tasks (days, hours, minutes)
- **Progress Tracking** - Visual progress bar for date-range tasks
- **Theme System** - 7 color themes with gradient effects, each supporting light/dark mode
- **Transparency Control** - Independent opacity adjustment for panel background and task cards
- **Task Reminders** - Windows notification alerts with configurable timing and repeat intervals
- **Desktop Widget** - Frameless transparent window, always accessible on your desktop
- **Position Memory** - Remembers window position across sessions with multi-monitor safety
- **Auto Launch** - Optional startup with Windows login
- **Offline Ready** - All dependencies bundled locally, no internet required

## Installation

### Download Installer

Go to [Releases](https://github.com/Wisdm-K/TaskFlow/releases) and download the latest `TaskFlow Setup x.x.x.exe`.

### Build from Source

```bash
git clone https://github.com/Wisdm-K/TaskFlow.git
cd TaskFlow
npm install
npm start       # Run in development mode
npm run build   # Build installer (output in dist/)
```

## Tech Stack

- **Electron** 29 - Desktop application framework
- **React** 18 - UI rendering
- **Tailwind CSS** - Utility-first styling
- **NSIS** - Windows installer packaging

## Project Structure

```
TaskFlow/
├── main.js            # Electron main process
├── index.html         # Entry HTML
├── App.js             # Root React component
├── Tasks.js           # Task management & card components
├── Hooks.js           # Custom React hooks (theme, opacity, reminders)
├── Settings.js        # Settings panel & dialogs
├── ThemeColors.js     # Theme color definitions & gradient logic
├── Icons.js           # SVG icon components
├── Styles.css         # Core styles & scrollbar customization
├── vendor/            # Local dependencies (React, Babel, Tailwind)
├── assets/            # App icons
└── package.json       # Project config & build settings
```

## Language

[中文文档](README_CN.md)

## License

ISC
