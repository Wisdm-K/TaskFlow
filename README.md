# TaskFlow

A lightweight desktop widget for tracking time-sensitive tasks with visual progress indicators. Built with Electron + React.

TaskFlow - 轻量级桌面时间进度管理工具，实时追踪任务倒计时与进度。

## Features / 功能特性

- **Task Countdown** - Real-time countdown display for deadline-based tasks (days, hours, minutes)
- **Progress Tracking** - Visual progress bar for date-range tasks
- **Theme System** - 7 color themes with gradient effects, each supporting light/dark mode
- **Transparency Control** - Independent opacity adjustment for panel background and task cards
- **Task Reminders** - Windows notification alerts with configurable timing and repeat intervals
- **Desktop Widget** - Frameless transparent window, always accessible on your desktop
- **Position Memory** - Remembers window position across sessions with multi-monitor safety
- **Auto Launch** - Optional startup with Windows login
- **Offline Ready** - All dependencies bundled locally, no internet required

## Screenshots / 截图

| Light Mode | Dark Mode |
|:---:|:---:|
| Clean white interface with gradient theme colors | Dark interface with deep theme color gradients |

## Installation / 安装

### Download Installer

Go to [Releases](https://github.com/Wisdm-K/TaskFlow/releases) and download the latest `TaskFlow Setup x.x.x.exe`.

### Build from Source

```bash
# Clone the repository
git clone https://github.com/Wisdm-K/TaskFlow.git
cd TaskFlow

# Install dependencies
npm install

# Run in development mode
npm start

# Build installer
npm run build
```

The installer will be generated in the `dist/` folder.

## Tech Stack / 技术栈

- **Electron** 29 - Desktop application framework
- **React** 18 - UI rendering
- **Tailwind CSS** - Utility-first styling
- **NSIS** - Windows installer packaging

## Project Structure / 项目结构

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

## License

ISC
