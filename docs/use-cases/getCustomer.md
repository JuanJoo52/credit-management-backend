# Consultar cliente

**Trazabilidad Jira:** HU-05 · SCRUM-11 · SCRUM Sprint 2 · Finalizada.

**Entrada:** `GET /api/v1/customers/by-document/{documentNumber}`. **Actor:** ADMIN, ADVISOR.

**Evidencia:** `src/server.ts`, `src/routes/v1/`; src/controllers/customer.controller.ts; src/services/customer.service.ts; src/utils/document.validator.ts.

**Flujo:** el router recibe la solicitud, verifica JWT y usuario activo en BD, y autoriza el rol actual. Consultar cliente. El controlador construye la respuesta 200; los errores se resuelven según el controlador y los middlewares documentados en la referencia REST.

**Entrada, respuesta y excepciones:** [contrato y ejemplos](../API_REFERENCE.md). Consulte también la operación `getCustomer` en [OpenAPI](../openapi.yaml).

```mermaid
flowchart TD
R["GET /customers/by-document/{documentNumber}"]
R --> JWT["verifyToken: firma, expiración, usuario ACTIVE"]
JWT --> RBAC["requireRoles: ADMIN, ADVISOR"]
JWT --> E401["401: autenticación rechazada"]
RBAC --> C
C["Controlador y servicio: getCustomer"] --> S["200: respuesta JSON"]
C --> E["Errores: 400, 401, 403, 404, 500"]
```
