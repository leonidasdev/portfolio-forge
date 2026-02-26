/**
 * GitHub Export Button
 *
 * A button component that triggers export to GitHub Pages.
 * Shows progress and handles the entire export flow.
 */

'use client'

import { Button } from '@/components/ui/Button'
import { AlertModal, ConfirmModal } from '@/components/ui/Modal'
import { useState } from 'react'

interface GitHubExportButtonProps {
  portfolioId: string
  portfolioTitle: string
  /** GitHub OAuth token - must be obtained before rendering this component */
  githubToken?: string
  /** Called when GitHub auth is needed */
  onAuthRequired?: () => void
  /** Custom class name */
  className?: string
}

interface ExportResult {
  repoUrl: string
  pagesUrl: string
  commitSha: string
  filesCount: number
  totalSize: number
}

type ExportStatus = 'idle' | 'configuring' | 'exporting' | 'success' | 'error'

export function GitHubExportButton({
  portfolioId,
  portfolioTitle,
  githubToken,
  onAuthRequired,
  className,
}: GitHubExportButtonProps) {
  const [status, setStatus] = useState<ExportStatus>('idle')
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [exportResult, setExportResult] = useState<ExportResult | null>(null)
  const [repoName, setRepoName] = useState('portfolio')
  const [customDomain, setCustomDomain] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  const handleClick = () => {
    if (!githubToken) {
      onAuthRequired?.()
      return
    }
    setShowConfigModal(true)
    setStatus('configuring')
  }

  const handleExport = async () => {
    if (!githubToken) {
      onAuthRequired?.()
      return
    }

    setShowConfigModal(false)
    setStatus('exporting')

    try {
      const response = await fetch('/api/v1/export/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolioId,
          repoName,
          customDomain: customDomain || undefined,
          isPrivate,
          githubToken,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }

      const data = await response.json()
      setExportResult(data.export)
      setStatus('success')
      setShowSuccessModal(true)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Export failed')
      setStatus('error')
      setShowErrorModal(true)
    }
  }

  const handleCloseConfig = () => {
    setShowConfigModal(false)
    setStatus('idle')
  }

  return (
    <>
      <Button
        onClick={handleClick}
        isLoading={status === 'exporting'}
        disabled={status === 'exporting'}
        variant="secondary"
        className={className}
        leftIcon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        }
      >
        {status === 'exporting' ? 'Deploying...' : 'Deploy to GitHub Pages'}
      </Button>

      {/* Configuration Modal */}
      <ConfirmModal
        isOpen={showConfigModal}
        onClose={handleCloseConfig}
        onConfirm={handleExport}
        title="Deploy to GitHub Pages"
        confirmText="Deploy"
        variant="primary"
        message={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: 'var(--color-text)', opacity: 0.8, marginBottom: '0.5rem' }}>
              Deploy <strong>{portfolioTitle}</strong> to GitHub Pages. This will create a
              repository and deploy your portfolio automatically.
            </p>

            <div>
              <label
                htmlFor="repoName"
                style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
              >
                Repository Name
              </label>
              <input
                id="repoName"
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="portfolio"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Your portfolio will be at: https://username.github.io/{repoName || 'portfolio'}
              </p>
            </div>

            <div>
              <label
                htmlFor="customDomain"
                style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}
              >
                Custom Domain (optional)
              </label>
              <input
                id="customDomain"
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="myportfolio.com"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                id="isPrivate"
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                style={{ width: '1rem', height: '1rem' }}
              />
              <label htmlFor="isPrivate" style={{ fontSize: '0.875rem' }}>
                Make repository private
              </label>
            </div>
          </div>
        }
      />

      {/* Success Modal */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false)
          setStatus('idle')
        }}
        title="Deployment Successful!"
        type="success"
        message={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>Your portfolio has been deployed to GitHub Pages!</p>

            {exportResult && (
              <div
                style={{
                  background: '#f0fdf4',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
              >
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Live URL:</strong>{' '}
                  <a
                    href={exportResult.pagesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#059669' }}
                  >
                    {exportResult.pagesUrl}
                  </a>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Repository:</strong>{' '}
                  <a
                    href={exportResult.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#059669' }}
                  >
                    {exportResult.repoUrl}
                  </a>
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                  {exportResult.filesCount} files ({Math.round(exportResult.totalSize / 1024)}KB)
                </div>
              </div>
            )}

            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Note: It may take 1-2 minutes for GitHub Pages to fully deploy your site.
            </p>
          </div>
        }
      />

      {/* Error Modal */}
      <AlertModal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false)
          setStatus('idle')
        }}
        title="Deployment Failed"
        type="error"
        message={
          <>
            <p>{errorMessage}</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Please check your GitHub permissions and try again.
            </p>
          </>
        }
      />
    </>
  )
}
