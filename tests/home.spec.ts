/**
 * Home Page E2E Tests
 *
 * Tests for the public landing page.
 */

import { expect, test } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')

    // Check that the page loads
    await expect(page).toHaveURL('/')
  })

  test('should display the application name', async ({ page }) => {
    await page.goto('/')

    // Look for Portfolio Forge branding
    await expect(page.getByText(/portfolio forge/i)).toBeVisible()
  })

  test('should have navigation to login', async ({ page }) => {
    await page.goto('/')

    // Find login link or button
    const loginLink = page.getByRole('link', { name: /log in|sign in/i })
    await expect(loginLink).toBeVisible()
  })

  test('should have navigation to signup', async ({ page }) => {
    await page.goto('/')

    // Find signup link or button
    const signupLink = page.getByRole('link', { name: /sign up|get started|create/i })
    await expect(signupLink).toBeVisible()
  })

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Page should still be functional
    await expect(page.getByText(/portfolio forge/i)).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await expect(page.getByText(/portfolio forge/i)).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await expect(page.getByText(/portfolio forge/i)).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('should navigate from home to login', async ({ page }) => {
    await page.goto('/')

    // Click login
    await page.getByRole('link', { name: /log in|sign in/i }).click()

    // Verify URL changed
    await expect(page).toHaveURL(/.*login/)
  })

  test('should navigate from home to signup', async ({ page }) => {
    await page.goto('/')

    // Click signup/get started
    const signupButton = page.getByRole('link', { name: /sign up|get started|create/i }).first()
    await signupButton.click()

    // Verify URL changed
    await expect(page).toHaveURL(/.*signup/)
  })
})

test.describe('Public Portfolio Access', () => {
  test('should handle invalid portfolio token gracefully', async ({ page }) => {
    // Try to access a non-existent public portfolio
    await page.goto('/p/invalid-token-12345')

    // Should show error or 404
    const errorText = page.getByText(/not found|doesn't exist|invalid|error/i)
    await expect(errorText).toBeVisible()
  })
})
