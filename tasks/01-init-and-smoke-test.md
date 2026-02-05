# Tarea 01: Inicialización y Prueba de Humo (Smoke Test)

## 0. Referencias Obligatorias (The Rulebook)
**⚠️ ADVERTENCIA AL AGENTE:** Antes de ejecutar cualquier pensamiento o código, debes asimilar las reglas definidas en los siguientes archivos del repositorio. Ignorarlas resultará en código rechazado.

1.  **`.instructions/deploy-container.md`**: Regla de oro. TODO comando se ejecuta dentro de Docker. NADA en el host.
2.  **`.instructions/architecture.md`**: Entiende el stack (NestJS + SMTP2GO).
3.  **`agents.md`**: Asume el rol de **"The NestJS Developer (The Builder)"** bajo la supervisión del Arquitecto.

---

## 1. Contexto de Negocio & Objetivo
Estamos construyendo el microservicio "Secure Mailer". La infraestructura Docker ya está definida (`docker-compose.yml`), pero necesitamos inicializar el código base y probar la conexión externa.

**Objetivo:** Crear un endpoint temporal que demuestre que el contenedor puede conectarse a **SMTP2GO** y enviar un correo real. Esto valida la red, las credenciales y la configuración base de NestJS.

---

## 2. Requerimientos Técnicos
1.  **Inicialización:** Si el proyecto no tiene dependencias instaladas, realizar la instalación limpia.
2.  **Dependencias:** Instalar `@nestjs-modules/mailer`, `nodemailer` y sus tipos.
3.  **Configuración:**
    -   Usar `ConfigModule` (global) para leer `.env`.
    -   Configurar `MailerModule` en `app.module.ts` usando `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, etc.
4.  **Endpoint de Prueba:**
    -   Ruta: `POST /test/email`
    -   Controlador: `TestController` (No crear servicio/módulo complejo para esto, es throw-away code).
    -   Payload: `{ "to": "email@destino.com" }`
    -   Acción: Enviar un correo de texto plano.

---

## 3. Prompt para el Agente (Copiar y Ejecutar)

```text
!IMPORTANTE: Lee primero `.instructions/deploy-container.md` y `agents.md`.

Actúa como el rol "The NestJS Developer". Tu tarea es inicializar el sistema de envío de correos.

CONTEXTO ACTUAL:
- Estás en la raíz del proyecto.
- Existe un `docker-compose.yml` funcional.
- Las credenciales SMTP ya están en el `.env` (inyectadas por Docker).
- NO debes escribir en el host, dame los comandos para ejecutar vía `docker compose`.

PASOS A EJECUTAR:

1. INSTALACIÓN DE PAQUETES:
   Genera el comando Docker para instalar: `@nestjs/config`, `@nestjs-modules/mailer`, `nodemailer` y `@types/nodemailer`.
   *Recordatorio: Usa `npm install` dentro del servicio `app-dev`.*

2. CÓDIGO (AppModule):
   Proporciona el código completo para `src/app.module.ts`.
   - Debe importar `ConfigModule.forRoot({ isGlobal: true })`.
   - Debe configurar `MailerModule.forRootAsync` inyectando `ConfigService`.
   - Mapea las variables de entorno:
     host: SMTP_HOST
     port: SMTP_PORT
     auth: user/pass

3. CÓDIGO (TestController):
   Proporciona el código para `src/test/test.controller.ts`.
   - Decorador `@Controller('test')`.
   - Endpoint `@Post('email')`.
   - Inyecta `MailerService`.
   - Envía un correo simple al destinatario recibido en el Body.

4. VERIFICACIÓN:
   Dime qué comando cURL usar (desde el host) para probar el endpoint una vez levantado el servicio.

Genera el código y los comandos ahora.