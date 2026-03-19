# 📱 Social Media App

A full-stack social media platform built with **Node.js**, **Express**, and **MongoDB** — featuring real-time notifications, post feeds, follow system, comments, and media uploads.

---

## 🚀 Features

- 🔐 **Authentication** — Secure signup/login with JWT & bcrypt password hashing
- 📝 **Posts** — Create, view, and manage posts with image uploads via Multer
- ❤️ **Likes** — Like and unlike posts
- 💬 **Comments** — Comment on posts in real time
- 👥 **Follow System** — Follow/unfollow users, view followers & following
- 🔔 **Notifications** — Real-time notifications via WebSockets (Socket.io)
- 🖼️ **Profile Management** — Edit profile, upload avatar
- 📰 **Dashboard Feed** — Personalized feed from followed users

---

## 🛠️ Tech Stack

| Layer        | Technology             |
| ------------ | ---------------------- |
| Frontend     | HTML, CSS, JavaScript  |
| Backend      | Node.js, Express.js    |
| Database     | MongoDB (Mongoose)     |
| Auth         | JWT, Bcrypt            |
| Real-time    | WebSockets (Socket.io) |
| File Uploads | Multer                 |
| Architecture | MVC Pattern            |

---

## 📁 Project Structure

```
social_media_app/
├── app/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── comment.controller.js
│   │   ├── follow.controller.js
│   │   ├── notification.controller.js
│   │   ├── post.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── upload.middleware.js
│   │   └── verifyToken.middleware.js
│   ├── models/
│   │   ├── comments.model.js
│   │   ├── follow.model.js
│   │   ├── likes.model.js
│   │   ├── notification.model.js
│   │   ├── posts.model.js
│   │   └── users.model.js
│   ├── routes/
│   │   ├── comment.routes.js
│   │   ├── follow.routes.js
│   │   ├── notification.routes.js
│   │   ├── posts.routes.js
│   │   └── user.routes.js
│   └── services/
│       ├── comment.service.js
│       ├── follow.service.js
│       ├── notification.service.js
│       ├── post.service.js
│       └── socket.service.js
├── config/
│   └── db.js
├── public/
│   ├── upload/
│   ├── login.html / login.js / login.css
│   ├── signup.html / signup.js / signup.css
│   ├── dashboard-feed.html / feed.js
│   ├── create-post.html / createPost.js
│   ├── edit-profile.html / editProfile.js
│   ├── followers.js
│   └── styles.css
├── app.js
└── package.json
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js v18+
- MongoDB (local)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/mmubashirdev/social_media_app.git
cd social_media_app

# 2. Install dependencies
npm install

# 3. Create a .env file
touch .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/social_media_app
JWT_SECRET=your_jwt_secret_key
```

### Run the App

```bash
# Development
npm run dev

# Production
npm start
```

Then open your browser at `http://localhost:3000`

---

## 📡 API Endpoints

### Auth

| Method | Endpoint           | Description             |
| ------ | ------------------ | ----------------------- |
| POST   | `/api/auth/signup` | Register a new user     |
| POST   | `/api/auth/login`  | Login and get JWT token |

### Posts

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| GET    | `/api/posts`     | Get all posts     |
| POST   | `/api/posts`     | Create a new post |
| DELETE | `/api/posts/:id` | Delete a post     |

### Users

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| GET    | `/api/users/:id` | Get user profile    |
| PUT    | `/api/users/:id` | Update user profile |

### Follow

| Method | Endpoint          | Description     |
| ------ | ----------------- | --------------- |
| POST   | `/api/follow/:id` | Follow a user   |
| DELETE | `/api/follow/:id` | Unfollow a user |

### Comments

| Method | Endpoint                | Description      |
| ------ | ----------------------- | ---------------- |
| POST   | `/api/comments/:postId` | Add a comment    |
| DELETE | `/api/comments/:id`     | Delete a comment |

### Notifications

| Method | Endpoint             | Description            |
| ------ | -------------------- | ---------------------- |
| GET    | `/api/notifications` | Get user notifications |

---

## 🔒 Security

- Passwords hashed with **bcrypt**
- Routes protected via **JWT middleware** (`verifyToken.middleware.js`)
- `.gitignore` configured to exclude sensitive files

---

## 👤 Author

**Muhammad Mubashir**

- GitHub: [@mmubashirdev](https://github.com/mmubashirdev)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
