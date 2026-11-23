# Desembolsar crédito

**Trazabilidad Jira:** HU-12 · SCRUM-17 · SCRUM Sprint 3 · Finalizada.

**Entrada:** `POST /api/v1/credits/{id}/disburse`. **Actor:** ADMIN.

**Evidencia:** `src/server.ts`, `src/routes/v1/`; src/controllers/credit.controller.ts; src/services/credit.service.ts; src/services/financial.service.ts.

**Flujo:** el router recibe la solicitud, verifica JWT y usuario activo en BD, y autoriza el rol actual. Solo APPROVED; transacción crea cuotas y cambia estado a DISBURSED. Fechas calculadas con Date.setMonth desde el día del desembolso. No ejecuta transferencia bancaria. El controlador construye la respuesta 200; los errores se resuelven según el controlador y los middlewares documentados en la referencia REST.

**Entrada, respuesta y excepciones:** [contrato y ejemplos](../API_REFERENCE.md). Consulte también la operación `disburseCredit` en [OpenAPI](../openapi.yaml).

```mermaid
flowchart TD
R["POST /credits/{id}/disburse"]
R --> JWT["verifyToken: firma, expiración, usuario ACTIVE"]
JWT --> RBAC["requireRoles: ADMIN"]
JWT --> E401["401: autenticación rechazada"]
RBAC --> C
C["Controlador y servicio: disburseCredit"] --> S["200: respuesta JSON"]
C --> E["Errores: 400, 401, 403, 404, 500"]
```

```mermaid
sequenceDiagram
  actor A as ADMIN
  participant C as CreditController
  participant S as CreditService
  participant F as FinancialService
  participant DB as Prisma / PostgreSQL
  A->>C: POST credits/:id/disburse tras JWT/RBAC
  C->>S: disburseCredit(Number(id))
  S->>DB: creditRequest.findUnique(id)
  DB-->>S: Solicitud
  alt Inexistente o estado distinto de APPROVED
    S-->>C: AppError 404 o 400
    C-->>A: Error delegado al middleware global
  else APPROVED
    S->>F: generateAmortizationSchedule(amount, termMonths)
    F-->>S: Cronograma frances
    S->>DB: Iniciar transaccion
    S->>DB: installment.createMany con fechas setMonth
    S->>DB: creditRequest.update DISBURSED e include cuotas/cliente
    alt Error de persistencia
      DB-->>S: Rollback y excepcion
      S-->>C: Error delegado
      C-->>A: Respuesta del manejador global
    else Commit
      DB-->>S: Credito y cuotas
      S-->>C: Resultado
      C-->>A: 200 message y data
    end
  end
```

La existencia y estado se consultan antes de la transacción; no hay bloqueo explícito ni unicidad compuesta de número de cuota. No se acredita exclusión de desembolsos simultáneos.
