## 14. Documentación de API REST

La referencia siguiente incluye las **20 operaciones reales**, prefijo compuesto `/api/v1`, métodos, roles, requests, responses y errores por operación. OpenAPI importable: [openapi.yaml](../openapi.yaml). Los ejemplos JSON utilizan datos de demostración. Headers: `Content-Type: application/json` para body y `Authorization: Bearer <token>` en rutas protegidas. No todas las operaciones devuelven todos los códigos: 200/201 corresponden al éxito propio, 400 a validaciones, 401 a autenticación, 403 a RBAC, 404 a recursos/rutas inexistentes y 500 a fallos internos. Se conserva además 409 donde está implementado.


Los ejemplos JSON muestran los contratos de entrada y salida de cada operación. Las respuestas mantienen los campos definidos por cada controlador.

| Método | Ruta (prefijo `/api/v1`) | Acceso real | Éxito | Errores documentados |
|---|---|---|---|---|
| GET | `/health` | Público | 200 | — |
| POST | `/auth/login` | Público | 200 | 400, 401 |
| POST | `/auth/forgot-password` | Público | 200 | 400, 500 |
| POST | `/auth/reset-password` | Público | 200 | 400, 500 |
| POST | `/users` | ADMIN | 201 | 400, 401, 403, 409, 500 |
| PATCH | `/users/{id}` | ADMIN | 200 | 400, 401, 403, 404, 500 |
| GET | `/users` | ADMIN | 200 | 401, 403, 500 |
| POST | `/customers` | ADMIN, ADVISOR, CASHIER | 201 | 400, 401, 409, 500 |
| GET | `/customers/by-document/{documentNumber}` | ADMIN, ADVISOR | 200 | 400, 401, 403, 404, 500 |
| PATCH | `/customers/by-document/{documentNumber}` | ADMIN, ADVISOR | 200 | 400, 401, 403, 404, 500 |
| GET | `/customers` | ADMIN, ADVISOR, CASHIER | 200 | 401, 403, 500 |
| POST | `/credits/simulate` | Público | 200 | 400, 500 |
| POST | `/credits/public` | Público | 201 | 400, 500 |
| POST | `/credits` | ADMIN, ADVISOR | 201 | 400, 401, 403, 404, 500 |
| PATCH | `/credits/{id}/evaluate` | ADMIN | 200 | 400, 401, 403, 404, 500 |
| GET | `/credits` | ADMIN, ADVISOR | 200 | 400, 401, 403, 500 |
| POST | `/credits/{id}/disburse` | ADMIN | 200 | 400, 401, 403, 404, 500 |
| GET | `/credits/{id}` | ADMIN, ADVISOR | 200 | 400, 401, 403, 404, 500 |
| GET | `/collections/customers/{documentNumber}/pending-installments` | ADMIN, ADVISOR, CASHIER | 200 | 400, 401, 403, 404, 500 |
| POST | `/collections/payments` | CASHIER | 201 | 400, 401, 403, 404, 500 |

En body malformado: ```json
{
  "status": "error",
  "message": "El cuerpo de la petición (JSON) está malformado o es inválido"
}
```

Errores de aplicación: ```json
{
  "success": false,
  "message": "Descripción del error"
}
```

Un 404 por ruta no registrada usa el mensaje `Ruta no encontrada: METHOD URL`. CORS rechazado llega al manejador global como 500; no equivale a autorización RBAC. 409 existe en altas de usuarios/clientes aunque no figuraba en la lista solicitada. Un 500 puede ocurrir en infraestructura; login y verifyToken convierten sus excepciones capturadas a 401.

#### GET /api/v1/health

Estado de API. No consulta la base de datos.

**Acceso:** público. 

**Request:** sin body.

**Response 200:**

```json
{
  "status": "API v1 is running "
}
```

**Errores:** Sin errores específicos de negocio definidos.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### POST /api/v1/auth/login

Iniciar sesión. JWT de 2 horas con userId y role. Todos los errores capturados por este controlador se convierten en 401.

**Acceso:** público. Header: `Content-Type: application/json`.

**Request:** 

```json
{
  "email": "admin@example.com",
  "password": "DemoPass123"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "<JWT>",
    "user": {
      "id": 1,
      "name": "Ana Administradora",
      "email": "admin@example.com",
      "role": "ADMIN",
      "status": "ACTIVE",
      "createdAt": "2026-11-19T15:00:00.000Z"
    }
  }
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 401: Token ausente, inválido o expirado; usuario inexistente/inactivo; credenciales inválidas en login.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### POST /api/v1/auth/forgot-password

Solicitar recuperación. Respuesta genérica para correo inexistente o inactivo; JWT de recuperación de 15 minutos. SMTP solo en NODE_ENV=production.

**Acceso:** público. Header: `Content-Type: application/json`.

**Request:** 

```json
{
  "email": "admin@example.com"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Si el correo se encuentra registrado, recibirás un enlace para restablecer tu contraseña."
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### POST /api/v1/auth/reset-password

Restablecer contraseña. Secreto dinámico JWT_SECRET + passwordHash: cambiar la contraseña invalida el enlace. La regla aquí es longitud mínima 8, distinta de alta de usuarios.

**Acceso:** público. Header: `Content-Type: application/json`.

**Request:** 

```json
{
  "token": "<RESET_JWT>",
  "newPassword": "NuevaPass123"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente. Ya puedes iniciar sesión."
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### POST /api/v1/users

Crear empleado. 

**Acceso:** ADMIN. Header: `Authorization: Bearer <token>`. Header: `Content-Type: application/json`.

**Request:** 

```json
{
  "name": "Carlos Cajero",
  "email": "cashier@example.com",
  "password": "DemoPass123",
  "role": "CASHIER"
}
```

**Response 201:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "name": "Carlos Cajero",
    "email": "cashier@example.com",
    "role": "CASHIER",
    "status": "ACTIVE",
    "createdAt": "2026-11-19T15:00:00.000Z"
  }
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 401: Token ausente, inválido o expirado; usuario inexistente/inactivo; credenciales inválidas en login. 403: Rol actual sin autorización. 409: Correo o documento ya registrado. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### PATCH /api/v1/users/{id}

Actualizar empleado. Impide la autodesactivación; permite cambiar name, role, status.

**Acceso:** ADMIN. Header: `Authorization: Bearer <token>`. Header: `Content-Type: application/json`.

**Request:** 

```json
{
  "name": "Carlos Cajero",
  "status": "INACTIVE"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Empleado actualizado exitosamente",
  "data": {
    "id": 2,
    "name": "Carlos Cajero",
    "email": "admin@example.com",
    "role": "CASHIER",
    "status": "INACTIVE",
    "createdAt": "2026-11-19T15:00:00.000Z"
  }
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 401: Token ausente, inválido o expirado; usuario inexistente/inactivo; credenciales inválidas en login. 403: Rol actual sin autorización. 404: Recurso inexistente. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### GET /api/v1/users

Listar empleados. Orden descendente por createdAt; sin paginación.

**Acceso:** ADMIN. Header: `Authorization: Bearer <token>`. 

**Request:** sin body.

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Ana Administradora",
      "email": "admin@example.com",
      "role": "ADMIN",
      "status": "ACTIVE",
      "createdAt": "2026-11-19T15:00:00.000Z"
    }
  ]
}
```

**Errores:** 401: Token ausente, inválido o expirado; usuario inexistente/inactivo; credenciales inválidas en login. 403: Rol actual sin autorización. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### POST /api/v1/customers

Registrar cliente. Solo verifyToken: no hay restricción RBAC adicional. CC/CE: 6–10 dígitos; PASSPORT: 6–12 alfanuméricos. Teléfono: 7–15 dígitos.

**Acceso:** ADMIN, ADVISOR, CASHIER. Header: `Authorization: Bearer <token>`. Header: `Content-Type: application/json`.

**Request:** 

```json
{
  "documentType": "CC",
  "documentNumber": "1234567890",
  "firstName": "Laura",
  "lastName": "Pérez",
  "monthlyIncome": 3000000,
  "address": "Calle 10 # 20-30",
  "phone": "3001234567"
}
```

**Response 201:**

```json
{
  "message": "Cliente registrado exitosamente",
  "data": {
    "id": 1,
    "documentType": "CC",
    "documentNumber": "1234567890",
    "firstName": "Laura",
    "lastName": "Pérez",
    "monthlyIncome": 3000000,
    "address": "Calle 10 # 20-30",
    "phone": "3001234567",
    "createdAt": "2026-11-19T15:00:00.000Z",
    "updatedAt": "2026-11-19T15:00:00.000Z"
  }
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 401: Token ausente, inválido o expirado; usuario inexistente/inactivo; credenciales inválidas en login. 409: Correo o documento ya registrado. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### GET /api/v1/customers/by-document/{documentNumber}

Consultar cliente. 

**Acceso:** ADMIN, ADVISOR. Header: `Authorization: Bearer <token>`. 

**Request:** sin body.

**Response 200:**

```json
{
  "data": {
    "id": 1,
    "documentType": "CC",
    "documentNumber": "1234567890",
    "firstName": "Laura",
    "lastName": "Pérez",
    "monthlyIncome": 3000000,
    "address": "Calle 10 # 20-30",
    "phone": "3001234567",
    "createdAt": "2026-11-19T15:00:00.000Z",
    "updatedAt": "2026-11-19T15:00:00.000Z"
  }
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 401: Token ausente, inválido o expirado; usuario inexistente/inactivo; credenciales inválidas en login. 403: Rol actual sin autorización. 404: Recurso inexistente. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### PATCH /api/v1/customers/by-document/{documentNumber}

Actualizar cliente. 

**Acceso:** ADMIN, ADVISOR. Header: `Authorization: Bearer <token>`. Header: `Content-Type: application/json`.

**Request:** 

```json
{
  "phone": "3007654321",
  "monthlyIncome": 3500000
}
```

**Response 200:**

```json
{
  "message": "Datos del cliente actualizados exitosamente",
  "data": {
    "id": 1,
    "documentType": "CC",
    "documentNumber": "1234567890",
    "firstName": "Laura",
    "lastName": "Pérez",
    "monthlyIncome": 3500000,
    "address": "Calle 10 # 20-30",
    "phone": "3007654321",
    "createdAt": "2026-11-19T15:00:00.000Z",
    "updatedAt": "2026-11-19T15:00:00.000Z"
  }
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 401: Token ausente, inválido o expirado; usuario inexistente/inactivo; credenciales inválidas en login. 403: Rol actual sin autorización. 404: Recurso inexistente. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### GET /api/v1/customers

Listar clientes. Orden descendente por createdAt; sin paginación.

**Acceso:** ADMIN, ADVISOR, CASHIER. Header: `Authorization: Bearer <token>`. 

**Request:** sin body.

**Response 200:**

```json
{
  "data": [
    {
      "id": 1,
      "documentType": "CC",
      "documentNumber": "1234567890",
      "firstName": "Laura",
      "lastName": "Pérez",
      "monthlyIncome": 3000000,
      "address": "Calle 10 # 20-30",
      "phone": "3001234567",
      "createdAt": "2026-11-19T15:00:00.000Z",
      "updatedAt": "2026-11-19T15:00:00.000Z"
    }
  ]
}
```

**Errores:** 401: Token ausente, inválido o expirado; usuario inexistente/inactivo; credenciales inválidas en login. 403: Rol actual sin autorización. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### POST /api/v1/credits/simulate

Simular amortización. Sistema francés, tasa mensual fija 1.5%. Convierte amount y termMonths con Number; no impone el máximo de monto de creación.

**Acceso:** público. Header: `Content-Type: application/json`.

**Request:** 

```json
{
  "amount": 100000,
  "termMonths": 1
}
```

**Response 200:**

```json
{
  "message": "Simulación del plan de amortización realizada exitosamente",
  "data": {
    "amount": 100000,
    "termMonths": 1,
    "monthlyInterestRate": 0.015,
    "monthlyInstallment": 101500,
    "totalInterest": 1500,
    "totalPayment": 101500,
    "schedule": [
      {
        "installmentNumber": 1,
        "payment": 101500,
        "interest": 1500,
        "principal": 100000,
        "remainingBalance": 0
      }
    ]
  }
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### POST /api/v1/credits/public

Solicitar crédito público. Crea cliente si no existe; si existe no modifica sus datos. documentType=CC, address=No registrada, phone vacío y destination=Libre inversión por defecto. Cliente y solicitud se crean sin transacción conjunta.

**Acceso:** público. Header: `Content-Type: application/json`.

**Request:** 

```json
{
  "documentType": "CC",
  "documentNumber": "1234567890",
  "firstName": "Laura",
  "lastName": "Pérez",
  "monthlyIncome": 3000000,
  "address": "Calle 10 # 20-30",
  "phone": "3001234567",
  "amount": 100000,
  "termMonths": 1,
  "destination": "Capital de trabajo"
}
```

**Response 201:**

```json
{
  "message": "Solicitud de crédito registrada exitosamente. Ha quedado en estado PENDIENTE de evaluación.",
  "data": {
    "id": 1,
    "status": "PENDING"
  }
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### POST /api/v1/credits

Crear solicitud interna. Documento alfanumérico de 5–20 caracteres; cliente debe existir. Monto positivo hasta 100000000, plazo entero de 1–72.

**Acceso:** ADMIN, ADVISOR. Header: `Authorization: Bearer <token>`. Header: `Content-Type: application/json`.

**Request:** 

```json
{
  "documentNumber": "1234567890",
  "amount": 100000,
  "termMonths": 1,
  "destination": "Capital de trabajo"
}
```

**Response 201:**

```json
{
  "message": "Solicitud de crédito creada exitosamente en estado Pendiente",
  "data": {
    "id": 1,
    "amount": 100000,
    "termMonths": 1,
    "destination": "Capital de trabajo",
    "status": "PENDING",
    "rejectionReason": null,
    "customerId": 1,
    "createdAt": "2026-11-19T15:00:00.000Z",
    "updatedAt": "2026-11-19T15:00:00.000Z",
    "customer": {
      "documentNumber": "1234567890",
      "firstName": "Laura",
      "lastName": "Pérez"
    }
  }
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 401: Token ausente, inválido o expirado; usuario inexistente/inactivo; credenciales inválidas en login. 403: Rol actual sin autorización. 404: Recurso inexistente. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### PATCH /api/v1/credits/{id}/evaluate

Evaluar solicitud. Solo PENDING; rechazo exige rejectionReason no vacío; aprobación exige cuota francesa <= 40% de monthlyIncome.

**Acceso:** ADMIN. Header: `Authorization: Bearer <token>`. Header: `Content-Type: application/json`.

**Request:** 

```json
{
  "status": "APPROVED"
}
```

**Response 200:**

```json
{
  "message": "Solicitud de crédito evaluada exitosamente: APPROVED",
  "data": {
    "id": 1,
    "amount": 100000,
    "termMonths": 1,
    "destination": "Capital de trabajo",
    "status": "APPROVED",
    "rejectionReason": null,
    "customerId": 1,
    "createdAt": "2026-11-19T15:00:00.000Z",
    "updatedAt": "2026-11-19T15:00:00.000Z",
    "customer": {
      "documentNumber": "1234567890",
      "firstName": "Laura",
      "lastName": "Pérez",
      "monthlyIncome": 3000000
    }
  }
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 401: Token ausente, inválido o expirado; usuario inexistente/inactivo; credenciales inválidas en login. 403: Rol actual sin autorización. 404: Recurso inexistente. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### GET /api/v1/credits

Listar solicitudes. Filtros opcionales status y documentNumber; status se convierte a mayúsculas, documento solo trim. Orden descendente por createdAt.

**Acceso:** ADMIN, ADVISOR. Header: `Authorization: Bearer <token>`. 

**Request:** sin body.

**Response 200:**

```json
{
  "message": "Listado de solicitudes de crédito obtenido exitosamente",
  "count": 1,
  "data": [
    {
      "id": 1,
      "amount": 100000,
      "termMonths": 1,
      "destination": "Capital de trabajo",
      "status": "PENDING",
      "rejectionReason": null,
      "customerId": 1,
      "createdAt": "2026-11-19T15:00:00.000Z",
      "updatedAt": "2026-11-19T15:00:00.000Z",
      "customer": {
        "documentNumber": "1234567890",
        "firstName": "Laura",
        "lastName": "Pérez",
        "monthlyIncome": 3000000
      }
    }
  ]
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 401: Token ausente, inválido o expirado; usuario inexistente/inactivo; credenciales inválidas en login. 403: Rol actual sin autorización. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### POST /api/v1/credits/{id}/disburse

Desembolsar crédito. Solo APPROVED; transacción crea cuotas y cambia estado a DISBURSED. Fechas calculadas con Date.setMonth desde el día del desembolso. No ejecuta transferencia bancaria.

**Acceso:** ADMIN. Header: `Authorization: Bearer <token>`. 

**Request:** sin body.

**Response 200:**

```json
{
  "message": "Crédito liquidado y desembolsado exitosamente. Se ha generado el cronograma oficial de pagos.",
  "data": {
    "id": 1,
    "amount": 100000,
    "termMonths": 1,
    "destination": "Capital de trabajo",
    "status": "DISBURSED",
    "rejectionReason": null,
    "customerId": 1,
    "createdAt": "2026-11-19T15:00:00.000Z",
    "updatedAt": "2026-11-19T15:00:00.000Z",
    "customer": {
      "documentNumber": "1234567890",
      "firstName": "Laura",
      "lastName": "Pérez"
    },
    "installments": [
      {
        "id": 1,
        "installmentNumber": 1,
        "dueDate": "2026-12-19T15:00:00.000Z",
        "principal": 100000,
        "interest": 1500,
        "paidAmount": 0,
        "totalAmount": 101500,
        "status": "PENDING",
        "creditRequestId": 1,
        "createdAt": "2026-11-19T15:00:00.000Z",
        "updatedAt": "2026-11-19T15:00:00.000Z"
      }
    ]
  }
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 401: Token ausente, inválido o expirado; usuario inexistente/inactivo; credenciales inválidas en login. 403: Rol actual sin autorización. 404: Recurso inexistente. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### GET /api/v1/credits/{id}

Detalle de solicitud. 

**Acceso:** ADMIN, ADVISOR. Header: `Authorization: Bearer <token>`. 

**Request:** sin body.

**Response 200:**

```json
{
  "message": "Detalle de la solicitud de crédito obtenido exitosamente",
  "data": {
    "id": 1,
    "amount": 100000,
    "termMonths": 1,
    "destination": "Capital de trabajo",
    "status": "PENDING",
    "rejectionReason": null,
    "customerId": 1,
    "createdAt": "2026-11-19T15:00:00.000Z",
    "updatedAt": "2026-11-19T15:00:00.000Z",
    "customer": {
      "id": 1,
      "documentNumber": "1234567890",
      "firstName": "Laura",
      "lastName": "Pérez",
      "phone": "3001234567",
      "monthlyIncome": 3000000
    },
    "installments": []
  }
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 401: Token ausente, inválido o expirado; usuario inexistente/inactivo; credenciales inválidas en login. 403: Rol actual sin autorización. 404: Recurso inexistente. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### GET /api/v1/collections/customers/{documentNumber}/pending-installments

HU-16: consultar cuotas pendientes. Solo créditos DISBURSED y cuotas PENDING/PARTIAL/OVERDUE, ordenadas por dueDate dentro de cada crédito. Documento trim y mayúsculas, sin regex adicional.

**Acceso:** ADMIN, ADVISOR, CASHIER. Header: `Authorization: Bearer <token>`. 

**Request:** sin body.

**Response 200:**

```json
{
  "success": true,
  "message": "Cuotas pendientes consultadas exitosamente",
  "data": {
    "customer": {
      "id": 1,
      "fullName": "Laura Pérez",
      "documentNumber": "1234567890"
    },
    "activeCredits": [
      {
        "creditRequestId": 1,
        "amount": 100000,
        "pendingInstallments": [
          {
            "installmentId": 1,
            "installmentNumber": 1,
            "dueDate": "2026-12-19T15:00:00.000Z",
            "totalAmount": 101500,
            "paidAmount": 0,
            "pendingBalance": 101500,
            "status": "Pendiente"
          }
        ]
      }
    ]
  }
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 401: Token ausente, inválido o expirado; usuario inexistente/inactivo; credenciales inválidas en login. 403: Rol actual sin autorización. 404: Recurso inexistente. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).

#### POST /api/v1/collections/payments

HU-17: registrar pago. Convierte installmentId y amount con Number. cashierId proviene del usuario autenticado, nunca del body. Pago por una cuota; monto <= saldo pendiente; saldo cero => PAID, de otro modo PARTIAL.

**Acceso:** CASHIER. Header: `Authorization: Bearer <token>`. Header: `Content-Type: application/json`.

**Request:** 

```json
{
  "installmentId": 1,
  "amount": 50000
}
```

**Response 201:**

```json
{
  "success": true,
  "message": "Pago registrado exitosamente",
  "data": {
    "receipt": {
      "paymentId": 1,
      "paidAt": "2026-11-19T15:00:00.000Z",
      "amountPaid": 50000,
      "installmentId": 1,
      "installmentNumber": 1,
      "totalInstallmentAmount": 101500,
      "paidAmount": 50000,
      "remainingBalance": 51500,
      "status": "Con abono"
    }
  }
}
```

**Errores:** 400: Validación o regla de negocio incumplida; JSON malformado. 401: Token ausente, inválido o expirado; usuario inexistente/inactivo; credenciales inválidas en login. 403: Rol actual sin autorización. 404: Recurso inexistente. 500: Error interno, persistencia o configuración.

Contrato completo de campos y parámetros: [OpenAPI](../openapi.yaml).
