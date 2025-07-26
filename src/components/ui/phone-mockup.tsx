export function PhoneMockup() {
  return (
    <svg
      width="320"
      height="640"
      viewBox="0 0 320 640"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-2xl"
    >
      {/* 手机外框 */}
      <rect
        x="10"
        y="10"
        width="300"
        height="620"
        rx="40"
        fill="white"
        stroke="#e5e7eb"
        strokeWidth="2"
      />
      
      {/* 屏幕 */}
      <rect
        x="25"
        y="60"
        width="270"
        height="520"
        rx="25"
        fill="url(#screenGradient)"
      />
      
      {/* 听筒 */}
      <rect
        x="130"
        y="30"
        width="60"
        height="6"
        rx="3"
        fill="#9ca3af"
      />
      
      {/* Home按钮 */}
      <circle
        cx="160"
        cy="600"
        r="15"
        fill="#f3f4f6"
        stroke="#d1d5db"
        strokeWidth="1"
      />
      
      {/* 屏幕内容 */}
      <g>
        {/* 状态栏 */}
        <rect x="40" y="80" width="240" height="20" fill="rgba(255,255,255,0.1)" rx="10" />
        
        {/* 标题区域 */}
        <text x="160" y="140" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">
          数学练习
        </text>
        <text x="160" y="165" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="14">
          从这里开始
        </text>
        
        {/* 练习卡片 */}
        <rect x="50" y="200" width="220" height="120" rx="15" fill="rgba(255,255,255,0.15)" />
        
        {/* 卡片内容 */}
        <circle cx="80" cy="230" r="15" fill="rgba(255,255,255,0.3)" />
        <text x="105" y="235" fill="white" fontSize="16" fontWeight="600">10以内加法</text>
        <text x="105" y="250" fill="rgba(255,255,255,0.7)" fontSize="12">20题练习</text>
        
        <text x="60" y="280" fill="rgba(255,255,255,0.9)" fontSize="12">
          简单的数学计算练习
        </text>
        <text x="60" y="295" fill="rgba(255,255,255,0.9)" fontSize="12">
          让孩子快乐学习数学！
        </text>
        
        {/* 装饰圆点 */}
        <circle cx="250" cy="150" r="8" fill="rgba(255,255,255,0.2)" />
        <circle cx="70" cy="400" r="6" fill="rgba(255,255,255,0.15)" />
        <circle cx="240" cy="450" r="4" fill="rgba(255,255,255,0.25)" />
      </g>
      
      {/* 渐变定义 */}
      <defs>
        <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
}