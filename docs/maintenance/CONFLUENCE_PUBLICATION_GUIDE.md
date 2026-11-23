# Publicación del entregable en Confluence y GitHub

## Qué subir a Git

Versionar `README.md`, `.env.example`, `docs/` y `prisma/migrations/`. Las carpetas de documentación y las migraciones forman parte del entregable: no se agregan a .gitignore. Excluir `.env`, archivos de entorno privados, node_modules, dist y scripts temporales de preparación. El README del Frontend se encuentra en docs/FRONTEND_README.md para copiarlo al repositorio correspondiente.

## 1. Preparar las páginas de Confluence

En el espacio de la asignatura, crear una página titulada **Proyecto Final – Sistema de Gestión de Créditos**. Crear tres páginas hijas: **API REST**, **Frontend y navegación** y **Diagramas del sistema**. Los archivos listos para copiar son:

| Página Confluence | Archivo | Contenido |
|---|---|---|
| Proyecto Final – Sistema de Gestión de Créditos | docs/confluence/01-MEMORIA.md | Secciones 1 a 13 |
| API REST | docs/confluence/02-API-REST.md | Sección 14 completa |
| Frontend y navegación | docs/confluence/03-FRONTEND.md | Sección 15 completa |
| Diagramas del sistema | docs/confluence/04-DIAGRAMAS.md | Cinco diagramas |

Las tres primeras páginas reúnen las 15 secciones obligatorias. CONFLUENCE_DOCUMENTATION.md conserva la versión completa en un único archivo de referencia; no copiarla además de estas páginas porque duplicaría el contenido.

## 2. Copiar las 15 secciones

Abrir cada uno de los tres archivos de docs/confluence/ en VS Code y usar **Abrir vista previa** (Ctrl+Shift+V). Copiar el contenido renderizado desde la vista previa y pegarlo en su página Confluence con Ctrl+V. Probar primero un título y una tabla: la conservación del formato depende del editor y el portapapeles. Si se pierde el formato, pegar por secciones y usar los encabezados y tablas de Confluence; los ejemplos JSON se insertan con `/code`.

No asumir que arrastrar un archivo .md lo convierte automáticamente en una página. La importación Markdown depende de las herramientas instaladas en el espacio. Las opciones oficiales de importación y complementos se describen en [Atlassian: importar documentos](https://support.atlassian.com/confluence-cloud/docs/import-content-into-confluence-cloud/).

## 3. Publicar los diagramas

Abrir `docs/DIAGRAMS.md`: contiene los cinco diagramas exigidos. Si el espacio tiene un complemento Mermaid, insertar cada diagrama mediante ese complemento y pegar solo su código, sin las líneas de triple acento. Si no hay complemento, renderizar cada diagrama en una herramienta Mermaid, exportar como PNG o SVG e insertar las imágenes en la página **Diagramas del sistema**. Un bloque de código Mermaid por sí solo muestra el texto, no garantiza el gráfico.

Repetir el procedimiento con el diagrama de navegación de la página Frontend y navegación. Adjuntar DIAGRAMS.md permite conservar también la fuente editable. [Atlassian: insertar archivos e imágenes](https://support.atlassian.com/confluence-cloud/docs/display-files-and-images/).

## 4. Adjuntar la especificación

En **API REST**, adjuntar `docs/openapi.yaml`. Incluir una descripción breve: contrato OpenAPI 3.0.3 con 20 operaciones, seguridad JWT y ejemplos; se importa en Swagger o Postman. Agregar el enlace de la API: `https://credit-management-backend.vercel.app/api/v1`. El endpoint de estado es `/api/v1/health`.

## 5. Completar las evidencias del proyecto

En la sección de Sprints, agregar enlaces a los cuatro Sprints cerrados o sus reportes de Jira. Las HU y sus Sprints ya están alineados con el CSV compartido. La memoria final incluye estimaciones Fibonacci de 3, 5 y 8 SP por historia; corresponden a los valores suministrados por el equipo para HU-01 a HU-17, con un total de 97 SP. En la sección 15 agregar capturas reales del Frontend por rol con datos de demostración. Añadir los enlaces de ambos repositorios GitHub y los despliegues públicos. No incluir contraseñas, tokens ni capturas de .env.

## 6. Corregir los enlaces al copiar

En el documento original hay enlaces relativos como `DIAGRAMS.md`, `openapi.yaml` y `use-cases/...`. En Confluence reemplazarlos por las páginas creadas, adjuntos o enlaces a los archivos de GitHub en la rama integrada. Los enlaces relativos al repositorio no se convierten automáticamente en enlaces de Confluence.

## 7. Revisar y publicar

Comprobar las 15 secciones, tablas, JSON, cinco diagramas, navegación, enlaces de Jira, enlaces de despliegue y adjunto OpenAPI. Verificar permisos de lectura para el docente. Publicar las páginas y entregar la URL de la página principal. [Atlassian: crear y publicar páginas](https://support.atlassian.com/confluence-cloud/docs/create-edit-and-publish-a-page/).

## Material de trabajo y mantenimiento

VALIDATION.md y los archivos de docs/maintenance/ son material técnico de apoyo. No es necesario copiarlos dentro de la memoria principal de Confluence. README queda en la portada de GitHub y docs/use-cases/ sirve como consulta detallada del Backend.
