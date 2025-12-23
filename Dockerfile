# syntax=docker/dockerfile:1.7
# ใช้ Dockerfile syntax เวอร์ชันใหม่ (รองรับ feature ใหม่ ๆ)

############################
# BUILD STAGE
############################
FROM node:18-bookworm-slim AS builder

# ตั้ง working directory ภายใน container
WORKDIR /app

# ติดตั้ง dependency สำหรับ build (native modules เช่น bcrypt, sharp)
RUN echo "Installing build dependencies..." && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 \
        make \
        g++ && \
    rm -rf /var/lib/apt/lists/*

# copy package files เพื่อให้ Docker cache ทำงานได้ดี
COPY package.json package-lock.json ./

# ติดตั้ง dependency ตาม lock file (เหมาะกับ prod / CI)
RUN echo "Installing npm dependencies..." && \
    npm ci

# copy source code และไฟล์ที่ใช้ตอน build
COPY src ./src
COPY build.js api-docs.json ./

# build โปรเจกต์ (เช่น TS → JS)
RUN echo "Building application (production mode)..." && \
    npm run build:prod

# ลบ devDependencies ออก เหลือเฉพาะที่ runtime ใช้จริง
RUN echo "Pruning dev dependencies..." && \
    npm prune --omit=dev


############################
# PRODUCTION STAGE
############################
FROM node:18-bookworm-slim AS runner

# ตั้ง environment เป็น production
ENV NODE_ENV=production

# working directory สำหรับรันจริง
WORKDIR /app

# copy เฉพาะของที่จำเป็นจาก build stage
RUN echo "Copying production artifacts..."
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/api-docs.json ./api-docs.json

# เตรียมโฟลเดอร์สำหรับเก็บไฟล์ (เช่น upload / export)
# และตั้ง owner ให้ user node เขียนได้
RUN echo "Preparing runtime directories..." && \
    mkdir -p /app/user_profile && \
    chown node:node /app/user_profile

# รัน container ด้วย user ที่ไม่ใช่ root (ปลอดภัยกว่า)
USER node

# เปิด port สำหรับ API
EXPOSE 3000

# คำสั่งเริ่มรันแอป
RUN echo "Starting application..."
CMD ["node", "dist/app.js"]
