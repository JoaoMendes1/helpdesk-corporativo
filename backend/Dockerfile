FROM node:24-slim

# O Prisma precisa do OpenSSL, que a imagem slim não traz.
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# Sem a consulta de atualização CLI do Prisma a cada execução.
ENV CHECKPOINT_DISABLE=1

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

USER node
EXPOSE 3000

# No boot: aplica as migrations, roda o seed (popula o banco vazio) e sobe a API.
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && exec node src/server.js"]