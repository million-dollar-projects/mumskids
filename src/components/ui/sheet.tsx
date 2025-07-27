"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface SheetContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue | undefined>(undefined)

function useSheet() {
  const context = React.useContext(SheetContext)
  if (!context) {
    throw new Error("useSheet must be used within a Sheet")
  }
  return context
}

interface SheetProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Sheet = ({ children, open = false, onOpenChange }: SheetProps) => {
  return (
    <SheetContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </SheetContext.Provider>
  )
}

interface SheetTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
  onClick?: () => void
}

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ children, asChild = false, className, onClick, ...props }, ref) => {
    const { onOpenChange } = useSheet()
    
    const handleClick = () => {
      onOpenChange(true)
      onClick?.()
    }

    if (asChild) {
      return React.cloneElement(children as React.ReactElement, {
        onClick: handleClick,
        ref,
      })
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={className}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SheetTrigger.displayName = "SheetTrigger"

interface SheetContentProps {
  children: React.ReactNode
  className?: string
  side?: "top" | "right" | "bottom" | "left"
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ children, className, side = "bottom", ...props }, ref) => {
    const { open, onOpenChange } = useSheet()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
      setMounted(true)
    }, [])

    if (!mounted) return null

    const getAnimationVariants = (side: string) => {
      switch (side) {
        case "top":
          return {
            initial: { y: "-100%" },
            animate: { y: 0 },
            exit: { y: "-100%" }
          }
        case "right":
          return {
            initial: { x: "100%" },
            animate: { x: 0 },
            exit: { x: "100%" }
          }
        case "bottom":
          return {
            initial: { y: "100%" },
            animate: { y: 0 },
            exit: { y: "100%" }
          }
        case "left":
          return {
            initial: { x: "-100%" },
            animate: { x: 0 },
            exit: { x: "-100%" }
          }
        default:
          return {
            initial: { y: "100%" },
            animate: { y: 0 },
            exit: { y: "100%" }
          }
      }
    }

    const sideClasses = {
      top: "top-0 left-0 right-0",
      right: "top-0 right-0 bottom-0",
      bottom: "bottom-0 left-0 right-0",
      left: "top-0 left-0 bottom-0"
    }

    const variants = getAnimationVariants(side)

    const content = (
      <AnimatePresence>
        {open && (
          <>
            {/* 透明的点击区域，用于关闭 Sheet */}
            <motion.div
              className="fixed inset-0 z-[9998]"
              onClick={() => onOpenChange(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            
            {/* Sheet Content */}
            <motion.div
              ref={ref}
              className={cn(
                "fixed z-[9999] bg-white shadow-lg border rounded-t-lg",
                sideClasses[side],
                className
              )}
              initial={variants.initial}
              animate={variants.animate}
              exit={variants.exit}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
                duration: 0.3
              }}
              {...props}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )

    return createPortal(content, document.body)
  }
)
SheetContent.displayName = "SheetContent"

interface SheetHeaderProps {
  children: React.ReactNode
  className?: string
}

const SheetHeader = ({ children, className }: SheetHeaderProps) => {
  const { onOpenChange } = useSheet()
  
  return (
    <div className={cn("flex items-center justify-between p-4 border-b", className)}>
      {children}
      <button
        onClick={() => onOpenChange(false)}
        className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}

interface SheetTitleProps {
  children: React.ReactNode
  className?: string
}

const SheetTitle = ({ children, className }: SheetTitleProps) => {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  )
}

interface SheetCloseProps {
  className?: string
}

const SheetClose = ({ className }: SheetCloseProps) => {
  const { onOpenChange } = useSheet()
  
  return (
    <button
      onClick={() => onOpenChange(false)}
      className={cn(
        "rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
        className
      )}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
}