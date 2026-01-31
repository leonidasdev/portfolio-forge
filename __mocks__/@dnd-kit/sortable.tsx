/**
 * Mock for @dnd-kit/sortable
 *
 * Provides minimal mock implementations for testing components
 * that use sortable drag-and-drop functionality.
 */

import React, { ReactNode } from 'react'

export const arrayMove = jest.fn((arr: unknown[], from: number, to: number) => {
  const result = [...arr]
  const [removed] = result.splice(from, 1)
  result.splice(to, 0, removed)
  return result
})

export const SortableContext = ({ children }: { children: ReactNode }) => <div>{children}</div>
export const sortableKeyboardCoordinates = jest.fn()
export const verticalListSortingStrategy = jest.fn()

export const useSortable = () => ({
  attributes: {},
  listeners: {},
  setNodeRef: jest.fn(),
  transform: null,
  transition: null,
  isDragging: false,
})
