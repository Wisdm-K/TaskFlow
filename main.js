const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, Notification, screen } = require('electron')
const path = require('path')
const fs = require('fs')

// ================= 单实例锁：防止多开 =================
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  // 已有实例在运行，直接退出新启动的进程
  app.quit();
} else {
  // 若用户再次双击启动，聚焦到已有窗口
  app.on('second-instance', () => {
    if (win) {
      if (!win.isVisible()) win.show();
      win.focus();
    }
  });
}

app.commandLine.appendSwitch('js-flags', '--max-old-space-size=128');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-color-correct-rendering');

let tray = null;
let win = null;
/** 鼠标穿透开启时轮询光标，防止 forward 未送达导致卡在穿透状态 */
let ignoreMousePollTimer = null;
/** 面板内容区屏幕坐标（由渲染进程同步），用于轮询时区分「透明边距」与「可点击区」 */
let contentScreenBounds = null;

function createWindow() {
  // ================= 图标处理逻辑 =================
  const windowIcon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png'));
  const trayIcon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.ico'));

  win = new BrowserWindow({
    width: 380,
    height: 2200,
    transparent: true,
    frame: false,
    hasShadow: false,
    icon: windowIcon,
    skipTaskbar: true,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: false,
      backgroundThrottling: true
    }
  });

  win.setAlwaysOnTop(false, 'desktop');

  win.once('ready-to-show', () => {
    win.show();
  });

  win.webContents.on('did-fail-load', () => {
    setTimeout(() => {
      if (win && !win.isDestroyed()) {
        win.loadFile(path.join(__dirname, 'index.html'));
      }
    }, 1000);
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  // ================= 记住窗口位置 + 屏幕外弹回 =================
  const { ensureWindowInBounds } = require('./windowBounds');
  const posFile = path.join(app.getPath('userData'), 'window-pos.json');

  function isPositionVisible(x, y) {
    const displays = screen.getAllDisplays();
    return displays.some(d => {
      const b = d.bounds;
      return x >= b.x - 100 && x < b.x + b.width && y >= b.y - 100 && y < b.y + b.height;
    });
  }

  function applyBounceBackIfNeeded() {
    const newPos = ensureWindowInBounds(win);
    if (newPos) {
      win.setPosition(newPos.x, newPos.y);
    }
  }

  win.webContents.on('did-finish-load', () => {
    if (fs.existsSync(posFile)) {
      try {
        const pos = JSON.parse(fs.readFileSync(posFile, 'utf8'));
        if (isPositionVisible(pos.x, pos.y)) {
          win.setPosition(pos.x, pos.y);
        }
      } catch (e) {}
    }
    applyBounceBackIfNeeded();
  });
  win.on('moved', () => {
    const newPos = ensureWindowInBounds(win);
    if (newPos) win.setPosition(newPos.x, newPos.y);
    const [x, y] = win.getPosition();
    fs.writeFileSync(posFile, JSON.stringify({ x, y }));
  });
  win.on('show', () => applyBounceBackIfNeeded());

  screen.on('display-added', () => applyBounceBackIfNeeded());
  screen.on('display-removed', () => applyBounceBackIfNeeded());

  ipcMain.handle('get-window-position', () => {
    const [x, y] = win.getPosition();
    return { x, y };
  });
  ipcMain.handle('set-window-position', (_, { x, y }) => {
    win.setPosition(x, y);
  });

  // ================= 开机自启动 =================
  ipcMain.handle('get-auto-launch', () => {
    const settings = app.getLoginItemSettings();
    return settings.openAtLogin;
  });
  ipcMain.handle('set-auto-launch', (_, enabled) => {
    app.setLoginItemSettings({ openAtLogin: enabled });
    return enabled;
  });

  // ================= 系统通知（队列化，避免多条通知被 Windows 合并） =================
  let notifQueue = [];
  let notifBusy = false;

  function processNotifQueue() {
    if (notifBusy || notifQueue.length === 0) return;
    notifBusy = true;
    const { title, body } = notifQueue.shift();
    const notif = new Notification({
      title,
      body,
      icon: windowIcon,
      silent: false
    });
    notif.on('click', () => {
      if (win && !win.isDestroyed()) {
        if (!win.isVisible()) win.show();
        win.focus();
      }
    });
    notif.show();
    setTimeout(() => {
      notifBusy = false;
      processNotifQueue();
    }, 3000);
  }

  ipcMain.on('show-notification', (_, { title, body }) => {
    notifQueue.push({ title, body });
    processNotifQueue();
  });

  function pointInScreenRect(pt, r) {
    return pt.x >= r.x && pt.x < r.x + r.width && pt.y >= r.y && pt.y < r.y + r.height;
  }

  ipcMain.on('content-bounds-screen', (_, bounds) => {
    if (
      bounds &&
      typeof bounds.x === 'number' &&
      typeof bounds.y === 'number' &&
      typeof bounds.width === 'number' &&
      typeof bounds.height === 'number'
    ) {
      contentScreenBounds = bounds;
    }
  });

  ipcMain.on('set-ignore-mouse', (_, ignore) => {
    if (ignoreMousePollTimer) {
      clearInterval(ignoreMousePollTimer);
      ignoreMousePollTimer = null;
    }
    if (win && !win.isDestroyed()) {
      win.setIgnoreMouseEvents(ignore, { forward: true });
      if (ignore) {
        ignoreMousePollTimer = setInterval(() => {
          if (!win || win.isDestroyed()) {
            clearInterval(ignoreMousePollTimer);
            ignoreMousePollTimer = null;
            return;
          }
          const pt = screen.getCursorScreenPoint();
          const wb = win.getBounds();
          const fallback = { x: wb.x, y: wb.y, width: wb.width, height: wb.height };
          const rect = contentScreenBounds || fallback;
          if (pointInScreenRect(pt, rect)) {
            win.setIgnoreMouseEvents(false, { forward: true });
            clearInterval(ignoreMousePollTimer);
            ignoreMousePollTimer = null;
          }
        }, 40);
      }
    }
  });

  win.on('moved', () => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('window-moved');
    }
  });

  // ================= 托盘图标设置（系统右下角小图标） =================
  tray = new Tray(trayIcon);
  tray.setToolTip('TaskFlow');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示 / 隐藏面板',
      click: () => {
        if (win.isVisible()) win.hide();
        else win.show();
      }
    },
    { type: 'separator' },
    {
      label: '退出程序',
      click: () => app.quit()
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (win.isVisible()) win.hide();
    else win.show();
  });
}

app.whenReady().then(() => {
  if (gotLock) createWindow();
});

if (process.platform === 'darwin') {
  app.dock.hide();
}
