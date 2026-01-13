# Backend API - IIoT Dashboard

Backend Node.js com NestJS para monitoramento de máquinas industriais.

## Stack

- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL + TypeORM
- **MQTT**: Consumo de mensagens do broker
- **Auth**: JWT
- **Docs**: Swagger

## Funcionalidades

- ✅ Consumo de mensagens MQTT
- ✅ Persistência no PostgreSQL
- ✅ API REST:
  - `GET /machines` - Listar máquinas
  - `GET /metrics?machineId=&from=&to=` - Buscar métricas
- ✅ Autenticação JWT
- ✅ Swagger em `/api`

## Como Rodar

### Desenvolvimento Local

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
# Editar .env com suas configurações
```

3. **Subir PostgreSQL e Mosquitto:**
```bash
docker-compose up -d postgres mosquitto
```

4. **Rodar o backend:**
```bash
npm run start:dev
```

### Docker Compose

```bash
docker-compose up -d backend-api
```

## Credenciais Padrão

- **Username**: `admin`
- **Password**: `admin123`

## Endpoints

### Autenticação
- `POST /auth/login` - Obter token JWT

### Máquinas
- `GET /machines` - Listar todas (requer autenticação)

### Métricas
- `GET /metrics?machineId=M-01&from=2026-01-01&to=2026-01-31` - Buscar métricas (requer autenticação)

## Swagger

Acesse `http://localhost:3000/api` para ver a documentação interativa.



