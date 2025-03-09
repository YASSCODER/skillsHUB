# 📌 SkillsHUB - Backend API

SkillsHUB is a **Node.js + TypeScript** backend server designed for **managing users, communities, gamification, and real-time communication**. This project follows **NestJS-like modular architecture** while using **Express.js** and **MongoDB Atlas**.

## 🚀 Features

- **User Management**: Manage users and roles (Admin & Normal Users).
- **Community Management**: Users can create communities, post forums, and events (like a mini Discord).
- **Gamification & Feedback**: Achievements, points, and rewards system.
- **Real-time Communication**: Chat & meetings (future integration).
- **Wallet System**: Users can store and manage money (`IMoney` model).
- **MongoDB Atlas Database**: Hosted in the cloud with a **replica set**.

---

## ⚙️ Tech Stack

- **Node.js** (Express.js with TypeScript)
- **MongoDB Atlas** (Mongoose ODM)
- **Yarn** (Dependency management)
- **Docker** (optional for local development)
- **Winston Logger** (for logging API requests)
- **JWT Authentication** (Login & Signup)

---

## 🏗️ Project Structure

```sh
.
├── src
│   ├── app.ts                  # Main Express App
│   ├── server.ts               # Server entry point
│   ├── config                  # Configuration files
│   │   ├── database.ts         # MongoDB connection
│   ├── common                  # Shared utilities
│   │   ├── helpers             # Logger helper
│   │   ├── utils               # Logging & other utilities
│   ├── modules                 # Feature-based modules
│   │   ├── auth                # Authentication module
│   │   ├── user                # User management
│   │   ├── community           # Community & forums
│   │   ├── wallet              # Money management
│   └── types                   # Type definitions
│
├── .env                        # Environment variables
├── .gitignore                  # Ignored files
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── yarn.lock                   # Yarn lock file
└── README.md                   # Project documentation
```

## 🛠️ How to run

```sh
git pull origin main
yarn dev
```
