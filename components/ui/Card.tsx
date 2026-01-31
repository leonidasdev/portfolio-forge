/**
 * Card Component
 *
 * A flexible card component for content containers.
 *
 * @example
 * import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
 *
 * <Card>
 *   <CardHeader title="Card Title" subtitle="Optional subtitle" />
 *   <CardBody>Card content here</CardBody>
 *   <CardFooter>Footer actions</CardFooter>
 * </Card>
 */

import { cn } from '@/lib/utils'

// ============================================================================
// Card Component
// ============================================================================

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to add hover effect */
  hoverable?: boolean
  /** Whether the card is clickable (adds cursor and hover states) */
  clickable?: boolean
  /** Card padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export function Card({
  className,
  children,
  hoverable = false,
  clickable = false,
  padding = 'none',
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        hoverable && 'transition-shadow hover:shadow-md',
        clickable && 'cursor-pointer transition-all hover:shadow-md hover:border-gray-300',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================================================
// CardHeader Component
// ============================================================================

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card title */
  title?: string
  /** Card subtitle */
  subtitle?: string
  /** Right side content (e.g., actions) */
  action?: React.ReactNode
  /** Whether to show border at the bottom */
  bordered?: boolean
}

export function CardHeader({
  className,
  title,
  subtitle,
  action,
  bordered = true,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div className={cn('px-4 py-4', bordered && 'border-b border-gray-200', className)} {...props}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}

// ============================================================================
// CardBody Component
// ============================================================================

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to add padding */
  noPadding?: boolean
}

export function CardBody({ className, noPadding = false, children, ...props }: CardBodyProps) {
  return (
    <div className={cn(!noPadding && 'px-4 py-4', className)} {...props}>
      {children}
    </div>
  )
}

// ============================================================================
// CardFooter Component
// ============================================================================

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show border at the top */
  bordered?: boolean
  /** Alignment of footer content */
  align?: 'left' | 'center' | 'right' | 'between'
}

const alignClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
}

export function CardFooter({
  className,
  bordered = true,
  align = 'right',
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn(
        'px-4 py-3 flex items-center gap-3',
        bordered && 'border-t border-gray-200 bg-gray-50 rounded-b-lg',
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
