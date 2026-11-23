# Listar clientes

**Entrada:** `GET /api/v1/customers`. **Actor:** ADMIN, ADVISOR, CASHIER.

**Evidencia:** `src/server.ts`, `src/routes/v1/`; src/controllers/customer.controller.ts; src/services/customer.service.ts; src/utils/document.validator.ts.

**Flujo:** el router recibe la solicitud, verifica JWT y usuario activo en BD, y autoriza el rol actual. Orden descendente por createdAt; sin paginación. El controlador construye la respuesta 200; los errores se resuelven según el controlador y los middlewares documentados en la referencia REST.

**Entrada, respuesta y excepciones:** [contrato y ejemplos](../API_REFERENCE.md). Consulte también la operación `listCustomers` en [OpenAPI](../openapi.yaml).

```mermaid
flowchart TD
R["GET /customers"]
R --> JWT["verifyToken: firma, expiración, usuario ACTIVE"]
JWT --> RBAC["requireRoles: ADMIN, ADVISOR, CASHIER"]
JWT --> E401["401: autenticación rechazada"]
RBAC --> C
C["Controlador y servicio: listCustomers"] --> S["200: respuesta JSON"]
C --> E["Errores: 401, 403, 500"]
```
