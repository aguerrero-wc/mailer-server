# Tarea 07: Sistema de Auditoría de Seguridad (Security Logs)

## 0. Referencias Obligatorias
**⚠️ ADVERTENCIA AL AGENTE:**
1.  Rol: **Security Specialist**.
2.  Objetivo: Registrar intentos de acceso no autorizado o malicioso SIN bloquear el flujo principal.
3.  Referencia: `.instructions/architecture.md` (Postgres/TypeORM).

---

## 1. Contexto de Negocio
El sistema Legacy es inseguro. Esperamos intentos de ataque.
Necesitamos diferenciar entre:
-   **EmailLog (Operativo):** "Se envió el correo de Bienvenida a Juan".
-   **SecurityLog (Defensivo):** "La IP 172.20.0.5 intentó enviar un template 'viagra_promo' y falló" O "Alguien intentó usar una API Key incorrecta".

Esta tabla debe registrar **todo lo que el sistema RECHAZA**.

---

## 2. Requerimientos Técnicos

### A. Nueva Entidad: `SecurityLog`
-   Crear `src/logging/entities/security-log.entity.ts`.
-   **Campos:**
    -   `id`: UUID.
    -   `createdAt`: Timestamp.
    -   `eventType`: String (Ej: 'INVALID_API_KEY', 'TEMPLATE_NOT_FOUND', 'VALIDATION_ERROR').
    -   `sourceIp`: String (Capturar la IP del request).
    -   `endpoint`: String (La URL intentada).
    -   `payload`: JSONB (Guardar el cuerpo de la petición para ver qué intentaban inyectar).
    -   `description`: String (Mensaje de error técnico).

### B. Servicio de Logger (`SecurityLoggerService`)
-   Método simple: `logSecurityEvent(type, request, errorDetails)`.
-   Debe ser "Fire and Forget" (no debe romper la app si falla el log, usar `try/catch` interno).

### C. Implementación: Exception Filter (Interceptor Global)
-   Esta es la forma elegante de NestJS. No queremos ensuciar los controladores con `if/else`.
-   Crear `src/common/filters/security-exception.filter.ts`.
-   Debe capturar:
    -   `UnauthorizedException` (Fallo de API Key).
    -   `ForbiddenException` (Acceso denegado).
    -   `NotFoundException` (Template inexistente -> Posible escaneo de vulnerabilidades).
-   **Lógica del Filter:**
    1.  Capturar la excepción.
    2.  Extraer IP, Body y URL del Request.
    3.  Llamar a `SecurityLoggerService` para guardar en BD.
    4.  Responder al cliente con el error original (no ocultar el 404/403).

---
