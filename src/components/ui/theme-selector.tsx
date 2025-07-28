'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { themes, Theme } from '@/lib/themes';
import { ChevronsUpDown, Shuffle } from 'lucide-react';

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (themeId: string) => void;
}

export function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);

  const currentTheme = themes.find(t => t.id === selectedTheme);

  const randomizeTheme = () => {
    const availableThemes = themes.filter(theme => theme.id !== selectedTheme);
    const randomTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];
    onThemeChange(randomTheme.id);
  };

  return (
    <Card className="backdrop-blur-sm border-0 shadow-sm rounded cursor-pointer">
      <CardContent className="px-2 py-1">
        <div className="flex items-center justify-between">
          {/* 左侧：主题图标和信息 */}
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg ${currentTheme?.gradient} flex items-center justify-center shadow-sm`}>
              <span className="text-lg">{currentTheme?.icon}</span>
            </div>
            <div>
              <div className="text-sm text-gray-600">主题</div>
              <div className="font-medium text-gray-900">{currentTheme?.name}</div>
            </div>
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center space-x-2">
            {/* 选择按钮 */}
            <Sheet open={themeSheetOpen} onOpenChange={setThemeSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-8 w-8 cursor-pointer bg-purple-900/5 hover:bg-purple-900/10">
                  <ChevronsUpDown className="w-6 h-6 text-gray-500" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[75vh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>选择主题</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <div className="flex items-center justify-center space-x-4 overflow-x-auto pb-4">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          onThemeChange(theme.id);
                          setThemeSheetOpen(false);
                        }}
                        className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-all min-w-[80px] ${
                          selectedTheme === theme.id
                            ? 'bg-blue-50 border-2 border-blue-500'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-lg ${theme.gradient} flex items-center justify-center shadow-sm`}>
                          <span className="text-2xl">{theme.icon}</span>
                        </div>
                        <div className="text-center">
                          <h3 className="font-medium text-gray-900 text-sm">{theme.name}</h3>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* 随机按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-8 w-8 bg-purple-900/5 hover:bg-purple-900/10 opacity-100 cursor-pointer"
              onClick={randomizeTheme}
            >
              <Shuffle className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}