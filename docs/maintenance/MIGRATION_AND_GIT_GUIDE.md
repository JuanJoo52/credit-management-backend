# Guía operativa: migración de recaudo y ramas Git

Esta guía acompaña al mantenedor. La documentación funcional de entrega está en [Confluence](../CONFLUENCE_DOCUMENTATION.md); este procedimiento no implica una interrupción del sistema desplegado.

## 1. Archivos preparados

`prisma/migrations/20261119160000_add_collection_payments/migration.sql` contiene el estado de recaudo definido en schema.prisma: valor PARTIAL, paidAmount con default 0, payments y relaciones con installments y users. Fue generado con Prisma instalado en el proyecto, comparando los modelos anteriores a recaudo con el modelo actual. No se ejecutó SQL ni se alteró el historial de ninguna base.

## 2. Rama de trabajo

La revisión comenzó en `fix/credit-request-passport-validation`, un commit por delante del main local. Esa diferencia modifica validación de documentos en credit.service.ts. Los archivos de documentación y migración están sin commit.

Crear una rama conserva todos esos archivos:

```powershell
git status --short
git switch -c chore/collection-migration-docs
```

Esta rama hereda el arreglo de pasaportes. Si ese arreglo tiene un PR abierto, integrar primero ese PR en main; después comparar esta rama contra main para que el PR documental contenga únicamente sus cambios. No partir de develop: la copia local de develop corresponde al setup inicial. No ejecutar reset ni borrar archivos para cambiar de rama.

## 3. Comprobar la base seleccionada

Ejecutar desde la raíz. Las URLs se configuran localmente en .env; revisar en privado que DATABASE_URL y DIRECT_URL seleccionen el entorno deseado. Para migraciones de Supabase, usar su conexión directa compatible con el acceso de tu red, evitando el pooler en modo transacción. No copiar credenciales en Git o en capturas.

```powershell
npx prisma migrate status
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --exit-code
```

El primer comando consulta historial y puede señalar la migración nueva como pendiente: es esperable antes de registrarla. El segundo compara la estructura real con el modelo, sin aplicar cambios: código 0 indica que Prisma no detectó diferencias; código 2 indica diferencias y código 1 un error. No interpretar problemas de conexión como diferencias de esquema. La comparación se limita a los objetos soportados por Prisma.

Revisar además la tabla payments, las relaciones, el default de paidAmount y el enum con [las consultas de lectura](VERIFY_COLLECTION_SCHEMA.sql). Consultar el SQL de la migración preparada. Si las estructuras difieren, detener el registro y preparar una conciliación acorde con el resultado. No usar resolve para esconder diferencias.

## 4. Registrar cambios que ya existen

Solo después de comprobar que la base ya contiene exactamente los cambios, ejecutar:

```powershell
npx prisma migrate resolve --applied 20261119160000_add_collection_payments
npx prisma migrate status
```

`resolve` escribe un registro en `_prisma_migrations`; no ejecuta el SQL de esta migración ni recrea tablas. Este paso sí modifica metadatos de la base. Se realiza una vez por cada entorno que ya contiene estos cambios: local y Supabase se verifican por separado. Si Prisma informa que ya está registrada, no repetirla. Si falta historial de migraciones anteriores, comprobarlo antes de continuar; no marcar migraciones anteriores sin verificar sus estructuras.

Para una base **nueva y vacía**, con el historial completo versionado, se usa `npx prisma migrate deploy`. No ejecutar el SQL de creación sobre una base que ya contiene esos objetos. No usar migrate reset ni aceptar borrado de datos para este procedimiento.

Flujo respaldado por [Prisma: reconciliar cambios existentes con el historial](https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing).

## 5. Commits y pull request

Tras revisar los archivos:

```powershell
git add prisma/migrations/20261119160000_add_collection_payments/migration.sql
git diff --cached
git commit -m "chore(prisma): version collection payment migration"
git add README.md .env.example docs
git diff --cached --stat
git commit -m "docs: document credit management system and deployment"
git push -u origin chore/collection-migration-docs
```

Revisar que .env no aparezca en el staging. Abrir PR hacia main; describir el SQL preparado, la documentación y el resultado real de las verificaciones por entorno. No afirmar que resolve o migrate deploy se ejecutaron si aún no se realizaron. Si Vercel ejecuta migraciones durante build, completar antes la conciliación de Supabase para no intentar crear objetos existentes.

Título sugerido: `Versionar migración de recaudo y documentación técnica del sistema`. La rama y los commits son pasos guiados: no se crearon automáticamente ni se enviaron cambios remotos.
