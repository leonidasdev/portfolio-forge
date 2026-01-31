/**
 * Mock for @dnd-kit/core
 *
 * Provides minimal mock implementations for testing components
 * that use drag-and-drop functionality.
 */

import { ReactNode } from 'react'

export const DndContext = ({ children }: { children: ReactNode }) => <div>{children}</div>
export const closestCenter = jest.fn()
export const KeyboardSensor = jest.fn()
export const PointerSensor = jest.fn()
export const useSensor = jest.fn()
export const useSensors = () => []
