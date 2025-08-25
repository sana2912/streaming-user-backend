# 🎵 Streaming User Backend

This project serves as the **User Service Backend** in the full streaming application.  
It handles **authentication**, **content management** (tracks, albums, playlists), and **user interaction**, while connecting to **MongoDB Atlas** and **Cloudinary**.

---

## 🔗 Project Position in Full System

- **Frontend (User side perform on netlify):** [streaming-frontend](https://github.com/sana2912/streaming-frontend.git)  
- **Backend (User side perform on render):** **this project**  
- **Frontend (Admin side perfrom on netlify):** [stream_admin_ui](https://github.com/sana2912/stream_admin_ui.git)  
- **Backend (Admin side perfom on render):** [stream_admin_backned](https://github.com/sana2912/stream_admin_backned.git)  

**System Connections**

UserFrontend <--> UserBackend (via REST API) 
UserBackend <--> MongoDB Atlas 
UserBackend <--> Cloudinary 
UserFrontend <--> Cloudinary 
AdminFrontend <--> AdminBackend (via REST API) 
AdminBackend <--> MongoDB 
Atlas AdminBackend <--> Cloudinary
AdminFrontend <--> Cloudinary

---

## ⚙️ Stack & Tools
- JavaScript  
- Node.js  
- Express.js  
- Mongoose (ODM → MongoDB Atlas)  
- Passport.js (authentication)  
- Cloudinary (file storage)  

---

## 📂 Project Layout
── .env
├── .gitignore
├── app.js                 # Entry point
├── package.json
├── package-lock.json
├── node_modules/
└── src/
    ├── config_user/        # Database & Cloudinary settings
    │   ├── data_base.js
    │   └── cloudinary_.js
    │
    ├── controller/         # Handle req/res with MongoDB & Cloudinary
    │   ├── track_controll.js
    │   ├── album_controller.js
    │   ├── playlist_controll.js
    │   ├── search_controll.js
    │   ├── email_auth_controll.js
    │   ├── google_auth_controll.js
    │   └── like_controll.js
    │
    ├── middleware_user/    # Auth, protected routes, file tracking
    │   ├── multer_.js
    │   ├── passport_auth.js
    │   └── passport_google.js
    │
    ├── model_user/         # Mongoose schemas
    │   ├── user_model.js
    │   ├── track_model.js
    │   ├── album_model.js
    │   └── playlist_model.js
    │
    ├── rout/               # Routes
    │   ├── auth_router.js
    │   ├── google_auth_router.js
    │   ├── album_router.js
    │   ├── playlist_router.js
    │   ├── track_router.js
    │   ├── like_router.js
    │   └── search_router.js
    │
    └── user_profile/       # File storage for Multer uploads

---

## 🔑 Authentication
- **Email & Password**  
  - Validate user, JWT,respose as cookies seemore at src/contraller/email_auth_controll.js
- **Google OAuth 2.0**  
  - Authenticate with Google via Passport.js see more at src/controller/google_auth_controll.js

---

## 🚀 Features (see this feature at src/controller)
- User authentication (Email/Password, Google OAuth 2.0)  
- Content management: Tracks, Albums, Playlists  
- User interactions: Likes  
- Search functionality  
- File upload & management (Multer + Cloudinary)  

---

## 🗄️ Database
- **MongoDB Atlas** with Mongoose ODM  

---

## ☁️ File Storage
- **Cloudinary** for media files  

---

## 🏁 Getting Started

1. Install dependencies  
   ```bash
   npm install

