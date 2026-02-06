# Tarea 07: Sistema de Auditoría de Seguridad (Security Logs)

## 0. Referencias Obligatorias
**⚠️ ADVERTENCIA AL AGENTE:**
1.  **Contexto:** Estás trabajando en un entorno Docker (`.instructions/deploy-container.md`).
2.  **Rol:** Security Specialist.
3.  **Fuente de Verdad:** Debes leer y seguir estrictamente los requerimientos de la Sección 2 de este archivo.

---

## 1. Contexto de Negocio
Necesitamos diferenciar entre logs operativos (envío de correos) y logs de seguridad (intentos de ataque).
La tabla `security_logs` actuará como una "Caja Negra" que registra todo lo que el sistema **RECHAZA** (401, 403, 404).

---

## 2. Requerimientos Técnicos (Especificaciones)

### A. Nueva Entidad: `SecurityLog`
-   Archivo: `src/logging/entities/security-log.entity.ts`.
-   **Campos:**
    -   `id`: UUID (PK).
    -   `createdAt`: Timestamp (default now).
    -   `eventType`: String (Ej: 'UNAUTHORIZED', 'NOT_FOUND').
    -   `sourceIp`: String (IP del atacante).
    -   `endpoint`: String (URL intentada).
    -   `method`: String (POST, GET).
    -   `payload`: JSONB (Nullable. El body del request para análisis forense).
    -   `description`: String.

### B. Servicio: `SecurityLoggerService`
-   Archivo: `src/logging/services/security-logger.service.ts`.
-   Debe tener un método `logSecurityEvent(exception: HttpException, request: Request)`.
-   **Lógica:** Extraer IP, URL, Body y Mensaje de Error de la excepción y guardarlo en la entidad.
-   *Importante:* Debe manejar sus propios errores (try/catch) para no tumbar la aplicación si la BD falla.

### C. Exception Filter Global: `SecurityExceptionFilter`
-   Archivo: `src/common/filters/security-exception.filter.ts`.
-   Implementa: `ExceptionFilter`.
-   Decorador: `@Catch(HttpException)`.
-   **Lógica de Intercepción:**
    1.  Capturar la excepción.
    2.  Verificar el status HTTP.
    3.  **SI** es `401 Unauthorized`, `403 Forbidden` o `404 Not Found`:
        -   Llamar a `SecurityLoggerService.logSecurityEvent(...)`.
    4.  **SIEMPRE** responder al cliente con el JSON de error original (no ocultar la respuesta, solo loguearla).

### D. Inyección en `main.ts`
-   Resolver la dependencia del servicio antes de instanciar el filtro:
    ```typescript
    const securityLogger = app.get(SecurityLoggerService);
    app.useGlobalFilters(new SecurityExceptionFilter(securityLogger));
    ```

---
