-- Consultas de lectura. Ejecutar en la base seleccionada; no cambian datos.
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (table_name = 'payments'
       OR (table_name = 'installments' AND column_name = 'paidAmount'))
ORDER BY table_name, ordinal_position;

SELECT n.nspname AS schema_name, t.typname AS enum_name,
       e.enumlabel AS enum_value, e.enumsortorder
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
JOIN pg_enum e ON e.enumtypid = t.oid
WHERE n.nspname = 'public' AND t.typname = 'InstallmentStatus'
ORDER BY e.enumsortorder;

SELECT c.conname AS constraint_name, pg_get_constraintdef(c.oid) AS definition
FROM pg_constraint c
JOIN pg_class r ON r.oid = c.conrelid
JOIN pg_namespace n ON n.oid = r.relnamespace
WHERE n.nspname = 'public' AND r.relname = 'payments'
ORDER BY c.conname;
