# 🍄 Xital — API REST de E-commerce

> *Xital: palabra maya que significa **vida** o **alma**.*

API REST para una tienda en línea especializada en **tinturas de hongos adaptógenos** cultivados
de forma artesanal y con doble extracción (agua y alcohol para extraer los elementos/compuestos
necesarios y adecuados que te ayudarán a sentirte mejor). Los productos incluyen las variedades
más reconocidas: Reishi, Cola de pavo, Melena de León y Cordyceps, disponibles en presentaciones
de 30, 50 y 100 ml.

- **Producción:** https://xital-backend.onrender.com
- **Frontend:** https://xital.onrender.com (repositorio `xital_frontend`)

---

## 1. Descripción

Backend de un e-commerce funcional, desarrollado con Node.js, Express y MongoDB. Implementa
autenticación con JWT, autorización por rol, validación de datos y una arquitectura modular
organizada por responsabilidades.

Todo el estado persistente de la aplicación vive aquí: usuarios, catálogo, carritos, órdenes,
direcciones, métodos de pago, reseñas, listas de deseos y logs. El frontend es un consumidor más
de esta API.

### Módulos

| Módulo | Qué resuelve |
|---|---|
| Auth | Registro y login, emisión de JWT |
| Products | Catálogo con paginación, filtros y búsqueda |
| Categories | Categorías con soporte de subcategorías |
| Cart | Carrito por usuario, con verificación de stock |
| Orders | Órdenes creadas a partir del carrito |
| Addresses | Direcciones de envío, con dirección predeterminada |
| Payment Methods | Métodos de pago registrados, con método predeterminado |
| Reviews | Reseñas de productos con calificación de 1 a 5 |
| Wishlist | Lista de deseos por usuario |
| Logs | Recepción de eventos estructurados del frontend |
| Health | Healthcheck público para la plataforma de despliegue |

---

## 2. Instalación

### Requisitos previos

- Node.js v18 o superior
- MongoDB local (o una instancia accesible por red, como Atlas)
- Git

### Pasos

```bash
git clone https://github.com/tu-usuario/xital_backend.git
cd xital_backend
npm install
cp .env.example .env
```

### Variables de entorno

Se rellenan en el `.env`, que **nunca se sube a git**. La plantilla versionada es `.env.example`.

| Variable | Obligatoria | Ejemplo local | Descripción |
|---|:---:|---|---|
| `MONGO_URL` | **Sí** | `mongodb://127.0.0.1:27017/xital` | Cadena de conexión de MongoDB |
| `JWT_SECRET` | **Sí** | *(64 bytes hex)* | Secreto de firma del token de acceso |
| `JWT_REFRESH_TOKEN` | **Sí** | *(64 bytes hex)* | Secreto de firma del refresh token |
| `CORS_ALLOWED_ORIGINS` | **Sí** | `http://localhost:5173` | Orígenes autorizados, separados por comas |
| `PORT` | No | `4000` | Puerto local. En Render lo inyecta la plataforma |
| `NODE_ENV` | No | `development` | Entorno; hoy solo se usa en el log de arranque |
| `FRONTEND_URL` | No | `http://localhost:5173` | **Reservada**: ningún módulo la consume todavía |
| `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | No | — | **Reservadas**: las expiraciones están fijas en `authController.js` |

Los secretos se generan con:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

`src/config/env.config.js` verifica las cuatro obligatorias al arrancar. Si falta alguna, el
proceso muere de inmediato con:

```
Faltan variables de entorno obligatorias: CORS_ALLOWED_ORIGINS. Revisa .env.example
```

El mensaje nombra la variable, **nunca su valor**: los secretos no se imprimen.

---

## 3. Cómo correr

```bash
npm run dev     # Desarrollo con nodemon (recarga al guardar)
npm start       # Producción (node server.js)
npm test        # Suite de tests (vitest run)
```

El servidor queda disponible en **`http://localhost:4000`** (o el `PORT` que definas). Al arrancar
imprime:

```
Server running on port 4000 [development]
```

Verificación rápida de que está vivo:

```bash
curl http://localhost:4000/api/health
# {"status":"ok","uptime":12.34,"timestamp":"2026-08-16T10:00:00.000Z"}
```

`GET /` responde `API is working successfully`, y cualquier ruta inexistente devuelve
`404 {"error":"Route not found","method":"...","url":"..."}`.

---

## 4. Arquitectura

### Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | v18+ | Entorno de ejecución |
| Express | ^5.2.1 | Framework web |
| MongoDB | Local o Atlas | Base de datos |
| Mongoose | ^9.3.3 | ODM |
| jsonwebtoken | ^9.0.3 | Autenticación |
| bcryptjs | ^3.0.3 | Hash de contraseñas |
| express-validator | ^7.3.1 | Middleware de validación |
| cors | ^2.8.6 | Control de orígenes |
| dotenv | ^17.3.1 | Variables de entorno |
| Vitest | ^4.1.10 | Runner de tests *(dev)* |
| mongodb-memory-server | ^11.2.0 | MongoDB en memoria para tests *(dev)* |
| nodemon | ^3.1.14 | Recarga en desarrollo *(dev)* |

Proyecto ESM puro (`"type": "module"`): las extensiones `.js` son obligatorias en los imports y no
hay paso de transpilación.

### Estructura

```
xital_backend/
├── server.js                 Punto de entrada: CORS, JSON, conexión, rutas, listen
├── vitest.config.js          Configuración del runner de tests
├── .env.example              Plantilla de variables de entorno
├── docs/
│   └── render-deployment.md  Guía completa de despliegue
├── tests/
│   └── models/               68 tests de esquemas Mongoose
└── src/
    ├── config/
    │   ├── db.config.js      connectDB() → mongoose.connect(MONGO_URL)
    │   └── env.config.js     Carga dotenv, valida obligatorias, exporta `env`
    ├── controllers/          Lógica de negocio, uno por recurso
    ├── middlewares/          authMiddleware, isAdminMiddleware, validationMiddleware
    ├── models/               Esquemas de Mongoose
    └── routes/
        ├── index.js          Agrega todos los routers
        └── *Routes.js        Un router por recurso
```

### Flujo de una petición

```
Cliente → CORS → express.json() → /api → router del recurso
        → authMiddleware (si la ruta es privada)
        → isAdmin (si la ruta es administrativa)
        → controlador → Mongoose → MongoDB
```

### Modelos y relaciones

| Modelo | Descripción |
|---|---|
| `User` | Usuarios registrados. Rol `customer` o `admin`, email único |
| `Product` | Tinturas, con enums de hongo y volumen, stock y referencia a categoría |
| `Category` | Categorías con soporte de subcategorías (autoreferenciada) |
| `Cart` | Carrito por usuario, con cantidad y precio unitario por línea |
| `Order` | Orden con productos, dirección, método de pago, costo de envío y estado |
| `Address` | Direcciones de envío, con tipo (`home`/`work`/`other`) y predeterminada |
| `PaymentMethod` | Métodos de pago por usuario, con predeterminado y baja lógica |
| `Wishlist` | Lista de deseos por usuario |
| `Review` | Reseñas con comentario y calificación de 1 a 5 |
| `Log` | Eventos estructurados, principalmente del frontend |

Todos declaran `{ timestamps: true }`.

---

## 5. Endpoints de la API

URL base local: **`http://localhost:4000/api`** · Producción: **`https://xital-backend.onrender.com/api`**

> 🔒 requiere `Authorization: Bearer <token>` · 👑 requiere además rol `admin`

### 🔐 Auth — `/api/auth`

| Método | Endpoint | Acceso | Descripción |
|---|---|:---:|---|
| POST | `/auth/register` | público | Registro de nuevo usuario |
| POST | `/auth/login` | público | Inicio de sesión, retorna JWT |

### 🍄 Products — `/api/products`

| Método | Endpoint | Acceso | Descripción |
|---|---|:---:|---|
| GET | `/products` | público | Listado paginado con filtros |
| GET | `/products/search` | público | Búsqueda paginada |
| GET | `/products/:id` | público | Producto por id, con categoría poblada |
| POST | `/products/` | 🔒👑 | Crear producto |
| PUT | `/products/:id` | 🔒👑 | Actualizar producto |
| DELETE | `/products/:id` | 🔒👑 | Eliminar producto |

Los listados devuelven `{ products, pagination: { currentPage, totalPages, totalResults,
hasNextPage, hasPrevPage } }`, con `page=1` y `limit=9` por defecto.

### 🏷️ Categories — `/api/category`

| Método | Endpoint | Acceso | Descripción |
|---|---|:---:|---|
| GET | `/category` | público | Listar categorías |
| GET | `/category/:id` | público | Categoría por id |
| POST | `/category` | 🔒👑 | Crear categoría |
| PUT | `/category/:id` | 🔒👑 | Actualizar categoría |
| DELETE | `/category/:id` | 🔒👑 | Eliminar categoría |

### 👤 Users — `/api/user`

| Método | Endpoint | Acceso | Descripción |
|---|---|:---:|---|
| GET | `/user` | 🔒👑 | Listar usuarios |
| GET | `/user/:id` | 🔒 | Usuario por id |
| POST | `/user` | 🔒 | Crear usuario |
| PUT | `/user/:id` | 🔒 | Actualizar usuario |
| DELETE | `/user/:id` | 🔒👑 | Eliminar usuario |

### 🛒 Cart — `/api/cart`

| Método | Endpoint | Acceso | Descripción |
|---|---|:---:|---|
| GET | `/cart` | 🔒👑 | Listar todos los carritos |
| GET | `/cart/user/` | 🔒 | Carrito del usuario del token |
| POST | `/cart/product` | 🔒 | Agregar producto (verifica stock) |
| PUT | `/cart/product` | 🔒 | Actualizar cantidad |
| DELETE | `/cart/product/:productId` | 🔒 | Eliminar producto del carrito |
| DELETE | `/cart/clear` | 🔒 | Vaciar carrito |

### 📦 Orders — `/api/orders`

| Método | Endpoint | Acceso | Descripción |
|---|---|:---:|---|
| GET | `/orders` | 🔒 | Órdenes del usuario del token |
| GET | `/orders/:id` | 🔒 | Orden por id |
| POST | `/orders` | 🔒 | Crear orden |
| PUT | `/orders/:id` | 🔒 | Actualizar orden (solo si está `pending`) |

Estados: `pending`, `processing`, `shipped`, `delivered`, `cancelled`.

### 📍 Addresses — `/api/address`

| Método | Endpoint | Acceso | Descripción |
|---|---|:---:|---|
| GET | `/address` | 🔒 | Direcciones del usuario |
| GET | `/address/:addressId` | 🔒 | Dirección por id |
| POST | `/address` | 🔒 | Crear dirección |
| PUT | `/address/:addressId` | 🔒 | Actualizar dirección |
| DELETE | `/address/:addressId` | 🔒 | Eliminar (no la predeterminada si hay otra) |

### 💳 Payment Methods — `/api/payment-method`

| Método | Endpoint | Acceso | Descripción |
|---|---|:---:|---|
| GET | `/payment-method` | 🔒 | Listar métodos del usuario |
| GET | `/payment-method/:id` | 🔒 | Método por id |
| POST | `/payment-method` | 🔒 | Registrar método |
| PUT | `/payment-method/:id` | 🔒 | Actualizar método |
| DELETE | `/payment-method/:id` | 🔒 | Eliminar (no el predeterminado si hay otro) |

### ⭐ Reviews — `/api/reviews`

| Método | Endpoint | Acceso | Descripción |
|---|---|:---:|---|
| GET | `/reviews` | 🔒 | Listar reseñas |
| GET | `/reviews/product/:productId` | 🔒 | Reseñas de un producto |
| POST | `/reviews` | 🔒 | Crear reseña |
| PUT | `/reviews/:id` | 🔒 | Actualizar reseña |
| DELETE | `/reviews/:id` | 🔒 | Eliminar reseña |

### ❤️ Wishlist — `/api/wishlist`

| Método | Endpoint | Acceso | Descripción |
|---|---|:---:|---|
| GET | `/wishlist` | 🔒 | Listar wishlists |
| GET | `/wishlist/:id` | 🔒 | Wishlist por id |
| POST | `/wishlist` | 🔒 | Crear wishlist (409 si ya existe) |
| PUT | `/wishlist/product` | 🔒 | Agregar producto |
| DELETE | `/wishlist/:id/product` | 🔒 | Quitar producto |
| DELETE | `/wishlist/:id` | 🔒 | Eliminar wishlist |

### 📝 Logs — `/api/logs`

| Método | Endpoint | Acceso | Descripción |
|---|---|:---:|---|
| POST | `/logs` | público | Registra un evento estructurado |

**Público a propósito:** también tiene que capturar errores de usuarios sin sesión. El token es
**opcional** y solo sirve para atribuir el log a un usuario; un token ausente, inválido o expirado
no produce 401, el log se guarda sin `user`.

Body:

```json
{
  "level": "error",
  "event": "load_cart_failed",
  "message": "NETWORK_ERROR",
  "source": "frontend",
  "context": { "url": "/cart" }
}
```

`level` debe ser `error`, `warn` o `info`; `event` y `message` son obligatorios; `source` es
`frontend` o `backend` (por defecto `frontend`). Si algo falla responde **422** con
`{"errors":[{"field":"...","message":"..."}]}`. El `message` se recorta a 1000 caracteres y el
`context` a 4000, para que un payload gigante no llene la colección.

### ❤️‍🩹 Health — `/api/health`

| Método | Endpoint | Acceso | Descripción |
|---|---|:---:|---|
| GET | `/health` | público | Estado del servicio |

```json
{ "status": "ok", "uptime": 1234.56, "timestamp": "2026-08-16T10:00:00.000Z" }
```

**Público a propósito:** un healthcheck debe responder sin credenciales. No consulta la base de
datos ni expone estado interno del proceso.

### Códigos de estado

| Código | Cuándo |
|---|---|
| 200 / 201 / 204 | Éxito, recurso creado, eliminación sin contenido |
| 400 | Error de negocio o credenciales inválidas |
| 401 | Falta el token, o es inválido o expirado |
| 403 | Autenticado pero sin rol `admin` |
| 404 | Recurso no encontrado (incluye recursos de otro usuario) |
| 409 | Conflicto por duplicado |
| 422 | Error de validación, con `errors` por campo |
| 500 | Error interno, con mensaje genérico |

---

## 6. Decisiones técnicas

### Autenticación con JWT en header, sin cookies

Al hacer login el servidor devuelve un token que el cliente envía en cada petición protegida:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

El token de acceso expira en **1 h** y el refresh en **7 d**. Las contraseñas se guardan hasheadas
con bcryptjs (10 rounds) y nunca en texto plano.

No hay cookies de sesión: no se usa `cookie-parser`, ni `res.cookie`, ni `express-session`. Por eso
no hace falta configurar `sameSite`, `secure`, `domain` ni `trust proxy` para que la sesión
funcione entre los dos dominios del despliegue.

### El id del usuario sale del token, nunca del body ni de la URL

Todos los controladores usan `const userId = req.user.userId`, y los recursos por usuario se
buscan con filtro compuesto:

```js
Model.findOne({ _id: id, user: userId })
```

Un usuario que pida el recurso de otro recibe **404**, no 403 ni 200: el filtro no encuentra nada.
Es la razón por la que `GET /api/cart/user/` no lleva `:userId` en la ruta — pedirlo por parámetro
sería confiar en que el cliente diga la verdad.

### Validación de entorno antes de arrancar

`server.js` importa `env.config.js` **antes** que `db.config.js`. En ESM los imports se evalúan
antes del cuerpo del módulo, así que el `dotenv.config()` vive dentro de `env.config.js`: si
esperara a `server.js`, la validación correría sin valores. El proceso falla al arrancar si falta
una obligatoria, en vez de fallar a mitad de una petición en producción.

### CORS con lista blanca, no comodín

La configuración vive en `server.js` y usa `origin(origin, callback)`:

- Una petición **sin header `Origin`** se acepta: es el caso de Postman, curl, el healthcheck de la
  plataforma y las pruebas automatizadas.
- Un origen presente en `CORS_ALLOWED_ORIGINS` se acepta; cualquier otro se rechaza con
  `Origen no permitido por CORS: <origen>`.
- `credentials: true` se mantiene y nunca se combina con `origin: "*"`.

Los orígenes distinguen protocolo, host y puerto: `http://localhost:5173` y
`http://127.0.0.1:5173` son **dos orígenes distintos**.

### Estado de `express-validator`

La dependencia está instalada y `validationMiddleware` ejecuta `validationResult(req)` y responde
422 si hay errores, pero **hoy no hay cadenas `body()`, `param()` ni `check()` definidas en las
rutas**: el middleware está montado en las rutas de productos y no encuentra reglas que evaluar.

La validación real la hacen los esquemas de Mongoose (`required`, `unique`, `enum`, `min`/`max`,
`minlength`/`maxlength`), que en los updates se fuerzan con `{ new: true, runValidators: true }`,
más comprobaciones explícitas en los controladores (`verifyUserExists`, `checkStock`, el rango del
rating en `updateReview`, el estado `pending` en `updateOrder`). `logController` es la excepción:
valida su body a mano porque el endpoint es público.

### Errores capturados sin exponer detalles internos

Todos los controladores envuelven su cuerpo en `try/catch`, registran el error en consola y
responden `500 {"message":"Internal Server Error"}`. El stack trace y el mensaje de Mongo se
quedan en el servidor: al cliente nunca le llega la estructura interna.

### Logs propios en lugar de servicio externo

El endpoint `POST /api/logs` guarda en la colección `logs` los eventos que reporta el frontend
—errores de red, boundaries de React, fallos de carga— con nivel, evento, mensaje, origen y
contexto libre. No se añadió Winston, Pino ni un servicio de terceros: para el alcance del
proyecto, una colección de Mongo consultable con Compass resuelve el mismo problema sin sumar
dependencias ni configuración de despliegue.

---

## 7. Testing

Runner: **Vitest**, con **mongodb-memory-server** para levantar un MongoDB real en memoria.

```bash
npm test        # vitest run
```

### Configuración — `vitest.config.js`

| Opción | Valor | Motivo |
|---|---|---|
| `environment` | `node` | No hay DOM que emular |
| `include` | `tests/**/*.test.js` | Los tests viven fuera de `src/` |
| `hookTimeout` | `120000` | El primer arranque descarga el binario de `mongod` |
| `testTimeout` | `20000` | Margen para operaciones contra la base en memoria |
| `fileParallelism` | `false` | En paralelo, varias instancias de `mongod` compiten y no arrancan |

Cada archivo levanta su propia instancia con `MongoMemoryServer.create()` e
`instance: { launchTimeout: 60000 }`. Un archivo nuevo que levante instancia propia necesita
repetir esa opción.

### Cobertura actual

**68 tests en 8 archivos**, todos en `tests/models/` y todos de validación de esquemas:

| Archivo | Tests |
|---|---:|
| `Address.test.js` | 13 |
| `Order.test.js` | 11 |
| `Product.test.js` | 10 |
| `Log.test.js` | 9 |
| `Review.test.js` | 8 |
| `User.test.js` | 7 |
| `Cart.test.js` | 6 |
| `PaymentMethod.test.js` | 4 |

Última ejecución verificada: **68/68 en verde**, 8 de 8 archivos, en 33.74 s (`npm test`, 16 de
agosto de 2026).

Verifican los `required`, los `enum`, los rangos (`min`/`max`, `minlength`/`maxlength`), los
valores por defecto y la unicidad del email, contra una base real y no contra un mock de Mongoose.

### Criterios

- **Base de datos real en memoria**, nunca Mongoose mockeado a mano.
- Un happy path por módulo, más un caso negativo por cada regla real del código.
- Estructura AAA, tests independientes, con limpieza entre casos y sin dependencia del orden.

### Qué no está cubierto

- No hay tests de `Category` ni de `Wishlist`.
- **No hay tests por HTTP.** Los endpoints no se ejercitan porque `server.js` no exporta `app`:
  crea la aplicación, llama a `connectDB()` y hace `app.listen()` en el mismo módulo. Montarla en
  un cliente HTTP de pruebas exigiría cambiar código de producción.
- No hay herramienta SAST configurada.

Las pruebas manuales se hacen con Postman o Thunder Client:

1. `POST /api/auth/register` — crear el usuario
2. `POST /api/auth/login` — obtener el token
3. Agregarlo como *Bearer Token* en las peticiones protegidas
4. Recorrer el resto de endpoints

---

## 8. Deployment

Desplegado en **Render** como *Web Service*, independiente del frontend: son dos repositorios y
dos servicios separados, sin monorepo ni workspaces. La guía completa está en
[`docs/render-deployment.md`](docs/render-deployment.md).

### Configuración del servicio

| Campo | Valor |
|---|---|
| Tipo | Web Service (Node) |
| Root Directory | *(vacío — la raíz del repo)* |
| Build Command | `npm install` |
| Start Command | `npm start` |
| URL | https://xital-backend.onrender.com |

### Variables en producción

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URL` | Cadena de conexión de Atlas (no puede apuntar a `127.0.0.1`) |
| `JWT_SECRET` | Secreto de 64 bytes |
| `JWT_REFRESH_TOKEN` | Secreto de 64 bytes |
| `CORS_ALLOWED_ORIGINS` | `https://xital.onrender.com` |

**`PORT` no se configura a mano**: Render la inyecta y el código la respeta con
`process.env.PORT || 4000`. `app.listen(PORT)` se llama sin host, así que Node escucha en
`0.0.0.0` y acepta conexiones externas.

El backend **no tiene paso de build**: es ESM puro, sin transpilación.

### Healthcheck

`GET /api/health` responde 200 sin credenciales y sin tocar la base de datos, que es justo lo que
la plataforma necesita para saber si el servicio está vivo. Como no consulta Mongo, un 200 aquí
significa "el proceso responde", no "la base está conectada".

### Orden de despliegue

Cada servicio necesita la URL del otro, así que la primera vez va en tres pasos:

1. Desplegar el **backend**; Render asigna su URL (`https://xital-backend.onrender.com`).
2. Desplegar el **frontend** con `VITE_API_URL=https://xital-backend.onrender.com/api`.
3. Volver al backend, poner `CORS_ALLOWED_ORIGINS=https://xital.onrender.com` y redesplegar.

Si se omite el paso 3, el frontend carga pero **todas las peticiones fallan por CORS**.

### Base de datos en producción

Si se usa Atlas, hay que autorizar las IPs de salida de Render en su *Network Access*, o la
conexión se queda colgada hasta el timeout.

---

## 🚧 Estado del proyecto

- [x] Autenticación (registro y login) con JWT
- [x] CRUD de productos, con paginación y búsqueda
- [x] CRUD de categorías, usuarios, carrito, direcciones, reseñas, wishlist, métodos de pago y órdenes
- [x] Middleware `isAdmin` para rutas administrativas
- [x] Aislamiento de recursos por usuario mediante filtro compuesto
- [x] Validación de variables de entorno al arrancar
- [x] CORS por lista blanca configurable
- [x] Endpoint de logs y healthcheck
- [x] Suite de tests de esquemas con Vitest y MongoDB en memoria
- [ ] Cadenas de validación de `express-validator` en las rutas
- [ ] Manejo de errores centralizado (`errorHandler` + `next(error)`)
- [ ] Tests de endpoints por HTTP

---

## 👩‍💻 Autora

**María G. Serna Domínguez**
Bióloga Molecular | Yogini | Desarrolladora en formación

Especialista en micología, bioinformática y reconstrucciones filogenéticas. Con la misma
metodología que se aplica al estudio de hongos entomopatógenos —observación, iteración y
paciencia— aprendiendo a construir sistemas backend.

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos.

---

*"De la biología molecular al desarrollo web: siempre explorando sistemas complejos."* 🍄
