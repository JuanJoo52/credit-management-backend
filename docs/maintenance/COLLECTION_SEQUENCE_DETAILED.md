# Secuencia tecnica detallada de recaudo

Referencia de mantenimiento; para Confluence usar la secuencia resumida de DIAGRAMS.md.

## 2. Secuencia crítica HU-16 y HU-17

```mermaid
sequenceDiagram
  actor Cajero as CASHIER
  participant UI as Collections.jsx / api.js
  participant R as collection.routes
  participant M as verifyToken / requireRoles
  participant C as collection.controller
  participant S as collection.service
  participant DB as Prisma / PostgreSQL
  Cajero->>UI: Buscar por documento
  UI->>R: GET /api/v1/collections/customers/:documentNumber/pending-installments + Bearer
  R->>M: Verificar JWT y consultar usuario ACTIVE
  M->>DB: user.findUnique(userId)
  DB-->>M: Usuario y rol actual
  alt Token inválido o usuario inactivo/inexistente
    M-->>UI: 401 success=false
  else Usuario autenticado y rol ADMIN, ADVISOR o CASHIER
    M->>C: searchPendingInstallments
    C->>S: getPendingInstallmentsByDocument(documentNumber)
    S->>S: Validar presencia, trim y mayúsculas
    S->>DB: customer.findUnique, créditos DISBURSED, cuotas PENDING/PARTIAL/OVERDUE
    DB-->>S: Cliente y cuotas por dueDate ascendente
    alt Cliente inexistente
      S-->>C: AppError 404
      C-->>UI: 404 success=false
    else Cliente encontrado
      S->>S: pendingBalance = totalAmount - paidAmount, etiquetas de estado
      S-->>C: customer y activeCredits
      C-->>UI: 200 success=true, message, data
      UI-->>Cajero: Selección de cuota y saldo
    end
  end
  Cajero->>UI: Ingresar abono o saldo completo y confirmar
  UI->>R: POST /api/v1/collections/payments {installmentId, amount} + Bearer
  R->>M: Verificar JWT, consultar usuario y exigir CASHIER
  M->>DB: user.findUnique(userId)
  DB-->>M: Usuario actual
  alt Autenticación inválida
    M-->>UI: 401 success=false
  else Rol diferente de CASHIER
    M-->>UI: 403 success=false
  else CASHIER autorizado
    M->>C: createInstallmentPayment
    C->>C: Number(body), cashierId desde req.user
    C->>S: registerInstallmentPayment(installmentId, amount, cashierId)
    S->>S: ID entero positivo y monto positivo
    alt Entrada inválida
      S-->>C: AppError 400
      C-->>UI: 400 success=false
    else Entrada válida
      S->>DB: Iniciar prisma.$transaction
      S->>DB: tx.installment.findUnique(id)
      DB-->>S: Cuota o null
      alt Cuota inexistente, pagada o sobrepago
        S-->>DB: Abortar transacción por AppError
        S-->>C: 404 inexistente o 400 regla de saldo
        C-->>UI: success=false y message
      else Pago válido
        S->>S: Acumular paidAmount y redondear saldo a 2 decimales
        alt Saldo restante igual a cero
          S->>S: newStatus = PAID
        else Saldo restante positivo
          S->>S: newStatus = PARTIAL
        end
        S->>DB: tx.installment.update(paidAmount, status)
        S->>DB: tx.payment.create(installmentId, amount, cashierId)
        alt Fallo de persistencia
          DB-->>S: Error y rollback
          S-->>C: Excepción
          C-->>UI: 500 success=false
        else Commit exitoso
          DB-->>S: Cuota actualizada y Payment
          S-->>C: receipt con paymentId, fecha, importes, saldo y etiqueta
          C-->>UI: 201 success=true, message, data.receipt
          UI-->>Cajero: Comprobante en pantalla
          UI->>R: Reconsultar HU-16 para refrescar cuotas
        end
      end
    end
  end
```

La transacción asegura que actualización de cuota y creación del pago se confirmen juntas. No implica bloqueo explícito ni idempotencia; el control de operaciones concurrentes y reintentos se contempla en los riesgos operativos. HU-16 no marca OVERDUE según fecha. La UI impide nuevos envíos mientras paga y exige refrescar tras errores inciertos. Una búsqueda sin cuotas devuelve 200 con colecciones vacías. No hay generación de PDF ni pasarela.

