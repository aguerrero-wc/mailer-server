# Tarea 08: Procesamiento en Segundo Plano (Colas con BullMQ)

## 0. Referencias Obligatorias
**⚠️ ADVERTENCIA AL AGENTE:**
1.  **Contexto:** Entorno Docker con servicio `redis` ya configurado (`.instructions/deploy-container.md`).
2.  **Arquitectura:** `.instructions/architecture.md`.
3.  **Fuente de Verdad:** Lee y ejecuta estrictamente la Sección 2 de este archivo.

---

## 1. Contexto de Negocio
Actualmente, el envío de correos es **Síncrono** (bloqueante). Si el servidor SMTP tarda 3 segundos, el cliente (Legacy) espera 3 segundos. Si hay un pico de tráfico, el servidor puede colapsar.

**El Cambio:**
Pasaremos a un modelo **Asíncrono (Producer/Consumer)**:
1.  Legacy envía solicitud -> NestJS valida y pone el trabajo en Redis -> Responde `202 Accepted` + `jobId`.
2.  Un "Worker" en segundo plano toma el trabajo y ejecuta la lógica pesada (Renderizar + SMTP + Logs).

---

## 2. Requerimientos Técnicos (Especificaciones)

### A. Instalación y Configuración
-   Instalar: `@nestjs/bullmq` y `bullmq`.
-   Configurar `BullModule.forRootAsync` en `AppModule`:
    -   Usar `ConfigService` para leer `REDIS_HOST` y `REDIS_PORT`.
-   Registrar una cola llamada `'email_sending'` (`BullModule.registerQueue`).

### B. Refactorización: El Productor (MailService)
-   Modificar `MailService` (o crear un `MailQueueService` si prefieres separar, pero mantenerlo en el módulo mail es aceptable).
-   Inyectar la cola `@InjectQueue('email_sending')`.
-   Crear método `queueEmail(dto: SendEmailDto)`:
    -   Debe agregar un "Job" a la cola.
    -   Nombre del Job: `'send_transactional_email'`.
    -   Datos: El DTO completo.
    -   Opciones de reintento: `attempts: 3`, `backoff: 5000` (esperar 5s entre fallos).

### C. Creación: El Consumidor (MailProcessor)
-   Crear `src/mail/mail.processor.ts`.
-   Decorar con `@Processor('email_sending')`.
-   Crear método `@Process('send_transactional_email')`.
-   **Lógica del Worker:**
    -   Recibir el `Job`.
    -   Llamar a la lógica de envío real.
    -   *Estrategia:* Mover la lógica actual de `MailService.sendEmail` (buscar template, renderizar, enviar SMTP, guardar Log) a este método o a un método interno `processSend`.
    -   **Importante:** El Worker debe manejar las excepciones para que BullMQ sepa si falló (y reintentar).

### D. Actualización del Controlador
-   El endpoint `POST /mail/send` YA NO debe llamar a la lógica de envío directo.
-   Debe llamar a `mailService.queueEmail(dto)`.
-   Retornar: `{ message: 'Queued', jobId: ... }`.

---


