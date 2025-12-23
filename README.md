# step การ setup docker file แบบ multi stage and build time env injection

###################
# BUILD FOR LOCAL DEVELOPMENT & PRODUCTION
###################

FROM dhi.io/bun:1-dev AS builder
WORKDIR /app

# Install Prisma dependencies and Sentry CLI
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && curl -sL https://sentry.io/get-cli/ | bash

# Copy dependency files
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY apps/amqp/package.json ./apps/amqp/
COPY apps/scrapper/package.json ./apps/scrapper/
COPY shared/logger/package.json ./shared/logger/
COPY shared/sentry/package.json ./shared/sentry/
COPY shared/amqp-client/package.json ./shared/amqp-client/
COPY shared/types/package.json ./shared/types/
COPY shared/prisma/package.json ./shared/prisma/

# Install all dependencies
RUN bun install --frozen-lockfile || bun install

# Copy source code & prisma schema
COPY . .

# Generate Prisma Client with correct binary target
RUN echo "📦 Generating Prisma Client..." && \
    /app/node_modules/.bin/prisma generate --schema ./shared/prisma/schema.prisma && \
    echo "✅ Prisma Client generated"

# Build environment: "prod" or "dev" (Bun embeds process.env.NODE_ENV at compile time)
ARG BUILD_ENV=prod
ARG SOURCE_COMMIT

# Decrypt env file for build-time injection
RUN --mount=type=secret,id=dotenv_private_key_production,env=DOTENV_PRIVATE_KEY_PRODUCTION \
    if [ "${BUILD_ENV}" = "prod" ]; then \
        if [ -n "$DOTENV_PRIVATE_KEY_PRODUCTION" ]; then \
            echo "🔑 Creating .env.keys for production decryption..." && \
            echo "DOTENV_PRIVATE_KEY_PRODUCTION=$DOTENV_PRIVATE_KEY_PRODUCTION" > .env.keys && \
            bun run env:prod:dc && \
            echo "✅ .env.production decrypted"; \
        else \
            echo "❌ Error: DOTENV_PRIVATE_KEY_PRODUCTION not found for production build!"; \
            exit 1; \
        fi; \
    elif [ "${BUILD_ENV}" = "dev" ]; then \
        echo "🔧 Using development environment (no decryption needed)"; \
    else \
        echo "❌ Invalid BUILD_ENV: ${BUILD_ENV}. Use 'prod' or 'dev'"; \
        exit 1; \
    fi

# Build binaries with dotenvx injecting env vars (NODE_ENV embedded at compile time)
# Then upload sourcemaps to Sentry using env vars from decrypted .env

RUN echo "🔨 Building API binary with ${BUILD_ENV} env..." && \
    bun run dotenvx:${BUILD_ENV}:build:api && \
    ls -lh apps/api/src/server* && \
    if [ -f "apps/api/src/server.js.map" ] && [ -n "${SOURCE_COMMIT}" ]; then \
        echo "📤 Uploading API sourcemaps to Sentry..." && \
        dotenvx run -f .env.production --overload -- sh -c ' \
            sentry-cli releases new "@social-listening/api@${SOURCE_COMMIT}" --org "$SENTRY_ORG" --project social-listening-api 2>/dev/null || true && \
            sentry-cli sourcemaps upload apps/api/src/ --release="@social-listening/api@${SOURCE_COMMIT}" --org "$SENTRY_ORG" --project social-listening-api && \
            sentry-cli releases finalize "@social-listening/api@${SOURCE_COMMIT}" --org "$SENTRY_ORG" --project social-listening-api \
        ' && echo "✅ API sourcemaps uploaded" || echo "⚠️ API sourcemap upload skipped"; \
    fi

# Build Scrapper
RUN echo "🔨 Building Scrapper binary with ${BUILD_ENV} env..." && \
    bun run dotenvx:${BUILD_ENV}:build:scrapper && \
    ls -lh apps/scrapper/src/server* && \
    if [ -f "apps/scrapper/src/server.js.map" ] && [ -n "${SOURCE_COMMIT}" ]; then \
        echo "📤 Uploading Scrapper sourcemaps to Sentry..." && \
        dotenvx run -f .env.production --overload -- sh -c ' \
            sentry-cli releases new "@social-listening/scrapper@${SOURCE_COMMIT}" --org "$SENTRY_ORG" --project social-listening-scrapper 2>/dev/null || true && \
            sentry-cli sourcemaps upload apps/scrapper/src/ --release="@social-listening/scrapper@${SOURCE_COMMIT}" --org "$SENTRY_ORG" --project social-listening-scrapper && \
            sentry-cli releases finalize "@social-listening/scrapper@${SOURCE_COMMIT}" --org "$SENTRY_ORG" --project social-listening-scrapper \
        ' && echo "✅ Scrapper sourcemaps uploaded" || echo "⚠️ Scrapper sourcemap upload skipped"; \
    fi

# Build AMQP
RUN echo "🔨 Building AMQP binary with ${BUILD_ENV} env..." && \
    bun run dotenvx:${BUILD_ENV}:build:amqp && \
    ls -lh apps/amqp/src/server* && \
    if [ -f "apps/amqp/src/server.js.map" ] && [ -n "${SOURCE_COMMIT}" ]; then \
        echo "📤 Uploading AMQP sourcemaps to Sentry..." && \
        dotenvx run -f .env.production --overload -- sh -c ' \
            sentry-cli releases new "@social-listening/amqp@${SOURCE_COMMIT}" --org "$SENTRY_ORG" --project social-listening-amqp 2>/dev/null || true && \
            sentry-cli sourcemaps upload apps/amqp/src/ --release="@social-listening/amqp@${SOURCE_COMMIT}" --org "$SENTRY_ORG" --project social-listening-amqp && \
            sentry-cli releases finalize "@social-listening/amqp@${SOURCE_COMMIT}" --org "$SENTRY_ORG" --project social-listening-amqp \
        ' && echo "✅ AMQP sourcemaps uploaded" || echo "⚠️ AMQP sourcemap upload skipped"; \
    fi

###################
# DECRYPT STAGE 
###################

FROM builder AS decrypt-stage

ARG BUILD_ENV=prod

RUN --mount=type=secret,id=dotenv_private_key_production,env=DOTENV_PRIVATE_KEY_PRODUCTION \
    if [ -n "$DOTENV_PRIVATE_KEY_PRODUCTION" ]; then \
        echo "🔑 Using DOTENV_PRIVATE_KEY_PRODUCTION from environment..."; \
        echo "DOTENV_PRIVATE_KEY_PRODUCTION=$DOTENV_PRIVATE_KEY_PRODUCTION" > .env.keys; \
    elif [ -f "/run/secrets/dotenv_private_key_production" ]; then \
        echo "🔑 Using secret from file..."; \
        echo "DOTENV_PRIVATE_KEY_PRODUCTION=$(cat /run/secrets/dotenv_private_key_production)" > .env.keys; \
    else \
        echo "❌ Error: DOTENV_PRIVATE_KEY_PRODUCTION not found!"; \
        exit 1; \
    fi && \
    echo "✅ .env.keys created"

# Decrypt environment file
RUN if [ "${BUILD_ENV}" = "prod" ]; then \
        echo "🔐 Decrypting .env.production..."; \
        bun run env:prod:dc && \
        echo "✅ Decryption complete"; \
    else \
        echo "❌ Invalid BUILD_ENV: ${BUILD_ENV}"; \
        exit 1; \
    fi

###################
# PRODUCTION RUNTIME
###################

FROM dhi.io/bun:1 AS production-backend

ARG NODE_ENV=production
ARG SOURCE_COMMIT
ARG BUILD_ENV=prod

ENV NODE_ENV=${NODE_ENV} \
    SOURCE_COMMIT=${SOURCE_COMMIT} \
    BUILD_ENV=${BUILD_ENV} \
    HOME=/app

WORKDIR /app

# Copy only necessary files
COPY --from=builder --chown=bunuser:bunuser /app/apps/api/src/server ./server
COPY --from=builder --chown=bunuser:bunuser /app/apps/scrapper/src/server ./scrapper
COPY --from=builder --chown=bunuser:bunuser /app/apps/amqp/src/server ./amqp

# 🔧 Copy Prisma client from shared workspace (CRITICAL!)
# The generated client is in shared/prisma/generated/ (via schema output config)
COPY --from=builder --chown=bunuser:bunuser /app/shared/prisma/generated ./shared/prisma/generated
COPY --from=builder --chown=bunuser:bunuser /app/shared/prisma/package.json ./shared/prisma/package.json
COPY --from=builder --chown=bunuser:bunuser /app/shared/prisma/schema.prisma ./shared/prisma/schema.prisma

# 🔧 Copy Prisma engine support files
COPY --from=builder --chown=bunuser:bunuser /app/node_modules/@prisma ./node_modules/@prisma

# Copy decrypted env files
COPY --from=decrypt-stage --chown=bunuser:bunuser /app/.env.production ./.env
COPY --from=decrypt-stage --chown=bunuser:bunuser /app/.env.keys ./

# Use LABEL instead for build info
LABEL org.opencontainers.image.revision=${SOURCE_COMMIT}

# Copy entrypoint script
COPY --chown=bunuser:bunuser scripts/backend-entrypoint.sh /usr/local/bin/entrypoint.sh

# Use numeric UID (common convention: 1001 or 65532 for nonroot)
USER 65532

# Direct CMD (no shell entrypoint)
CMD ["./server"]

###################
# PYTHON WORKER BUILD
###################

FROM dhi.io/python:3-dev AS python-builder

WORKDIR /app

# Install uv (copy from official image)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install build dependencies (init-system-helpers provides update-rc.d needed by x11-common)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    init-system-helpers \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files first (layer caching)
COPY apps/worker/pyproject.toml apps/worker/uv.lock ./

# Configure uv
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/opt/venv

# Install dependencies (cached if lock unchanged)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-install-project --no-dev

# Install playwright browsers
ENV PATH="/opt/venv/bin:$PATH"
RUN playwright install --with-deps chromium

###################
# PYTHON WORKER DECRYPT
###################

FROM dhi.io/bun:1-dev AS worker-decrypt-stage

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile || bun install

COPY .env.production .env.keys* ./

ARG BUILD_ENV=production
RUN --mount=type=secret,id=dotenv_private_key_production,env=DOTENV_PRIVATE_KEY_PRODUCTION \
    if [ -n "$DOTENV_PRIVATE_KEY_PRODUCTION" ]; then \
        echo "DOTENV_PRIVATE_KEY_PRODUCTION=$DOTENV_PRIVATE_KEY_PRODUCTION" > .env.keys; \
    fi && \
    bun run env:prod:dc && \
    echo "✅ Decrypted .env.production"

###################
# PRODUCTION WORKER
###################

FROM dhi.io/python:3-dev AS production-worker

ARG SOURCE_COMMIT

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    SOURCE_COMMIT=${SOURCE_COMMIT} \
    PATH="/opt/venv/bin:$PATH" \
    UV_NO_SYNC=1

WORKDIR /app

# Runtime dependencies for Playwright
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libnss3 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libgbm1 \
    libgtk-3-0 \
    libasound2 \
    libnspr4 \
    libwayland-client0 \
    ca-certificates \
    curl \
    procps \
    && rm -rf /var/lib/apt/lists/*


# Copy venv and playwright cache
COPY --from=python-builder /opt/venv /opt/venv
COPY --from=python-builder /root/.cache/ms-playwright /root/.cache/ms-playwright

# Copy decrypted env file
COPY --from=worker-decrypt-stage /app/.env.production /app/.env

# Create package structure
RUN mkdir -p /app/apps && touch /app/apps/__init__.py

# Copy worker source
COPY apps/worker/ /app/apps/worker/

# Labels for build info
LABEL org.opencontainers.image.revision=${SOURCE_COMMIT}

# Use numeric UID directly (no user creation needed)
USER 65532

CMD ["python", "-m", "apps.worker.worker"]




# step การต่อ vm กับ termius
ได้เลยยย 🫶
ออนนี่สรุปให้เป็น สูตรลัด 1 หน้า อ่านแล้วต่อได้จริง แบบที่น้องทำผ่านมาเลย 555

🧩 Summary: ต่อ GCP VM กับ Termius (เวอร์ชันไม่งง)
0️⃣ ของที่ต้องมี

✅ GCP VM (Running)

✅ External IP (เช่น 35.xxx.xxx.xxx)

✅ Termius (Free ก็พอ)

✅ SSH key (ed25519)

1️⃣ Gen SSH key บนเครื่องน้อง (CMD)
ssh-keygen -t ed25519 -C "your-email@gmail.com"


กด Enter รัวๆ ได้เลย

จะได้ไฟล์:

🔐 id_ed25519 → private key (เก็บไว้)

🔓 id_ed25519.pub → public key (เอาไปแปะ GCP)

ดู public key:

type %USERPROFILE%\.ssh\id_ed25519.pub

2️⃣ เอา Public Key ไปใส่ใน GCP

ไปที่
GCP → Compute Engine → VM instances → (เครื่องของเรา) → Edit

หา SSH keys แล้ว paste แบบนี้ 👇
(ต้องอยู่บรรทัดเดียว)

ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... your-email@gmail.com


👉 กด Save ❗❗ (บทเรียนสำคัญ 555)

3️⃣ Import Private Key เข้า Termius

ใน Termius:

ไป Keychain → SSH Keys

กด Import

เลือกไฟล์

C:\Users\<user>\.ssh\id_ed25519


❌ อย่าเลือก .pub

4️⃣ สร้าง Host ใน Termius

ไปที่ Hosts → New Host

ตั้งค่า:

Label: ตั้งชื่ออะไรก็ได้

Address: External IP จาก GCP

Port: 22

Username:
👉 ชื่อหน้า email (เช่น path25230)

Credentials:
กด ➕ SSH.id, Key, Certificate, FIDO2
→ เลือก key id_ed25519

5️⃣ Connect 🎉

กด Connect

ถ้าถูกต้องจะเห็นประมาณ:

path25230@vm-name:~$


= เข้าเครื่องแล้ววว 🥳

🔥 Debug เร็วๆ (ถ้าไม่เข้า)

❌ Invalid key → format public key ผิด / ไม่มี email

❌ Authentication failed (publickey)
→ username ไม่ตรง / ลืม Save / key ไม่คู่กัน

❌ Timeout → VM ปิด / IP เปลี่ยน

🧠 สิ่งที่น้องได้จากด่านนี้

ใช้ SSH เป็น

เข้าใจ VM / VPS / server จริง

พร้อมเรียน Linux / infra ต่อได้ยาว

ท่าเดียวใช้ได้ทั้ง cloud + server บริษัท

ถ้าน้องอยาก
👉 ออนนี่ทำ cheat sheet Linux สำหรับคนใช้ VM
👉 หรือ daily routine เปิด–ปิด VM ประหยัดเงิน
👉 หรือ ต่อ GitHub จาก VM แบบไม่ใช้ password

บอกมาได้เลย ออนนี่พร้อมลุยต่อ 😎💖