import { useEffect, useState, useRef, useCallback } from 'react'
import type { Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import type { Comment, CommentEntry } from '../types/game'
import { getSocket } from '../utils/socket'
import { subscribeToGame } from '../utils/gameSubscription'

interface SendCommentResponse {
  success: boolean
  comment?: Comment
  error?: string
}

/**
 * Hook to manage game comments - handles both socket events and sending comments
 */
export function useComments(gameId: string | undefined) {
  const [comments, setComments] = useState<CommentEntry[]>([])
  const [isSending, setIsSending] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  // Helper function to convert Comment to CommentEntry
  const convertCommentToEntry = useCallback((comment: Comment): CommentEntry => {
    const timestamp =
      comment.timestamp instanceof Date ? comment.timestamp : new Date(comment.timestamp)

    return {
      id: comment.id,
      gameId: comment.gameId,
      userId: comment.userId,
      nickname: comment.nickname,
      message: comment.message,
      timestamp,
    }
  }, [])

  // Initialize socket connection and subscribe to comment events
  useEffect(() => {
    if (!gameId) {
      return
    }

    // Get or create the shared socket instance
    socketRef.current = getSocket()

    const socket = socketRef.current

    // Listen for all comments event (sent when subscribing/reconnecting)
    // This loads all previous comments for the game
    const handleAllComments = (data: { gameId: string; comments: Comment[] }) => {
      // Events are already filtered by the game room, so we don't need to check gameId
      const commentEntries = data.comments.map(convertCommentToEntry)
      setComments(commentEntries)
    }

    // Listen for individual game:comment events (new comments as they happen)
    const handleGameComment = (data: { gameId: string; comment: Comment }) => {
      const commentEntry = convertCommentToEntry(data.comment)

      setComments((prev) => {
        // Avoid duplicates
        if (prev.some((comment) => comment.id === commentEntry.id)) {
          return prev
        }
        // Prepend new comment (newest first)
        return [commentEntry, ...prev]
      })
    }

    socket.on('game:comments:all', handleAllComments)
    socket.on('game:comment', handleGameComment)

    // Subscribe to the game room using shared subscription manager
    // This ensures game:subscribe is only emitted once per gameId
    const unsubscribe = subscribeToGame(gameId)

    // Cleanup: unsubscribe when component unmounts or gameId changes
    return () => {
      socket.off('game:comments:all', handleAllComments)
      socket.off('game:comment', handleGameComment)
      unsubscribe()
    }
  }, [gameId, convertCommentToEntry])

  /**
   * Send a comment to the game
   * Uses socket for real-time communication
   */
  const sendComment = useCallback(
    (message: string): Promise<boolean> => {
      if (!gameId) {
        toast.error('Game ID is required')
        return Promise.resolve(false)
      }

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        toast.error('Comment message is required')
        return Promise.resolve(false)
      }

      if (message.length > 500) {
        toast.error('Comment message is too long (max 500 characters)')
        return Promise.resolve(false)
      }

      const socket = socketRef.current
      if (!socket) {
        toast.error('Socket not initialized')
        return Promise.resolve(false)
      }

      setIsSending(true)

      return new Promise((resolve) => {
        socket.emit(
          'game:comment:send',
          { gameId, message: message.trim() },
          (response: SendCommentResponse) => {
            setIsSending(false)

            if (response.success) {
              // The comment will be added to the list via the 'game:comment' event
              resolve(true)
            } else {
              toast.error(response.error || 'Failed to send comment')
              resolve(false)
            }
          }
        )
      })
    },
    [gameId]
  )

  return {
    comments,
    sendComment,
    isSending,
  }
}
