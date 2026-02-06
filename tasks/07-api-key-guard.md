# Tarea 07: Implementación de Seguridad S2S (API Key Guard)

## 0. Referencias Obligatorias
**⚠️ ADVERTENCIA AL AGENTE:**
1.  Consulta `agents.md`: Asume el rol de **Security Specialist**.
2.  Consulta `.instructions/deploy-container.md`: Comandos SOLO dentro de Docker.

---

## 1. Contexto
Actualmente, el microservicio acepta peticiones de cualquiera que tenga acceso a la red interna. Necesitamos restringir esto inmediatamente.
Solo el sistema Legacy (Laravel) debe poder consumir la API. Usaremos un mecanismo de **Secreto Compartido**.

**El Contrato de Seguridad:**
1.  NestJS tiene una variable de entorno `API_KEY_PRIVATE_ZONES`.
2.  Laravel envía cada petición con el header `x-api-key`.
3.  Si coinciden -> `200 OK`.
4.  Si no coinciden o falta -> `403 Forbidden` (o `401 Unauthorized`).

---

## 2. Requerimientos Técnicos

### A. Configuración (.env)
-   Asegurar que el proyecto lee la variable `API_KEY_PRIVATE_ZONES` usando `ConfigService`.
-   *Nota para el Agente:* No escribas la clave real en el código, usa `ConfigService`.

### B. El Guardián (`ApiKeyGuard`)
-   Crear `src/common/guards/api-key.guard.ts`.
-   Debe implementar la interfaz `CanActivate` de NestJS.
-   **Lógica:**
    ```typescript
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const validApiKey = this.configService.get<string>('API_KEY_PRIVATE_ZONES');
    return apiKey === validApiKey;
    ```

### C. Protección del Controlador
-   Aplicar el Guard en `src/mail/mail.controller.ts` usando `@UseGuards(ApiKeyGuard)`.
-   Esto protegerá automáticamente todas las rutas presentes y futuras de ese controlador (`/send`, `/test`, etc.).

---
