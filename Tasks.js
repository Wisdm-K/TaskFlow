// 任务逻辑模块
const { useState, useEffect } = React;

// 任务数据管理 Hook
function useTasks(sortByCategory = false) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('desktop_tasks');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: '任务示例1', type: 'single', endDate: '2026-04-01T18:00' },
      { id: '2', title: '任务示例2', type: 'single', endDate: '2026-04-10T12:00' },
      { id: '3', title: '任务示例3', type: 'range', startDate: '2026-03-20T00:00', endDate: '2026-04-05T23:59' },
      { id: '4', title: '任务示例4', type: 'range', startDate: '2026-03-25T00:00', endDate: '2026-04-20T23:59' },
      { id: '5', title: '任务示例5', type: 'single', endDate: '2026-05-01T09:00' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('desktop_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task) => {
    setTasks([...tasks, { ...task, id: Date.now().toString() }]);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // 计算任务的排序权重（剩余时间，单位：毫秒）
  const getTaskWeight = (task, now = new Date()) => {
    if (task.type === 'single') {
      // 单日任务：使用结束时间
      return new Date(task.endDate).getTime() - now.getTime();
    } else {
      // 阶段任务：使用剩余时间（结束时间 - 当前时间）
      return new Date(task.endDate).getTime() - now.getTime();
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortByCategory) {
      // 分类排序：先按类型分组，再按时间排序
      if (a.type !== b.type) {
        return a.type === 'single' ? -1 : 1; // single 在前
      }
      // 同类型按时间排序
      if (a.type === 'single') {
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      } else {
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      }
    } else {
      // 不分类：统一按剩余时间排序
      return getTaskWeight(a) - getTaskWeight(b);
    }
  });

  return { tasks: sortedTasks, addTask, deleteTask };
}

// 时间计算工具
function getSingleTimeRemaining(endDateStr, now) {
  const diff = new Date(endDateStr).getTime() - now.getTime();
  if (diff <= 0) return { expired: true, text: '已结束' };
  return { 
    expired: false, 
    days: Math.floor(diff / 86400000), 
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60)
  };
}

function getRangeProgress(startStr, endStr, now) {
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();
  const current = now.getTime();
  
  if (current <= start) {
    return { 
      percent: 0, 
      daysLeft: Math.ceil((end - start) / 86400000), 
      text: '未开始' 
    };
  }
  if (current >= end) {
    return { percent: 100, daysLeft: 0, text: '已结束' };
  }

  const remainingMs = end - current;
  if (remainingMs <= 86400000) {
    const hours = Math.floor(remainingMs / 3600000);
    const minutes = Math.floor((remainingMs % 3600000) / 60000);
    return {
      percent: ((current - start) / (end - start)) * 100,
      daysLeft: 0,
      text: `剩 ${hours}小时${minutes}分`
    };
  }

  return { 
    percent: ((current - start) / (end - start)) * 100, 
    daysLeft: Math.ceil((end - current) / 86400000), 
    text: `剩 ${Math.ceil((end - current) / 86400000)} 天` 
  };
}

// 任务卡片组件
function TaskCard({ task, onDelete, now, currentTaskOpacity, isDarkMode, themeStyles }) {
  const cardBg = themeStyles?.cardGradient?.(currentTaskOpacity)
    || (isDarkMode
      ? `rgba(0,0,0,${currentTaskOpacity/100})`
      : `linear-gradient(135deg, rgba(255,255,255,${currentTaskOpacity/100}) 0%, rgba(241,245,249,${currentTaskOpacity/100}) 100%)`);
  const cardBorder = themeStyles?.cardBorder || (isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.28)');
  const cardShadow = themeStyles?.cardShadow || (isDarkMode
    ? '0 12px 28px rgba(15,23,42,0.2)'
    : '0 12px 28px rgba(15,23,42,0.08)');
  const cardHoverGlow = themeStyles?.cardHoverGlow || cardShadow;

  return (
    <div className="h-[116px] group shrink-0 relative" style={{ isolation: 'isolate' }}>
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-all duration-300 group-hover:opacity-100"
        style={{ boxShadow: cardHoverGlow, zIndex: 20 }}
      />
      {/* 卡片背景层（仅背景色，受透明度控制） */}
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-300 backdrop-blur-sm overflow-hidden"
        style={{
          border: `1px solid ${cardBorder}`,
          boxShadow: cardShadow,
          zIndex: 1,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: cardBg,
          }}
        />
      </div>
      {/* 卡片内容层（文字等，始终不透明） */}
      <div 
        className="relative h-full rounded-2xl p-4 flex flex-col justify-between overflow-hidden"
        style={{ zIndex: 2 }}
      >
        <button 
          onClick={() => onDelete(task.id)} 
          className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all"
        >
          <IconTrash2 size={14} />
        </button>
        
        <h3
          className="font-bold text-[19px] leading-tight truncate pr-6 shrink-0"
          style={{ fontFamily: "'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', sans-serif" }}
        >
          {task.title}
        </h3>
        
        <div className="flex-1 flex flex-col justify-center min-h-0">
          {task.type === 'single' ? (
            <SingleTaskDisplay task={task} now={now} themeStyles={themeStyles} />
          ) : (
            <RangeTaskDisplay task={task} now={now} themeStyles={themeStyles} />
          )}
        </div>
        
        <div className="text-[11px] text-gray-400 dark:text-gray-400 flex items-center gap-1 mt-1 shrink-0">
          {task.type === 'single' ? (
            <>
              <IconClock size={10} className="shrink-0" />
              <span className="truncate">目标: {task.endDate.replace('T', ' ')}</span>
            </>
          ) : (
            <>
              <IconCalendar size={10} className="shrink-0" />
              <span className="truncate">
                有效期: {task.startDate.split('T')[0]} 至 {task.endDate.split('T')[0]}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 单日任务显示
function SingleTaskDisplay({ task, now, themeStyles }) {
  const info = getSingleTimeRemaining(task.endDate, now);
  const color = themeStyles?.singleTaskPrimary || themeStyles?.primary || '#2563eb';
  
  return (
    <div className="flex items-end gap-2">
      {info.expired ? (
        <span className="text-gray-400 dark:text-gray-500 font-medium">{info.text}</span>
      ) : (
        <div className="flex items-baseline gap-1">
          {info.days > 0 && (<>
            <span className="text-3xl font-bold tracking-tighter" style={{ color }}>{info.days}</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">天</span>
          </>)}
          <span className="text-3xl font-bold tracking-tighter" style={{ color }}>{info.hours}</span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">时</span>
          <span className="text-xl font-semibold tracking-tighter" style={{ color, opacity: 0.85 }}>{info.minutes}</span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">分</span>
        </div>
      )}
    </div>
  );
}

// 时间段任务显示
function RangeTaskDisplay({ task, now, themeStyles }) {
  const prog = getRangeProgress(task.startDate, task.endDate, now);
  const start = new Date(task.startDate).getTime();
  const end = new Date(task.endDate).getTime();
  const current = now.getTime();
  const remainingMs = end - current;
  const isFinalDay = current >= start && remainingMs > 0 && remainingMs <= 86400000;
  const color = themeStyles?.rangeTaskPrimary || themeStyles?.primary || '#22c55e';

  if (isFinalDay) {
    const hours = Math.floor(remainingMs / 3600000);
    const minutes = Math.floor((remainingMs % 3600000) / 60000);
    return (
      <div className="flex items-end gap-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tighter" style={{ color }}>{hours}</span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1">时</span>
          <span className="text-xl font-semibold tracking-tighter" style={{ color, opacity: 0.85 }}>{minutes}</span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">分</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        <span>{new Date(task.startDate).getMonth() + 1}月{new Date(task.startDate).getDate()}日</span>
        <span className="px-2 py-0.5 rounded-full" style={{ 
          backgroundColor: prog.daysLeft === 0 ? 'rgba(156, 163, 175, 0.2)' : `${color}20`,
          color: prog.daysLeft === 0 ? '#9ca3af' : color
        }}>
          {prog.text}
        </span>
        <span>{new Date(task.endDate).getMonth() + 1}月{new Date(task.endDate).getDate()}日</span>
      </div>
      <div className="h-2.5 w-full bg-gray-200/80 dark:bg-gray-700/50 rounded-full overflow-hidden relative">
        <div 
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000" 
          style={{ width: `${prog.percent}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}60` }} 
        />
        {prog.percent > 0 && prog.percent < 100 && (
          <div 
            className="absolute top-0 h-full w-1.5 bg-white/90 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.3)] transform -translate-x-1/2" 
            style={{ left: `${prog.percent}%` }} 
          />
        )}
      </div>
    </div>
  );
}

// 任务列表组件
function TaskList({ tasks, onDeleteTask, now, currentTaskOpacity, isDarkMode, themeStyles }) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-300 text-sm">
        暂无项目
      </div>
    );
  }

  return (
    <>
      {tasks.map(task => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onDelete={onDeleteTask} 
          now={now}
          currentTaskOpacity={currentTaskOpacity}
          isDarkMode={isDarkMode}
          themeStyles={themeStyles}
        />
      ))}
    </>
  );
}

// 添加任务表单组件
function AddTaskForm({ onSubmit, onCancel, themeStyles }) {
  const [formData, setFormData] = useState({ 
    title: '', 
    type: 'single', 
    startDate: '', 
    startTime: '00:00', 
    endDate: '', 
    endTime: '23:59' 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.endDate) return;
    if (formData.type === 'range' && !formData.startDate) return;

    const finalStartDate = formData.type === 'range' 
      ? `${formData.startDate}T${formData.startTime}` 
      : '';
    const finalEndDate = `${formData.endDate}T${formData.endTime}`;

    onSubmit({ 
      title: formData.title, 
      type: formData.type, 
      startDate: finalStartDate, 
      endDate: finalEndDate 
    });
  };

  return (
    <div className="absolute inset-0 z-50 flex items-start justify-center p-4 no-drag pointer-events-auto">
      <div className="w-full max-w-sm bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2rem] shadow-2xl p-6 flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-lg font-semibold">新增项目</h2>
          <button 
            onClick={onCancel} 
            className="p-1 bg-black/5 dark:bg-white/10 rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">项目名称</label>
            <input 
              type="text" 
              required 
              placeholder="例如：拼多多面试" 
              className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black dark:text-white" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">项目类型</label>
            <div className="flex bg-black/5 dark:bg-white/5 rounded-xl p-1">
              <button 
                type="button" 
                className={`flex-1 text-sm py-1.5 rounded-lg transition-all ${
                  formData.type === 'single' 
                    ? 'shadow-sm font-medium text-white' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`} 
                style={formData.type === 'single' ? { backgroundColor: themeStyles?.primary || '#3b82f6' } : {}}
                onClick={() => setFormData({...formData, type: 'single'})}
              >
                单日项目
              </button>
              <button 
                type="button" 
                className={`flex-1 text-sm py-1.5 rounded-lg transition-all ${
                  formData.type === 'range' 
                    ? 'shadow-sm font-medium text-white' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`} 
                style={formData.type === 'range' ? { backgroundColor: themeStyles?.primary || '#3b82f6' } : {}}
                onClick={() => setFormData({...formData, type: 'range'})}
              >
                时间段项目
              </button>
            </div>
          </div>
          
          {formData.type === 'range' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">开始时间</label>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  required 
                  className="flex-1 bg-black/5 dark:bg-white/5 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black dark:text-white" 
                  value={formData.startDate} 
                  onChange={e => setFormData({...formData, startDate: e.target.value})} 
                />
                <input 
                  type="time" 
                  required 
                  className="w-28 bg-black/5 dark:bg-white/5 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black dark:text-white" 
                  value={formData.startTime} 
                  onChange={e => setFormData({...formData, startTime: e.target.value})} 
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {formData.type === 'single' ? '目标时间' : '结束时间'}
            </label>
            <div className="flex gap-2">
              <input 
                type="date" 
                required 
                className="flex-1 bg-black/5 dark:bg-white/5 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black dark:text-white" 
                value={formData.endDate} 
                onChange={e => setFormData({...formData, endDate: e.target.value})} 
              />
              <input 
                type="time" 
                required 
                className="w-28 bg-black/5 dark:bg-white/5 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black dark:text-white" 
                value={formData.endTime} 
                onChange={e => setFormData({...formData, endTime: e.target.value})} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="mt-4 shrink-0 w-full text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg"
            style={{ backgroundColor: themeStyles?.primary || '#3b82f6', boxShadow: `0 4px 12px ${themeStyles?.primary || '#3b82f6'}40` }}
          >
            添加
          </button>
        </form>
      </div>
    </div>
  );
}
