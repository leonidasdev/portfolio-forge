/**
 * Accessibility Tests for UI Components
 *
 * Uses jest-axe to automatically test for accessibility violations.
 * Tests check for WCAG 2.1 Level AA compliance.
 */

import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Button } from '../Button'
import { Modal, ConfirmModal, AlertModal } from '../Modal'
import { Input, Textarea, Select } from '../Input'
import { Card, CardHeader, CardBody, CardFooter } from '../Card'
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard } from '../Skeleton'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  describe('Button', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Button>Click me</Button>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations for all variants', async () => {
      const { container } = render(
        <div>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="success">Success</Button>
        </div>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations when disabled', async () => {
      const { container } = render(<Button disabled>Disabled</Button>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations when loading', async () => {
      const { container } = render(<Button isLoading>Loading</Button>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Modal', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations with footer actions', async () => {
      const { container } = render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
          footer={
            <div>
              <Button variant="secondary">Cancel</Button>
              <Button variant="primary">Save</Button>
            </div>
          }
        >
          <p>Modal content</p>
        </Modal>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('ConfirmModal', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Confirm Action"
          message="Are you sure you want to proceed?"
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations with danger variant', async () => {
      const { container } = render(
        <ConfirmModal
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Delete Item"
          message="This action cannot be undone."
          confirmVariant="danger"
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('AlertModal', () => {
    it('should have no violations for info alert', async () => {
      const { container } = render(
        <AlertModal
          isOpen={true}
          onClose={() => {}}
          title="Information"
          message="This is info."
          type="info"
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations for error alert', async () => {
      const { container } = render(
        <AlertModal
          isOpen={true}
          onClose={() => {}}
          title="Error"
          message="Something went wrong."
          type="error"
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations for success alert', async () => {
      const { container } = render(
        <AlertModal
          isOpen={true}
          onClose={() => {}}
          title="Success"
          message="Operation completed."
          type="success"
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Input', () => {
    it('should have no accessibility violations with label', async () => {
      const { container } = render(<Input label="Email" type="email" placeholder="Enter email" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations with error state', async () => {
      const { container } = render(<Input label="Email" error="Invalid email address" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations when disabled', async () => {
      const { container } = render(<Input label="Email" disabled />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations with helper text', async () => {
      const { container } = render(
        <Input label="Password" type="password" helperText="Must be at least 8 characters" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Textarea', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Textarea label="Description" placeholder="Enter description" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations with error state', async () => {
      const { container } = render(<Textarea label="Description" error="Description is required" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Select', () => {
    const options = [
      { value: 'opt1', label: 'Option 1' },
      { value: 'opt2', label: 'Option 2' },
      { value: 'opt3', label: 'Option 3' },
    ]

    it('should have no accessibility violations', async () => {
      const { container } = render(<Select label="Choose option" options={options} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations with error state', async () => {
      const { container } = render(
        <Select label="Choose option" options={options} error="Selection required" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Card', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <h3>Card Title</h3>
          </CardHeader>
          <CardBody>
            <p>Card content goes here</p>
          </CardBody>
          <CardFooter>
            <Button>Action</Button>
          </CardFooter>
        </Card>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no violations when clickable', async () => {
      const { container } = render(
        <Card onClick={() => {}}>
          <CardBody>Clickable card</CardBody>
        </Card>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Skeleton', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <div>
          <Skeleton className="h-8 w-full" />
          <SkeletonText lines={3} />
          <SkeletonAvatar size="md" />
          <SkeletonCard />
        </div>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Form combinations', () => {
    it('should have no violations for a complete form', async () => {
      const { container } = render(
        <form>
          <Input label="Full Name" required />
          <Input label="Email" type="email" required />
          <Textarea label="Bio" />
          <Select
            label="Country"
            options={[
              { value: 'us', label: 'United States' },
              { value: 'uk', label: 'United Kingdom' },
            ]}
          />
          <div>
            <Button type="submit">Submit</Button>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
