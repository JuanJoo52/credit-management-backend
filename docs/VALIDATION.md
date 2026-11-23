# Evidencia y validación documental

Fecha: 19 de noviembre de 2026. Backend inspeccionado: commit `efce105` y árbol de trabajo disponible. Frontend: commit `4339a82` y archivos reales en `D:/credit-management-frontend`. No se publicaron valores de `.env` ni se modificó código de aplicación, configuración de despliegue, esquema Prisma o base de datos. Se añadió un archivo de migración SQL sin ejecutarlo.

## Resultado de comprobaciones

| Comprobación | Resultado |
|---|---|
| Parseo YAML y validación OpenAPI 3.0.3 | Correcto; referencias y estructura válidas |
| Comparación de métodos/rutas contra routers reales y prefijos | 20 operaciones documentadas de 20 detectadas |
| Ejemplos de request/response | 106 comprobados contra campos requeridos, tipos, enums y restricciones declaradas aplicables |
| Sintaxis Mermaid | 33 bloques válidos, incluidas las versiones completas y separadas para Confluence |
| Enlaces locales Markdown | 168 destinos existentes |
| Secciones obligatorias Confluence | 15 secciones numeradas |
| Rutas Frontend | 10 rutas explícitas representadas; fallback documentado |
| Valores sensibles configurados en .env | Ningún valor sensible configurado detectado en los documentos o ejemplos |

Herramientas de validación instaladas en carpeta temporal, sin cambiar package.json ni package-lock.json: `yaml 2.9.1`, `@apidevtools/swagger-parser 13.1.0`, `mermaid 12.3.0`, `jsdom 31.0.1`. Mermaid se comprobó con su parser y DOM simulado; no se realizó inspección visual de renderizado en navegador. La comprobación de ejemplos fue estructural, no una llamada al Backend, y no evalúa todas las reglas condicionales de negocio.

## Evidencia funcional y pendientes

La ruta HTTP se verificó por composición `src/server.ts` → `src/routes/v1/index.ts` → router de módulo → middleware → controlador → servicio. Las entidades y relaciones proceden del esquema Prisma; las migraciones se contrastaron por separado. La navegación se comprobó con App.jsx, guardas, enlaces, componentes y llamadas desde api.js del Frontend.

No se ejecutaron pruebas funcionales, builds, migraciones ni llamadas a servicios externos. No hay suites de tests o integración SonarQube encontradas. El CSV de Jira registra SCRUM-38, validación HTTP en Postman, como Finalizada; no incluye sus resultados de ejecución. No se afirma cobertura, Quality Gate, funcionamiento del correo real o concurrencia segura.

Actualización de contexto aportada por el responsable: El sistema está desplegado en Vercel: [Frontend](https://credit-management-frontend.vercel.app/) y [Backend](https://credit-management-backend.vercel.app/). La API usa PostgreSQL en Supabase. El equipo confirma también una base local actualizada y cuatro Sprints cerrados en Jira. Esta información de operación y gestión fue confirmada por el responsable del proyecto el 19 de noviembre de 2026. La consulta mediante la herramienta web a las URLs públicas no permitió recuperar contenido en esta sesión; no se atribuye a esta limitación una caída del servicio ni se presenta como smoke test exitoso.

La migración de recaudo está incluida en `prisma/migrations/20261119160000_add_collection_payments/migration.sql`. El responsable ejecutó la comparación de estructura y obtuvo `No difference detected`; el estado consultado mostró cuatro migraciones y la de recaudo sin registrar en ese entorno. Esto distingue la estructura existente del registro administrativo en `_prisma_migrations`. El procedimiento de registro y comprobación por entorno está en la guía de mantenimiento; no se afirma su ejecución hasta recibir el resultado correspondiente.

La evolución técnica contempla pruebas de concurrencia/idempotencia y alineación de contratos UI/API. El detalle histórico de historias y ceremonias se gestiona en Jira. El despliegue Backend/Frontend en Vercel, PostgreSQL en Supabase y cierre de cuatro Sprints fueron confirmados por el responsable; el diagrama cloud refleja esa arquitectura.

## Cambios entregados

- Nuevos: Confluence con las 15 secciones y API completa, cinco diagramas principales, OpenAPI, README Backend, .env.example y README Frontend preparado para copiar.
- Soporte de la skill: docs/main.md, referencia REST independiente y un documento por cada una de las 20 operaciones implementadas en docs/use-cases/.
- No había documentación existente que preservar o sustituir. El código fuente permanece sin cambios.
- El README Frontend se entrega dentro del Backend para su copia al otro repositorio; no se escribió fuera del workspace.

La exportación Jira compartida permitió verificar cinco épicas y 17 HU finalizadas en cuatro Sprints (4/3/7/3), así como sus subtareas. Se corrigieron HU-01/02/03/05/06/15, sus relaciones y referencias en casos de uso. La versión final del 20 de noviembre incorpora, por solicitud del equipo, estimaciones Fibonacci de 3, 5 y 8 SP: total 97 SP, distribuidos en 26/21/34/16 por Sprint. Son estimaciones para la entrega final, no valores extraídos del CSV. El DoD define criterios de calidad; las acciones de retrospectiva, monetización y roadmap se presentan como parte de la planificación del equipo.

## Verificación de la versión final — 20 de noviembre de 2026

Se validó nuevamente OpenAPI 3.0.3 y su correspondencia con las 20 operaciones de los routers. Se comprobaron 106 ejemplos JSON, 15 secciones numeradas, 17 HU con SP Fibonacci, cinco fases consecutivas del roadmap y diez rutas React con diez placeholders de captura. La sección de riesgos contiene exclusivamente concurrencia, idempotencia, precisión decimal, rate limiting y respaldos.

Se contrastaron las cinco tablas y sus 42 campos escalares del diagrama ER con schema.prisma. Los cinco diagramas principales y sus copias para Confluence pasaron el parser Mermaid; en el conjunto documental se comprobaron 33 bloques y 168 enlaces locales. Las verificaciones son documentales y no equivalen a pruebas funcionales o de carga de la aplicación.
