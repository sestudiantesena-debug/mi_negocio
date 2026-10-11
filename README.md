# mi_negocio

Plataforma de e-commerce + automatización conversacional (WhatsApp + Facebook) con IA para demostración de eficiencia en emprendimientos.

## Arquitectura

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Cliente    │────▶│  Next.js     │────▶│  PostgreSQL     │
│  (Web/App)  │     │  (Catálogo,  │     │  (Productos,    │
└─────────────┘     │   Admin)     │     │   Pedidos,      │
                    └──────┬───────┘     │   Usuarios)     │
                           │             └─────────────────┘
                    ┌──────▼───────┐
                    │  API Backend │◀──┬──────────────────┐
                    │  (FastAPI)   │   │                  │
                    └──────┬───────┘   │                  │
                           │           │                  │
              ┌────────────┼───────────┼──────────────────┐
              │            │           │                  │
       ┌──────▼────┐ ┌─────▼────┐ ┌────▼─────┐    ┌──────▼──────┐
       │ Evolution │ │ Meta     │ │  IA      │    │  Upstash    │
       │ API       │ │ Business │ │  Engine  │    │  Redis      │
       │(WhatsApp) │ │ API      │ │(Groq/LLM)│    │  (Queue)    │
       └───────────┘ └──────────┘ └──────────┘    └─────────────┘
```

## Stack Tecnológico

| Componente | Tecnología | Free Tier |
|------------|------------|-----------|
| **Frontend** | Next.js 14 + Tailwind + Shadcn/ui | Vercel (unlimited personal) |
| **Backend** | FastAPI + SQLAlchemy 2.0 + Pydantic v2 | Fly.io (3 shared VMs) |
| **Database** | PostgreSQL (Neon) | 0.5 GB, autosuspend |
| **Cache/Queue** | Redis (Upstash) | 10K req/día, 256 MB |
| **IA/LLM** | Groq (Llama 3.1 70B) | 14,400 tokens/min |
| **WhatsApp** | Evolution API (Docker) | Self-hosted en Fly.io |
| **Facebook** | Meta Business API | Gratis (modo desarrollo) |
| **Auth Admin** | Clerk | 10K MAU gratis |
| **CI/CD** | GitHub Actions | 2,000 min/mes |

## Estructura del Proyecto

```
mi_negocio/
├── .github/workflows/ci.yml          # CI/CD pipeline
├── docker-compose.yml                 # Local development
├── backend/                           # FastAPI Backend
│   ├── src/
│   │   ├── main.py                   # App entry point
│   │   ├── config.py                 # Pydantic Settings
│   │   ├── database.py               # SQLAlchemy async
│   │   ├── redis.py                  # Upstash client
│   │   ├── dependencies.py           # FastAPI dependencies
│   │   ├── exceptions.py             # Custom exceptions
│   │   ├── modules/
│   │   │   ├── products/             # Catálogo productos
│   │   │   ├── orders/               # Pedidos y clientes
│   │   │   ├── conversations/        # Sesiones chat multicanal
│   │   │   ├── ai_engine/            # Motor IA + function calling
│   │   │   ├── whatsapp/             # Evolution API integration
│   │   │   └── facebook/             # Meta Graph API integration
│   │   └── workers/                  # Background jobs
│   ├── tests/
│   ├── scripts/seed.py               # Demo data
│   ├── alembic/                      # Migrations
│   ├── Dockerfile
│   ├── requirements.txt
│   └── fly.toml
├── frontend/                          # Next.js Frontend
│   ├── src/
│   │   ├── app/(web)/                # Tienda pública
│   │   ├── app/(admin)/              # Panel admin (Clerk)
│   │   ├── app/api/webhook/          # Webhooks recepción
│   │   ├── components/
│   │   ├── lib/
│   │   └── hooks/
│   ├── Dockerfile
│   └── vercel.json
└── evolution-api/                     # Evolution API (submódulo)
```

## Desarrollo Local

### Prerrequisitos
- Docker + Docker Compose
- Python 3.11+
- Node.js 20+
- Cuentas en: Neon, Upstash, Groq, Clerk, Meta Developers

### Inicio Rápido

```bash
# 1. Clonar y configurar variables
cp backend/.env.example backend/.env
# Editar backend/.env con tus claves

# 2. Levantar servicios
docker-compose up -d

# 3. Ejecutar migraciones y seed
docker-compose exec backend alembic upgrade head
docker-compose exec backend python scripts/seed.py

# 4. Acceder
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
# Evolution API: http://localhost:8080
```

### Variables de Entorno Requeridas

```env
# Backend (.env)
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
REDIS_URL=redis://host:6379/0
GROQ_API_KEY=gsk_xxx
EVOLUTION_API_KEY=your_key
META_APP_ID=xxx
META_APP_SECRET=xxx
META_VERIFY_TOKEN=xxx
CLERK_SECRET_KEY=sk_test_xxx
FRONTEND_URL=http://localhost:3000

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_WHATSAPP_NUMBER=521xxxxxxxxxx
```

## Despliegue en Producción (Free Tier)

### 1. Crear cuentas y recursos
- **Neon**: Crear project → copiar `DATABASE_URL`
- **Upstash**: Crear Redis database → copiar `UPSTASH_REDIS_REST_URL` y `TOKEN`
- **Groq**: Crear API key
- **Clerk**: Crear application → copiar keys
- **Meta Developers**: Crear app → configurar webhook → obtener tokens
- **Fly.io**: `fly auth login` → `fly launch` en backend/
- **Vercel**: Importar repo → configurar env vars

### 2. Configurar secrets en Fly.io
```bash
fly secrets set \
  DATABASE_URL="postgresql://..." \
  UPSTASH_REDIS_REST_URL="https://..." \
  UPSTASH_REDIS_REST_TOKEN="..." \
  GROQ_API_KEY="gsk_..." \
  EVOLUTION_API_KEY="..." \
  META_APP_ID="..." \
  META_APP_SECRET="..." \
  META_VERIFY_TOKEN="..." \
  CLERK_SECRET_KEY="sk_..." \
  FRONTEND_URL="https://tu-app.vercel.app"
```

### 3. Deploy automático
Push a `main` → GitHub Actions ejecuta:
1. Lint + Typecheck + Tests (backend)
2. Lint + Typecheck + Build (frontend)
3. Deploy backend → Fly.io
4. Deploy frontend → Vercel

## APIs Principales

### Productos
- `GET /api/v1/products` - Listar con filtros
- `POST /api/v1/products` - Crear
- `GET /api/v1/products/{id}` - Detalle
- `PATCH /api/v1/products/{id}` - Actualizar
- `DELETE /api/v1/products/{id}` - Eliminar

### Pedidos
- `GET /api/v1/orders` - Listar con filtros
- `POST /api/v1/orders` - Crear (desde chat o web)
- `GET /api/v1/orders/{id}` - Detalle
- `POST /api/v1/orders/{number}/confirm-payment` - Confirmar pago manual

### Conversaciones
- `GET /api/v1/conversations` - Listar (admin)
- `GET /api/v1/conversations/{id}` - Detalle + mensajes
- `POST /api/v1/conversations/{id}/escalate` - Escalar a humano

### IA Chat
- `POST /api/v1/ai/chat` - Chat multicanal
- `POST /api/v1/ai/test` - Playground testing

### Webhooks
- `POST /webhook/evolution` - WhatsApp (Evolution API)
- `GET/POST /webhook/meta` - Facebook/Instagram (Meta)

## Demo: Flujo de Venta Automatizado

1. Usuario navega catálogo web → clic "Hablar por WhatsApp"
2. IA saluda → pregunta necesidad → `search_products()`
3. Usuario elige → IA muestra detalles → `get_product_details()`
4. Usuario confirma → IA crea borrador → `create_draft_order()`
5. IA envía resumen + datos de pago manual
6. Admin ve orden en panel → marca "Pagado"
7. IA notifica al cliente → orden confirmada

## Métricas de Demostración

El panel admin muestra:
- **Tasa de automatización**: % conversaciones resueltas sin humano
- **Tiempo medio respuesta**: IA vs humano
- **Conversión chat→venta**: Pedidos creados vía chat / conversaciones
- **Productos más consultados**: Top búsquedas en IA
- **Escalaciones**: Motivos y frecuencia

## Roadmap MVP

- [x] Backbone: FastAPI + Neon + Upstash + Fly.io
- [x] Core: Products + Orders + Customers CRUD
- [x] WhatsApp: Evolution API webhooks + sender
- [x] IA Engine: Groq + Function Calling (search, order, status, escalate)
- [x] Facebook: Meta Graph API webhooks + sender
- [ ] Frontend: Catálogo web + carrito + checkout demo
- [ ] Admin: Dashboard + CRUD + Conversaciones tiempo real
- [ ] IA Playground: Test prompts + ver function calls
- [ ] Seed data realista + métricas demo
- [ ] Deploy producción + docs

## Licencia

MIT - Uso libre para demostración y aprendizaje.