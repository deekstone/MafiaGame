import { useState, type FormEvent, type KeyboardEvent, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { CommentEntry } from '../../types/game'
import { Text } from '../Text'
import { Button } from '../Button'

interface CommentSectionProps {
  comments: CommentEntry[]
  onSendComment: (message: string) => Promise<boolean>
  isSending: boolean
}

// Check if device is mobile
const isMobileDevice = () => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  )
}

const SEND_DEBOUNCE_MS = 1000

export function CommentSection({ comments, onSendComment, isSending }: CommentSectionProps) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSendRef = useRef(0)

  const handleSubmit = async (e?: FormEvent) => {
    if (e) {
      e.preventDefault()
    }
    // If a mobile blur auto-submit is pending, cancel it so we don't double-send.
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
    if (!text.trim() || isSending) {
      return
    }
    if (Date.now() - lastSendRef.current < SEND_DEBOUNCE_MS) {
      return
    }
    lastSendRef.current = Date.now()

    const success = await onSendComment(text.trim())
    if (success) {
      setText('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, but allow Shift+Enter for new lines
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    // Auto-submit on mobile when keyboard closes (blur)
    // Don't auto-submit if focus is moving to the send button
    const relatedTarget = e.relatedTarget as HTMLElement | null
    const isMovingToButton = relatedTarget?.tagName === 'BUTTON' || relatedTarget?.closest('button')

    if (isMobileDevice() && text.trim() && !isSending && !isMovingToButton) {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
      blurTimeoutRef.current = setTimeout(() => {
        handleSubmit()
      }, 150)
    }
  }

  const handleFocus = () => {
    // Clear blur timeout if user refocuses
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  return (
    <section className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6 flex flex-col min-h-0 h-full">
      <Text variant="h2" className="mb-4">
        {t('game.comments')}
      </Text>

      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={t('game.commentPlaceholder')}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 text-base"
          rows={3}
          maxLength={500}
          disabled={isSending}
        />
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Text variant="p" size="xs" color="muted">
            {t('game.charactersCount', { count: text.length })}
          </Text>
          <Button
            type="submit"
            disabled={!text.trim() || isSending}
            size="lg"
            touchFriendly
            className="py-2.5 px-6"
          >
            {isSending ? t('common.sending') : t('common.send')}
          </Button>
        </div>
      </form>

      <div className="space-y-3 md:max-h-96 overflow-y-auto flex-1 min-h-0">
        {comments.length === 0 ? (
          <Text variant="p" size="sm" color="muted" className="text-center py-8">
            {t('game.noComments')}
          </Text>
        ) : (
          <>
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-sm font-bold shrink-0 text-gray-900 dark:text-gray-100">
                    {comment.nickname}
                  </span>
                  <Text variant="p" size="xs" color="muted" className="shrink-0">
                    {comment.timestamp.toLocaleTimeString()}
                  </Text>
                </div>
                <Text
                  variant="p"
                  size="sm"
                  className="whitespace-pre-wrap text-gray-700 dark:text-gray-300"
                >
                  {comment.message}
                </Text>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  )
}
