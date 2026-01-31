/**
 * Skeleton Components
 *
 * Reusable loading skeleton components for consistent loading states.
 *
 * @example
 * import { Skeleton, SkeletonText, SkeletonCard } from '@/components/ui/Skeleton'
 *
 * <Skeleton className="h-8 w-32" />
 * <SkeletonText lines={3} />
 * <SkeletonCard />
 */

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

/**
 * Basic skeleton element with pulse animation
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
}

interface SkeletonTextProps {
  /** Number of text lines to show */
  lines?: number
  /** Width of the last line (percentage) */
  lastLineWidth?: string
  className?: string
}

/**
 * Skeleton for text content with multiple lines
 */
export function SkeletonText({ lines = 3, lastLineWidth = '60%', className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{
            width: i === lines - 1 ? lastLineWidth : '100%',
          }}
        />
      ))}
    </div>
  )
}

interface SkeletonAvatarProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Skeleton for avatar/profile images
 */
export function SkeletonAvatar({ size = 'md', className }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  }

  return <Skeleton className={cn('rounded-full', sizeClasses[size], className)} />
}

interface SkeletonButtonProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Skeleton for buttons
 */
export function SkeletonButton({ size = 'md', className }: SkeletonButtonProps) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  }

  return <Skeleton className={cn(sizeClasses[size], className)} />
}

interface SkeletonCardProps {
  /** Show image placeholder */
  hasImage?: boolean
  /** Number of text lines */
  lines?: number
  className?: string
}

/**
 * Skeleton for card components
 */
export function SkeletonCard({ hasImage = true, lines = 2, className }: SkeletonCardProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow overflow-hidden', className)}>
      {hasImage && <Skeleton className="h-32 w-full rounded-none" />}
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <SkeletonText lines={lines} />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

interface SkeletonTableProps {
  /** Number of rows */
  rows?: number
  /** Number of columns */
  columns?: number
  className?: string
}

/**
 * Skeleton for table content
 */
export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

interface SkeletonListItemProps {
  /** Show avatar */
  hasAvatar?: boolean
  /** Number of text lines */
  lines?: number
  className?: string
}

/**
 * Skeleton for list items
 */
export function SkeletonListItem({
  hasAvatar = true,
  lines = 2,
  className,
}: SkeletonListItemProps) {
  return (
    <div className={cn('flex gap-4 items-start', className)}>
      {hasAvatar && <SkeletonAvatar />}
      <div className="flex-1">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <SkeletonText lines={lines - 1} />
      </div>
    </div>
  )
}
