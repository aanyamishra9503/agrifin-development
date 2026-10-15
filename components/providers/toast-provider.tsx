'use client'

import { CircleCheck, X } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { usePreferences } from './preferences-provider'

interface ToastValue {
  showSuccess: (message: string) => void
}

const ToastContext = createContext<ToastValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { t } = usePreferences()
  const [message, setMessage] = useState<{ id: number; text: string } | null>(null)

  const showSuccess = useCallback((text: string) => setMessage({ id: Date.now(), text }), [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 6000)
    return () => clearTimeout(timer)
  }, [message])

  return (
    <ToastContext.Provider value={{ showSuccess }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="no-print pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-6"
      >
        {message && (
          <div
            key={message.id}
            className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-lg animate-in fade-in slide-in-from-bottom-2"
          >
            <CircleCheck className="size-6 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-base font-medium leading-snug">{message.text}</p>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="flex size-10 shrink-0 items-center justify-center rounded-lg hover:bg-primary-foreground/15"
            >
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">{t('common.close')}</span>
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
