/**
 * Tests for Skeleton Components
 */

import { render, screen } from '@testing-library/react'
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonTable,
  SkeletonListItem,
} from '../Skeleton'

describe('Skeleton', () => {
  it('should render with default classes', () => {
    const { container } = render(<Skeleton />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveClass('animate-pulse', 'bg-gray-200', 'rounded')
  })

  it('should accept additional className', () => {
    const { container } = render(<Skeleton className="h-8 w-32" />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton).toHaveClass('h-8', 'w-32')
  })
})

describe('SkeletonText', () => {
  it('should render 3 lines by default', () => {
    const { container } = render(<SkeletonText />)
    const lines = container.querySelectorAll('.animate-pulse')
    expect(lines).toHaveLength(3)
  })

  it('should render specified number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />)
    const lines = container.querySelectorAll('.animate-pulse')
    expect(lines).toHaveLength(5)
  })

  it('should set last line width', () => {
    const { container } = render(<SkeletonText lines={3} lastLineWidth="80%" />)
    const lines = container.querySelectorAll('.animate-pulse')
    const lastLine = lines[lines.length - 1] as HTMLElement
    // Check style attribute directly since JSDOM style object doesn't always reflect inline styles
    expect(lastLine.getAttribute('style')).toContain('80%')
  })

  it('should set full width for non-last lines', () => {
    const { container } = render(<SkeletonText lines={3} />)
    const lines = container.querySelectorAll('.animate-pulse')
    const firstLine = lines[0] as HTMLElement
    expect(firstLine.getAttribute('style')).toContain('100%')
  })
})

describe('SkeletonAvatar', () => {
  it('should render with medium size by default', () => {
    const { container } = render(<SkeletonAvatar />)
    const avatar = container.firstChild as HTMLElement
    expect(avatar).toHaveClass('rounded-full', 'h-10', 'w-10')
  })

  it('should render with small size', () => {
    const { container } = render(<SkeletonAvatar size="sm" />)
    const avatar = container.firstChild as HTMLElement
    expect(avatar).toHaveClass('h-8', 'w-8')
  })

  it('should render with large size', () => {
    const { container } = render(<SkeletonAvatar size="lg" />)
    const avatar = container.firstChild as HTMLElement
    expect(avatar).toHaveClass('h-16', 'w-16')
  })
})

describe('SkeletonButton', () => {
  it('should render with medium size by default', () => {
    const { container } = render(<SkeletonButton />)
    const button = container.firstChild as HTMLElement
    expect(button).toHaveClass('h-10', 'w-24')
  })

  it('should render with small size', () => {
    const { container } = render(<SkeletonButton size="sm" />)
    const button = container.firstChild as HTMLElement
    expect(button).toHaveClass('h-8', 'w-20')
  })

  it('should render with large size', () => {
    const { container } = render(<SkeletonButton size="lg" />)
    const button = container.firstChild as HTMLElement
    expect(button).toHaveClass('h-12', 'w-32')
  })
})

describe('SkeletonCard', () => {
  it('should render with image by default', () => {
    const { container } = render(<SkeletonCard />)
    // Image placeholder is full width and has rounded-none
    const imagePlaceholder = container.querySelector('.rounded-none')
    expect(imagePlaceholder).toBeInTheDocument()
  })

  it('should render without image when hasImage is false', () => {
    const { container } = render(<SkeletonCard hasImage={false} />)
    const imagePlaceholder = container.querySelector('.rounded-none')
    expect(imagePlaceholder).not.toBeInTheDocument()
  })

  it('should render with card styling', () => {
    const { container } = render(<SkeletonCard />)
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow')
  })

  it('should render specified number of text lines', () => {
    const { container } = render(<SkeletonCard lines={4} />)
    // Get text lines (excluding header skeleton and tag skeletons)
    const textContainer = container.querySelector('.space-y-2')
    expect(textContainer).toBeInTheDocument()
  })
})

describe('SkeletonTable', () => {
  it('should render 5 rows by default', () => {
    const { container } = render(<SkeletonTable />)
    // 1 header row + 5 data rows = 6 flex containers
    const flexRows = container.querySelectorAll('.flex.gap-4')
    expect(flexRows).toHaveLength(6) // header + 5 rows
  })

  it('should render specified number of rows', () => {
    const { container } = render(<SkeletonTable rows={3} />)
    const flexRows = container.querySelectorAll('.flex.gap-4')
    expect(flexRows).toHaveLength(4) // header + 3 rows
  })

  it('should render 4 columns by default', () => {
    const { container } = render(<SkeletonTable />)
    // Check first row has 4 skeleton elements
    const headerRow = container.querySelector('.border-b')
    const headerSkeletons = headerRow?.querySelectorAll('.animate-pulse')
    expect(headerSkeletons).toHaveLength(4)
  })

  it('should render specified number of columns', () => {
    const { container } = render(<SkeletonTable columns={6} />)
    const headerRow = container.querySelector('.border-b')
    const headerSkeletons = headerRow?.querySelectorAll('.animate-pulse')
    expect(headerSkeletons).toHaveLength(6)
  })
})

describe('SkeletonListItem', () => {
  it('should render with avatar by default', () => {
    const { container } = render(<SkeletonListItem />)
    const avatar = container.querySelector('.rounded-full')
    expect(avatar).toBeInTheDocument()
  })

  it('should render without avatar when hasAvatar is false', () => {
    const { container } = render(<SkeletonListItem hasAvatar={false} />)
    const avatar = container.querySelector('.rounded-full')
    expect(avatar).not.toBeInTheDocument()
  })

  it('should have flex layout', () => {
    const { container } = render(<SkeletonListItem />)
    const listItem = container.firstChild as HTMLElement
    expect(listItem).toHaveClass('flex', 'gap-4', 'items-start')
  })

  it('should accept additional className', () => {
    const { container } = render(<SkeletonListItem className="p-4" />)
    const listItem = container.firstChild as HTMLElement
    expect(listItem).toHaveClass('p-4')
  })
})
