# apps/api — WaviGram Backend

This is the backend for the WaviGram social networking platform. It provides REST APIs and real-time WebSocket (Socket.IO) functionality for messaging, reactions, typing indicators, and more.

## ✨ Features

- **RESTful API** for users, conversations, messages
- **Real-time communication** via Socket.IO:
  - Send/receive messages
  - Message editing and deletion
  - Reactions (add/remove)
  - Typing indicators
- **Authentication** using JWT (access & refresh tokens)
- **PostgreSQL** database with TypeORM ORM
- **Input validation** using Zod
- **Security** with Helmet, CORS, bcrypt
- **Environment configuration** via dotenv
- **Graceful shutdown** handling

## 🛠️ Tech Stack

- Node.js 20+ (tested on 24)
- Express.js
- TypeScript
- TypeORM + PostgreSQL
- Socket.IO (with Redis adapter ready)
- JWT (jsonwebtoken)
- Bcryptjs (password hashing)
- Zod (validation)
- Helmet & CORS (security)
- dotenv (environment variables)

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 13+
- Redis (optional, for Socket.IO adapter in production)
- pnpm 9+

## 🚀 Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and other settings.

### 3. Run database migrations

```bash
pnpm migration:run
```

### 4. Start the development server

```bash
pnpm dev
```

The API will be available at `http://localhost:3000/api`.

### 5. Production build

```bash
pnpm build
pnpm start
```

## 🐳 Docker Usage

### Development (with docker-compose)

```bash
docker-compose up -d
```

This will start the API, PostgreSQL, and Redis containers.

### Manual Docker build

```bash
docker build -t wavigram-api .
docker run -p 3000:3000 --env-file .env wavigram-api
```

## 🔌 API Routes

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (client should discard tokens)
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users/:id` - Get user by ID

### Conversations
- `GET /api/conversations` - Get all conversations for the user
- `POST /api/conversations` - Create a new conversation
- `GET /api/conversations/:id` - Get conversation by ID with messages
- `DELETE /api/conversations/:id` - Leave/delete a conversation
- `POST /api/conversations/:id/pin` - Pin conversation
- `DELETE /api/conversations/:id/pin` - Unpin conversation
- `POST /api/conversations/:id/archive` - Archive conversation
- `DELETE /api/conversations/:id/archive` - Unarchive conversation

### Messages
- `POST /api/conversations/:conversationId/messages` - Send a message
- `PATCH /api/conversations/:conversationId/messages/:messageId` - Edit a message
- `DELETE /api/conversations/:conversationId/messages/:messageId` - Delete a message
- `POST /api/conversations/:conversationId/messages/:messageId/reactions` - Add reaction to a message
- `DELETE /api/conversations/:conversationId/messages/:messageId/reactions/:emoji` - Remove reaction from a message
- `POST /api/conversations/:conversationId/read` - Mark messages as read

### Real-time Events (Socket.IO)

Connect to the Socket.IO server at the same URL as the API. Authentication is done via the `auth` token parameter.

#### Events emitted by client:
- `message:send` - Send a new message
- `message:update` - Edit a message
- `message:delete` - Delete a message
- `message:react` - Add reaction to a message
- `message:unreact` - Remove reaction from a message
- `typing_start` - Indicate user started typing
- `typing_stop` - Indicate user stopped typing

#### Events emitted by server:
- `message:receive` - New message received
- `message:sent` - Confirmation of message sent (to sender)
- `message:updated` - Message was edited
- `message:deleted` - Message was deleted
- `message:reacted` - Reaction added to message
- `message:unreacted` - Reaction removed from message
- `typing_start` - User started typing (broadcast to others)
- `typing_stop` - User stopped typing (broadcast to others)

## 🧪 Testing

Currently, unit tests are not implemented. This is a TODO for future development.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.