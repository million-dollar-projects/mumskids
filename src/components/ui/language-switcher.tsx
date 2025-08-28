'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Globe, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

const languages: Language[] = [
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳'
  },
  {
    code: 'en', 
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  }
]

interface LanguageSwitcherProps {
  currentLocale: string
  variant?: 'compact' | 'full'
  className?: string
}

export function LanguageSwitcher({ 
  currentLocale, 
  variant = 'compact',
  className 
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0]

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLanguageChange = (languageCode: string) => {
    const newPathname = pathname.replace(`/${currentLocale}`, `/${languageCode}`)
    router.push(newPathname)
    setIsOpen(false)
  }

  if (variant === 'compact') {
    return (
      <div className={cn("relative", className)} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1.5 px-2 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
          aria-label={`切换语言，当前: ${currentLanguage.nativeName}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">
            {currentLanguage.code.toUpperCase()}
          </span>
        </button>

        {isOpen && (
          <div 
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            role="listbox"
            aria-label="选择语言"
          >
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left",
                  currentLanguage.code === language.code && "bg-blue-50 text-blue-600"
                )}
                role="option"
                aria-selected={currentLanguage.code === language.code}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-base" role="img" aria-label={`${language.name} 国旗`}>{language.flag}</span>
                  <span className="font-medium">{language.nativeName}</span>
                </div>
                {currentLanguage.code === language.code && (
                  <Check className="w-4 h-4 text-blue-600" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Full variant for landing page
  return (
    <div className={cn("flex gap-1 sm:gap-2", className)}>
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => handleLanguageChange(language.code)}
          className={cn(
            "text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md font-medium transition-colors cursor-pointer",
            currentLanguage.code === language.code
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          {language.nativeName}
        </button>
      ))}
    </div>
  )
}
