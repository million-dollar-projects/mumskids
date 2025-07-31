import { ReactNode } from 'react';

interface PracticeLayoutProps {
  children: ReactNode;
}

export default function PracticeLayout({ children }: PracticeLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-200 to-blue-300">
      {/* 专门为练习功能设计的布局，移除系统管理界面元素 */}
      <main className="w-full h-full">
        {children}
      </main>
      
      {/* 可以在这里添加练习专用的全局元素，比如音效控制等 */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* 预留位置给音效控制或其他用户功能 */}
      </div>
    </div>
  );
}