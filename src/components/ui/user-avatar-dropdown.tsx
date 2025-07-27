'use client'

import { User, Settings, LogOut } from 'lucide-react'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from './dropdown-menu'
import { useAuth } from '@/lib/auth/context'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface UserAvatarDropdownProps {
  user: SupabaseUser
}

export function UserAvatarDropdown({ user }: UserAvatarDropdownProps) {
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  const getUserInitial = () => {
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase()
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getUserDisplayName = () => {
    return user.user_metadata?.full_name || user.email || '用户'
  }

  return (
    <DropdownMenu
      trigger={
        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors">
          <span className="text-white text-sm font-medium">{getUserInitial()}</span>
        </div>
      }
    >
      {/* 用户信息头部 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-base font-medium">{getUserInitial()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {getUserDisplayName()}
            </p>
            {user.email && (
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 菜单项 */}
      <DropdownMenuItem onClick={() => console.log('查看个人资料')}>
        <div className="flex items-center space-x-3">
          <User className="w-4 h-4 text-gray-500" />
          <span>查看个人资料</span>
        </div>
      </DropdownMenuItem>

      <DropdownMenuItem onClick={() => console.log('设置')}>
        <div className="flex items-center space-x-3">
          <Settings className="w-4 h-4 text-gray-500" />
          <span>设置</span>
        </div>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={handleSignOut} className="text-red-600 hover:bg-red-50">
        <div className="flex items-center space-x-3">
          <LogOut className="w-4 h-4" />
          <span>退出登录</span>
        </div>
      </DropdownMenuItem>
    </DropdownMenu>
  )
}