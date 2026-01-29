export {}

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

// Extend Socket.IO Socket type with custom data
import { Socket as SocketIoSocket } from 'socket.io'

declare module 'socket.io' {
  interface Socket {
    data: {
      userId?: string
      /** Frontend language for log i18n ('en' | 'ar') */
      lang?: string
    }
  }
}
