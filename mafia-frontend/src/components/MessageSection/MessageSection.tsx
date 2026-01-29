import { useState } from 'react'
import type { GameMessage } from '../../types/game'
import { Text } from '../Text'
import { Button } from '../Button'

interface MessageSectionProps {
  messages: GameMessage[]
  onAddMessage: (text: string) => void
}

export function MessageSection({ messages, onAddMessage }: MessageSectionProps) {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onAddMessage(text.trim())
      setText('')
    }
  }

  return (
    <section className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <Text variant="h2" className="mb-4">
        Messages
      </Text>
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          rows={3}
        />
        <Button type="submit" fullWidth>
          Submit
        </Button>
      </form>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <Text variant="p" size="sm" color="muted" className="text-center py-8">
            No messages yet. Be the first to post!
          </Text>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <Text variant="p" size="sm">
                {message.text}
              </Text>
              <Text variant="p" size="xs" color="muted" className="mt-1">
                {message.timestamp.toLocaleTimeString()}
              </Text>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
