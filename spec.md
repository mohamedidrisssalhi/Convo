# Convo Chat App - Technical Specification

## 1. Project Overview
A full-stack real-time chat application with user authentication, chat rooms, and media messaging. Built with Node.js, Express, MongoDB, React, and Socket.IO.

## 2. Features by Phase

### Phase 1: Project Setup & Database
- Node.js/Express backend
- MongoDB connection via Mongoose
- Models: User, Message

### Phase 2: User Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Auth routes: register, login, logout
- Auth middleware to protect routes
- React forms for login/register

### Phase 3: Chat Room Management
- Chat room model and routes (create, join, leave)
- Backend logic for room membership
- React form to create/join/leave rooms
- Real-time user list per room

### Phase 4: Real-Time Messaging
- Socket.IO integration (server & client)
- Message model for storing chat history
- Backend logic for sending/receiving messages
- React message interface (send/receive in real time)
- Message timestamps and user indicators

### Phase 5: UI & Styling
- Modular React components (Navbar, Sidebar, ChatContainer, etc.)
- Responsive design with TailwindCSS
- User-friendly, mobile-ready interface

### Phase 6: Deployment
- Deployment to Netlify/Vercel (frontend) and Render/Heroku (backend)
- Environment variable management
- Production build and optimization

---

## 3. Technical Architecture
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO
- **Frontend:** React, React Router, Zustand (state), TailwindCSS
- **Authentication:** JWT, bcrypt, cookies
- **Deployment:** Netlify/Vercel (frontend), Render/Heroku (backend)

---

## 4. Data Models

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
  createdAt, updatedAt
}
```

---

## 5. API Endpoints

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

## 6. Core Functions & Logic
- **User registration:** Validates input, hashes password, stores user
- **Login:** Validates credentials, issues JWT, sets cookie
- **Auth middleware:** Verifies JWT, attaches user to request
- **Chat room creation/join/leave:** Updates room membership
- **Real-time messaging:** Uses Socket.IO for instant updates
- **Message storage:** Saves messages to MongoDB

---

## 7. Error Handling
- All endpoints return clear error messages and status codes
- Handles duplicate registration, invalid login, unauthorized access, etc.
- Socket.IO errors handled on both client and server

---

## 8. Performance & Security
- Passwords hashed with bcrypt
- JWTs stored in httpOnly cookies
- CORS configured for frontend/backend
- Input validation on all endpoints
- Production builds optimized for deployment

---

## 9. Testing & Future Enhancements
- Unit and integration tests for backend routes (Jest/Supertest)
- E2E tests for frontend (Cypress)
- Future: media uploads, group DMs, notifications, admin panel

---

## 10. File/Component Naming
- All files and components are named to match project instructions and phases (see code comments for mapping)
- Example: `RegisterForm.jsx` (was `SignUpPage.jsx`), `chatRooms.js` (was `chatRoom.route.js`)

---

## 11. Diagrams & References
- See `README.md` for tech stack diagram and UI/UX sketches
- For detailed code logic, see comments in each file
