# Detalle de solicitud

**Trazabilidad Jira:** HU-14 · SCRUM-41 · SCRUM Sprint 3 · Finalizada.

**Entrada:** `GET /api/v1/credits/{id}`. **Actor:** ADMIN, ADVISOR.

**Evidencia:** `src/server.ts`, `src/routes/v1/`; src/controllers/credit.controller.ts; src/services/credit.service.ts; src/services/financial.service.ts.

**Flujo:** el router recibe la solicitud, verifica JWT y usuario activo en BD, y autoriza el rol actual. Detalle de solicitud. El controlador construye la respuesta 200; los errores se resuelven según el controlador y los middlewares documentados en la referencia REST.

**Entrada, respuesta y excepciones:** [contrato y ejemplos](../API_REFERENCE.md). Consulte también la operación `getCredit` en [OpenAPI](../openapi.yaml).

```mermaid
flowchart TD
R["GET /credits/{id}"]
R --> JWT["verifyToken: firma, expiración, usuario ACTIVE"]
JWT --> RBAC["requireRoles: ADMIN, ADVISOR"]
JWT --> E401["401: autenticación rechazada"]
RBAC --> C
C["Controlador y servicio: getCredit"] --> S["200: respuesta JSON"]
C --> E["Errores: 400, 401, 403, 404, 500"]
```
