/**
 * Certification List Component
 * 
 * Client component that displays certifications with filtering, sorting,
 * and actions (edit, delete).
 * 
 * Features:
 * - Table layout with key metadata
 * - Sort by date or name
 * - Filter by tag (placeholder)
 * - Edit and delete actions
 * - Create new certification button
 */

'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/lib/api/client'
import type { CertificationWithTags } from '@/app/dashboard/certifications/page'

type SortOption = 'newest' | 'oldest' | 'a-z'

interface CertificationListProps {
  certifications: CertificationWithTags[]
}

export function CertificationList({ certifications }: CertificationListProps) {
  const router = useRouter()
  
  // State
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Extract unique tags from all certifications
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    certifications.forEach((cert) => {
      cert.tags.forEach((tag) => {
        if (tag.name) tagSet.add(tag.name)
      })
    })
    return Array.from(tagSet).sort()
  }, [certifications])

  // Filter by tag
  const filteredCertifications = useMemo(() => {
    if (selectedTag === 'all') return certifications
    
    return certifications.filter((cert) =>
      cert.tags.some((tag) => tag.name === selectedTag)
    )
  }, [certifications, selectedTag])

  // Sort certifications
  const sortedCertifications = useMemo(() => {
    const sorted = [...filteredCertifications]
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = a.date_issued || a.created_at
          const dateB = b.date_issued || b.created_at
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        })
      case 'oldest':
        return sorted.sort((a, b) => {
          const dateA = a.date_issued || a.created_at
          const dateB = b.date_issued || b.created_at
          return new Date(dateA).getTime() - new Date(dateB).getTime()
        })
      case 'a-z':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      default:
        return sorted
    }
  }, [filteredCertifications, sortBy])

  // Delete handler
  async function handleDelete(id: string, title: string) {
    const confirmed = confirm(
      `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`
    )
    
    if (!confirmed) return
    
    setDeletingId(id)
    
    try {
      await apiClient.delete(`/certifications/${id}`)
      
      // Refresh the page to show updated list
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete certification')
    } finally {
      setDeletingId(null)
    }
  }

  // Format date
  function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Get certification type label
  function getTypeLabel(type: string): string {
    switch (type) {
      case 'pdf':
        return 'PDF'
      case 'image':
        return 'Image'
      case 'external_link':
        return 'External Link'
      case 'manual':
        return 'Manual'
      default:
        return type
    }
  }

  // Get type badge color
  function getTypeBadgeColor(type: string): string {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800'
      case 'image':
        return 'bg-purple-100 text-purple-800'
      case 'external_link':
        return 'bg-blue-100 text-blue-800'
      case 'manual':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          {/* Sort dropdown */}
          <div>
            <label htmlFor="sort" className="sr-only">Sort by</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="a-z">A–Z</option>
            </select>
          </div>

          {/* Tag filter dropdown */}
          <div>
            <label htmlFor="tag-filter" className="sr-only">Filter by tag</label>
            <select
              id="tag-filter"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Tags</option>
              {availableTags.length === 0 && (
                <option disabled>No tags yet</option>
              )}
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600">
            {sortedCertifications.length} {sortedCertifications.length === 1 ? 'certification' : 'certifications'}
          </div>
        </div>

        {/* New certification button */}
        <Link
          href="/dashboard/certifications/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium"
        >
          + New Certification
        </Link>
      </div>

      {/* Empty state */}
      {sortedCertifications.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {selectedTag === 'all' ? 'No certifications' : 'No certifications with this tag'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedTag === 'all' 
              ? 'Get started by creating a new certification.'
              : 'Try selecting a different tag or create a new certification.'}
          </p>
          {selectedTag === 'all' && (
            <div className="mt-6">
              <Link
                href="/dashboard/certifications/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                + New Certification
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Certifications table */}
      {sortedCertifications.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certification
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issuer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visibility
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCertifications.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {cert.title}
                    </div>
                    {cert.tags.length > 0 && (
                      <div className="mt-1 flex gap-1 flex-wrap">
                        {cert.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {cert.issuing_organization}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(cert.date_issued)}
                    </div>
                    {cert.expiration_date && (
                      <div className="text-xs text-gray-500">
                        Expires: {formatDate(cert.expiration_date)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(cert.certification_type)}`}>
                      {getTypeLabel(cert.certification_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cert.is_public ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Private
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/certifications/${cert.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(cert.id, cert.title)}
                        disabled={deletingId === cert.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === cert.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
