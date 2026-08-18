import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Panel({
  title,
  code,
  children,
  className,
  action,
}: {
  title: string
  code?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <section
      className={cn(
        'border border-border bg-card relative',
        'shadow-[0_0_0_1px_rgba(0,0,0,0.4)]',
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border bg-secondary/60 px-4 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-2 w-2 shrink-0 bg-primary" aria-hidden />
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-foreground truncate">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {action}
          {code && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {code}
            </span>
          )}
        </div>
      </header>
      <div className="p-4">{children}</div>
    </section>
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
        {hint && <span className="text-muted-foreground/70">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full border border-input bg-background px-3 py-2 font-mono text-sm text-foreground',
        'placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring',
        'transition-colors',
        className,
      )}
      {...props}
    />
  )
}
