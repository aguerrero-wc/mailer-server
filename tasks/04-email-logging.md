# Tarea 04: Sistema de Auditoría y Logs de Envíos

## 0. Referencias Obligatorias
**⚠️ ADVERTENCIA AL AGENTE:**
1.  Consulta `.instructions/architecture.md`: Stack de Base de Datos (Postgres/TypeORM).
2.  Consulta `tasks/03-database-and-templates.md`: Para entender la entidad `Template` existente.

---

## 1. Contexto de Negocio
Necesitamos trazabilidad total. Cada vez que el sistema intente enviar un correo, debe quedar registrado en la base de datos.
Esto nos permitirá:
1.  Verificar si los correos de recuperación están saliendo.
2.  Detectar picos de uso (posible ataque).
3.  Tener evidencia (Message ID del proveedor) en caso de reclamos.

**Relación:** Un `Template` puede tener muchos `EmailLogs` (One-to-Many). Un `EmailLog` pertenece a un solo `Template`.

---

## 2. Requerimientos Técnicos

### A. Nueva Entidad: `EmailLog`
Crear `src/logging/entities/email-log.entity.ts` con:
-   `id`: UUID (Primary Key).
-   `sentAt`: Timestamp (CreateDateColumn).
-   `recipient`: String (El email de destino).
-   `status`: Enum o String ('SUCCESS', 'FAILED').
-   `providerId`: String (Nullable. El ID que devuelve SMTP2GO/Nodemailer, útil para rastreo externo).
-   `errorMessage`: Text (Nullable. Si falla, guardar el error aquí).
-   `metadata`: JSONB (Opcional. Para guardar datos extra como IP de origen si la tenemos).
-   **Relación:** `ManyToOne` hacia `Template` (campo `templateId`).

### B. Actualización de Entidad `Template`
-   Agregar la relación inversa `OneToMany` hacia `EmailLog`.

### C. Lógica en `MailService`
Modificar el método `sendUserConfirmation` (o el método genérico de envío):
1.  **Antes de enviar:** Ya tenemos la entidad `Template` recuperada en la Tarea 03.
2.  **Intentar envío:** Ejecutar `mailerService.sendMail()`.
3.  **Capturar Resultado:**
    -   *Éxito:* Guardar un nuevo `EmailLog` con status 'SUCCESS' y el `messageId` del proveedor.
    -   *Error:* Capturar la excepción (`catch`), guardar un `EmailLog` con status 'FAILED' y el mensaje de error. **Luego relanzar el error** para que el controlador sepa que falló.

---
