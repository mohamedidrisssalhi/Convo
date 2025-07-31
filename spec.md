
# Convo Chat App — Technical Specification

## Overview
Convo is a modern, full-stack real-time chat application featuring user authentication, chat rooms, and media messaging. Built with Node.js, Express, MongoDB, React, Zustand, and Socket.IO, it delivers a seamless, responsive, and scalable messaging experience.

---

## Features

### Core
- User registration, login, and logout (JWT-based authentication)
- Secure password hashing (bcrypt)
- Real-time chat rooms (create, join, leave)
- Direct and group messaging
- Media (image) messaging support
- Real-time online user and room member lists
- Responsive, mobile-ready UI (TailwindCSS)

### Advanced
- Modular React component architecture
- State management with Zustand
- Real-time updates via Socket.IO (messages, presence, room members)
- Error handling and user feedback (toasts, status codes)
- Production-ready deployment (Render, Netlify/Vercel)

---

## Technical Architecture

**Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO  
**Frontend:** React, React Router, Zustand, TailwindCSS  
**Authentication:** JWT (httpOnly cookies), bcrypt  
**Deployment:** Render (backend), Netlify/Vercel (frontend)

---

## Data Models

### User
```js
{
  email: String, // unique, required
  fullName: String, // required
  password: String, // hashed, required
  profilePic: String, // optional
  createdAt, updatedAt
}
```

### Message
```js
{
  senderId: ObjectId (User),
  receiverId: ObjectId (User, optional),
  roomId: ObjectId (ChatRoom, optional),
  text: String,
  image: String,
  createdAt, updatedAt
}
```

### ChatRoom
```js
{
  name: String, // required
  members: [ObjectId (User)],
  avatar: String, // optional
  createdAt, updatedAt
}
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login user
- `POST /api/auth/logout` — Logout user

### Chat Rooms
- `POST /api/chatRooms/create` — Create room
- `POST /api/chatRooms/join` — Join room
- `POST /api/chatRooms/leave` — Leave room
- `GET /api/chatRooms/` — List rooms

### Messages
- `POST /api/messages/` — Send message
- `GET /api/messages/:roomId` — Get messages for room

---

## Core Logic & Workflows

- **Registration:** Validates input, hashes password, stores user
- **Login:** Validates credentials, issues JWT, sets cookie
- **Auth Middleware:** Verifies JWT, attaches user to request
- **Chat Room Management:** Create, join, leave; updates membership in DB and real time
- **Real-Time Messaging:** Socket.IO for instant message delivery and presence
- **Message Storage:** Persists all messages in MongoDB

---

## Error Handling & Security

- All endpoints return clear error messages and status codes
- Handles duplicate registration, invalid login, unauthorized access, etc.
- Socket.IO errors handled on both client and server
- Passwords hashed with bcrypt
- JWTs stored in httpOnly cookies
- CORS configured for frontend/backend
- Input validation on all endpoints
- Production builds optimized for deployment

---

## Testing & Future Enhancements

- Unit/integration tests for backend (Jest/Supertest)
- E2E tests for frontend (Cypress)
- Future: media uploads, group DMs, notifications, admin panel, message reactions, file sharing

---

## File/Component Naming & Structure

- Files and components are named for clarity and phase alignment (see code comments)
- Example: `RegisterForm.jsx` (was `SignUpPage.jsx`), `chatRooms.js` (was `chatRoom.route.js`)

---

## References & Diagrams

- See `README.md` for tech stack diagram and UI/UX sketches
- For detailed code logic, see comments in each file
