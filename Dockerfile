# =========================
# BUILD STAGE
# =========================
FROM node:24-alpine AS builder

# Añadimos openssl para la etapa de compilación
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Generar Prisma Client para los motores de Linux
RUN npx prisma generate

RUN npm run build


# =========================
# PRODUCTION STAGE
# =========================
FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# 1. CAMBIO CRÍTICO: Instalar OpenSSL en la imagen final de producción
RUN apk add --no-cache openssl

COPY package*.json ./

# 2. CAMBIO CRÍTICO: Quitamos '--ignore-scripts' para que Prisma active sus motores en producción
RUN npm ci --omit=dev

# Copiar build desde el builder
COPY --from=builder /app/dist ./dist

# Copiar el Prisma Client generado con sus binarios correctos
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client


EXPOSE 3000

# 3. RECOMENDACIÓN: Si tu base de datos no tiene las tablas creadas aún, 
# puedes descomentar la línea de abajo para que las cree al iniciar:
# CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]

CMD ["node", "dist/server.js"]
