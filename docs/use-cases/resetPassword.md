# Restablecer contraseña

**Trazabilidad Jira:** HU-15 · SCRUM-42 · SCRUM Sprint 4 · Finalizada.

**Entrada:** `POST /api/v1/auth/reset-password`. **Actor:** público.

**Evidencia:** `src/server.ts`, `src/routes/v1/`; src/controllers/auth.controller.ts; src/services/auth.service.ts; src/utils/mailer.ts.

**Flujo:** el router recibe la solicitud. Secreto dinámico JWT_SECRET + passwordHash: cambiar la contraseña invalida el enlace. La regla aquí es longitud mínima 8, distinta de alta de usuarios. El controlador construye la respuesta 200; los errores se resuelven según el controlador y los middlewares documentados en la referencia REST.

**Entrada, respuesta y excepciones:** [contrato y ejemplos](../API_REFERENCE.md). Consulte también la operación `resetPassword` en [OpenAPI](../openapi.yaml).

```mermaid
flowchart TD
R["POST /auth/reset-password"]
R --> C
C["Controlador y servicio: resetPassword"] --> S["200: respuesta JSON"]
C --> E["Errores: 400, 500"]
```
