/**
 * Certifications Loading State
 *
 * Displays skeleton UI while certifications list is loading.
 */

import { Skeleton, SkeletonListItem } from '@/components/ui'

export default function CertificationsLoading() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-8 w-44 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Certifications List */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4">
            <SkeletonListItem hasAvatar={true} lines={2} />
          </div>
        ))}
      </div>
    </div>
  )
}
