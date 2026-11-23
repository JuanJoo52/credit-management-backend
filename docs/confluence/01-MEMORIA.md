# Proyecto Final – Ingeniería de Software II

**Sistema de Gestión de Créditos**

**Memoria técnica y funcional · Versión final · 20 de noviembre de 2026**

Desarrollamos una solución web para administrar clientes, solicitudes de crédito, evaluación, desembolso y recaudo de cuotas. Organizamos el trabajo en cuatro Sprints cerrados en Jira y aplicamos una separación de responsabilidades mediante los perfiles ADMIN, ADVISOR y CASHIER.

El [Frontend](https://credit-management-frontend.vercel.app/) y el [Backend](https://credit-management-backend.vercel.app/) están desplegados en Vercel. Utilizamos PostgreSQL en Supabase para el entorno desplegado y PostgreSQL local para desarrollo. Esta memoria presenta el alcance del MVP, el backlog, los criterios de calidad, la arquitectura, la API y la navegación del producto.

## 1. Descripción del problema y necesidad

Una operación de crédito necesita identificar al solicitante, registrar sus ingresos y contacto, evaluar solicitudes, establecer un cronograma y controlar cuánto se ha recibido de cada cuota. La dispersión de esa información dificulta distinguir solicitudes pendientes de créditos desembolsados y pagos parciales de cuotas saldadas.

El sistema centraliza clientes por documento único, solicitudes con estados y cuotas asociadas. Separa responsabilidades internas mediante ADMIN, ADVISOR y CASHIER, expone una solicitud pública con simulador y registra cada pago con fecha y cajero. Su propósito es mejorar la trazabilidad operativa desde la solicitud hasta el recaudo. La reducción efectiva de tiempos y errores debe medirse en un piloto.

## 2. Usuario final: perfiles y permisos

| Perfil | Responsabilidad y permisos implementados en API | Acceso real en Frontend |
|---|---|---|
| ADMIN | Crear, listar y actualizar empleados; gestionar clientes; crear, listar y consultar créditos; aprobar/rechazar; desembolsar; consultar cuotas pendientes | Solicitudes, nueva solicitud, detalle, clientes y usuarios |
| ADVISOR | Crear, listar, consultar y actualizar clientes; crear/listar/consultar solicitudes; consultar cuotas pendientes | Solicitudes, nueva solicitud, detalle y clientes |
| CASHIER | Consultar cuotas pendientes y registrar pagos; también listar y crear clientes por permisos reales del Backend | Exclusivamente pantalla Cobros dentro del panel |
| Cliente final/prospecto | Simular y radicar solicitud pública sin token | Formulario público de tres pasos en `/`; no tiene cuenta ni panel propio |

El cliente es `Customer`, no un cuarto valor de `Role`. Los endpoints de autenticación son públicos para el equipo interno. ADMIN no hereda automáticamente todos los permisos: **solo CASHIER registra pagos**. `POST /customers` exige JWT y no usa `requireRoles`; permite acceso a los tres roles internos. La UI oculta funciones según sesión, pero la autorización efectiva ocurre en el servidor con el usuario y rol actuales consultados en BD.

## 3. Caso de uso principal: ciclo del crédito y recaudo

1. El cliente abre `/`, proporciona documento y nombres, contacto/ingresos y condiciones del crédito. El simulador consulta `POST /api/v1/credits/simulate` con amortización francesa y tasa fija mensual de 0.015.
2. El formulario radica `POST /api/v1/credits/public`. El servicio reutiliza al cliente existente sin modificar sus datos o crea uno nuevo, y registra solicitud `PENDING`. La respuesta pública contiene solamente `id` y `status` dentro de `data`.
3. Alternativamente, ADMIN o ADVISOR busca/crea al cliente y radica una solicitud interna desde `/panel/credits/new` con `POST /credits`.
4. ADMIN consulta el detalle y evalúa la solicitud pendiente. Para aprobar, la cuota estimada debe ser menor o igual al 40% del ingreso mensual registrado. Para rechazar, debe indicar un motivo. Un incumplimiento de capacidad devuelve 400 y conserva PENDING; no rechaza automáticamente.
5. ADMIN desembolsa una solicitud APPROVED. Una transacción crea las cuotas y actualiza el crédito a DISBURSED. El término “desembolso” representa registro interno y cronograma; no hay transferencia bancaria integrada.
6. CASHIER inicia sesión y llega a `/panel/collections`. Consulta cuotas por documento mediante HU-16. Solo se recuperan créditos DISBURSED y cuotas PENDING, PARTIAL u OVERDUE, ordenadas por vencimiento dentro de cada crédito.
7. Selecciona una cuota, ingresa un abono o usa “Usar saldo completo”, revisa el diálogo y confirma HU-17. El Backend obtiene cashierId de la sesión, consulta el saldo y rechaza importes superiores al pendiente.
8. La transacción actualiza `paidAmount`/estado y crea `Payment`. Saldo positivo produce PARTIAL; saldo cero produce PAID. La UI muestra recibo JSON y vuelve a consultar cuotas. Las cuotas PAID dejan de aparecer en HU-16.

Pago total significa cancelar el saldo de **una cuota**. No existe endpoint de liquidación anticipada global del crédito ni distribución automática entre varias cuotas. El crédito mantiene DISBURSED aunque todas sus cuotas estén pagadas.

Flujos y persistencia: [diagramas](../DIAGRAMS.md), [HU-16](../use-cases/pendingInstallments.md) y [HU-17](../use-cases/registerPayment.md).

## 4. Alcance: MVP y exclusiones

| Incluido en el MVP | Fuera del alcance del MVP |
|---|---|
| Login, JWT, roles y usuarios activos/inactivos | MFA, refresh tokens, logout de servidor, auditoría integral |
| Recuperación y restablecimiento con correo en producción | Servicio genérico configurable de SMTP; usa Gmail |
| Clientes CC, CE y PASSPORT; documento único | Portal autenticado del cliente, KYC o consulta a centrales de riesgo |
| Solicitud pública e interna y simulador | Firma digital, adjuntos, garantías, codeudores |
| Evaluación manual y regla de capacidad del 40% | Scoring automático, tasas configurables, productos financieros múltiples |
| Desembolso lógico y cronograma persistido | Transferencias, integración bancaria y conciliación de pasarelas |
| Recaudo por cuota, abonos, saldo y recibo en pantalla | PDF, reversos, devoluciones, abono global o prepago de crédito |
| PostgreSQL mediante Prisma y Dockerfile | Multiempresa, facturación SaaS, reportes contables, alta disponibilidad y acuerdos de nivel de servicio |
| UI React con rutas protegidas y estados de carga/error; despliegue Vercel/Supabase | Automatización de pruebas y pipeline de análisis de calidad |

El modelo contempla OVERDUE para representar cuotas vencidas. La clasificación automática por fecha y el cálculo de intereses de mora se reservan para la evolución del módulo de cartera.

## 5. Product Backlog: épicas e historias

Gestionamos el backlog en Jira mediante cinco épicas y 17 historias de usuario. Las HU se encuentran finalizadas y distribuidas en cuatro Sprints. La tabla reúne su identificación, alcance, criterios de aceptación y estimación de esfuerzo relativo.

### Épicas del proyecto

| Clave Jira | Épica |
|---|---|
| SCRUM-1 | Gestión de Identidad y Accesos |
| SCRUM-2 | Administración de Clientes |
| SCRUM-3 | Originación y Evaluación de Créditos |
| SCRUM-4 | Liquidación y Planes de Pago |
| SCRUM-5 | Control de Recaudos y Cartera |

### Historias y criterios verificables

Utilizamos la escala Fibonacci de **3, 5 y 8 Story Points** para expresar el esfuerzo relativo de las historias. Los valores de la tabla corresponden a las estimaciones del proyecto y no representan horas ni mediciones de velocidad.

| Clave Jira | HU | Título en Jira | Épica / Principal | Sprint | Estado | Criterios de aceptación | SP |
|---|---|---|---|---|---|---|---|
| SCRUM-7 | HU-01 | Inicio de Sesión (Login) y Generación de Token | SCRUM-1 | SCRUM Sprint 1 | Finalizada | Credenciales válidas devuelven JWT de 2 h y usuario; inactivo o credenciales erróneas devuelven 401; CASHIER llega a Cobros | 8 |
| SCRUM-6 | HU-02 | Registro de Personal y Asignación de Roles | SCRUM-1 | SCRUM Sprint 1 | Finalizada | POST users con ADMIN devuelve 201 sin hash; rol no autorizado recibe 403; correo existente 409; contraseña requiere 8 caracteres, mayúscula y número | 5 |
| SCRUM-8 | HU-03 | Protección de Endpoints y Middleware de Roles | SCRUM-1 | SCRUM Sprint 1 | Finalizada | Sin Bearer o con token inválido/expirado devuelve 401; usuario inactivo pierde acceso; rol no permitido recibe 403; el middleware usa el usuario y rol actuales de BD. | 8 |
| SCRUM-9 | HU-04 | Gestión y Desactivación de Empleados | SCRUM-1 | SCRUM Sprint 1 | Finalizada | PATCH permite name, role, status; al menos un campo; empleado inexistente 404; autodesactivación 400; inactivo pierde acceso protegido | 5 |
| SCRUM-11 | HU-05 | Búsqueda y Perfilamiento de Cliente | SCRUM-2 | SCRUM Sprint 2 | Finalizada | Documento normalizado; devuelve datos en data; inexistente 404; formato inválido 400 | 5 |
| SCRUM-10 | HU-06 | Registro de Nuevo Cliente | SCRUM-2 | SCRUM Sprint 2 | Finalizada | Documento único; ingreso positivo; teléfono de 7–15 dígitos; 201 con cliente; duplicado detectado 409; UI ofrece alta a ADMIN/ADVISOR | 8 |
| SCRUM-12 | HU-07 | Actualización de Perfil y Datos de Contacto | SCRUM-2 | SCRUM Sprint 2 | Finalizada | Al menos monthlyIncome, address o phone; documento/tipo inmutables; ingreso positivo y teléfono válido; respuesta 200 | 8 |
| SCRUM-13 | HU-08 | Crear Solicitud de Crédito | SCRUM-3 | SCRUM Sprint 3 | Finalizada | Cliente existente; monto positivo hasta 100 millones; plazo entero 1–72; destino obligatorio; crea PENDING con 201 | 5 |
| SCRUM-14 | HU-09 | Evaluación de Solicitud de Crédito | SCRUM-3 | SCRUM Sprint 3 | Finalizada | Solo PENDING; APPROVED exige cuota <= 40% del ingreso; REJECTED exige motivo; reevaluación devuelve 400; ADVISOR obtiene 403 | 8 |
| SCRUM-15 | HU-10 | Consulta y Listado de Solicitudes | SCRUM-3 | SCRUM Sprint 3 | Finalizada | Filtros status/documentNumber en API; estado inválido 400; UI filtra estado y busca nombre/documento localmente; listado vacío es válido | 3 |
| SCRUM-16 | HU-11 | Simulación de Tabla de Amortización | SCRUM-4 | SCRUM Sprint 3 | Finalizada | Monto positivo y plazo entero 1–72; francés al 1.5% mensual; devuelve cuota, intereses, total y schedule sin persistir | 5 |
| SCRUM-17 | HU-12 | Liquidación y Activación del Crédito | SCRUM-4 | SCRUM Sprint 3 | Finalizada | Solo APPROVED; crea cronograma y DISBURSED en transacción; cuotas PENDING y paidAmount 0; estado diferente devuelve 400 | 5 |
| SCRUM-39 | HU-13 | Formulario Web Público para Radicación de Créditos por el Cliente | SCRUM-3 | SCRUM Sprint 3 | Finalizada | Formulario de tres pasos; monto 100 mil–100 millones y plazo 1–72; crea/reutiliza cliente; devuelve id/status PENDING; datos existentes no se sobrescriben | 5 |
| SCRUM-41 | HU-14 | Consulta de Detalle de Solicitud de Crédito | SCRUM-3 | SCRUM Sprint 3 | Finalizada | Devuelve solicitud, proyección de cliente y cuotas por número; inexistente 404; UI habilita decisión/desembolso solo a ADMIN según estado | 3 |
| SCRUM-42 | HU-15 | Olvidar Contraseña | Sin épica vinculada | SCRUM Sprint 4 | Finalizada | Correo registrado activo genera enlace de 15 min; correo ausente tiene respuesta genérica; token inválido/usado devuelve 400; contraseña cambia con hash | 8 |
| SCRUM-18 | HU-16 | Consulta de Cuotas Pendientes | SCRUM-5 | SCRUM Sprint 4 | Finalizada | Busca cliente normalizado; ausente 404; solo DISBURSED y cuotas PENDING/PARTIAL/OVERDUE; devuelve pendingBalance y etiqueta de estado | 3 |
| SCRUM-19 | HU-17 | Registro de Pago de Cuota | SCRUM-5 | SCRUM Sprint 4 | Finalizada | 201 con receipt; monto positivo hasta saldo; inexistente 404; ya pagada o sobrepago 400; cajero de JWT; update y Payment atómicos; saldo final define PARTIAL/PAID | 5 |

HU-15 (SCRUM-42) gestiona la recuperación de contraseña y se mantiene sin una épica vinculada en Jira. Los listados de usuarios/clientes y health son operaciones de apoyo. HU-03 define la política transversal de autenticación y autorización de las rutas protegidas.

Dependencias funcionales: identidad habilita las operaciones protegidas; el cliente precede a la solicitud interna; HU-09 precede a HU-12 y el desembolso habilita el recaudo HU-16/HU-17.

**Estimación total del backlog: 97 SP.**

## 6. Definition of Done técnico y funcional

Aplicamos los siguientes criterios para considerar una historia lista para aceptación:

- **Funcionalidad:** el flujo principal cumple los criterios de aceptación y contempla entradas inválidas, recursos inexistentes y reglas de negocio.
- **Seguridad:** la operación exige autenticación y rol cuando corresponde; los errores diferencian 401 y 403; las respuestas no exponen hashes ni secretos.
- **Interfaz:** el usuario puede completar la tarea desde su perfil y recibe estados de carga, vacío, validación, éxito y error.
- **Persistencia:** las relaciones y restricciones son coherentes con el modelo Prisma; las operaciones de desembolso y pago mantienen atomicidad en sus escrituras.
- **Verificación:** se revisan los escenarios positivos y negativos en el entorno de pruebas y se conserva su resultado junto con la historia. La compilación y la validación del esquema forman parte de la revisión técnica.
- **Versionamiento:** el cambio se revisa en Git y las modificaciones de estructura se acompañan de sus migraciones.
- **Documentación:** el contrato API, la navegación y los diagramas reflejan el comportamiento entregado.
- **Aceptación:** el equipo revisa el incremento con los criterios de la historia y mantiene su seguimiento en Jira.

El DoD establece los criterios de calidad del proceso. Las pruebas manuales, la automatización y el análisis estático se gestionan como actividades diferenciadas; un estado de historia finalizada no sustituye un reporte de cobertura.

## 7. Resumen de cuatro Sprints

Completamos cuatro Sprints con **17 HU finalizadas**. La distribución de historias se mantiene alineada con Jira; los SP corresponden a las estimaciones del proyecto.

| Sprint | Objetivo | Historias finalizadas | Cantidad | SP estimados | Estado |
|---|---|---|---|---|---|
| SCRUM Sprint 1 | Identidad y control de acceso | HU-01, HU-02, HU-03, HU-04 | 4 | 26 | Cerrado |
| SCRUM Sprint 2 | Administración de clientes | HU-05, HU-06, HU-07 | 3 | 21 | Cerrado |
| SCRUM Sprint 3 | Originación, evaluación y liquidación | HU-08, HU-09, HU-10, HU-11, HU-12, HU-13, HU-14 | 7 | 34 | Cerrado |
| SCRUM Sprint 4 | Recuperación de acceso y recaudo | HU-15, HU-16, HU-17 | 3 | 16 | Cerrado |
| **Total** | **MVP de gestión de créditos** | **HU-01 a HU-17** | **17** | **97** | **Completado** |

### Sprint Review: incrementos entregados

| Sprint | Incremento funcional | Recorrido de revisión |
|---|---|---|
| 1 | Inicio de sesión, registro de personal, JWT/RBAC y gestión de empleados | Acceder por rol, crear un empleado, editarlo y comprobar el bloqueo de acceso de cuentas inactivas |
| 2 | Búsqueda, registro y actualización de clientes | Buscar por documento, registrar un cliente y actualizar ingresos y contacto |
| 3 | Solicitudes internas/públicas, evaluación, listados, simulación, desembolso y detalle | Radicar, consultar, aprobar o rechazar; simular el plan y generar las cuotas del crédito aprobado |
| 4 | Recuperación de contraseña, consulta de cuotas y pagos | Restablecer acceso, buscar cuotas por documento, registrar un abono y pagar el saldo de una cuota |

### Sprint Retrospective: aprendizajes y acciones de mejora

| Sprint | Aprendizaje del incremento | Acción de mejora |
|---|---|---|
| 1 | La identidad y los permisos son una dependencia transversal | Mantener una matriz de roles y escenarios de rechazo para cada operación protegida |
| 2 | La identidad del cliente debe conservarse entre operaciones | Centralizar validación y normalización de documentos y verificar la persistencia de los campos editables |
| 3 | El ciclo financiero conecta reglas, estados y persistencia | Revisar transiciones de estado, redondeo y atomicidad antes de extender el producto |
| 4 | El recaudo exige trazabilidad y control de reintentos | Fortalecer idempotencia, pruebas concurrentes y conciliación entre pagos y saldo acumulado |

El seguimiento de implementación incluye la validación manual de respuestas HTTP en Postman (SCRUM-38) y la sincronización del esquema en local y Supabase (SCRUM-46).

## 8. Lecciones aprendidas

1. **Responsabilidades por rol:** una matriz explícita evita que los permisos de administración se interpreten como acceso universal a las operaciones financieras.
2. **Transacciones y concurrencia:** agrupar las escrituras de un pago protege su atomicidad; la evolución del recaudo también debe controlar operaciones simultáneas y reintentos.
3. **Versionamiento de datos:** mantener esquema y migraciones juntos facilita instalaciones reproducibles y consistencia entre desarrollo y despliegue.
4. **Validación en ejecución:** los tipos TypeScript deben complementarse con validación de los datos HTTP y reglas de negocio explícitas.
5. **Contrato compartido:** documentar API e interfaz conjuntamente permite alinear campos, mensajes y permisos.
6. **Configuración por entorno:** separar secretos y parámetros operativos facilita el despliegue y el mantenimiento.
7. **Trazabilidad de trabajo:** vincular HU, cambios de Git y verificaciones permite explicar cada incremento y su alcance.

## 9. Riesgos y mitigaciones

| Riesgo arquitectónico u operativo | Impacto | Mitigación y verificación |
|---|---|---|
| Concurrencia en recaudo y desembolso | Operaciones simultáneas pueden competir por el mismo saldo o transición de estado | Complementar las transacciones con control de concurrencia, condiciones de actualización o aislamiento apropiado; probar solicitudes simultáneas y conciliar resultados |
| Reintentos e idempotencia | Un reenvío tras un timeout puede duplicar una operación financiera | Incorporar claves de idempotencia persistidas y respuestas reutilizables; verificar reenvíos desde distintos clientes |
| Precisión decimal de importes | Los cálculos en punto flotante pueden acumular diferencias de redondeo | Evolucionar a Decimal o unidades monetarias menores; establecer política de redondeo y verificar acumulados y última cuota |
| Rate limiting y capacidad de servicio | Solicitudes masivas a login, recuperación o rutas públicas pueden degradar disponibilidad | Definir límites por origen y operación, cuotas de tráfico y alertas; realizar pruebas controladas de carga y de rechazo por límite |
| Respaldos y recuperación | Una pérdida de datos o indisponibilidad afecta la continuidad operativa | Establecer frecuencia de respaldo, retención, RPO/RTO y responsables; ensayar restauración y comprobar integridad de clientes, créditos, cuotas y pagos |

Las mitigaciones forman parte del fortalecimiento operativo del producto y se priorizan según volumen, criticidad y resultados de las verificaciones.

## 10. Estudio de mercado y soluciones similares

Comparación exploratoria, consultada el 19 de noviembre de 2026 en fuentes oficiales. No sustituye entrevistas, cotizaciones ni un estudio cuantitativo de demanda.

| Alternativa | Capacidades publicadas / observadas | Diferencia relevante frente al proyecto |
|---|---|---|
| Mifos X | Plataforma abierta con gestión de clientes, cartera de préstamos/ahorro, contabilidad y reportes | Cobertura más amplia; este proyecto reduce alcance a originación y recaudo de créditos individuales |
| Mambu | Productos y cuentas de préstamo configurables; intereses, cronogramas, pagos y ciclo del crédito | Mayor configurabilidad e integración; el MVP tiene una tasa y reglas fijas, sin motor de productos |
| Hoja de cálculo / operación manual | Alternativa conceptual; no se estudió un producto concreto ni una organización usuaria | Menor barrera inicial; el MVP agrega control por rol, relaciones persistidas y recibo vinculado a cajero |
| Sistema construido | Cinco modelos, 20 operaciones HTTP, tres roles y diez rutas Frontend | Prototipo enfocado para validación; no equiparable aún a un core financiero completo |

Fuentes: [Mifos X](https://mifos.org/mifos-x/) y [documentación oficial de préstamos Mambu](https://docs.mambu.com/docs/loans-overview/). La diferenciación propuesta es una experiencia simple para operaciones pequeñas; su valor y disposición a pagar están pendientes de validación. La validación comercial comprende entrevistas, pruebas de adopción y análisis de costos.

## 11. Modelo de monetización: SaaS B2B

**Modelo comercial propuesto.** Cliente objetivo: cooperativas y pequeñas financieras que necesitan originación y control de recaudo. El ingreso provendría de suscripción por organización, con escalones por usuarios operativos o cartera administrada y un cargo opcional de implementación/migración. Los precios se definirían mediante entrevistas y costos reales, con base en la disposición de pago y los costos de operación.

| Nivel propuesto | Oferta futura | Condición para ofrecerla |
|---|---|---|
| Piloto | Acompañamiento, instancia aislada, funcionalidades verificadas del MVP | Respaldo/restauración, migraciones completas y contrato de soporte |
| Operación | Mayor volumen y soporte con horario definido | Observabilidad, pruebas y objetivos de servicio medidos |
| Integración | Integraciones, reportes y personalización | Requerimientos aprobados y costo estimado por alcance |

Costos por estimar: hosting, PostgreSQL, backups, correo, soporte, onboarding, seguridad y desarrollo. Indicadores propuestos: MRR, margen por organización, costo de adquisición, conversión de piloto a pago, retención y cancelación. Punto de equilibrio = costos fijos / contribución media por organización, cuando existan datos. El esquema actual no contiene tenant, plan, factura ni suscripción; inicialmente cualquier piloto multiinstitución exigiría aislamiento explícito.

## 12. Estrategia de visibilidad y adopción

Estrategia propuesta: presentar una demo con datos sintéticos y recorrido por rol; publicar README, diagramas y contrato OpenAPI; contactar cooperativas mediante canales institucionales autorizados; organizar pilotos supervisados y capacitación para asesor, administrador y cajero.

La adopción comienza con diagnóstico del proceso y calidad de documentos, continúa con provisión de usuarios y carga validada de clientes, y termina con operaciones acompañadas y conciliación diaria de pagos. El MVP no incluye importador masivo; una migración real necesita procedimiento específico.

Medir prospectos calificados, demos, pilotos iniciados, usuarios activos por rol, tiempo desde solicitud a decisión, tiempo de registro de pago, errores y satisfacción. Establecer línea base en el piloto antes de prometer ahorros. Condición de expansión: aceptación funcional, datos conciliados, restauración comprobada y ausencia de defectos críticos.

## 13. Roadmap post-MVP

| Fase propuesta | Resultado | Criterio de salida / dependencia |
|---|---|---|
| 1. Estabilización | Migraciones completas, validaciones coherentes, alineación UI/API, pruebas de recaudo y corrección de carreras | BD reconstruible; contratos verificados; concurrencia e idempotencia probadas |
| 2. Piloto operativo | Consolidar operación en Vercel/Supabase con backups, monitoreo, soporte y capacitación | Smoke test por rol, restauración y conciliación; decisión del responsable del piloto |
| 3. Gestión de cartera | Reportes, vencimiento automático, cierre de crédito y recibos exportables | Reglas de mora/cierre aceptadas y pruebas; no basta con agregar estados |
| 4. Integraciones | Pasarela/bancos, notificaciones y auditoría | Proveedores y contratos aprobados; trazabilidad y conciliación end-to-end |
| 5. SaaS B2B | Aislamiento multiempresa, planes y facturación | Modelo de tenant, pruebas de aislamiento y viabilidad comercial |

No son fechas comprometidas. Cada fase requiere priorización, estimación y validación con usuarios; ninguna se presenta como ya disponible.
