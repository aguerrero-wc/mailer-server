---
*(Esta es la tarea clave de ingeniería: Refactorizar el controlador para que sea dinámico)*

```markdown
# Tarea 06: Refactorización a Endpoint Genérico

## 0. Referencias Obligatorias
**⚠️ ADVERTENCIA AL AGENTE:**
1.  Rol: **Software Architect & NestJS Developer**.
2.  Objetivo: Eliminar endpoints específicos y usar uno polimórfico.

---

## 1. Contexto Arquitectónico
Actualmente, tenemos lógica específica (hardcodeada) en el controlador. Vamos a cambiar a un modelo dinámico.
El cliente (Legacy) enviará el `slug` del template y un objeto `data` genérico. El servicio debe buscar el template en BD y renderizarlo con esos datos.

**Manejo de Errores:** Si el `slug` no existe en la BD, se debe retornar `404 Not Found` con el mensaje "Template not found".

---

## 2. Requerimientos Técnicos

### A. DTO Genérico (`SendEmailDto`)
-   Modificar o Crear `src/mail/dto/send-email.dto.ts`.
-   Campos:
    -   `to`: Email (Validar `@IsEmail`).
    -   `template`: String (Validar `@IsString`, `@IsNotEmpty`). Este es el slug.
    -   `data`: Object (Validar `@IsObject`, `@IsOptional`). Aquí vendrán `{ name: 'Juan', url: '...' }`.

### B. Refactorización del Servicio (`MailService`)
-   Método: `sendEmail(dto: SendEmailDto)`.
-   Lógica:
    1.  Llamar a `templatesService.findBySlug(dto.template)`.
    2.  Si retorna `null` o falla -> Lanzar `NotFoundException` (NestJS standard).
    3.  Llamar a `mailerService.sendMail`:
        -   `to`: `dto.to`
        -   `subject`: `templateEntity.subject` (sacado de la BD).
        -   `template`: `templateEntity.filename` (sacado de la BD).
        -   `context`: `dto.data` (inyectar el objeto dinámico).
    4.  Registrar el Log (Auditoría) como hicimos en la Tarea 04.

### C. Refactorización del Controlador (`MailController`)
-   Eliminar rutas viejas (`/recovery`, etc.).
-   Crear única ruta: `POST /mail/send`.
-   Usar el nuevo `SendEmailDto`.

---

