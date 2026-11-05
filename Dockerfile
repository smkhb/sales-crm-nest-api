FROM node:24-alpine
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Esta camada SÓ vai rodar de novo se os arquivos acima mudarem.
ENV CI=true
RUN pnpm install

COPY prisma/schema.prisma ./prisma/

RUN npx prisma generate

COPY . .
EXPOSE 3333

CMD ["pnpm", "run", "start:dev"]