// 主应用组件
const { useState, useEffect, useRef, useCallback } = React;
const { ipcRenderer } = require('electron');

function App() {
  const now = useCurrentTime();
  const [isAdding, setIsAdding] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const { isDarkMode, setIsDarkMode } = useTheme();
  const opacity = useOpacity(isDarkMode);
  const { 
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
  } = useDisplaySettings();
  const { themeColor, setThemeColor } = useThemeColor();
  const reminderSettings = useReminderSettings();
  const { tasks, addTask, deleteTask } = useTasks(sortByCategory);

  useTaskReminder(tasks, reminderSettings);
  
  const mainPanelRef = useRef(null);
  const [panelVisibleHeight, setPanelVisibleHeight] = useState(null);

  const currentBgOpacity = opacity.bgOpacity;
  const setCurrentBgOpacity = opacity.setBgOpacity;
  const currentTaskOpacity = opacity.taskOpacity;
  const setCurrentTaskOpacity = opacity.setTaskOpacity;

  const handleAddTask = (task) => {
    addTask(task);
    setIsAdding(false);
  };

  const confirmCloseApp = () => {
    window.close();
  };

  // 智能自适应最大高度状态
  const [adaptiveMaxHeight, setAdaptiveMaxHeight] = useState('100vh');

  useEffect(() => {
    const updateAdaptiveHeight = () => {
      // 1. 获取屏幕实际可用高度（刨去 Windows 任务栏等）
      const screenHeight = window.screen.availHeight || window.innerHeight;
      const availableHeight = screenHeight - 64; // 上下再预留 64px 的安全边距

      // 2. 基础高度参数
      // 面板基础占用 = 头部(86px) + 列表上下内边距(约18px) = 104px
      // 单个任务占用 = 卡片(116px) + 间距(16px) = 132px

      // 3. 计算当前屏幕最多能“完整”放下几个任务卡片
      const maxFullTasks = Math.floor((availableHeight - 104) / 132);

      // 4. 核心逻辑：取【用户偏好设置】与【屏幕物理极限】的最小值
      // 保证最大不超屏幕，最小不低于1个
      const actualDisplayCount = Math.min(maxDisplayCount, Math.max(1, maxFullTasks));

      // 5. 生成完美贴合的像素高度
      const perfectHeight = 104 + actualDisplayCount * 132;
      setAdaptiveMaxHeight(`${perfectHeight}px`);
    };

    updateAdaptiveHeight();
    window.addEventListener('resize', updateAdaptiveHeight);
    return () => window.removeEventListener('resize', updateAdaptiveHeight);
  }, [maxDisplayCount]); // 当用户在设置里调整最大数量时，也会重新计算




  // 获取主题样式
  const themeStyles = getThemeStyles(themeColor, isDarkMode, currentBgOpacity);

  // 窗口位置管理
  useEffect(() => {
    if (rememberPosition) {
      // 1. 加载保存的位置
      const savedPosition = localStorage.getItem('desktop_window_position');
      if (savedPosition) {
        const { x, y } = JSON.parse(savedPosition);
        // 直接使用 ipcRenderer 调用 main.js 注册好的 handle
        ipcRenderer.invoke('set-window-position', { x, y });
      }

      // 2. 监听窗口移动事件并保存位置
      const savePosition = () => {
        ipcRenderer.invoke('get-window-position').then(pos => {
          localStorage.setItem('desktop_window_position', JSON.stringify(pos));
        }).catch(err => console.error("无法获取窗口位置:", err));
      };

      // 仅靠 blur 有时不能完美捕捉拖拽结束，加上 mouseup 会更稳
      window.addEventListener('blur', savePosition);
      window.addEventListener('mouseup', savePosition);

      return () => {
        window.removeEventListener('blur', savePosition);
        window.removeEventListener('mouseup', savePosition);
      };
    }
  }, [rememberPosition]);

  // 将设置面板高度限制为当前主面板可见高度
  useEffect(() => {
    const updatePanelHeight = () => {
      if (mainPanelRef.current) {
        setPanelVisibleHeight(Math.round(mainPanelRef.current.clientHeight));
      }
    };

    updatePanelHeight();
    window.addEventListener('resize', updatePanelHeight);

    let observer = null;
    if (typeof ResizeObserver !== 'undefined' && mainPanelRef.current) {
      observer = new ResizeObserver(updatePanelHeight);
      observer.observe(mainPanelRef.current);
    }

    return () => {
      window.removeEventListener('resize', updatePanelHeight);
      if (observer) observer.disconnect();
    };
  }, [maxDisplayCount, tasks.length]);

  // 鼠标穿透：面板外区域让操作系统级别的点击穿透到桌面
  const containerRef = useRef(null);
  const hasModal = isAdding || isSettingsOpen || isClosing;
  useEffect(() => {
    let ignoring = false;
    /** 边缘命中膨胀，减少边界误判；与主进程 content-bounds 一致 */
    const hitPad = 3;

    const sendContentBounds = () => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      ipcRenderer.send('content-bounds-screen', {
        x: window.screenX + r.left,
        y: window.screenY + r.top,
        width: r.width,
        height: r.height,
      });
    };

    const onWindowMoved = () => {
      sendContentBounds();
    };
    ipcRenderer.on('window-moved', onWindowMoved);

    const onPointerMove = (e) => {
      sendContentBounds();
      if (hasModal) {
        if (ignoring) {
          ipcRenderer.send('set-ignore-mouse', false);
          ignoring = false;
        }
        return;
      }
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left - hitPad &&
        e.clientX <= rect.right + hitPad &&
        e.clientY >= rect.top - hitPad &&
        e.clientY <= rect.bottom + hitPad;
      if (inside && ignoring) {
        ipcRenderer.send('set-ignore-mouse', false);
        ignoring = false;
      } else if (!inside && !ignoring) {
        ipcRenderer.send('set-ignore-mouse', true);
        ignoring = true;
      }
    };
    const onFocus = () => {
      if (ignoring) {
        ipcRenderer.send('set-ignore-mouse', false);
        ignoring = false;
      }
    };
    if (hasModal) ipcRenderer.send('set-ignore-mouse', false);

    const opts = { capture: true, passive: true };
    document.addEventListener('pointermove', onPointerMove, opts);

    let resizeObserver = null;
    const el = containerRef.current;
    if (el && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => sendContentBounds());
      resizeObserver.observe(el);
    }
    sendContentBounds();

    window.addEventListener('focus', onFocus);
    return () => {
      ipcRenderer.removeListener('window-moved', onWindowMoved);
      document.removeEventListener('pointermove', onPointerMove, opts);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('focus', onFocus);
      if (ignoring) ipcRenderer.send('set-ignore-mouse', false);
    };
  }, [hasModal, adaptiveMaxHeight]);

  return (
    <div className="h-screen w-screen flex flex-col p-4 font-sans text-gray-800 dark:text-gray-100">
      
      <div ref={containerRef} className="w-full max-w-sm mx-auto relative" style={{ maxHeight:adaptiveMaxHeight }}>
      <div 
        ref={mainPanelRef}
        className={`w-full border rounded-[2rem] overflow-hidden flex flex-col relative transition-all duration-300 backdrop-blur-2xl
        ${!isPinned ? `drag-region shadow-[0_0_30px_rgba(0,0,0,0.1)]` : 'no-drag border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)]'}`}
        style={{ 
          background: themeStyles.gradientBg,
          maxHeight: adaptiveMaxHeight,
          borderColor: !isPinned ? `${themeStyles.primary}80` : undefined,
        }}
      >
        
        {/* 头部固定高度 86px */}
        <div className="h-[86px] shrink-0 px-6 flex justify-between items-center border-b border-gray-200/30 dark:border-gray-700/30">
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-semibold tracking-tight">
              {!isPinned ? '拖动窗口调整位置' : '时间进度'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">
              {now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
            </p>
          </div>
          
          <div className="flex gap-2 no-drag items-center">
            <button 
              onClick={() => setIsClosing(true)} 
              title="退出并关闭挂件" 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/40 transition-colors"
            >
              <IconPower size={14} />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)} 
              title="偏好设置" 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              <IconSliders size={15} />
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              title={isDarkMode ? "切换到日间模式" : "切换到夜间模式"} 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              {isDarkMode ? <IconSun size={16} /> : <IconMoon size={16} />}
            </button>
            <button 
              onClick={() => setIsPinned(!isPinned)} 
              title={isPinned ? "点击解锁并拖动位置" : "点击锁定位置"} 
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors`}
              style={{
                backgroundColor: !isPinned ? `${themeStyles.primary}20` : undefined,
                color: !isPinned ? themeStyles.primary : undefined
              }}
            >
              {!isPinned ? <IconMove size={16} /> : <IconPin size={16} />}
            </button>
            <button 
              onClick={() => setIsAdding(true)} 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            >
              <IconPlus size={18} />
            </button>
          </div>
        </div>

        {/* 任务列表 */}
        <div className="px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar flex-1 no-drag">
          <TaskList 
            tasks={tasks} 
            onDeleteTask={deleteTask} 
            now={now}
            currentTaskOpacity={currentTaskOpacity}
            isDarkMode={isDarkMode}
            themeStyles={themeStyles}
          />
        </div>
      </div>

      {/* 退出确认弹窗 */}
      <CloseConfirmDialog 
        isOpen={isClosing}
        onCancel={() => setIsClosing(false)}
        onConfirm={confirmCloseApp}
        panelRef={mainPanelRef}
      />

      {/* 偏好设置模态框 */}
      <SettingsPanel 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        panelVisibleHeight={panelVisibleHeight}
        themeStyles={themeStyles}
        settings={{
          isDarkMode,
          currentBgOpacity,
          setCurrentBgOpacity,
          currentTaskOpacity,
          setCurrentTaskOpacity,
          maxDisplayCount,
          setMaxDisplayCount,
          sortByCategory,
          setSortByCategory,
          rememberPosition,
          setRememberPosition,
          themeColor,
          setThemeColor,
          autoLaunch,
          setAutoLaunch,
          ...reminderSettings
        }}
      />

      {/* 添加任务模态框 */}
      {isAdding && (
        <AddTaskForm 
          onSubmit={handleAddTask}
          onCancel={() => setIsAdding(false)}
          themeStyles={themeStyles}
        />
      )}
      </div>
    </div>
  );
}
