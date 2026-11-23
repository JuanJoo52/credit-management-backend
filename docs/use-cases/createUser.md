# Crear empleado

**Trazabilidad Jira:** HU-02 · SCRUM-6 · SCRUM Sprint 1 · Finalizada.

**Entrada:** `POST /api/v1/users`. **Actor:** ADMIN.

**Evidencia:** `src/server.ts`, `src/routes/v1/`; src/controllers/user.controller.ts; src/services/user.service.ts.

**Flujo:** el router recibe la solicitud, verifica JWT y usuario activo en BD, y autoriza el rol actual. Crear empleado. El controlador construye la respuesta 201; los errores se resuelven según el controlador y los middlewares documentados en la referencia REST.

**Entrada, respuesta y excepciones:** [contrato y ejemplos](../API_REFERENCE.md). Consulte también la operación `createUser` en [OpenAPI](../openapi.yaml).

```mermaid
flowchart TD
R["POST /users"]
R --> JWT["verifyToken: firma, expiración, usuario ACTIVE"]
JWT --> RBAC["requireRoles: ADMIN"]
JWT --> E401["401: autenticación rechazada"]
RBAC --> C
C["Controlador y servicio: createUser"] --> S["201: respuesta JSON"]
C --> E["Errores: 400, 401, 403, 409, 500"]
```
