# 🎵 Streaming User Backend
- **see this service** [streaming user backned](https://streaming-user-backend.onrender.com)  

This project serves as the **User Service Backend** in the full streaming application.  
It handles **authentication**, **content management** (tracks, albums, playlists), and **user interaction**, while connecting to **MongoDB Atlas** and **Cloudinary**.

---

## 🔗 Project Position in Full System

- **Frontend (User side perform on netlify):** [streaming-frontend](https://github.com/sana2912/streaming-frontend.git)  
- **Backend (User side perform on render):** **this project**  
- **Frontend (Admin side perfrom on netlify):** [stream_admin_ui](https://github.com/sana2912/stream_admin_ui.git)  
- **Backend (Admin side perfom on render):** [stream_admin_backned](https://github.com/sana2912/stream_admin_backned.git)  
- **for more understanding see full systems picture:** [image](https://res.cloudinary.com/ddlspu2uq/image/upload/v1756123510/system_d4p3cd.jpg)  

## ⚙️ Stack & Tools
- JavaScript  
- Node.js  
- Express.js  
- Mongoose (ODM → MongoDB Atlas)  
- Passport.js (authentication)  
- Cloudinary (file storage)  

---

## 📂 Project Layout
flowchart TD

    A[Root] --> B[.env]
    A --> C[.gitignore]
    A --> D[app.js]
    A --> E[package.json]
    A --> F[package-lock.json]
    A --> G[node_modules/]
    A --> H[src/]

    subgraph H[src/]
        H1[config_user/]
        H2[controller/]
        H3[middleware_user/]
        H4[model_user/]
        H5[rout/]
        H6[user_profile/]
    end

    subgraph H1[config_user/]
        H1a[data_base.js]
        H1b[cloudinary_.js]
    end

    subgraph H2[controller/]
        H2a[track_controll.js]
        H2b[album_controller.js]
        H2c[playlist_controll.js]
        H2d[search_controll.js]
        H2e[email_auth_controll.js]
        H2f[google_auth_controll.js]
        H2g[like_controll.js]
    end

    subgraph H3[middleware_user/]
        H3a[multer_.js]
        H3b[passport_auth.js]
        H3c[passport_google.js]
    end

    subgraph H4[model_user/]
        H4a[user_model.js]
        H4b[track_model.js]
        H4c[album_model.js]
        H4d[playlist_model.js]
    end

    subgraph H5[rout/]
        H5a[auth_router.js]
        H5b[google_auth_router.js]
        H5c[album_router.js]
        H5d[playlist_router.js]
        H5e[track_router.js]
        H5f[like_router.js]
        H5g[search_router.js]
    end

    H6[user_profile/]


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

