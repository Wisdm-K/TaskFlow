/**
 * 窗口边界检测模块
 * 仅当「可见内容区域」超出屏幕时弹回。窗口总高 2200px，但实际可见的只有顶部区域
 * 支持单屏和多屏
 */
const { screen } = require('electron');

// 核心控制区域高度：头部 86px + 余量，确保拖动/设置等按钮在屏幕内
const VISIBLE_HEIGHT = 180;

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
 * 判断可见区域是否有任意部分超出所有显示器（上下左右任一方向）
 * 任一角超出即触发弹回，确保核心控制区始终完整在屏幕内
 */
function isVisiblePartOutside(x, y, width) {
  const displays = screen.getAllDisplays();
  const corners = [
    [x, y],
    [x + width, y],
    [x, y + VISIBLE_HEIGHT],
    [x + width, y + VISIBLE_HEIGHT]
  ];
  const allIn = corners.every(([px, py]) => isPointInAnyDisplay(px, py, displays));
  return !allIn;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * 将可见区域弹回主显示器的位置
 */
function getClampedPosition(x, y, width) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const b = primaryDisplay.bounds;
  const newX = clamp(x, b.x, Math.max(b.x, b.x + b.width - width));
  const newY = clamp(y, b.y, Math.max(b.y, b.y + b.height - VISIBLE_HEIGHT));
  if (newX === x && newY === y) return null;
  return { x: newX, y: newY };
}

/**
 * 仅当可见内容区域超出屏幕时弹回
 */
function ensureWindowInBounds(browserWindow) {
  if (!browserWindow || browserWindow.isDestroyed()) return null;
  const [x, y] = browserWindow.getPosition();
  const [width] = browserWindow.getSize();
  if (!isVisiblePartOutside(x, y, width)) return null;
  return getClampedPosition(x, y, width);
}

module.exports = {
  isVisiblePartOutside,
  getClampedPosition,
  ensureWindowInBounds
};
