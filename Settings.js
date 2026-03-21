// 设置面板组件
function SettingsPanel({ isOpen, onClose, settings, panelVisibleHeight, themeStyles }) {
  if (!isOpen) return null;

  const {
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
    reminderEnabled,
    setReminderEnabled,
    reminderDaysBefore,
    setReminderDaysBefore,
    reminderHoursBefore,
    setReminderHoursBefore,
    reminderRepeatEnabled,
    setReminderRepeatEnabled,
    reminderRepeatInterval,
    setReminderRepeatInterval
  } = settings;

  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center p-4 no-drag pointer-events-auto">
      <div
        className="w-full max-w-sm bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2rem] shadow-2xl p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200"
        style={{ maxHeight: panelVisibleHeight ? `${panelVisibleHeight}px` : 'calc(100vh - 32px)' }}
      >
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-lg font-semibold">偏好设置</h2>
          <button 
            onClick={onClose} 
            className="p-1 bg-black/5 dark:bg-white/10 rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>
        
        <div className="flex-1 min-h-0 flex flex-col gap-5 overflow-y-auto custom-scrollbar pr-1">
          <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
            <h3 className="text-xs font-bold text-gray-400 mb-4 tracking-wider">透明度</h3>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  面板背景不透明度
                </label>
                <span className="text-xs font-mono text-gray-500 bg-white dark:bg-black/20 px-2 py-0.5 rounded-md">
                  {currentBgOpacity}%
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={currentBgOpacity} 
                onChange={e => setCurrentBgOpacity(Number(e.target.value))} 
                className="w-full appearance-none bg-transparent outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  任务卡片不透明度
                </label>
                <span className="text-xs font-mono text-gray-500 bg-white dark:bg-black/20 px-2 py-0.5 rounded-md">
                  {currentTaskOpacity}%
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={currentTaskOpacity} 
                onChange={e => setCurrentTaskOpacity(Number(e.target.value))} 
                className="w-full appearance-none bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
            <h3 className="text-xs font-bold text-gray-400 mb-4 tracking-wider">显示设置</h3>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  面板高度随数量缩放
                </label>
                <span className="text-xs font-mono text-gray-500 bg-white dark:bg-black/20 px-2 py-0.5 rounded-md">
                  {maxDisplayCount} 个
                </span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="15" 
                value={maxDisplayCount} 
                onChange={e => setMaxDisplayCount(Number(e.target.value))} 
                className="w-full appearance-none bg-transparent outline-none"
              />
              <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                <span>1 个</span>
                <span>15 个</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  任务分类排序
                </label>
                <p className="text-[10px] text-gray-400 mt-0.5">单日项目与时间段项目分组显示</p>
              </div>
              <button
                onClick={() => setSortByCategory(!sortByCategory)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  sortByCategory ? '' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                style={{ backgroundColor: sortByCategory ? themeStyles?.primary || '#3b82f6' : undefined }}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    sortByCategory ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                记住窗口位置
              </label>
              <button
                onClick={() => setRememberPosition(!rememberPosition)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  rememberPosition ? '' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                style={{ backgroundColor: rememberPosition ? themeStyles?.primary || '#3b82f6' : undefined }}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    rememberPosition ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  开机自启动
                </label>
                <p className="text-[10px] text-gray-400 mt-0.5">系统登录后自动运行此程序</p>
              </div>
              <button
                onClick={() => setAutoLaunch(!autoLaunch)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  autoLaunch ? '' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                style={{ backgroundColor: autoLaunch ? themeStyles?.primary || '#3b82f6' : undefined }}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    autoLaunch ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
            <h3 className="text-xs font-bold text-gray-400 mb-4 tracking-wider flex items-center gap-1.5">
              <IconBell size={12} />
              任务到期提醒
            </h3>

            <div className="flex items-center justify-between py-2 mb-2">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  启用通知提醒
                </label>
                <p className="text-[10px] text-gray-400 mt-0.5">通过 Windows 通知中心推送提醒</p>
              </div>
              <button
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  reminderEnabled ? '' : 'bg-gray-300 dark:bg-gray-600'
                }`}
                style={{ backgroundColor: reminderEnabled ? themeStyles?.primary || '#3b82f6' : undefined }}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    reminderEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {reminderEnabled && (
              <div className="space-y-4 pt-2 border-t border-gray-200/20 dark:border-gray-700/30">
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      提前通知天数
                    </label>
                    <span className="text-xs font-mono text-gray-500 bg-white dark:bg-black/20 px-2 py-0.5 rounded-md">
                      {reminderDaysBefore} 天
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    value={reminderDaysBefore}
                    onChange={e => setReminderDaysBefore(Number(e.target.value))}
                    className="w-full appearance-none bg-transparent outline-none"
                  />
                  <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                    <span>1 天</span>
                    <span>7 天</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">到期前 {reminderDaysBefore} 天发送首次提醒</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      最后一天提前通知
                    </label>
                    <span className="text-xs font-mono text-gray-500 bg-white dark:bg-black/20 px-2 py-0.5 rounded-md">
                      {reminderHoursBefore === 0 ? '关闭' : `${reminderHoursBefore} 小时`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="23"
                    value={reminderHoursBefore}
                    onChange={e => setReminderHoursBefore(Number(e.target.value))}
                    className="w-full appearance-none bg-transparent outline-none"
                  />
                  <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                    <span>关闭</span>
                    <span>23 小时</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {reminderHoursBefore === 0 ? '不发送最后一天的提前通知' : `剩余 ${reminderHoursBefore} 小时时发送一次紧急提醒`}
                  </p>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      规律性重复提醒
                    </label>
                    <p className="text-[10px] text-gray-400 mt-0.5">最后一天内按固定间隔反复通知</p>
                  </div>
                  <button
                    onClick={() => setReminderRepeatEnabled(!reminderRepeatEnabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      reminderRepeatEnabled ? '' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    style={{ backgroundColor: reminderRepeatEnabled ? themeStyles?.primary || '#3b82f6' : undefined }}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        reminderRepeatEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {reminderRepeatEnabled && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        重复间隔
                      </label>
                      <span className="text-xs font-mono text-gray-500 bg-white dark:bg-black/20 px-2 py-0.5 rounded-md">
                        {reminderRepeatInterval >= 60 
                          ? `${Math.floor(reminderRepeatInterval / 60)} 小时${reminderRepeatInterval % 60 > 0 ? ` ${reminderRepeatInterval % 60} 分` : ''}`
                          : `${reminderRepeatInterval} 分钟`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="480"
                      step="15"
                      value={reminderRepeatInterval}
                      onChange={e => setReminderRepeatInterval(Number(e.target.value))}
                      className="w-full appearance-none bg-transparent outline-none"
                    />
                    <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                      <span>15 分钟</span>
                      <span>8 小时</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl">
            <h3 className="text-xs font-bold text-gray-400 mb-4 tracking-wider">主题颜色</h3>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {Object.entries(THEME_COLORS).map(([key, color]) => (
                (() => {
                  const swatchStyle = { backgroundColor: color.primary };
                  return (
                <button
                  key={key}
                  onClick={() => setThemeColor(key)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    themeColor === key
                      ? 'border-current scale-95'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  style={{ color: color.primary }}
                >
                  <div className="w-full h-8 rounded-lg mb-1 border border-black/10 dark:border-white/10" style={swatchStyle} />
                  <div className="text-[10px] text-gray-600 dark:text-gray-400 text-center">{color.name}</div>
                </button>
                  );
                })()
              ))}
            </div>
          </div>
        </div>
        
        <button 
          onClick={onClose} 
          className="mt-6 shrink-0 w-full text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg"
          style={{ backgroundColor: themeStyles?.primary || '#3b82f6', boxShadow: `0 4px 12px ${themeStyles?.primary || '#3b82f6'}40` }}
        >
          完成
        </button>
      </div>
    </div>
  );
}

// 退出确认弹窗组件
function CloseConfirmDialog({ isOpen, onCancel, onConfirm, panelRef }) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center no-drag pointer-events-auto">
      <div 
        className="w-full max-w-xs bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2rem] shadow-2xl p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        <h3 className="text-lg font-semibold text-center mb-2">退出程序</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          确定要关闭桌面时间进度条吗？
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onCancel} 
            className="flex-1 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300 font-medium hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-sm shadow-red-500/30"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
