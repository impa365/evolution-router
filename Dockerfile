FROM golang:1.24.0-alpine as build

RUN apk update && apk add --no-cache git build-base

WORKDIR /build

# Copiar arquivos de dependência
COPY go.mod go.sum ./
RUN go mod download

# Copiar código fonte
COPY . .

# Build do backend
RUN CGO_ENABLED=0 GOOS=linux go build -o router ./cmd/router

# Build do manager (frontend)
FROM node:20-alpine as manager-build

WORKDIR /manager

COPY manager/package*.json ./
RUN npm install

COPY manager/ ./
RUN npm run build

# Imagem final
FROM alpine:3.19.1 as final

RUN apk update && apk add --no-cache tzdata ca-certificates

WORKDIR /app

COPY --from=build /build/router .
COPY --from=manager-build /manager/dist ./manager/dist

ENV TZ=America/Sao_Paulo

EXPOSE 3000

ENTRYPOINT ["/app/router"]
