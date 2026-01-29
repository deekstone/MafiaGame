# Middlewares

This directory contains Express.js middleware functions.

## User Identity Middleware (`userIdentity.ts`)

Express middleware that manages user identity via cookies.

**Purpose:**

- Provides stable user identity across requests
- Generates and manages user ID cookies
- Attaches user ID to request object for use in route handlers

**Functionality:**

- Checks for existing `mafia_user_id` cookie
- If no cookie exists, generates a new UUID and sets it as a cookie
- Attaches `userId` to the request object (accessible as `req.userId`)
- Cookie expires after 7 days

**Usage:**

- Applied globally to all routes in `src/index.ts`
- Used by route handlers to identify the current user
- Also used in Socket.IO connection handlers (cookie parsed from handshake)

**Cookie Settings:**

- Name: `mafia_user_id`
- HttpOnly: `true` (prevents JavaScript access for security)
- SameSite: `lax` (CSRF protection)
- MaxAge: 7 days

**Note:**

- User identity is session-based, not authenticated
- Each browser/device gets a unique user ID
- User ID is used to track game participation and ownership
