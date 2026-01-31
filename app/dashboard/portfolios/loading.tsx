/**
 * Portfolios Loading State
 *
 * Displays skeleton UI while portfolios list is loading.
 */

import { Skeleton, SkeletonCard } from '@/components/ui'

export default function PortfoliosLoading() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} hasImage={true} lines={2} />
        ))}
      </div>
    </div>
  )
}
