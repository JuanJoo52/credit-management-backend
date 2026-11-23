# Notas de mantenimiento: alineación Frontend/API

Material técnico para seguimiento del equipo; no requiere copiarse a Confluence junto con la memoria principal.

- CustomerDialog envía firstName/lastName al editar; el servicio actual solo persiste monthlyIncome, address y phone.
- ResetPassword exige mayúscula y número en UI; el Backend de restablecimiento exige longitud mínima de ocho caracteres.
- Nueva solicitud y simulador en UI usan mínimo 100.000; la creación interna y simulación Backend admiten monto positivo.
- La UI exige motivo de rechazo de cinco caracteres; Backend exige texto no vacío.
- Consentimiento y honeypot se validan en el cliente; el consentimiento no se envía ni se persiste actualmente.
- CASHIER no navega a Clientes y ADMIN/ADVISOR no navegan a Cobros; la API permite operaciones adicionales documentadas en su matriz de roles.

Estas notas describen el código inspeccionado. No afirman que las correcciones hayan sido implementadas.
