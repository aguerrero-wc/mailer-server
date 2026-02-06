# Tarea 05: Template de Bienvenida (Welcome)

## 0. Referencias Obligatorias
**⚠️ ADVERTENCIA AL AGENTE:**
1.  Consulta `tasks/03-database-and-templates.md` para el seeding.

---

## 1. Contexto
Necesitamos un correo de bienvenida cálido, sin enlaces de verificación complejos, solo informativo.

---

## 2. Requerimientos Técnicos

### A. Archivo HTML (`welcome.hbs`)
-   Crear `src/templates/welcome.hbs`.
-   **Variables:** `{{ name }}`.
-   **Copy:** "¡Hola {{ name }}! Bienvenido a la plataforma. Estamos felices de que estés aquí."
-   **Estilo:** Mantener la coherencia con `password-recovery.hbs`.

### B. Actualización del Seed
-   Modificar `TemplatesService` (`onModuleInit`).
-   Insertar si no existe:
    -   Slug: `welcome`
    -   Name: `Bienvenida a la Plataforma`
    -   Filename: `welcome`
    -   Subject: `¡Te damos la bienvenida!`

---
