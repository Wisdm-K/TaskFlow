/**
 * 窗口边界检测模块
 * 检测窗口是否完全在可见显示器范围内，支持单屏和多屏
 */
const { screen } = require('electron');

/**
 * 判断点 (px, py) 是否在任意显示器范围内
 */
function isPointInAnyDisplay(px, py, displays) {
  return displays.some(d => {
    const b = d.bounds;
    return px >= b.x && px < b.x + b.width && py >= b.y && py < b.y + b.height;
  });
}

/**
 * 判断窗口是否完全在可见范围内
 * @param {number} x 窗口左上角 x
 * @param {number} y 窗口左上角 y
 * @param {number} width 窗口宽度
 * @param {number} height 窗口高度
 * @returns {boolean} true=完全在范围内，false=有部分在范围外
 */
function isWindowFullyVisible(x, y, width, height) {
  const displays = screen.getAllDisplays();
  const corners = [
    [x, y],
    [x + width, y],
    [x, y + height],
    [x + width, y + height]
  ];
  return corners.every(([px, py]) => isPointInAnyDisplay(px, py, displays));
}

/**
 * 将坐标限制在 [min, max] 范围内
 */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * 计算将窗口弹回可见区域的新位置
 * 优先保留在窗口中心所在的显示器内；若中心已在屏幕外，则弹回主显示器
 * @param {number} x 当前 x
 * @param {number} y 当前 y
 * @param {number} width 窗口宽度
 * @param {number} height 窗口高度
 * @returns {{ x: number, y: number } | null} 若已在范围内返回 null，否则返回新坐标
 */
function getClampedPosition(x, y, width, height) {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();

  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // 查找包含窗口中心的显示器
  let targetDisplay = displays.find(d => {
    const b = d.bounds;
    return centerX >= b.x && centerX < b.x + b.width &&
           centerY >= b.y && centerY < b.y + b.height;
  });

  // 中心在屏幕外，使用主显示器
  if (!targetDisplay) {
    targetDisplay = primaryDisplay;
  }

  const b = targetDisplay.bounds;
  const newX = clamp(x, b.x, b.x + b.width - width);
  const newY = clamp(y, b.y, b.y + b.height - height);

  if (newX === x && newY === y) return null;
  return { x: newX, y: newY };
}

/**
 * 检查窗口位置，若超出可见区域则返回应弹回的位置
 * @param {Electron.BrowserWindow} browserWindow
 * @returns {{ x: number, y: number } | null}
 */
function ensureWindowInBounds(browserWindow) {
  if (!browserWindow || browserWindow.isDestroyed()) return null;
  const [x, y] = browserWindow.getPosition();
  const [width, height] = browserWindow.getSize();
  if (isWindowFullyVisible(x, y, width, height)) return null;
  return getClampedPosition(x, y, width, height);
}

module.exports = {
  isWindowFullyVisible,
  getClampedPosition,
  ensureWindowInBounds
};
