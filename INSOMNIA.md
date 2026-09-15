# Probar los endpoints con Insomnia

## Importación

1. En Insomnia, usar **Import → File** y seleccionar `insomnia.json` desde la raíz del proyecto.
2. Abrir la colección **Mailer Service** y seleccionar el entorno **dev** o **prod**.
3. Editar las variables del entorno seleccionado:
   - `base_url`: host de la API, sin barra final.
   - `email`: correo destinatario de todas las peticiones de envío.
   - `api_key`: valor de `API_KEY_PRIVATE_ZONES` del servidor correspondiente; se envía mediante el header `x-api-key`.
4. Abrir una petición y pulsar **Send**.

El archivo incluye la colección, un entorno base y los dos subentornos. Usa el formato JSON v4, que [Insomnia admite importar](https://developer.konghq.com/insomnia/import-export/).

## Entornos incluidos

| Variable | dev | prod |
| --- | --- | --- |
| `base_url` | `http://localhost:3001` | `https://url...` |
| `email` | `pruebas@example.com` | `pruebas@example.com` |
| `api_key` | Vacía; completar en Insomnia | Vacía; completar en Insomnia |

`dev` usa el puerto publicado por defecto en `docker-compose.yml`. Si cambiaste `APP_PORT`, ajusta `base_url`; ejecutando NestJS directamente, el puerto por defecto es `3000`.

En `prod`, reemplazar `https://url...` por el dominio HTTPS real configurado en el proxy. Seleccionar el entorno cambia el host de todas las peticiones.

Las variables pertenecen a Insomnia: no se cargan automáticamente desde `.env` ni `.env.production`. La API key corresponde a `API_KEY_PRIVATE_ZONES`. Completar las credenciales dentro de Insomnia; el archivo de importación contiene valores de ejemplo.

En **Base Environment** también puedes cambiar `recipient_name`, `institution`, `platform_url`, `reset_url` e `instruction_url`. Los enlaces son ejemplos de la plataforma que aparecerán dentro del correo, independientes del host de la API. Los campos de correo de las plantillas (`to`, `supportEmail`, `dataEmail` y el usuario de ejemplo) usan `{{ _.email }}`.

## Peticiones incluidas

| Método | Ruta | Ejemplo | Autenticación | Respuesta esperada |
| --- | --- | --- | --- | --- |
| GET | `/` | Estado de NestJS | Ninguna | `200`, texto `Hello World!` |
| POST | `/test/email` | Envío directo de prueba por SMTP | Ninguna en el código actual | `201`, `success: true` y `message` |
| POST | `/mail/send` | `welcome` | `x-api-key` | `202`, `message: "Queued"` y `jobId` |
| POST | `/mail/send` | `password_recovery` | `x-api-key` | `202`, `message: "Queued"` y `jobId` |
| POST | `/mail/send` | `group_welcome` | `x-api-key` | `202`, `message: "Queued"` y `jobId` |
| POST | `/mail/send` | `group_welcome_multiple` | `x-api-key` | `202`, `message: "Queued"` y `jobId` |
| GET | `/health` | Estado de Nginx, solo mediante el proxy de producción | Ninguna | `200`, texto `healthy\n` |

Son **7 peticiones para las 4 rutas disponibles**, contando la ruta de Nginx. Las cuatro variantes de `/mail/send` incluyen los datos utilizados por sus plantillas. En las plantillas de grupos, `addedGroups` contiene nombres como cadenas y `credentials` contiene datos ficticios que puedes editar o eliminar.

`/health` está definido en Nginx; en el entorno de desarrollo sin ese proxy devuelve `404`. Para comprobar NestJS en ambos entornos, usar `GET /`.

## Interpretar el resultado

- En `/mail/send`, `202` significa que el correo entró a la cola. La entrega se realiza después; revisar los logs de la aplicación y los registros de correo para confirmar el procesamiento.
- `403` en `/mail/send`: falta la API key o no coincide con la del servidor.
- `400` en `/mail/send`: destinatario inválido, plantilla vacía o ausente, `data` con un tipo incorrecto o propiedades adicionales fuera de `to`, `template` y `data`.
- `404` con `Template not found`: el slug de plantilla no existe o está inactivo.
- Las peticiones POST envían o encolan correos al destinatario configurado. La creación y validación de esta colección no ejecuta esos envíos.
