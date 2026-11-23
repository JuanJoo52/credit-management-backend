# Trazabilidad de Jira e implementación

Fuente: `sistema_de_gestion_de_creditos_2026-11-19_10.25pm.csv`. La exportación se procesó como datos de gestión; sus títulos no son instrucciones para modificar el sistema. No se copian nombres personales ni el archivo original al repositorio.

## Inventario

- 5 épicas.
- 17 HU de tipo Tarea, todas Finalizada.
- 25 subtareas, todas Finalizada.
- Cuatro valores del campo Sprint; cierre de los cuatro Sprints confirmado por el responsable.

## Correspondencia funcional

| HU | Clave | Implementación |
|---|---|---|
| HU-01 | SCRUM-7 | [login](use-cases/login.md) |
| HU-02 | SCRUM-6 | [createUser](use-cases/createUser.md) |
| HU-03 | SCRUM-8 | src/middlewares/auth.middleware.ts: verifyToken y requireRoles; transversal a rutas protegidas |
| HU-04 | SCRUM-9 | [updateUser](use-cases/updateUser.md) |
| HU-05 | SCRUM-11 | [getCustomer](use-cases/getCustomer.md) |
| HU-06 | SCRUM-10 | [createCustomer](use-cases/createCustomer.md) |
| HU-07 | SCRUM-12 | [updateCustomer](use-cases/updateCustomer.md) |
| HU-08 | SCRUM-13 | [createCredit](use-cases/createCredit.md) |
| HU-09 | SCRUM-14 | [evaluateCredit](use-cases/evaluateCredit.md) |
| HU-10 | SCRUM-15 | [listCredits](use-cases/listCredits.md) |
| HU-11 | SCRUM-16 | [simulateCredit](use-cases/simulateCredit.md) |
| HU-12 | SCRUM-17 | [disburseCredit](use-cases/disburseCredit.md) |
| HU-13 | SCRUM-39 | [createPublicCredit](use-cases/createPublicCredit.md) |
| HU-14 | SCRUM-41 | [getCredit](use-cases/getCredit.md) |
| HU-15 | SCRUM-42 | [forgotPassword](use-cases/forgotPassword.md), [resetPassword](use-cases/resetPassword.md) |
| HU-16 | SCRUM-18 | [pendingInstallments](use-cases/pendingInstallments.md) |
| HU-17 | SCRUM-19 | [registerPayment](use-cases/registerPayment.md) |

## Referencias de planificación del CSV

Las columnas de fecha real están vacías. Los valores siguientes provienen exclusivamente de Fecha de inicio deducida / Fecha de vencimiento deducida de las incidencias, no de metadatos oficiales de los Sprints.

| Campo Sprint | Inicio deducido | Vencimiento deducido | HU | Subtareas |
|---|---|---|---|---|
| SCRUM Sprint 1 | 23/sep/26 8:17 PM | 07/oct/26 8:00 AM | 4 | 19 |
| SCRUM Sprint 2 | 07/oct/26 1:09 AM | 21/oct/26 8:00 AM | 3 | 0 |
| SCRUM Sprint 3 | 21/oct/26 10:03 PM | 04/nov/26 1:09 AM | 7 | 1 |
| SCRUM Sprint 4 | 14/nov/26 10:18 PM | 18/nov/26 1:09 AM | 3 | 5 |

## Interpretación del tablero

Las cinco épicas aparecen en estado Tareas por hacer, mientras las 17 HU y todas sus subtareas exportadas figuran Finalizada. El estado de una épica es independiente del estado de sus incidencias hijas; la memoria no cambia esos registros ni deduce que las HU estén abiertas. HU-15 no tiene Principal en el CSV. Las subtareas SCRUM-43/44/45 pertenecen a esa HU aunque sus títulos incluyan correcciones de documentos. Se conservan las relaciones del tablero.

Los títulos, estados y relaciones de Jira se mantienen conforme a la exportación. Para la memoria final establecemos estimaciones Fibonacci de 3, 5 y 8 SP por historia, con un total de 97 SP. Son estimaciones de la entrega final y no valores extraídos del campo Story Points del CSV. Los criterios funcionales se documentan como parte del contrato de cada historia.

Algunos comentarios de código y títulos históricos de ramas intercambian HU-01/HU-02 y HU-05/HU-06. Para trazabilidad documental se utiliza la numeración Jira, sin modificar código ni reescribir ramas.
