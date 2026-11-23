# Credit Management Backend

API REST para administrar empleados, clientes, solicitudes de crédito, desembolsos y pagos parciales o totales de cuotas. Roles internos: ADMIN, ADVISOR y CASHIER; simulación y solicitud de crédito públicas.

## Stack y arquitectura

Node.js (Docker usa 24 Alpine), TypeScript 5.9, Express 5, Prisma 5.20, PostgreSQL, JWT, bcryptjs, Nodemailer y CORS. Las versiones declaradas son rangos de package.json; package-lock.json fija la instalación. Flujo: Routes → JWT/RBAC → Controllers → Services → Prisma → PostgreSQL.

```text
src/
  server.ts          # Arranque, CORS, JSON y prefijo /api/v1
  routes/v1/         # Auth, usuarios, clientes, créditos y recaudo
  controllers/       # Contratos HTTP y respuestas
  services/          # Reglas de negocio, finanzas y persistencia
  middlewares/       # JWT/RBAC, JSON inválido, errores y 404
  types/             # DTO e interfaces TypeScript
  utils/             # Validación de documentos y correo
  errors/            # AppError
prisma/
  schema.prisma      # Cinco modelos y enums
  migrations/        # Historial versionado del esquema PostgreSQL
docs/                # Documentación técnica, funcional, diagramas y OpenAPI
Dockerfile           # Build multietapa y ejecución de dist/server.js
```

## Requisitos e instalación

1. Instalar Node.js 24 con npm y disponer de PostgreSQL accesible. Node 24 es la referencia del Dockerfile; no hay engines en package.json.
2. Desde la raíz ejecutar `npm ci`.
3. Copiar `.env.example` a `.env` (PowerShell: `Copy-Item .env.example .env`) y configurar los valores.
4. Generar cliente: `npx prisma generate`.
5. Preparar el esquema de desarrollo según el apartado siguiente.
6. Ejecutar `npm run dev`. Verificar `GET http://localhost:3000/api/v1/health`.
7. Compilar con `npm run build`; ejecutar el compilado con `node dist/server.js`. No existe script npm start.

### Prisma y primera cuenta ADMIN

El esquema se administra mediante Prisma Migrate. En una base nueva y vacía, aplicar el historial versionado con `npx prisma migrate deploy`; después generar el cliente con `npx prisma generate`. La migración `20261119160000_add_collection_payments` incorpora la estructura de recaudo: pagos, acumulación por cuota y estado de abono parcial.

Para bases existentes con esa estructura, seguir la [guía de conciliación y ramas Git](docs/maintenance/MIGRATION_AND_GIT_GUIDE.md) antes de ejecutar migraciones.

No existe seed ni registro público de empleados. La primera cuenta ADMIN debe provisionarse por un operador autorizado en BD, con passwordHash generado mediante bcrypt de coste 10, status ACTIVE y correo en minúsculas. No almacenar contraseñas en texto plano. Tras ello, crear empleados mediante POST /users con su token ADMIN.

### Variables de entorno

| Variable | Uso |
|---|---|
| PORT | Puerto HTTP; defecto 3000 |
| NODE_ENV | production activa envío real de correo; otros valores registran enlace en consola |
| JWT_SECRET | Firma de tokens de sesión y base del secreto de recuperación |
| CORS_ORIGINS | Obligatoria al arrancar; orígenes separados por coma |
| DATABASE_URL | Conexión Prisma/PostgreSQL |
| DIRECT_URL | Conexión directa usada por datasource Prisma |
| EMAIL_USER | Cuenta Gmail del mailer de producción |
| EMAIL_PASS | Credencial de aplicación Gmail; no versionar |

Para recuperación, auth.service usa CORS_ORIGINS completo como base del enlace /reset-password?token=…; varios orígenes producen un enlace inválido. Usar un único origen al verificar este flujo o corregir la implementación por separado. La pantalla existe en el Frontend inspeccionado: src/pages/ResetPassword.jsx.

## Uso de API

Enviar Content-Type: application/json en solicitudes con body y Authorization: Bearer <token> en operaciones protegidas. Base local: http://localhost:3000/api/v1.

| Método | Ruta (prefijo `/api/v1`) | Acceso real | Éxito | Errores documentados |
|---|---|---|---|---|
| GET | `/health` | Público | 200 | — |
| POST | `/auth/login` | Público | 200 | 400, 401 |
| POST | `/auth/forgot-password` | Público | 200 | 400, 500 |
| POST | `/auth/reset-password` | Público | 200 | 400, 500 |
| POST | `/users` | ADMIN | 201 | 400, 401, 403, 409, 500 |
| PATCH | `/users/{id}` | ADMIN | 200 | 400, 401, 403, 404, 500 |
| GET | `/users` | ADMIN | 200 | 401, 403, 500 |
| POST | `/customers` | ADMIN, ADVISOR, CASHIER | 201 | 400, 401, 409, 500 |
| GET | `/customers/by-document/{documentNumber}` | ADMIN, ADVISOR | 200 | 400, 401, 403, 404, 500 |
| PATCH | `/customers/by-document/{documentNumber}` | ADMIN, ADVISOR | 200 | 400, 401, 403, 404, 500 |
| GET | `/customers` | ADMIN, ADVISOR, CASHIER | 200 | 401, 403, 500 |
| POST | `/credits/simulate` | Público | 200 | 400, 500 |
| POST | `/credits/public` | Público | 201 | 400, 500 |
| POST | `/credits` | ADMIN, ADVISOR | 201 | 400, 401, 403, 404, 500 |
| PATCH | `/credits/{id}/evaluate` | ADMIN | 200 | 400, 401, 403, 404, 500 |
| GET | `/credits` | ADMIN, ADVISOR | 200 | 400, 401, 403, 500 |
| POST | `/credits/{id}/disburse` | ADMIN | 200 | 400, 401, 403, 404, 500 |
| GET | `/credits/{id}` | ADMIN, ADVISOR | 200 | 400, 401, 403, 404, 500 |
| GET | `/collections/customers/{documentNumber}/pending-installments` | ADMIN, ADVISOR, CASHIER | 200 | 400, 401, 403, 404, 500 |
| POST | `/collections/payments` | CASHIER | 201 | 400, 401, 403, 404, 500 |

POST /customers solo verifica autenticación, por lo que CASHIER también puede crear clientes. ADMIN no puede registrar pagos: POST /collections/payments exige CASHIER. La creación de pagos responde un recibo JSON; no genera PDF ni realiza cobro por pasarela.

## Verificación y SonarQube

El proyecto solo define scripts dev y build. No se encontraron tests automatizados, script test, framework de pruebas, scanner ni sonar-project.properties. Jira registra la actividad de validación HTTP manual en Postman (SCRUM-38) como Finalizada. No ejecutar npm test ni afirmar cobertura o Quality Gate exitoso. `npm run build` comprueba la compilación y `npx prisma validate` comprueba el esquema sin demostrar reglas de negocio.

Verificación funcional propuesta en BD de pruebas: login por rol, denegación 401/403, alta y búsqueda de cliente, solicitud, evaluación, desembolso, HU-16, abono parcial, saldo final y rechazo de sobrepago. La integración SonarQube requiere configurar un proyecto, scanner, token externo, análisis TypeScript y reportes de cobertura reales; queda pendiente.

## Despliegue

Existe Dockerfile multietapa: `docker build -t credit-management-backend .` y `docker run --env-file .env -p 3000:3000 credit-management-backend`. Revisar el contexto antes de construir: no existe .dockerignore y el builder ejecuta COPY . ., por lo que conviene excluir .env del contexto antes de un build real. La imagen final arranca node dist/server.js y no aplica migraciones.

El sistema está desplegado en Vercel: [Frontend](https://credit-management-frontend.vercel.app/) y [Backend](https://credit-management-backend.vercel.app/). La API usa PostgreSQL en Supabase. El equipo confirma también una base local actualizada y cuatro Sprints cerrados en Jira. Esta información de operación y gestión fue confirmada por el responsable del proyecto el 19 de noviembre de 2026.

Base pública de la API: `https://credit-management-backend.vercel.app/api/v1`. Estado: `GET /api/v1/health`.

## Documentación

[Índice técnico](docs/main.md) · [Confluence](docs/CONFLUENCE_DOCUMENTATION.md) · [API](docs/API_REFERENCE.md) · [OpenAPI](docs/openapi.yaml) · [Diagramas](docs/DIAGRAMS.md). Licencia declarada en package.json: ISC; no se encontró archivo LICENSE.

Frontend inspeccionado: D:/credit-management-frontend. [README preparado para ese repositorio](docs/FRONTEND_README.md).
