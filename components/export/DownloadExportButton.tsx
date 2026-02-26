/**
 * Download Export Button
 *
 * A button component that downloads the portfolio as a ZIP file.
 */

'use client'

import { Button } from '@/components/ui/Button'
import { AlertModal } from '@/components/ui/Modal'
import { useState } from 'react'

interface DownloadExportButtonProps {
  portfolioId: string
  portfolioTitle: string
  /** Custom class name */
  className?: string
}

type DownloadStatus = 'idle' | 'downloading' | 'error'

export function DownloadExportButton({
  portfolioId,
  portfolioTitle,
  className,
}: DownloadExportButtonProps) {
  const [status, setStatus] = useState<DownloadStatus>('idle')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleDownload = async () => {
    setStatus('downloading')

    try {
      const response = await fetch('/api/v1/export/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolioId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Download failed')
      }

      // Get the blob and trigger download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename =
        filenameMatch?.[1] || `${portfolioTitle.toLowerCase().replace(/\s+/g, '-')}-export.zip`

      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setStatus('idle')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Download failed')
      setStatus('error')
      setShowErrorModal(true)
    }
  }

  return (
    <>
      <Button
        onClick={handleDownload}
        isLoading={status === 'downloading'}
        disabled={status === 'downloading'}
        variant="outline"
        className={className}
        leftIcon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        }
      >
        {status === 'downloading' ? 'Preparing...' : 'Download ZIP'}
      </Button>

      {/* Error Modal */}
      <AlertModal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false)
          setStatus('idle')
        }}
        title="Download Failed"
        type="error"
        message={
          <>
            <p>{errorMessage}</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Please try again later.
            </p>
          </>
        }
      />
    </>
  )
}
