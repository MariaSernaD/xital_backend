# Despliegue en Render — Xital

Xital son **dos repos independientes**, cada uno con su propio `.git` y su propio
`package.json`. En Render eso son **dos servicios separados**, cada uno apuntando a su
repositorio:

| Servicio | Repo | Tipo en Render |
|---|---|---|
| `xital-api` | `xital_backend` | Web Service (Node) |
| `xital-web` | `xital_frontend` | Static Site |

No hay monorepo, ni workspaces, ni `package.json` raíz: no se configura *Root Directory* con
subcarpetas, cada servicio toma la raíz de su propio repo.

---

## 1. Variables de entorno

| App | Variable | Obligatoria | Ejemplo local | Descripción |
|---|---|:---:|---|---|
| Backend | `MONGO_URL` | Sí | `mongodb://127.0.0.1:27017/xital` | Cadena de conexión de MongoDB |
| Backend | `JWT_SECRET` | Sí | *(64 bytes hex)* | Secreto de firma del token de acceso |
| Backend | `JWT_REFRESH_TOKEN` | Sí | *(64 bytes hex)* | Secreto de firma del refresh token |
| Backend | `CORS_ALLOWED_ORIGINS` | Sí | `http://localhost:5173` | Orígenes autorizados, separados por comas |
| Backend | `PORT` | No | `4000` | Puerto local. **En Render lo inyecta la plataforma** |
| Backend | `NODE_ENV` | No | `development` | Entorno; solo se usa en el log de arranque |
| Backend | `FRONTEND_URL` | No | `http://localhost:5173` | **Reservada**: ningún módulo la consume hoy |
| Frontend | `VITE_API_URL` | Sí | `http://localhost:4000/api` | Base de la API, **con el `/api` incluido** |

Los secretos se generan con:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### `.env` locales

Cada repo trae su plantilla versionada. Se copian y se rellenan:

```bash
cd xital_backend  && cp .env.example .env
cd xital_frontend && cp .env.example .env
```

Ninguno de los dos `.env` se sube: ambos `.gitignore` los ignoran y mantienen versionado el
`.env.example`.

**En el frontend no van secretos.** Todo lo que lleva el prefijo `VITE_` queda embebido en el
bundle y es legible por cualquiera que abra el sitio.

---

## 2. Configuración de cada servicio

### Backend — `xital-api`

| Campo | Valor |
|---|---|
| Tipo | Web Service |
| Root Directory | *(vacío — la raíz del repo)* |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Variables | `NODE_ENV=production`, `MONGO_URL`, `JWT_SECRET`, `JWT_REFRESH_TOKEN`, `CORS_ALLOWED_ORIGINS=https://URL-DEL-FRONTEND` |

`npm start` ejecuta `node server.js`, según `package.json`. **`PORT` no se configura a mano**:
Render la inyecta y `server.js` la respeta con `process.env.PORT || 4000`. El servidor llama a
`app.listen(PORT, ...)` sin especificar host, así que Node escucha en `0.0.0.0` y acepta
conexiones externas.

El backend no tiene paso de build: es ESM puro, sin transpilación.

### Frontend — `xital-web`

| Campo | Valor |
|---|---|
| Tipo | Static Site |
| Root Directory | *(vacío — la raíz del repo)* |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Variables | `VITE_API_URL=https://URL-DEL-BACKEND/api` |

Al ser una SPA con React Router, hace falta una **rewrite rule** en Render para que las rutas
profundas (`/products/:id`, `/checkout`) no devuelvan 404 al recargar:

```
Source: /*    Destination: /index.html    Action: Rewrite
```

> **`VITE_API_URL` se congela en el build.** Vite la sustituye por su valor literal al compilar,
> no se lee en tiempo de ejecución. Si cambia la URL del backend, **no basta con editar la
> variable en Render: hay que volver a construir y desplegar el frontend.**

---

## 3. Orden de despliegue

Cada servicio necesita la URL del otro, así que la primera vez se hace en dos pasos:

1. Desplegar el **backend**. Render asigna su URL (`https://xital-api.onrender.com`).
2. Desplegar el **frontend** con `VITE_API_URL=https://xital-api.onrender.com/api`. Render asigna la suya.
3. Volver al backend, poner `CORS_ALLOWED_ORIGINS=https://xital-web.onrender.com` y redesplegar.

Si se omite el paso 3, el frontend carga pero **todas las peticiones fallan por CORS**.

---

## 4. Diferencias entre desarrollo y producción

| | Desarrollo | Producción (Render) |
|---|---|---|
| Frontend | `http://localhost:5173` | `https://URL-DEL-FRONTEND` |
| Backend | `http://localhost:4000` | `https://URL-DEL-BACKEND` |
| `VITE_API_URL` | `http://localhost:4000/api` | `https://URL-DEL-BACKEND/api` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | `https://URL-DEL-FRONTEND` |
| `PORT` | `4000` (o el del `.env`) | Inyectado por Render |
| MongoDB | Local (Compass) | Atlas u otro Mongo accesible por red |

En producción `MONGO_URL` no puede apuntar a `127.0.0.1`: el servicio de Render no ve tu
máquina. Y si se usa Atlas, hay que autorizar las IPs de salida de Render en su *Network
Access*.

---

## 5. Cómo funciona el CORS

La configuración vive en `server.js` y lee `CORS_ALLOWED_ORIGINS` a través de
`src/config/env.config.js`:

- Se parte por comas, se hace `trim()` y se descartan los vacíos.
- Una petición **sin header `Origin`** se acepta: es el caso de Postman, curl, el healthcheck de Render y las pruebas automatizadas.
- Un origen que esté en la lista se acepta; cualquier otro se rechaza.
- `credentials: true` se mantiene, aunque hoy no tiene efecto: la sesión es un **JWT en `localStorage`** que viaja en el header `Authorization`, no una cookie. No se combina con `origin: "*"` en ningún momento.

### Añadir un origen nuevo

Se agrega a la lista separado por comas, **sin barra final y con el esquema incluido**:

```env
CORS_ALLOWED_ORIGINS=https://xital-web.onrender.com,https://www.xital.com
```

En Render: *Environment* → editar la variable → *Save* → el servicio se reinicia solo. No hay
que tocar código.

Los orígenes distinguen protocolo, host y puerto: `http://localhost:5173` y
`http://127.0.0.1:5173` son **dos orígenes distintos**. Si abres el front por IP, añádelo aparte.

---

## 6. Validación de configuración

`src/config/env.config.js` comprueba al arrancar que estén `MONGO_URL`, `JWT_SECRET`,
`JWT_REFRESH_TOKEN` y `CORS_ALLOWED_ORIGINS`. Si falta alguna, el proceso muere con:

```
Faltan variables de entorno obligatorias: CORS_ALLOWED_ORIGINS. Revisa .env.example
```

El mensaje nombra la variable, **nunca su valor**: los secretos no se imprimen.

En el frontend, `src/services/apiClient.js` lanza `Falta configurar VITE_API_URL` si la
variable no está. No hay URL de reserva: un fallback silencioso a `localhost` escondería una
configuración incorrecta hasta que la app estuviera en producción.

---

## 7. Cookies y autenticación

**No aplica.** El proyecto no usa cookies de sesión: no hay `cookie-parser`, ni `res.cookie`,
ni `express-session`. El token vive en `localStorage` bajo la clave `authToken` y se inyecta
como header en cada petición desde `apiClient.js`.

Por eso no hace falta configurar `sameSite`, `secure`, `domain` ni `app.set("trust proxy", 1)`
para que la sesión funcione entre los dos dominios de Render.
