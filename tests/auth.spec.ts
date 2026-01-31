/**
 * Authentication E2E Tests
 *
 * Tests for login, signup, and authentication flows.
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login page', async ({ page }) => {
      await page.goto('/auth/login')

      // Check page title or heading
      await expect(page).toHaveURL(/.*login/)
      await expect(page.getByRole('heading', { name: /sign in|log in/i })).toBeVisible()
    })

    test('should have OAuth login buttons', async ({ page }) => {
      await page.goto('/auth/login')

      // Check for OAuth providers (GitHub, Google, etc.)
      const oauthButtons = page.getByRole('button').filter({
        hasText: /github|google|continue with/i,
      })
      await expect(oauthButtons.first()).toBeVisible()
    })

    test('should have link to signup page', async ({ page }) => {
      await page.goto('/auth/login')

      // Find signup link
      const signupLink = page.getByRole('link', { name: /sign up|create account|register/i })
      await expect(signupLink).toBeVisible()

      // Click and verify navigation
      await signupLink.click()
      await expect(page).toHaveURL(/.*signup/)
    })
  })

  test.describe('Signup Page', () => {
    test('should display signup page', async ({ page }) => {
      await page.goto('/auth/signup')

      // Check page loads
      await expect(page).toHaveURL(/.*signup/)
      await expect(page.getByRole('heading', { name: /sign up|create|register/i })).toBeVisible()
    })

    test('should have OAuth signup buttons', async ({ page }) => {
      await page.goto('/auth/signup')

      // Check for OAuth providers
      const oauthButtons = page.getByRole('button').filter({
        hasText: /github|google|continue with/i,
      })
      await expect(oauthButtons.first()).toBeVisible()
    })

    test('should have link to login page', async ({ page }) => {
      await page.goto('/auth/signup')

      // Find login link
      const loginLink = page.getByRole('link', { name: /sign in|log in|already have/i })
      await expect(loginLink).toBeVisible()

      // Click and verify navigation
      await loginLink.click()
      await expect(page).toHaveURL(/.*login/)
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing dashboard unauthenticated', async ({ page }) => {
      // Try to access dashboard without auth
      await page.goto('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/.*login/)
    })

    test('should redirect to login when accessing portfolios unauthenticated', async ({ page }) => {
      // Try to access portfolios without auth
      await page.goto('/dashboard/portfolios')

      // Should redirect to login
      await expect(page).toHaveURL(/.*login/)
    })

    test('should redirect to login when accessing settings unauthenticated', async ({ page }) => {
      // Try to access settings without auth
      await page.goto('/dashboard/settings')

      // Should redirect to login
      await expect(page).toHaveURL(/.*login/)
    })
  })
})
