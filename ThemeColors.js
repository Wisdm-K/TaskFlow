// 主题颜色配置
const THEME_COLORS = {
  default: {
    name: '默认',
    primary: '#64748b',
    primaryDark: '#94a3b8',
    gradientStart: '#ffffff',
    gradientEnd: '#ffffff',
    darkGradientStart: '#000000',
    darkGradientEnd: '#000000',
    singlePrimary: '#2563eb',
    singlePrimaryDark: '#60a5fa',
    rangePrimary: '#22c55e',
    rangePrimaryDark: '#4ade80',
  },
  blue: {
    name: '经典蓝',
    primary: '#2563eb',
    primaryDark: '#60a5fa',
    gradientStart: '#e0f2fe',
    gradientEnd: '#7dd3fc',
    darkGradientStart: '#0f172a',
    darkGradientEnd: '#1e3a8a',
  },
  purple: {
    name: '优雅紫',
    primary: '#9333ea',
    primaryDark: '#c084fc',
    gradientStart: '#f3e8ff',
    gradientEnd: '#d8b4fe',
    darkGradientStart: '#170f2e',
    darkGradientEnd: '#3b0764',
  },
  green: {
    name: '清新绿',
    primary: '#059669',
    primaryDark: '#34d399',
    gradientStart: '#dcfce7',
    gradientEnd: '#6ee7b7',
    darkGradientStart: '#021c15',
    darkGradientEnd: '#064e3b',
  },
  orange: {
    name: '活力橙',
    primary: '#ea580c',
    primaryDark: '#fb923c',
    gradientStart: '#ffedd5',
    gradientEnd: '#fdba74',
    darkGradientStart: '#2a1205',
    darkGradientEnd: '#7c2d12',
  },
  pink: {
    name: '浪漫粉',
    primary: '#db2777',
    primaryDark: '#f472b6',
    gradientStart: '#fce7f3',
    gradientEnd: '#f9a8d4',
    darkGradientStart: '#2e0618',
    darkGradientEnd: '#831843',
  },
  indigo: {
    name: '深邃靛',
    primary: '#4f46e5',
    primaryDark: '#818cf8',
    gradientStart: '#e0e7ff',
    gradientEnd: '#a5b4fc',
    darkGradientStart: '#0f112a',
    darkGradientEnd: '#312e81',
  }
};

// 将 hex 色转为 r,g,b 数字
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function clamp255(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function mixRgb(base, target, ratio) {
  const t = Math.max(0, Math.min(1, ratio));
  return {
    r: clamp255(base.r + (target.r - base.r) * t),
    g: clamp255(base.g + (target.g - base.g) * t),
    b: clamp255(base.b + (target.b - base.b) * t),
  };
}

function rgbaString(rgb, alpha) {
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
}

function opacityToAlpha(percent) {
  const normalized = Math.max(0, Math.min(1, percent / 100));
  return Math.pow(normalized, 1.35);
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h, s, l };
}

function hslToRgb(h, s, l) {
  if (s === 0) { const v = clamp255(l * 255); return { r: v, g: v, b: v }; }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: clamp255(hue2rgb(p, q, h + 1/3) * 255),
    g: clamp255(hue2rgb(p, q, h) * 255),
    b: clamp255(hue2rgb(p, q, h - 1/3) * 255)
  };
}

function boostSaturationAndBrightness(rgb, satBoost, lightBoost) {
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.s = Math.min(1, hsl.s * (1 + satBoost));
  hsl.l = Math.min(1, hsl.l * (1 + lightBoost));
  return hslToRgb(hsl.h, hsl.s, hsl.l);
}

// 获取主题颜色样式
function getThemeStyles(colorKey, isDarkMode, bgOpacity) {
  const color = THEME_COLORS[colorKey] || THEME_COLORS.default;
  const primary = isDarkMode ? color.primaryDark : color.primary;
  const singleTaskPrimary = isDarkMode
    ? (color.singlePrimaryDark || color.primaryDark)
    : (color.singlePrimary || color.primary);
  const rangeTaskPrimary = isDarkMode
    ? (color.rangePrimaryDark || color.primaryDark)
    : (color.rangePrimary || color.primary);
  const alpha = opacityToAlpha(bgOpacity !== undefined ? bgOpacity : 60);

  const isNonDefault = colorKey !== 'default';
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };

  let gradientBg;
  let cardGradient;
  let endRgb;

  if (!isNonDefault) {
    // 默认主题：完全不做任何改动，面板纯色，卡片走 TaskCard 内的 fallback
    const rawStart = hexToRgb(isDarkMode ? color.darkGradientStart : color.gradientStart);
    const rawEnd = hexToRgb(isDarkMode ? color.darkGradientEnd : color.gradientEnd);
    endRgb = rawEnd;
    gradientBg = `linear-gradient(135deg, rgba(${rawStart.r},${rawStart.g},${rawStart.b},${alpha}) 0%, rgba(${rawEnd.r},${rawEnd.g},${rawEnd.b},${alpha}) 100%)`;
    cardGradient = null;
  } else {
    // 非默认主题：统一渐变方案
    // 日间：左上白色 → 右下主题色；夜间：左上黑色 → 右下对应主题深色
    // 面板背景与卡片各自独立渐变，互不影响
    const themeRgb = hexToRgb(color.primary);
    const darkEndRgb = hexToRgb(color.darkGradientEnd);

    if (isDarkMode) {
      endRgb = darkEndRgb;
      const panelStart = mixRgb(black, darkEndRgb, 0.08);
      const panelEnd = darkEndRgb;
      gradientBg = `linear-gradient(135deg, rgba(${panelStart.r},${panelStart.g},${panelStart.b},${alpha}) 0%, rgba(${panelEnd.r},${panelEnd.g},${panelEnd.b},${alpha}) 100%)`;
    } else {
      endRgb = themeRgb;
      const panelStart = white;
      const panelEnd = mixRgb(white, themeRgb, 0.56);
      gradientBg = `linear-gradient(135deg, rgba(${panelStart.r},${panelStart.g},${panelStart.b},${alpha}) 0%, rgba(${panelEnd.r},${panelEnd.g},${panelEnd.b},${alpha}) 100%)`;
    }

    cardGradient = (cardOpacity) => {
      const a = opacityToAlpha(cardOpacity);
      if (isDarkMode) {
        const cardStart = mixRgb(black, darkEndRgb, 0.20);
        return `linear-gradient(135deg, rgba(${cardStart.r},${cardStart.g},${cardStart.b},${a}) 0%, rgba(${darkEndRgb.r},${darkEndRgb.g},${darkEndRgb.b},${a}) 100%)`;
      } else {
        const cardStart = mixRgb(white, themeRgb, 0.07);
        const cardEnd = mixRgb(white, themeRgb, 0.32);
        return `linear-gradient(135deg, rgba(${cardStart.r},${cardStart.g},${cardStart.b},${a}) 0%, rgba(${cardEnd.r},${cardEnd.g},${cardEnd.b},${a}) 100%)`;
      }
    };
  }

  const cardBorder = isDarkMode
    ? 'rgba(255,255,255,0.18)'
    : (isNonDefault ? 'rgba(0,0,0,0.064)' : 'rgba(0,0,0,0.08)');

  const cardShadow = isDarkMode
    ? `0 18px 38px rgba(2,6,23,0.28), 0 8px 20px rgba(${endRgb.r},${endRgb.g},${endRgb.b},0.14)`
    : `0 14px 28px rgba(15,23,42,0.05), 0 4px 10px rgba(${endRgb.r},${endRgb.g},${endRgb.b},0.04)`;

  const cardHoverGlow = isDarkMode
    ? `0 0 0 1px rgba(255,255,255,0.50), 0 0 2px rgba(255,255,255,0.45), 0 0 4px rgba(255,255,255,0.35), 0 0 6px rgba(255,255,255,0.22), 0 18px 40px rgba(2,6,23,0.22)`
    : `0 0 0 1px rgba(255,255,255,0.40), 0 0 2px rgba(255,255,255,0.35), 0 0 4px rgba(255,255,255,0.25), 0 0 6px rgba(255,255,255,0.14), 0 14px 28px rgba(15,23,42,0.08)`;

  return {
    primary,
    singleTaskPrimary,
    rangeTaskPrimary,
    gradientBg,
    cardGradient,
    cardBorder,
    cardShadow,
    cardHoverGlow
  };
}
