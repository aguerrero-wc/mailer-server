# Tarea 02: Lógica Core de Email, Plantillas y Validación

## 0. Referencias Obligatorias (The Rulebook)
**⚠️ ADVERTENCIA AL AGENTE:** Antes de generar código, consulta:
1.  **`.instructions/architecture.md`**: Sección "Template Management" y "Security Constraints".
2.  **`.instructions/deploy-container.md`**: Comandos de ejecución.
3.  **`agents.md`**: Tu rol es **NestJS Developer** con supervisión de **Security Specialist**.

---

## 1. Contexto y Objetivo
El "Smoke Test" fue exitoso. Ahora debemos implementar la funcionalidad real para el caso de uso prioritario: **Recuperación de Contraseña**.

**Objetivos:**
1.  Configurar el motor de plantillas **Handlebars (`hbs`)** dentro de NestJS y `MailerModule`.
2.  Crear la primera plantilla HTML segura: `password-recovery.hbs`.
3.  Implementar **DTOs (Data Transfer Objects)** para validar estrictamente la entrada (evitar inyección de datos basura).
4.  Crear el `MailService` real que orqueste la renderización y el envío.

*Nota: En esta tarea aún no implementamos colas (Redis/BullMQ), eso será en la Tarea 03. Primero aseguramos que la lógica de envío síncrono funcione.*

---

## 2. Requerimientos Técnicos

### A. Dependencias
Instalar (dentro del contenedor):
-   `hbs` (Motor de plantillas).
-   `class-validator` y `class-transformer` (Para validación de seguridad).

### B. Configuración del Motor (Template Engine)
-   Configurar `MailerModule` para usar `HandlebarsAdapter`.
-   Directorio de templates: `/usr/src/app/src/templates` (o path relativo seguro).
-   Opciones: `strict: true`.

### C. La Plantilla (`password-recovery.hbs`)
Debe ser un HTML responsive básico que reciba:
-   `{{ name }}` (Nombre del usuario).
-   `{{ url }}` (Enlace único de recuperación).
-   Debe tener un diseño limpio y profesional.

### D. Seguridad (DTO)
Crear `SendPasswordRecoveryDto` que valide:
-   `email`: Debe ser un email válido.
-   `name`: String, no vacío.
-   `url`: Debe ser una URL válida (protección básica contra inyección).

---

## 3. Prompt para el Agente (Copiar y Ejecutar)

```text
!IMPORTANTE: Lee `.instructions/deploy-container.md` y `.instructions/architecture.md`.

Actúa como "The NestJS Developer" y "Security Specialist".
Tu misión es implementar la lógica de envío de correos con plantillas y validación.

PASOS DE EJECUCIÓN (Genera los comandos y el código):

1. INSTALACIÓN:
   Comando Docker para instalar: `hbs`, `class-validator`, `class-transformer`.

2. ESTRUCTURA DE ARCHIVOS:
   Crea (o modifica) los siguientes archivos:

   A) `src/templates/password-recovery.hbs`:
      - HTML5 básico con estilos inline (CSS).
      - Muestra un saludo con `{{name}}` y un botón que apunte a `{{url}}`.
      - Pie de página: "Si no solicitaste esto, ignora este correo".

   B) `src/mail/dto/send-recovery.dto.ts`:
      - Usa decoradores `@IsEmail()`, `@IsString()`, `@IsUrl()`, `@IsNotEmpty()`.

   C) `src/app.module.ts` (Actualización):
      - Actualiza la configuración de `MailerModule`.
      - Añade la propiedad `template`:
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },

   D) `src/mail/mail.service.ts`:
      - Método `async sendUserConfirmation(dto: SendRecoveryDto)`.
      - Usa `this.mailerService.sendMail()`.
      - Configura: `to: dto.email`, `subject: 'Recuperación de Clave'`, `template: './password-recovery'`, `context: { ... }`.

   E) `src/mail/mail.controller.ts`:
      - Endpoint: `POST /mail/recovery`.
      - Usa `@Body() dto: SendRecoveryDto`.
      - Llama al servicio.

   F) `src/main.ts`:
      - ¡CRÍTICO! Habilita `app.useGlobalPipes(new ValidationPipe())` para que los DTOs funcionen.
      - Configura `app.setViewEngine('hbs')` si es necesario para el admin panel futuro.

3. VALIDACIÓN FINAL:
   Dime el cURL para probar el envío exitoso y otro cURL para probar que el sistema rechaza un email inválido (validación funcionando).

Genera todo el código necesario.