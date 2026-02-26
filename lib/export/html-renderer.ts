/**
 * HTML Renderer
 *
 * Generates static HTML from portfolio data.
 * Converts React component structures to plain HTML strings.
 */

import type { Theme } from '@/lib/templates-themes/definitions'
import type { Portfolio, Section } from '@/types/portfolio'
import type { ExportData, HTMLGeneratorOptions } from './types'

// ============================================================================
// HTML Escaping
// ============================================================================

function escapeHtml(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return str.replace(/[&<>"']/g, (char) => htmlEntities[char])
}

// ============================================================================
// CSS Generation
// ============================================================================

function generateThemeCSS(theme: Theme): string {
  return `
:root {
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  --color-background: ${theme.colors.background};
  --color-text: ${theme.colors.text};
  --font-heading: '${theme.typography.headingFont}', system-ui, sans-serif;
  --font-body: '${theme.typography.bodyFont}', system-ui, sans-serif;
  --spacing-base: ${theme.spacing.base}px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text);
  font-family: var(--font-body);
  line-height: 1.6;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: bold;
  line-height: 1.3;
}

.portfolio-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.portfolio-header {
  margin-bottom: 3rem;
}

.portfolio-title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.portfolio-description {
  font-size: 1.125rem;
  opacity: 0.8;
}

.sections-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.875rem;
  margin-bottom: 1rem;
}

.section-content {
  line-height: 1.75;
  white-space: pre-wrap;
  opacity: 0.9;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  padding: 0.75rem 1rem;
  background: var(--color-primary);
  color: white;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.experience-item {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.experience-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.experience-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.experience-company {
  font-size: 1rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.experience-dates {
  font-size: 0.875rem;
  opacity: 0.7;
}

.experience-description {
  font-size: 0.9375rem;
  opacity: 0.9;
}

.experience-bullets {
  list-style: disc;
  padding-left: 1.5rem;
  margin-top: 0.5rem;
}

.experience-bullets li {
  margin-bottom: 0.25rem;
}

.certification-item {
  padding: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.certification-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.certification-issuer {
  font-size: 0.875rem;
  color: var(--color-primary);
}

.certification-date {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 0.25rem;
}

.custom-section-content {
  line-height: 1.75;
}

/* Two Column Layout */
.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.two-column-main {
  min-width: 0;
}

.two-column-sidebar {
  min-width: 0;
}

/* Timeline Layout */
.timeline-layout {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.timeline-item {
  position: relative;
  padding-left: 2rem;
  padding-bottom: 2rem;
  border-left: 2px solid var(--color-primary);
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 0;
  width: 10px;
  height: 10px;
  background: var(--color-primary);
  border-radius: 50%;
}

.timeline-item:last-child {
  border-left-color: transparent;
}

/* Grid Layout */
.grid-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.grid-item {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Responsive */
@media (max-width: 768px) {
  .portfolio-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .two-column-layout {
    grid-template-columns: 1fr;
  }

  .experience-header {
    flex-direction: column;
  }
}

/* Print styles */
@media print {
  body {
    background: white;
    color: black;
  }

  .skill-tag {
    border: 1px solid var(--color-primary);
    background: transparent;
    color: var(--color-primary);
  }
}
`.trim()
}

// ============================================================================
// Section Renderers
// ============================================================================

interface SectionContent {
  text?: string
  skills?: string[]
  experience?: Array<{
    title?: string
    company?: string
    startDate?: string
    endDate?: string
    description?: string
    bullets?: string[]
  }>
  certifications?: Array<{
    name?: string
    issuer?: string
    issueDate?: string
    expiryDate?: string
    credentialId?: string
    credentialUrl?: string
  }>
  [key: string]: unknown
}

function renderSummarySection(section: Section): string {
  const content = section.custom_content as SectionContent | null
  const text = content?.text || ''

  if (!text) {
    return ''
  }

  return `
<section class="section">
  <h2 class="section-title">About Me</h2>
  <p class="section-content">${escapeHtml(text)}</p>
</section>
`.trim()
}

function renderSkillsSection(section: Section): string {
  const content = section.custom_content as SectionContent | null
  const skills = content?.skills || []

  if (skills.length === 0) {
    return ''
  }

  const skillTags = skills
    .map((skill) => `<span class="skill-tag">${escapeHtml(skill)}</span>`)
    .join('\n      ')

  return `
<section class="section">
  <h2 class="section-title">Skills</h2>
  <div class="skills-container">
      ${skillTags}
  </div>
</section>
`.trim()
}

function renderExperienceSection(section: Section): string {
  const content = section.custom_content as SectionContent | null
  const experiences = content?.experience || []

  if (experiences.length === 0) {
    return ''
  }

  const experienceItems = experiences
    .map((exp) => {
      const bullets = exp.bullets?.length
        ? `
      <ul class="experience-bullets">
        ${exp.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('\n        ')}
      </ul>`
        : ''

      return `
    <div class="experience-item">
      <div class="experience-header">
        <h3 class="experience-title">${escapeHtml(exp.title || 'Untitled')}</h3>
        <span class="experience-dates">${escapeHtml(exp.startDate || '')} - ${escapeHtml(exp.endDate || 'Present')}</span>
      </div>
      <div class="experience-company">${escapeHtml(exp.company || '')}</div>
      ${exp.description ? `<p class="experience-description">${escapeHtml(exp.description)}</p>` : ''}
      ${bullets}
    </div>`
    })
    .join('\n')

  const sectionTitle = section.section_type === 'projects' ? 'Projects' : 'Experience'

  return `
<section class="section">
  <h2 class="section-title">${sectionTitle}</h2>
  ${experienceItems}
</section>
`.trim()
}

function renderCertificationsSection(section: Section): string {
  const content = section.custom_content as SectionContent | null
  const certs = content?.certifications || []

  if (certs.length === 0) {
    return ''
  }

  const certItems = certs
    .map(
      (cert) => `
    <div class="certification-item">
      <div class="certification-name">${escapeHtml(cert.name || 'Untitled')}</div>
      ${cert.issuer ? `<div class="certification-issuer">${escapeHtml(cert.issuer)}</div>` : ''}
      ${cert.issueDate ? `<div class="certification-date">Issued: ${escapeHtml(cert.issueDate)}</div>` : ''}
      ${cert.credentialUrl ? `<a href="${escapeHtml(cert.credentialUrl)}" target="_blank" rel="noopener">View Credential</a>` : ''}
    </div>`
    )
    .join('\n')

  return `
<section class="section">
  <h2 class="section-title">Certifications</h2>
  ${certItems}
</section>
`.trim()
}

function renderCustomSection(section: Section): string {
  const content = section.custom_content as SectionContent | null
  const text = content?.text || ''
  const title = section.title || 'Custom Section'

  if (!text) {
    return ''
  }

  return `
<section class="section">
  <h2 class="section-title">${escapeHtml(title)}</h2>
  <div class="custom-section-content">${escapeHtml(text)}</div>
</section>
`.trim()
}

function renderSection(section: Section): string {
  switch (section.section_type) {
    case 'about':
      return renderSummarySection(section)
    case 'skills':
      return renderSkillsSection(section)
    case 'experience':
    case 'projects':
      return renderExperienceSection(section)
    case 'certifications':
      return renderCertificationsSection(section)
    case 'custom':
    default:
      return renderCustomSection(section)
  }
}

// ============================================================================
// Template Layouts
// ============================================================================

function renderSingleColumnLayout(portfolio: Portfolio, sections: Section[]): string {
  const sectionsHtml = sections.map(renderSection).filter(Boolean).join('\n\n')

  return `
<div class="portfolio-container">
  <header class="portfolio-header">
    <h1 class="portfolio-title">${escapeHtml(portfolio.title || 'My Portfolio')}</h1>
    ${portfolio.description ? `<p class="portfolio-description">${escapeHtml(portfolio.description)}</p>` : ''}
  </header>

  <div class="sections-container">
    ${sectionsHtml}
  </div>
</div>
`.trim()
}

function renderTwoColumnLayout(portfolio: Portfolio, sections: Section[]): string {
  // Split sections: skills and certifications in sidebar, rest in main
  const sidebarTypes = ['skills', 'certifications', 'contact']
  const sidebarSections = sections.filter((s) => sidebarTypes.includes(s.section_type))
  const mainSections = sections.filter((s) => !sidebarTypes.includes(s.section_type))

  const mainHtml = mainSections.map(renderSection).filter(Boolean).join('\n\n')
  const sidebarHtml = sidebarSections.map(renderSection).filter(Boolean).join('\n\n')

  return `
<div class="two-column-layout">
  <div class="two-column-main">
    <header class="portfolio-header">
      <h1 class="portfolio-title">${escapeHtml(portfolio.title || 'My Portfolio')}</h1>
      ${portfolio.description ? `<p class="portfolio-description">${escapeHtml(portfolio.description)}</p>` : ''}
    </header>

    <div class="sections-container">
      ${mainHtml}
    </div>
  </div>

  <aside class="two-column-sidebar">
    ${sidebarHtml}
  </aside>
</div>
`.trim()
}

function renderTimelineLayout(portfolio: Portfolio, sections: Section[]): string {
  const sectionsHtml = sections.map(renderSection).filter(Boolean).join('\n\n')

  return `
<div class="timeline-layout">
  <header class="portfolio-header">
    <h1 class="portfolio-title">${escapeHtml(portfolio.title || 'My Portfolio')}</h1>
    ${portfolio.description ? `<p class="portfolio-description">${escapeHtml(portfolio.description)}</p>` : ''}
  </header>

  <div class="sections-container">
    ${sectionsHtml}
  </div>
</div>
`.trim()
}

function renderGridLayout(portfolio: Portfolio, sections: Section[]): string {
  const sectionsHtml = sections.map(renderSection).filter(Boolean).join('\n\n')

  return `
<div class="grid-layout">
  <header class="portfolio-header">
    <h1 class="portfolio-title">${escapeHtml(portfolio.title || 'My Portfolio')}</h1>
    ${portfolio.description ? `<p class="portfolio-description">${escapeHtml(portfolio.description)}</p>` : ''}
  </header>

  <div class="grid-container">
    ${sectionsHtml}
  </div>
</div>
`.trim()
}

function renderLayout(data: ExportData): string {
  const { portfolio, sections, templateLayout } = data

  switch (templateLayout) {
    case 'two-column':
      return renderTwoColumnLayout(portfolio, sections)
    case 'timeline':
      return renderTimelineLayout(portfolio, sections)
    case 'grid':
      return renderGridLayout(portfolio, sections)
    case 'single-column':
    default:
      return renderSingleColumnLayout(portfolio, sections)
  }
}

// ============================================================================
// Main HTML Generator
// ============================================================================

export interface GeneratedHTML {
  html: string
  css: string
}

/**
 * Generate complete HTML page from portfolio data
 */
export function generatePortfolioHTML(options: HTMLGeneratorOptions): GeneratedHTML {
  const { data, baseUrl = '', meta } = options
  const { theme, portfolio } = data

  // Generate CSS
  const css = generateThemeCSS(theme)

  // Generate body content
  const bodyContent = renderLayout(data)

  // Meta tags
  const title = meta?.title || portfolio.title || 'My Portfolio'
  const description = meta?.description || portfolio.description || 'Professional portfolio'
  const keywords = meta?.keywords?.join(', ') || ''

  // Generate full HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}">` : ''}

  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  ${meta?.ogImage ? `<meta property="og:image" content="${escapeHtml(meta.ogImage)}">` : ''}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="${meta?.twitterCard || 'summary'}">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.typography.headingFont)}:wght@400;600;700&family=${encodeURIComponent(theme.typography.bodyFont)}:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Styles -->
  ${options.inlineStyles ? `<style>${css}</style>` : `<link rel="stylesheet" href="${baseUrl}/styles.css">`}
</head>
<body>
  ${bodyContent}

  <!-- Generated by Portfolio Forge -->
  <footer style="text-align: center; padding: 2rem; opacity: 0.5; font-size: 0.75rem;">
    Built with <a href="https://portfolioforge.dev" target="_blank">Portfolio Forge</a>
  </footer>
</body>
</html>`

  return { html, css }
}

/**
 * Generate CSS file content
 */
export function generateCSS(theme: Theme): string {
  return generateThemeCSS(theme)
}
