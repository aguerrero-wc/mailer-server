# Tarea 05: Nuevo Template "Verificación de Cuenta"

## 0. Referencias Obligatorias
**⚠️ ADVERTENCIA AL AGENTE:**
1.  Consulta `tasks/03-database-and-templates.md` para entender el seeding de la BD.
2.  Mantén el estilo visual definido en `src/templates/password-recovery.hbs`.

---

## 1. Contexto
Necesitamos un segundo correo transaccional. Además de recuperar contraseña, el sistema debe enviar un correo de **"Confirma tu cuenta"** cuando un usuario se registra.
Este template debe:
1.  Seguir la misma línea gráfica que el anterior.
2.  Estar registrado en la base de datos automáticamente (Seed).

---

## 2. Requerimientos Técnicos

### A. Archivo HTML (`verify-email.hbs`)
-   Crear `src/templates/verify-email.hbs`.
-   Variables esperadas: `{{ name }}` y `{{ url }}`.
-   Texto del botón: "Confirmar mi cuenta".
-   Texto del cuerpo: "Gracias por registrarte. Por favor valida tu correo para continuar."

### B. Actualización del Seed (Semilla)
-   Modificar `src/templates/templates.service.ts` (método `onModuleInit`).
-   Agregar la lógica: Si no existe el slug `verify_email`, insertarlo.
    -   Slug: `verify_email`
    -   Name: `Verificación de Cuenta`
    -   Filename: `verify-email`
    -   Subject: `Bienvenido, confirma tu correo`

### C. DTO (Reutilización o Nuevo)
-   Revisar si `SendRecoveryDto` sirve (si tiene `email`, `name`, `url`).
-   Si es genérico, renombrarlo a `SendEmailDto` o crear uno nuevo si los campos cambian. *Para este caso, reutilizar o refactorizar a uno genérico es aceptable.*

---

## 3. Prompt para el Agente

```text
!IMPORTANTE: Lee `.instructions/deploy-container.md`.

Actúa como "Frontend/Backend Developer". Tu misión es agregar un nuevo template al sistema.

PASOS:

1. TEMPLATE HTML:
   - Crea `src/templates/verify-email.hbs`.
   - Copia el estilo de `password-recovery.hbs` pero cambia los textos para que sea de "Bienvenida/Verificación".

2. DATABASE SEED:
   - Modifica `src/templates/templates.service.ts`.
   - En `onModuleInit`, agrega la inserción del template 'verify_email' si no existe.

3. VALIDACIÓN:
   - Dime qué comando ejecutar (reinicio del server) para que el seed se ejecute y el template aparezca en la BD.