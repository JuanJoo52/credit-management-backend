# Diagramas del sistema de gestión de créditos

La arquitectura del sistema integra Frontend React/Vite en Vercel, Backend Express en Vercel, PostgreSQL en Supabase y correo SMTP. Los diagramas describen los actores, el flujo de recaudo, las entidades y los componentes de nuestra solución. Versión: 20 de noviembre de 2026.

## 1. Casos de uso

```mermaid
flowchart LR
  A["ADMIN"]
  V["ADVISOR"]
  C["CASHIER"]
  P["Cliente final / público"]
  subgraph Sistema["API de gestión de créditos"]
    Auth(["HU-01: login / HU-15: recuperación"])
    Users(["HU-02: registro / HU-04: gestión de empleados; listado de apoyo"])
    CreateCustomer(["HU-06: registrar cliente; listado de apoyo"])
    EditCustomer(["HU-05: búsqueda / HU-07: actualización de cliente"])
    Credits(["HU-08: crear / HU-10: listar / HU-14: detalle de solicitud"])
    Evaluate(["HU-09: evaluar solicitud PENDING"])
    Disburse(["HU-12: activar crédito y generar cuotas"])
    Pending(["HU-16: consultar cuotas pendientes"])
    Pay(["HU-17: registrar pago de una cuota"])
    Simulate(["HU-11: simular amortización"])
    Request(["HU-13: radicar solicitud pública"])
  end
  A --> Auth
  V --> Auth
  C --> Auth
  A --> Users
  A --> CreateCustomer
  V --> CreateCustomer
  C --> CreateCustomer
  A --> EditCustomer
  V --> EditCustomer
  A --> Credits
  V --> Credits
  A --> Evaluate
  A --> Disburse
  A --> Pending
  V --> Pending
  C --> Pending
  C --> Pay
  P --> Simulate
  P --> Request
```

Permisos de API, no menú UI: CASHIER puede registrar/listar clientes mediante API; la pantalla Clientes solo admite ADMIN/ADVISOR. La pantalla Cobros solo admite CASHIER aunque HU-16 permite los tres roles. Simulación y solicitud públicas también son accesibles sin sesión a cualquier visitante. No existe rol CLIENT en Prisma. HU-03 corresponde a la protección JWT/RBAC transversal a las operaciones protegidas, representada en componentes y secuencia. Identificadores contrastados con la [exportación Jira](JIRA_TRACEABILITY.md).

## 2. Secuencia crítica HU-16 y HU-17

La secuencia presenta el recorrido exitoso de consulta y pago. **API** agrupa rutas, middlewares JWT/RBAC y controlador; **Servicio** corresponde a collection.service. Cada petición protegida verifica el token y consulta el estado y rol actuales del usuario en base de datos.

```mermaid
sequenceDiagram
  actor Cajero as CASHIER
  participant UI as Frontend
  participant API as API de recaudo
  participant S as Servicio de recaudo
  participant DB as Prisma / PostgreSQL
  Note over UI,DB: HU-16 - Consulta de cuotas pendientes
  Cajero->>UI: Buscar por documento
  UI->>API: GET cuotas pendientes + Bearer JWT
  API->>S: Autorizar y consultar por documento
  S->>S: Validar y normalizar documento
  S->>DB: Buscar cliente y cuotas de créditos DISBURSED
  DB-->>S: Cuotas PENDING, PARTIAL u OVERDUE
  S-->>API: Cliente, cuotas y saldos
  API-->>UI: 200 - Mostrar cuotas para seleccionar
  Note over UI,DB: HU-17 - Pago parcial o total de una cuota
  Cajero->>UI: Elegir cuota, ingresar monto y confirmar
  UI->>API: POST payments - installmentId, amount + JWT
  API->>S: Exigir CASHIER y usar su ID autenticado
  S->>S: Validar ID y monto positivo
  rect rgb(235, 245, 255)
    Note over S,DB: Transacción Prisma - Escrituras confirmadas juntas
    S->>DB: Consultar cuota y saldo actual
    DB-->>S: Cuota y paidAmount
    S->>S: Rechazar cuota pagada o monto superior al saldo
    S->>S: Calcular acumulado y saldo restante
    Note over S: Saldo cero = PAID, saldo positivo = PARTIAL
    S->>DB: Actualizar cuota y crear Payment con cashierId
    DB-->>S: Commit - Cuota y pago registrados
  end
  S-->>API: Recibo y saldo restante
  API-->>UI: 201 - Mostrar comprobante
  UI->>API: Repetir HU-16 para actualizar cuotas
```

**Rutas:** base `/api/v1/collections`; HU-16 usa `GET /customers/:documentNumber/pending-installments` y HU-17 usa `POST /payments`.

**Reglas conservadas:** HU-16 permite ADMIN, ADVISOR y CASHIER en la API; el recorrido de la pantalla Cobros corresponde a CASHIER. La consulta calcula el saldo pendiente y ordena cuotas por vencimiento dentro de cada crédito. El pago actúa sobre una sola cuota y toma el cajero de la sesión. La transacción consulta la cuota, valida su saldo, actualiza paidAmount/estado y crea Payment antes de confirmar. Las cuotas PAID dejan de aparecer en la consulta.

**Excepciones:** 400 por datos o reglas de saldo; 401 por autenticación; 403 por rol; 404 por cliente o cuota inexistente; 500 por fallo interno. Un rechazo detiene la operación: si ocurre dentro de la transacción, las escrituras se revierten. La interfaz exige revisar o refrescar las cuotas cuando el resultado del pago es incierto. Los controles de concurrencia e idempotencia se gestionan como riesgos operativos, independientes de la atomicidad de la transacción.

## 3. Entidad-relación: esquema Prisma actual

Se muestran nombres físicos de tablas y columnas (incluidos `password_hash` y `created_at` mapeados), tipos Prisma y cardinalidades. `String` sin anotación nativa corresponde a texto PostgreSQL; Float representa doble precisión, no decimal monetario. Las relaciones son obligatorias del lado FK y las colecciones pueden estar vacías. Este diagrama refleja `schema.prisma`, el modelo de datos que registra el historial de migraciones.

```mermaid
erDiagram
  users ||--o{ payments : "registra como cashier"
  customers ||--o{ credit_requests : "solicita"
  credit_requests ||--o{ installments : "contiene"
  installments ||--o{ payments : "recibe"
  users {
    Int id PK "autoincrement"
    String name "VarChar(100)"
    String email UK "VarChar(100)"
    String password_hash "VarChar(255); Prisma passwordHash"
    Role role "ADMIN ADVISOR CASHIER"
    UserStatus status "ACTIVE INACTIVE; default ACTIVE"
    DateTime created_at "Prisma createdAt; default now"
  }
  customers {
    Int id PK "autoincrement"
    DocumentType documentType "CC CE PASSPORT"
    String documentNumber UK
    String firstName
    String lastName
    Float monthlyIncome
    String address
    String phone
    DateTime createdAt "default now"
    DateTime updatedAt "updatedAt"
  }
  credit_requests {
    Int id PK "autoincrement"
    Float amount
    Int termMonths
    String destination
    CreditStatus status "PENDING APPROVED REJECTED DISBURSED; default PENDING"
    String rejectionReason "nullable"
    Int customerId FK
    DateTime createdAt "default now"
    DateTime updatedAt "updatedAt"
  }
  installments {
    Int id PK "autoincrement"
    Int installmentNumber
    DateTime dueDate
    Float principal
    Float interest
    Float paidAmount "default 0"
    Float totalAmount
    InstallmentStatus status "PENDING PARTIAL PAID OVERDUE; default PENDING"
    Int creditRequestId FK
    DateTime createdAt "default now"
    DateTime updatedAt "updatedAt"
  }
  payments {
    Int id PK "autoincrement"
    Float amount
    DateTime paidAt "default now"
    Int installmentId FK
    Int cashierId FK
  }
```

No hay relación del asesor/administrador con CreditRequest ni tabla de tenant. Tampoco hay unicidad declarada para `(creditRequestId, installmentNumber)`. Los enums son tipos, no tablas adicionales.

## 4. Componentes: arquitectura observada

```mermaid
flowchart TB
  subgraph FE["Frontend React 18 / Vite 5"]
    Router["BrowserRouter / App.jsx: 10 rutas y fallback"]
    Guards["RequireAuth / RequireAdmin / RequireRoles"]
    Pages["Request, Login, ForgotPassword, ResetPassword, Panel, NewCredit, CreditDetail, Users, Customers, Collections"]
    Shared["Shell, PanelFrame, CustomerDialog, Simulator, Credits"]
    Session["auth.js / sessionStorage: token y user"]
    API["api.js / fetch / VITE_API_URL"]
    Router --> Guards
    Router --> Pages
    Guards --> Session
    Pages --> Shared
    Pages --> API
    Shared --> API
    API --> Session
  end
  subgraph BE["Backend Node.js / Express 5 / TypeScript"]
    Server["server.ts: CORS y JSON"]
    Routes["/api/v1: health, auth, users, customers, credits, collections"]
    Auth["verifyToken: JWT y usuario ACTIVE en BD"]
    RBAC["requireRoles según operación"]
    Controllers["Controladores HTTP"]
    Services["Auth / User / Customer / Credit / Collection Services"]
    Financial["FinancialService: francés 1.5% mensual; capacidad 40%"]
    Validators["document.validator"]
    ORM["PrismaClient por módulo / transacciones"]
    Mailer["mailer.ts / Nodemailer"]
    Errors["jsonErrorHandler / notFoundHandler / globalErrorHandler"]
    Server --> Routes
    Routes -->|Protegidas| Auth
    Auth --> RBAC
    RBAC --> Controllers
    Auth -->|Alta de cliente: sin RBAC adicional| Controllers
    Routes -->|Públicas| Controllers
    Routes -->|Health directo| Health["JSON de estado"]
    Controllers --> Services
    Services --> Financial
    Services --> Validators
    Services --> ORM
    Auth --> ORM
    Services --> Mailer
    Server --> Errors
    Controllers -->|Errores delegados según módulo| Errors
  end
  API -->|REST JSON; Bearer en protegidas| Server
  ORM --> DB[("PostgreSQL: cinco tablas")]
  Mailer -->|Producción| Gmail["SMTP Gmail"]
  Mailer -->|Desarrollo| Logs["Enlace de recuperación en consola"]
```

Auth y Collection controllers responden sus errores directamente; otros delegan al middleware global. Los middlewares JWT/RBAC también pueden responder sin llegar al controlador. No existe capa Repository separada, bus de eventos o cola. Las rutas públicas omiten JWT; se procesan sin autenticación.

## 5. Arquitectura cloud — Bonus 1

El sistema está desplegado en Vercel: [Frontend](https://credit-management-frontend.vercel.app/) y [Backend](https://credit-management-backend.vercel.app/). La API usa PostgreSQL en Supabase. Utilizamos PostgreSQL local para desarrollo y organizamos el trabajo en cuatro Sprints de Jira. El Frontend incluye rewrite SPA a index.html. Las opciones específicas del proyecto Vercel y de conexión Supabase se administran en sus respectivos entornos; no se publican credenciales.

```mermaid
flowchart TB
  Browser["Navegador: cliente y empleados"]
  subgraph Vercel["Vercel: Frontend y Backend desplegados"]
    Front["Frontend React/Vite: credit-management-frontend.vercel.app"]
    Back["Backend Express: credit-management-backend.vercel.app"]
  end
  subgraph Supabase["Supabase: PostgreSQL"]
    DB[("PostgreSQL: users, customers, credit_requests, installments, payments")]
  end
  SMTP["Servicio externo Gmail / SMTP de producción"]
  Browser -->|HTTPS: descargar SPA| Front
  Front -->|Se ejecuta en el navegador| Browser
  Browser -->|HTTPS REST: POST auth/login| Back
  Back -->|JSON: JWT de 2 h y usuario| Browser
  Browser -->|HTTPS REST: Authorization Bearer JWT| Back
  Back -->|Prisma / protocolo PostgreSQL| DB
  Back -->|SMTP de recuperación: Gmail| SMTP
  SMTP -->|Correo: enlace de reset y token de 15 min| Browser
```

La SPA llama a la API desde el navegador, no desde el hosting estático. El Backend consulta usuario activo y rol en PostgreSQL para cada operación protegida; no delega autenticación a Supabase Auth. DATABASE_URL y DIRECT_URL son configuración de Prisma; el uso de pooler, TLS y la topología final se administran por entorno y se revisan como parte de la operación. El token de recuperación tiene propósito y secreto distintos del token de sesión.
