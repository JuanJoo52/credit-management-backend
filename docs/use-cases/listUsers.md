# Listar empleados

**Entrada:** `GET /api/v1/users`. **Actor:** ADMIN.

**Evidencia:** `src/server.ts`, `src/routes/v1/`; src/controllers/user.controller.ts; src/services/user.service.ts.

**Flujo:** el router recibe la solicitud, verifica JWT y usuario activo en BD, y autoriza el rol actual. Orden descendente por createdAt; sin paginación. El controlador construye la respuesta 200; los errores se resuelven según el controlador y los middlewares documentados en la referencia REST.

**Entrada, respuesta y excepciones:** [contrato y ejemplos](../API_REFERENCE.md). Consulte también la operación `listUsers` en [OpenAPI](../openapi.yaml).

```mermaid
flowchart TD
R["GET /users"]
R --> JWT["verifyToken: firma, expiración, usuario ACTIVE"]
JWT --> RBAC["requireRoles: ADMIN"]
JWT --> E401["401: autenticación rechazada"]
RBAC --> C
C["Controlador y servicio: listUsers"] --> S["200: respuesta JSON"]
C --> E["Errores: 401, 403, 500"]
```
