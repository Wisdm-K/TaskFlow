/**
 * 窗口「超出屏幕弹回」机制（主逻辑集中在此文件）
 *
 * 窗口 BrowserWindow 比可见磨砂面板大（透明边距 + 高 2200 的占位），
 * 弹回检测应按「实际面板」的水平范围判断，避免左右比视觉面板更宽。
 *
 * 与页面根节点 `p-4`（每侧 16px）对齐；垂直方向仍只关心顶部「核心控制区」。
 */
const { screen } = require('electron');

/** 顶部参与检测的高度：头部 + 余量，保证标题栏/按钮在屏内 */
const VISIBLE_HEIGHT = 180;

/**
 * 与渲染层左右留白一致（Tailwind p-4 ≈ 16px/侧）
 * 用于：可见角点取在「磨砂面板」左右边上，而非整窗左右边
 */
const HORIZONTAL_CONTENT_INSET_PER_SIDE = 16;

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/** 根据窗口宽度计算单侧内缩（避免极小窗口时 inset 过大） */
function getEffectiveHorizontalInset(winWidth) {
  return Math.min(
    HORIZONTAL_CONTENT_INSET_PER_SIDE,
    Math.max(0, Math.floor((winWidth - 4) / 2))
  );
}

/**
 * 面板内容在屏幕坐标系下的左右边界（用于角点检测与水平钳位）
 * @param {number} winX - BrowserWindow.getPosition()[0]
 * @param {number} winWidth - BrowserWindow.getSize()[0]
 */
function getContentHorizontalEdges(winX, winWidth) {
  const inset = getEffectiveHorizontalInset(winWidth);
  return {
    left: winX + inset,
    right: winX + winWidth - inset,
    inset,
  };
}

function isPointInAnyDisplay(px, py, displays) {
  return displays.some((d) => {
    const b = d.bounds;
    return px >= b.x && px < b.x + b.width && py >= b.y && py < b.y + b.height;
  });
}

/**
 * 可见「面板」区域是否有一部分落在所有显示器之外（任一角离开即视为越界）
 */
function isVisiblePartOutside(winX, winY, winWidth) {
  const { left, right } = getContentHorizontalEdges(winX, winWidth);
  const displays = screen.getAllDisplays();
  const corners = [
    [left, winY],
    [right, winY],
    [left, winY + VISIBLE_HEIGHT],
    [right, winY + VISIBLE_HEIGHT],
  ];
  return !corners.every(([px, py]) => isPointInAnyDisplay(px, py, displays));
}

/**
 * 将窗口位置钳到主显示器内，使「面板」水平范围与顶部可见条不越界
 * @returns {{ x: number, y: number } | null}
 */
function getClampedPosition(winX, winY, winWidth) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const b = primaryDisplay.bounds;
  const inset = getEffectiveHorizontalInset(winWidth);

  const minX = b.x - inset;
  const maxX = b.x + b.width - winWidth + inset;
  const newX = clamp(winX, minX, maxX);
  const newY = clamp(winY, b.y, Math.max(b.y, b.y + b.height - VISIBLE_HEIGHT));

  if (newX === winX && newY === winY) return null;
  return { x: newX, y: newY };
}

/**
 * 若当前窗口越界则返回应设置的新坐标，否则 null
 */
function ensureWindowInBounds(browserWindow) {
  if (!browserWindow || browserWindow.isDestroyed()) return null;
  const [winX, winY] = browserWindow.getPosition();
  const [winWidth] = browserWindow.getSize();
  if (!isVisiblePartOutside(winX, winY, winWidth)) return null;
  return getClampedPosition(winX, winY, winWidth);
}

/**
 * 若越界则 setPosition，返回是否发生了修正
 */
function snapWindowIntoBoundsIfNeeded(browserWindow) {
  const next = ensureWindowInBounds(browserWindow);
  if (!next) return false;
  browserWindow.setPosition(next.x, next.y);
  return true;
}

/**
 * 恢复上次保存的窗口左上角时，是否至少落在某块显示器附近（带容差）
 */
function isSavedPositionOnAnyDisplay(winX, winY, marginPx = 100) {
  const displays = screen.getAllDisplays();
  return displays.some((d) => {
    const b = d.bounds;
    return (
      winX >= b.x - marginPx &&
      winX < b.x + b.width &&
      winY >= b.y - marginPx &&
      winY < b.y + b.height
    );
  });
}

module.exports = {
  VISIBLE_HEIGHT,
  HORIZONTAL_CONTENT_INSET_PER_SIDE,
  getContentHorizontalEdges,
  isVisiblePartOutside,
  getClampedPosition,
  ensureWindowInBounds,
  snapWindowIntoBoundsIfNeeded,
  isSavedPositionOnAnyDisplay,
};
