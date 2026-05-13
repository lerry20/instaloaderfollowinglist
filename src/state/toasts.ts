import { create } from 'zustand'

export interface Toast {
  id: number
  message: string
  kind: 'info' | 'success' | 'warn' | 'danger'
  undo?: () => void | Promise<void>
  duration: number
}

interface ToastState {
  toasts: Toast[]
  show: (
    message: string,
    options?: { kind?: Toast['kind']; undo?: Toast['undo']; duration?: number },
  ) => number
  dismiss: (id: number) => void
}

let nextId = 1

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  show(message, options = {}) {
    const id = nextId++
    const toast: Toast = {
      id,
      message,
      kind: options.kind ?? 'info',
      undo: options.undo,
      duration: options.duration ?? 4500,
    }
    set((s) => ({ toasts: [...s.toasts, toast] }))
    window.setTimeout(() => {
      const cur = get().toasts.find((t) => t.id === id)
      if (cur) get().dismiss(id)
    }, toast.duration)
    return id
  },
  dismiss(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))

export function toast(
  message: string,
  options?: { kind?: Toast['kind']; undo?: Toast['undo']; duration?: number },
) {
  return useToasts.getState().show(message, options)
}
