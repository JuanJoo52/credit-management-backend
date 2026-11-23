# Documentación técnica del Backend

Inspección del código: 19 de noviembre de 2026. Sistema de gestión de créditos con usuarios internos ADMIN, ADVISOR y CASHIER, clientes, solicitudes, amortización francesa y recaudo por cuota.

## Evidencia y límites

Fuentes primarias: `package.json`, `src/server.ts`, `src/routes/v1/*`, `src/controllers/*`, `src/services/*`, `src/middlewares/*`, `src/types/*`, `src/utils/*`, `prisma/schema.prisma`, migraciones y `Dockerfile`. Se inspeccionaron exclusivamente los nombres de las variables de .env, sin publicar valores. No había documentación previa ni plantilla local. Se inspeccionó el Frontend en `D:/credit-management-frontend`: React 18, Vite 5, diez rutas explícitas y rewrite SPA de Vercel. No se encontró rúbrica adicional ni configuración local de pruebas o SonarQube. El despliegue y la gestión de Sprints se complementan con la confirmación del responsable del proyecto.

El sistema está desplegado en Vercel: [Frontend](https://credit-management-frontend.vercel.app/) y [Backend](https://credit-management-backend.vercel.app/). La API usa PostgreSQL en Supabase. El equipo confirma también una base local actualizada y cuatro Sprints cerrados en Jira. Esta información de operación y gestión fue confirmada por el responsable del proyecto el 19 de noviembre de 2026.

## Arquitectura observada

Express 5 registra /api/v1 y encadena CORS, parser JSON, rutas, autenticación/autorización por ruta, controladores, servicios y Prisma/PostgreSQL. Es una estructura por capas inferida de las llamadas reales. Cada módulo de servicio y el middleware de autenticación instancian PrismaClient; no existe un repositorio separado ni bus de eventos. FinancialService calcula la cuota francesa al 1.5% mensual y valida capacidad del 40%. Nodemailer usa Gmail en producción y escribe el enlace de recuperación en consola en desarrollo.

## Seguridad y persistencia

Login emite JWT de 2 horas; verifyToken consulta el usuario y su estado actual en BD y RBAC usa el rol actual. Bcrypt usa coste 10. El restablecimiento emite un token de 15 minutos ligado al hash actual. El hash no se devuelve en las respuestas de usuarios. CORS exige lista de orígenes configurada. Hay transacciones para desembolso y recaudo; no se acredita protección ante pagos concurrentes ni idempotencia.

El esquema contiene cinco modelos: User, Customer, CreditRequest, Installment, Payment. Los importes son Float. El historial versionado incluye la migración de recaudo `20261119160000_add_collection_payments`, que registra Payment, paidAmount y PARTIAL. La conciliación del historial en bases existentes se realiza por entorno siguiendo la [guía operativa](maintenance/MIGRATION_AND_GIT_GUIDE.md). No hay job observado que cambie cuotas a OVERDUE; DISBURSED no cambia a un estado de crédito cerrado.

## Índice de casos de uso

- [Estado de API](use-cases/health.md) — `GET /health`
- [Iniciar sesión](use-cases/login.md) — `POST /auth/login`
- [Solicitar recuperación](use-cases/forgotPassword.md) — `POST /auth/forgot-password`
- [Restablecer contraseña](use-cases/resetPassword.md) — `POST /auth/reset-password`
- [Crear empleado](use-cases/createUser.md) — `POST /users`
- [Actualizar empleado](use-cases/updateUser.md) — `PATCH /users/{id}`
- [Listar empleados](use-cases/listUsers.md) — `GET /users`
- [Registrar cliente](use-cases/createCustomer.md) — `POST /customers`
- [Consultar cliente](use-cases/getCustomer.md) — `GET /customers/by-document/{documentNumber}`
- [Actualizar cliente](use-cases/updateCustomer.md) — `PATCH /customers/by-document/{documentNumber}`
- [Listar clientes](use-cases/listCustomers.md) — `GET /customers`
- [Simular amortización](use-cases/simulateCredit.md) — `POST /credits/simulate`
- [Solicitar crédito público](use-cases/createPublicCredit.md) — `POST /credits/public`
- [Crear solicitud interna](use-cases/createCredit.md) — `POST /credits`
- [Evaluar solicitud](use-cases/evaluateCredit.md) — `PATCH /credits/{id}/evaluate`
- [Listar solicitudes](use-cases/listCredits.md) — `GET /credits`
- [Desembolsar crédito](use-cases/disburseCredit.md) — `POST /credits/{id}/disburse`
- [Detalle de solicitud](use-cases/getCredit.md) — `GET /credits/{id}`
- [HU-16: consultar cuotas pendientes](use-cases/pendingInstallments.md) — `GET /collections/customers/{documentNumber}/pending-installments`
- [HU-17: registrar pago](use-cases/registerPayment.md) — `POST /collections/payments`

## Entregables

- [Documento de Confluence con 15 secciones](CONFLUENCE_DOCUMENTATION.md).
- [Diagramas](DIAGRAMS.md).
- [Referencia REST y ejemplos](API_REFERENCE.md).
- [OpenAPI 3.0.3](openapi.yaml).
- [Instalación y operación](../README.md).
- [Verificación documental y mantenimiento](VALIDATION.md).
- [README preparado para Frontend](FRONTEND_README.md).

## Frontend inspeccionado

React Router define cuatro rutas públicas y seis protegidas. api.js envía JSON/Bearer a VITE_API_URL; auth.js guarda token/usuario en sessionStorage y dirige CASHIER a Cobros. La guía de pantallas y divergencias UI/API está en la sección 15 del documento Confluence. [README preparado para Frontend](FRONTEND_README.md).

## Trazabilidad de gestión

[Correspondencia Jira e implementación](JIRA_TRACEABILITY.md): cinco épicas, 17 HU finalizadas y distribución por los cuatro Sprints. Los identificadores Jira prevalecen sobre comentarios históricos del código.

## Versión final para Confluence

La memoria final del 20 de noviembre de 2026 incluye las 15 secciones, 97 SP estimados mediante Fibonacci y diez espacios para capturas. Para publicarla por páginas: [Memoria, secciones 1–13](confluence/01-MEMORIA.md), [API REST, sección 14](confluence/02-API-REST.md), [Frontend, sección 15](confluence/03-FRONTEND.md) y [cinco diagramas](confluence/04-DIAGRAMAS.md). La especificación importable se mantiene en [openapi.yaml](openapi.yaml).
