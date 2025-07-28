'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DropdownMenu({ trigger, children, align = 'right', className, open, onOpenChange }: DropdownMenuProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = open !== undefined ? open : internalIsOpen
  const setIsOpen = onOpenChange || setInternalIsOpen
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      
      {isOpen && (
        <div className={cn(
          "absolute top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50",
          align === 'right' ? 'right-0' : 'left-0',
          className
        )}>
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function DropdownMenuItem({ children, onClick, className }: DropdownMenuItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors",
        className
      )}
    >
      {children}
    </div>
  )
}

interface DropdownMenuSeparatorProps {
  className?: string
}

export function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return <div className={cn("h-px bg-gray-200 my-1", className)} />
}