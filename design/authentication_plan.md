# Authentication Implementation Plan - PromptForge

## Overview
Implement passwordless email authentication with 6-digit verification codes and session management.

## Architecture

### Authentication Flow
1. **User enters email** → System generates 6-digit code
2. **Code sent via email** → User receives verification code
3. **User enters code** → System validates and creates session
4. **Session active** → User stays logged in for configured duration (96 hours default)
5. **Session expires** → User must re-authenticate

## Database Schema Updates

### 1. `users` Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  is_email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);
```

### 2. `sessions` Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);
```

### 3. `verification_codes` Table
```sql
CREATE TABLE verification_codes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false
);
```

## Environment Variables

```env
# Session Configuration
SESSION_DURATION_HOURS=96
SESSION_SECRET=<random-secret-for-jwt>

# Email Configuration (using Resend)
RESEND_API_KEY=<resend-api-key>
FROM_EMAIL=noreply@yourdomain.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=PromptForge

# Security
VERIFICATION_CODE_LENGTH=6
VERIFICATION_CODE_EXPIRY_MINUTES=10
MAX_VERIFICATION_ATTEMPTS=3
```

## Implementation Components

### Phase 1: Database & Schema
- [ ] Add users table schema
- [ ] Add sessions table schema
- [ ] Add verification_codes table schema
- [ ] Create migrations
- [ ] Add database query functions for auth

### Phase 2: Email Service
- [ ] Install Resend SDK
- [ ] Create email templates
- [ ] Create email sending utility
- [ ] Test email delivery

### Phase 3: API Routes
- [ ] POST `/api/auth/send-code` - Send verification code
- [ ] POST `/api/auth/verify-code` - Verify code and create session
- [ ] POST `/api/auth/logout` - Destroy session
- [ ] GET `/api/auth/me` - Get current user
- [ ] POST `/api/auth/refresh` - Refresh session

### Phase 4: Session Management
- [ ] Create session utility functions
- [ ] JWT token generation and validation
- [ ] Session middleware for protected routes
- [ ] Cookie management

### Phase 5: UI Components
- [ ] Sign in modal/page
- [ ] Verification code input
- [ ] User dropdown menu (navbar)
- [ ] Protected route wrapper
- [ ] Loading states

### Phase 6: Integration
- [ ] Update Navbar with auth state
- [ ] Add protected actions (like, save, submit)
- [ ] User profile page
- [ ] Session expiry handling

## Technology Stack

- **Email Service**: Resend (simple, modern, good free tier)
- **Session Management**: Custom with JWT tokens
- **Token Storage**: HTTP-only cookies
- **Database**: PostgreSQL with Drizzle ORM

## Security Considerations

1. **Rate Limiting**: Limit code generation requests per email
2. **Token Expiry**: Short-lived verification codes (10 minutes)
3. **Attempt Limiting**: Max 3 attempts per code
4. **HTTP-Only Cookies**: Prevent XSS attacks
5. **CSRF Protection**: Built into Next.js
6. **IP Tracking**: Log IP addresses for security audit

## User Experience

### Sign In Flow
1. Click "Sign In" button
2. Modal opens with email input
3. Enter email → Click "Continue"
4. Check inbox for 6-digit code
5. Enter code → Automatically logged in
6. Modal closes, user sees their name in navbar

### Session Management
- Silent session refresh on activity
- Automatic logout after 96 hours of inactivity
- "Remember me" option (future)

## API Endpoints

### `POST /api/auth/send-code`
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

### `POST /api/auth/verify-code`
**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": null
  }
}
```
**Sets Cookie:** `session=<jwt-token>; HttpOnly; Secure; SameSite=Lax`

### `POST /api/auth/logout`
**Response:**
```json
{
  "success": true
}
```

## Email Template

**Subject:** Your PromptForge Verification Code

**Body:**
```
Welcome to PromptForge!

Your verification code is:

123456

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

---
PromptForge - Discover & Share World-Class Prompts
```

## Future Enhancements
- [ ] OAuth integration (Google, GitHub)
- [ ] Magic link option (alternative to code)
- [ ] Account settings page
- [ ] Email preferences
- [ ] Two-factor authentication
- [ ] Device management
