// 自定义 Hooks 模块
const { useState, useEffect } = React;
const { ipcRenderer: ipcHooks } = require('electron');

// 主题管理 Hook
function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('desktop_theme');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('desktop_theme', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return { isDarkMode, setIsDarkMode };
}

// 透明度管理 Hook（日夜独立存储，自动跟随当前模式）
function useOpacity(isDarkMode) {
  const [bgOpacityLight, setBgOpacityLight] = useState(() => {
    const saved = localStorage.getItem('desktop_bg_opacity_light');
    const old = localStorage.getItem('desktop_bg_opacity');
    if (saved !== null) return Number(saved);
    if (old !== null) return Number(old);
    return 85;
  });
  const [bgOpacityDark, setBgOpacityDark] = useState(() => {
    const saved = localStorage.getItem('desktop_bg_opacity_dark');
    const old = localStorage.getItem('desktop_bg_opacity');
    if (saved !== null) return Number(saved);
    if (old !== null) return Number(old);
    return 85;
  });
  const [taskOpacityLight, setTaskOpacityLight] = useState(() => {
    const saved = localStorage.getItem('desktop_task_opacity_light');
    const old = localStorage.getItem('desktop_task_opacity');
    if (saved !== null) return Number(saved);
    if (old !== null) return Number(old);
    return 90;
  });
  const [taskOpacityDark, setTaskOpacityDark] = useState(() => {
    const saved = localStorage.getItem('desktop_task_opacity_dark');
    const old = localStorage.getItem('desktop_task_opacity');
    if (saved !== null) return Number(saved);
    if (old !== null) return Number(old);
    return 90;
  });

  useEffect(() => { localStorage.setItem('desktop_bg_opacity_light', bgOpacityLight.toString()); }, [bgOpacityLight]);
  useEffect(() => { localStorage.setItem('desktop_bg_opacity_dark', bgOpacityDark.toString()); }, [bgOpacityDark]);
  useEffect(() => { localStorage.setItem('desktop_task_opacity_light', taskOpacityLight.toString()); }, [taskOpacityLight]);
  useEffect(() => { localStorage.setItem('desktop_task_opacity_dark', taskOpacityDark.toString()); }, [taskOpacityDark]);

  const bgOpacity = isDarkMode ? bgOpacityDark : bgOpacityLight;
  const setBgOpacity = isDarkMode ? setBgOpacityDark : setBgOpacityLight;
  const taskOpacity = isDarkMode ? taskOpacityDark : taskOpacityLight;
  const setTaskOpacity = isDarkMode ? setTaskOpacityDark : setTaskOpacityLight;

  return { bgOpacity, setBgOpacity, taskOpacity, setTaskOpacity };
}

// 显示设置 Hook
function useDisplaySettings() {
  const [maxDisplayCount, setMaxDisplayCount] = useState(() => {
    const saved = localStorage.getItem('desktop_max_display_count');
    return saved !== null ? Number(saved) : 4;
  });

  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem('desktop_pinned');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [sortByCategory, setSortByCategory] = useState(() => {
    const saved = localStorage.getItem('desktop_sort_by_category');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [rememberPosition, setRememberPosition] = useState(() => {
    const saved = localStorage.getItem('desktop_remember_position');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [autoLaunch, setAutoLaunchState] = useState(false);
  useEffect(() => {
    ipcHooks.invoke('get-auto-launch').then(val => setAutoLaunchState(val));
  }, []);
  const setAutoLaunch = (enabled) => {
    ipcHooks.invoke('set-auto-launch', enabled).then(val => setAutoLaunchState(val));
  };

  useEffect(() => {
    localStorage.setItem('desktop_max_display_count', maxDisplayCount.toString());
  }, [maxDisplayCount]);

  useEffect(() => {
    localStorage.setItem('desktop_pinned', JSON.stringify(isPinned));
  }, [isPinned]);

  useEffect(() => {
    localStorage.setItem('desktop_sort_by_category', JSON.stringify(sortByCategory));
  }, [sortByCategory]);

  useEffect(() => {
    localStorage.setItem('desktop_remember_position', JSON.stringify(rememberPosition));
  }, [rememberPosition]);

  return { 
    maxDisplayCount, 
    setMaxDisplayCount, 
    isPinned, 
    setIsPinned,
    sortByCategory,
    setSortByCategory,
    rememberPosition,
    setRememberPosition,
    autoLaunch,
    setAutoLaunch
  };
}

// 当前时间 Hook
function useCurrentTime() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 10000);

    return () => window.clearInterval(timer);
  }, []);

  return now;
}

// 提醒设置 Hook
function useReminderSettings() {
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    const saved = localStorage.getItem('desktop_reminder_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // 到期前 N 天发出首次通知（1~7天，默认1）
  const [reminderDaysBefore, setReminderDaysBefore] = useState(() => {
    const saved = localStorage.getItem('desktop_reminder_days_before');
    return saved !== null ? Number(saved) : 1;
  });

  // 最后一天内的单次提前通知（小时数，0=关闭，1~23）
  const [reminderHoursBefore, setReminderHoursBefore] = useState(() => {
    const saved = localStorage.getItem('desktop_reminder_hours_before');
    return saved !== null ? Number(saved) : 8;
  });

  // 规律性重复通知开关
  const [reminderRepeatEnabled, setReminderRepeatEnabled] = useState(() => {
    const saved = localStorage.getItem('desktop_reminder_repeat_enabled');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // 重复通知间隔（分钟，15~480，默认60）
  const [reminderRepeatInterval, setReminderRepeatInterval] = useState(() => {
    const saved = localStorage.getItem('desktop_reminder_repeat_interval');
    return saved !== null ? Number(saved) : 60;
  });

  useEffect(() => { localStorage.setItem('desktop_reminder_enabled', JSON.stringify(reminderEnabled)); }, [reminderEnabled]);
  useEffect(() => { localStorage.setItem('desktop_reminder_days_before', reminderDaysBefore.toString()); }, [reminderDaysBefore]);
  useEffect(() => { localStorage.setItem('desktop_reminder_hours_before', reminderHoursBefore.toString()); }, [reminderHoursBefore]);
  useEffect(() => { localStorage.setItem('desktop_reminder_repeat_enabled', JSON.stringify(reminderRepeatEnabled)); }, [reminderRepeatEnabled]);
  useEffect(() => { localStorage.setItem('desktop_reminder_repeat_interval', reminderRepeatInterval.toString()); }, [reminderRepeatInterval]);

  return {
    reminderEnabled, setReminderEnabled,
    reminderDaysBefore, setReminderDaysBefore,
    reminderHoursBefore, setReminderHoursBefore,
    reminderRepeatEnabled, setReminderRepeatEnabled,
    reminderRepeatInterval, setReminderRepeatInterval
  };
}

// 任务提醒调度 Hook
function useTaskReminder(tasks, reminderSettings) {
  const {
    reminderEnabled,
    reminderDaysBefore,
    reminderHoursBefore,
    reminderRepeatEnabled,
    reminderRepeatInterval
  } = reminderSettings;

  const sentRef = React.useRef({});

  useEffect(() => {
    if (!reminderEnabled) return;

    const check = () => {
      const now = Date.now();
      const sent = sentRef.current;

      tasks.forEach(task => {
        const endTime = new Date(task.endDate).getTime();
        const remaining = endTime - now;
        if (remaining <= 0) return;

        const daysLeft = remaining / 86400000;
        const hoursLeft = remaining / 3600000;

        // 到期前 N 天通知（只触发一次）
        const dayKey = `day_${task.id}`;
        if (daysLeft <= reminderDaysBefore && daysLeft > 1 && !sent[dayKey]) {
          sent[dayKey] = true;
          const d = Math.ceil(daysLeft);
          ipcHooks.send('show-notification', {
            title: `任务即将到期：${task.title}`,
            body: `距离结束还有 ${d} 天，请注意安排时间。`
          });
        }

        // 最后24小时内的单次提前通知
        if (daysLeft <= 1 && reminderHoursBefore > 0) {
          const hourKey = `hour_${task.id}`;
          if (hoursLeft <= reminderHoursBefore && !sent[hourKey]) {
            sent[hourKey] = true;
            const h = Math.floor(hoursLeft);
            const m = Math.floor((hoursLeft - h) * 60);
            ipcHooks.send('show-notification', {
              title: `任务紧急提醒：${task.title}`,
              body: `距离结束仅剩 ${h}小时${m}分钟！`
            });
          }
        }

        // 规律性重复通知（最后24小时内）
        if (daysLeft <= 1 && reminderRepeatEnabled && reminderRepeatInterval > 0) {
          const intervalMs = reminderRepeatInterval * 60000;
          const repeatKey = `repeat_${task.id}`;
          const lastSent = sent[repeatKey] || 0;
          if (now - lastSent >= intervalMs) {
            sent[repeatKey] = now;
            const h = Math.floor(hoursLeft);
            const m = Math.floor((hoursLeft - h) * 60);
            ipcHooks.send('show-notification', {
              title: `定时提醒：${task.title}`,
              body: `距离结束还有 ${h}小时${m}分钟。`
            });
          }
        }
      });
    };

    check();
    const timer = setInterval(check, 30000);
    return () => clearInterval(timer);
  }, [tasks, reminderEnabled, reminderDaysBefore, reminderHoursBefore, reminderRepeatEnabled, reminderRepeatInterval]);
}

// 主题颜色管理 Hook
function useThemeColor() {
  const [themeColor, setThemeColor] = useState(() => {
    const saved = localStorage.getItem('desktop_theme_color');
    if (saved === 'white' || saved === 'black') return 'default';
    return saved || 'default';
  });

  useEffect(() => {
    localStorage.setItem('desktop_theme_color', themeColor);
  }, [themeColor]);

  return { themeColor, setThemeColor };
}
