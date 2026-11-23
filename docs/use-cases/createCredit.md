# Crear solicitud interna

**Trazabilidad Jira:** HU-08 · SCRUM-13 · SCRUM Sprint 3 · Finalizada.

**Entrada:** `POST /api/v1/credits`. **Actor:** ADMIN, ADVISOR.

**Evidencia:** `src/server.ts`, `src/routes/v1/`; src/controllers/credit.controller.ts; src/services/credit.service.ts; src/services/financial.service.ts.

**Flujo:** el router recibe la solicitud, verifica JWT y usuario activo en BD, y autoriza el rol actual. Documento alfanumérico de 5–20 caracteres; cliente debe existir. Monto positivo hasta 100000000, plazo entero de 1–72. El controlador construye la respuesta 201; los errores se resuelven según el controlador y los middlewares documentados en la referencia REST.

**Entrada, respuesta y excepciones:** [contrato y ejemplos](../API_REFERENCE.md). Consulte también la operación `createCredit` en [OpenAPI](../openapi.yaml).

```mermaid
flowchart TD
R["POST /credits"]
R --> JWT["verifyToken: firma, expiración, usuario ACTIVE"]
JWT --> RBAC["requireRoles: ADMIN, ADVISOR"]
JWT --> E401["401: autenticación rechazada"]
RBAC --> C
C["Controlador y servicio: createCredit"] --> S["201: respuesta JSON"]
C --> E["Errores: 400, 401, 403, 404, 500"]
```
