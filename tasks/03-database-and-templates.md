# Tarea 03: Persistencia y Registro de Plantillas

## 0. Referencias Obligatorias
**⚠️ ADVERTENCIA AL AGENTE:**
1.  Lee `.instructions/deploy-container.md`: Comandos SOLO dentro de Docker.
2.  Lee `.instructions/architecture.md`: Stack definido (Postgres, TypeORM).

---

## 1. Contexto de Negocio
Actualmente, el servicio de correo busca plantillas por nombre de archivo hardcodeado. Necesitamos un sistema robusto donde:
1.  Exista un registro en Base de Datos de qué plantillas están disponibles.
2.  Podamos asociar un `slug` (código único que envía Laravel, ej: `password-recovery`) con un archivo físico (`recovery.hbs`) y un Asunto por defecto.
3.  Esto permitirá en el futuro que el Admin Panel edite el asunto o cambie el archivo sin redesplegar código.

**Flujo Esperado:**
`MailService` recibe `template_slug` -> Consulta DB -> Obtiene `filename` y `subject` -> Renderiza y Envía.

---

## 2. Requerimientos Técnicos

### A. Configuración de Base de Datos
-   Instalar **TypeORM** y el driver de **Postgres** (`pg`).
-   Configurar `TypeOrmModule` en `AppModule` usando las variables de entorno (`DB_HOST`, `DB_PORT`, etc. ya definidas en docker-compose).
-   Estrategia: `autoLoadEntities: true` y `synchronize: true` (Solo por ahora, estamos en fase Dev).

### B. Entidad `Template`
Crear una tabla `templates` con:
-   `id`: Primary Key (UUID o Integer).
-   `slug`: String, Unique, Index (Ej: `password_recovery`). *Esta es la llave que usa Laravel.*
-   `name`: String (Nombre descriptivo para el admin).
-   `filename`: String (Nombre del archivo .hbs en disco).
-   `subject`: String (Asunto por defecto del correo).
-   `isActive`: Boolean (Default true).

### C. Servicio de Templates (`TemplatesService`)
-   Método `findBySlug(slug: string)`: Retorna la entidad o lanza error si no existe o no está activa.

### D. Refactorización de `MailService`
-   Inyectar `TemplatesService`.
-   En lugar de recibir el template string directo, recibir el `slug`.
-   Buscar el template en DB.
-   Usar los datos de la DB para configurar el envío (`subject`, `template`).

### E. Seed (Semilla) Inicial
-   Crear un script o mecanismo simple (puede ser en el `onModuleInit` del servicio) para que si la tabla está vacía, inserte el template de `password_recovery` automáticamente.

---

