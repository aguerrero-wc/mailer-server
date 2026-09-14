# Mailer Service

Servicio NestJS para envío de correos con plantillas Handlebars, colas BullMQ en Redis y registros de auditoría en PostgreSQL.

## Desarrollo

`docker-compose.yml` es independiente y usa `.env`. Levanta `app-dev`, PostgreSQL 15 y Redis 7 sin perfiles. El código y las plantillas se montan para recarga en caliente.

Crear `.env` desde `.env.example` si todavía no existe y completar SMTP y las claves de API. Si ya existe, conservar sus valores y añadir las variables que falten. `API_KEY_PRIVATE_ZONES` es la clave que valida el guard de la aplicación.

```bash
docker compose --env-file .env -f docker-compose.yml config --quiet
docker compose --env-file .env -f docker-compose.yml up -d --build
docker compose --env-file .env -f docker-compose.yml logs -f app-dev
```

La API se publica en `http://localhost:3001` por defecto. `APP_PORT`, `DB_PORT` y `REDIS_PORT` controlan los puertos del host; dentro de Docker la aplicación siempre conecta a `postgres:5432` y `redis:6379`.

Si desarrollo y producción comparten el mismo host Docker, definir `COMPOSE_PROJECT_NAME=mailer-service-dev` **solo en el `.env` de desarrollo** para separar sus contenedores y datos. Esto crea volúmenes propios para desarrollo; producción debe conservar su nombre de proyecto anterior.

## Producción

`docker-compose.production.yml` es independiente y usa `.env.production`. Levanta Nginx, `app-prod`, PostgreSQL y Redis sin perfiles ni archivos Compose superpuestos.

Crear `.env.production` desde `.env.production.example` si no existe y completar las credenciales reales del servidor. El archivo local generado inicialmente es una plantilla sin credenciales. Ambos archivos de credenciales están excluidos de Git y del contexto de construcción de Docker.

```bash
docker compose --env-file .env.production -f docker-compose.production.yml config --quiet
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build --wait
docker compose --env-file .env.production -f docker-compose.production.yml logs -f app-prod
```

Usar siempre `--env-file .env.production`: este parámetro selecciona las variables que Compose interpola; omitirlo cargaría `.env`. Las variables exportadas en la terminal tienen precedencia, por lo que hay que revisar cualquier valor exportado antes de desplegar. [Documentación de Docker](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/).

Solo Nginx publica un puerto: `0.0.0.0:3001` hacia su puerto interno `80`. `NGINX_HTTP_PORT` y `NGINX_BIND_ADDRESS` permiten cambiarlo. Nest escucha en `app-prod:3000` dentro de `secure_mail_network`; Nest, PostgreSQL y Redis no publican puertos del host.

### Nginx y Nginx Proxy Manager

El flujo es **cliente → Nginx Proxy Manager (HTTPS) → Nginx (HTTP) → app-prod:3000**. En NPM configurar el Proxy Host con esquema `http`, la IP del servidor Docker como destino y el puerto `3001` (o `NGINX_HTTP_PORT`). Si NPM corre en otro contenedor, `127.0.0.1` apunta al propio contenedor de NPM; usar una dirección del servidor alcanzable desde él. TLS y certificados se gestionan en NPM.

La configuración está en `nginx/nginx.conf`. La imagen oficial la procesa como plantilla al iniciar y sustituye únicamente `NGINX_TRUSTED_PROXY_CIDR`, conservando las variables nativas de Nginx. Incluye gzip, conexiones persistentes, límite de 10 peticiones/s por IP con ráfaga de 20 y respuesta `429`, y `/health` para comprobar Nginx. El límite de cuerpo de 10 MB aplica en Nginx; los límites del parser de Nest siguen aplicando. Docker resuelve `app-prod` periódicamente para seguir funcionando cuando el backend cambia de IP.

Definir `NGINX_TRUSTED_PROXY_CIDR` en `.env.production` con la IP/CIDR desde la que Nginx ve llegar a NPM. Preferir la IP concreta del proxy. El valor inicial `127.0.0.1/32` solo confía en loopback: hasta configurar NPM, los logs y el rate limit usarán la IP del proxy, y el esquema reenviado será `http`. No copiar `172.20.0.0/16` de otro proyecto sin verificar la red real. Nginx acepta `X-Forwarded-For` y `X-Forwarded-Proto` solo del proxy configurado y envía a Nest la IP validada. [Módulo Real IP de Nginx](https://nginx.org/en/docs/http/ngx_http_realip_module.html).

```bash
docker compose --env-file .env.production -f docker-compose.production.yml exec nginx nginx -t
docker compose --env-file .env.production -f docker-compose.production.yml logs -f nginx
```

Después de modificar `nginx/nginx.conf` o las variables de Nginx, recrear su contenedor para procesar de nuevo la plantilla:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml up -d --force-recreate --no-deps nginx
```

La imagen incluye las plantillas, ejecuta Node como usuario sin privilegios y comprueba `GET /` como señal de vida del proceso HTTP. El healthcheck no verifica SMTP ni el procesamiento de las colas. Se conserva el límite de 1 CPU y 512 MB, con un heap de Node de 384 MB, y el montaje `./logs:/usr/src/app/logs`. Redis mantiene AOF y usa `noeviction` para las colas. Los logs de contenedores rotan a 10 MB con tres archivos.

## Actualizar el despliegue existente sin cambiar volúmenes

Se mantienen las declaraciones `pg_data:` y `redis_data:`, los montajes de datos, PostgreSQL 15, Redis 7 y la red `secure_mail_network`. No se añade `name:` ni `external:` a los volúmenes.

Compose prefija los nombres físicos con el nombre del proyecto. Por ejemplo, para el proyecto `mailer-service`, siguen siendo `mailer-service_pg_data` y `mailer-service_redis_data`. Conservar las claves del YAML **y el mismo nombre de proyecto** permite reutilizarlos. [Documentación de Docker](https://docs.docker.com/compose/how-tos/project-name/).

Antes de actualizar, identificar el proyecto y los volúmenes del servidor:

```bash
docker compose ls
docker volume ls --filter label=com.docker.compose.volume=pg_data
docker volume ls --filter label=com.docker.compose.volume=redis_data
```

1. Conservar el directorio de despliegue. Si antes se usaba `-p` o `COMPOSE_PROJECT_NAME`, copiar exactamente ese nombre a `COMPOSE_PROJECT_NAME` en `.env.production`. No añadir un sufijo `-prod` al nombre existente.
2. Copiar a `.env.production` los valores de producción anteriores, incluidos `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, SMTP y claves de API. Cambiar las variables de PostgreSQL no cambia usuarios ni contraseñas de una base ya inicializada.
3. Revisar los nombres resueltos antes de arrancar. Este comando solo muestra nombres de volúmenes, sin credenciales:

   ```bash
   docker compose --env-file .env.production -f docker-compose.production.yml config --format json | python3 -c 'import json,sys; c=json.load(sys.stdin); print("Proyecto:", c["name"]); [print(k, "->", v["name"]) for k,v in c["volumes"].items()]'
   ```

4. Ejecutar los comandos de producción indicados arriba. Se conservan los nombres de servicio `app-prod`, `postgres` y `redis`, por lo que Compose puede actualizar el despliegue existente.

No ejecutar `down -v` ni eliminar los volúmenes para actualizar. Si el despliegue anterior ejecutaba `app-dev` con el mismo proyecto, detener ese servicio antes de arrancar producción para evitar dos consumidores con configuraciones distintas sobre la misma base y cola.

En producción `synchronize` está desactivado: este procedimiento supone que la base existente ya contiene el esquema. Una instalación sobre una base vacía requiere provisionar el esquema antes de iniciar la aplicación.

## Comprobaciones locales

```bash
npm ci
npm run build
npm test -- --runInBand
```

Para verificar únicamente la imagen, sin arrancar servicios:

```bash
docker build --target production -t secure-mailer-service:check .
```
