import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'outline' | 'danger' | 'ghost'

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground border-primary hover:brightness-110 active:brightness-95',
  outline:
    'bg-transparent text-foreground border-border hover:border-primary hover:text-primary',
  danger:
    'bg-transparent text-destructive border-destructive/60 hover:bg-destructive hover:text-destructive-foreground',
  ghost:
    'bg-secondary text-secondary-foreground border-transparent hover:bg-muted',
}

export function ActionButton({
  children,
  variant = 'primary',
  className,
  icon,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  icon?: ReactNode
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 border px-3.5 py-2',
        'font-mono text-xs font-semibold uppercase tracking-[0.12em]',
        'transition-all disabled:cursor-not-allowed disabled:opacity-40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        variants[variant],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
