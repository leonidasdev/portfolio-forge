/**
 * Dashboard Loading State
 *
 * Displays skeleton UI while dashboard content is loading.
 * Provides visual feedback and prevents layout shift.
 */

import { Skeleton, SkeletonListItem } from '@/components/ui'

export default function DashboardLoading() {
  return (
    <div className="p-6">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Portfolios */}
        <div className="bg-white p-6 rounded-lg shadow">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <Skeleton className="h-6 w-36 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonListItem key={i} hasAvatar={true} lines={1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
