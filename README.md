# 🍄 Xital — API REST de E-commerce

> *Xital: palabra maya que significa **vida** o **alma**.*

API REST para una tienda en línea especializada en **tinturas de hongos adaptógenos** cultivados de forma artesanal y con doble extracción (agua y alcohol para extraer los elementos/compuestos necesarios y adecuados que te ayudaran a sentirte mejor). Los productos incluyen las variedades más reconocidas: Reishi, Cola de pavo, Melena de León y Cordyceps, disponibles en presentaciones de 30, 50 y 100 ml.

Este proyecto es el backend de un e-commerce funcional, desarrollado con Node.js, Express y MongoDB. Implementa autenticación segura con JWT, validación de datos y una arquitectura modular organizada por responsabilidades.

---

## 🧰 Tecnologías utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | v18+ | Entorno de ejecución |
| Express | ^4.x | Framework web |
| MongoDB | Local (Compass) | Base de datos |
| Mongoose | ^8.x | ODM para MongoDB |
| JSON Web Token (JWT) | ^9.x | Autenticación |
| bcrypt | ^5.x | Encriptación de contraseñas |
| express-validator | ^7.x | Validación de datos |
| dotenv | ^16.x | Variables de entorno |

---

## 📁 Estructura del proyecto

```
xital-api/
├── src/
│   ├── bd.config/          # Configuración de conexión a MongoDB
│   ├── controllers/       # Lógica de negocio por módulo
│   ├── middlewares/       # Autenticación y validaciones
│   ├── models/            # Esquemas de Mongoose
│   └── routes/            # Definición de rutas
│       └── index.routes.js
├── .env                   # Variables de entorno (no incluido en git)
├── .env.example           # Plantilla de variables de entorno
├── .gitignore
└── server.js              # Punto de entrada de la aplicación
```

---

## ⚙️ Instalación y configuración

### Requisitos previos

- Node.js v18 o superior
- MongoDB instalado localmente (o acceso a MongoDB Compass)
- Git

### Pasos

1. **Clona el repositorio**

```bash
git clone https://github.com/tu-usuario/xital-api.git
cd xital-api
```

2. **Instala las dependencias**

```bash
npm install
```

3. **Configura las variables de entorno**

Copia el archivo de ejemplo y rellena tus valores:

```bash
cp .env.example .env
```

Contenido del `.env`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/xital-db
JWT_SECRET=tu_clave_secreta_aqui
```

4. **Asegúrate de que MongoDB esté corriendo** en tu máquina local (puedes verificarlo desde MongoDB Compass).

5. **Inicia el servidor**

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: `http://localhost:3000`

---

## 🗄️ Modelo de datos

El proyecto cuenta con los siguientes modelos principales y sus relaciones:

| Modelo | Descripción |
|---|---|
| `User` | Usuarios registrados (rol: user / admin) |
| `Product` | Tinturas con atributos de hongo y volumen |
| `Category` | Categorías con soporte de subcategorías (autoreferenciada) |
| `Cart` | Carrito de compras por usuario |
| `Order` | Órdenes generadas a partir del carrito |
| `Address` | Direcciones de envío del usuario |
| `PaymentMethod` | Métodos de pago registrados |
| `Wishlist` | Lista de deseos por usuario |
| `Review` | Reseñas de productos por usuario |

---

## 🔌 Endpoints de la API

La URL base para todos los endpoints es: `http://localhost:3000/api`

> 🔒 Los endpoints marcados con este candado requieren un token JWT válido en el header:
> `Authorization: Bearer <token>`

---

### 🔐 Auth — `/api/auth`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Registro de nuevo usuario |
| POST | `/auth/login` | ❌ | Inicio de sesión, retorna JWT |

---

### 👤 Users — `/api/user`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/user` | 🔒 | Obtener todos los usuarios |
| GET | `/user/:id` | 🔒 | Obtener usuario por ID |
| POST | `/user` | 🔒 | Crear usuario |
| PUT | `/user/:id` | 🔒 | Actualizar usuario |
| DELETE | `/user/:id` | 🔒 | Eliminar usuario |

---

### 🍄 Products — `/api/products`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/products` | ❌ | Listar todos los productos |
| GET | `/products/:id` | ❌ | Obtener producto por ID |
| POST | `/products` | 🔒 | Crear producto |
| PUT | `/products/:id` | 🔒 | Actualizar producto |
| DELETE | `/products/:id` | 🔒 | Eliminar producto |

---

### 🏷️ Categories — `/api/category`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/category` | ❌ | Listar todas las categorías |
| GET | `/category/:id` | ❌ | Obtener categoría por ID |
| POST | `/category` | 🔒 | Crear categoría |
| PUT | `/category/:id` | 🔒 | Actualizar categoría |
| DELETE | `/category/:id` | 🔒 | Eliminar categoría |

---

### 🛒 Cart — `/api/cart`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/cart` | 🔒 | Obtener todos los carritos |
| GET | `/cart/user/:userId` | 🔒 | Obtener carrito del usuario |
| POST | `/cart/product` | 🔒 | Agregar producto al carrito |
| PUT | `/cart/product` | 🔒 | Actualizar producto en carrito |
| DELETE | `/cart/product/:productId` | 🔒 | Eliminar producto del carrito |
| DELETE | `/cart/clear` | 🔒 | Vaciar carrito completo |

---

### 📦 Orders — `/api/orders`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/orders` | 🔒 | Obtener todas las órdenes |
| GET | `/orders/:id` | 🔒 | Obtener orden por ID |
| POST | `/orders` | 🔒 | Crear nueva orden |
| PUT | `/orders/:id` | 🔒 | Actualizar estado de orden |

---

### 📍 Addresses — `/api/address`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/address` | 🔒 | Obtener direcciones del usuario |
| GET | `/address/:addressId` | 🔒 | Obtener dirección por ID |
| POST | `/address` | 🔒 | Crear dirección |
| PUT | `/address/:addressId` | 🔒 | Actualizar dirección |
| DELETE | `/address/:addressId` | 🔒 | Eliminar dirección |

---

### 💳 Payment Methods — `/api/payment-method`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/payment-method` | 🔒 | Listar métodos de pago |
| GET | `/payment-method/:id` | 🔒 | Obtener método por ID |
| POST | `/payment-method` | 🔒 | Registrar método de pago |
| PUT | `/payment-method` | 🔒 | Actualizar método de pago |
| DELETE | `/payment-method` | 🔒 | Eliminar método de pago |

---

### ❤️ Wishlist — `/api/wishlist`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/wishlist` | 🔒 | Obtener todas las wishlists |
| GET | `/wishlist/:id` | 🔒 | Obtener wishlist de usuario |
| POST | `/wishlist` | 🔒 | Crear wishlist |
| PUT | `/wishlist/:id` | 🔒 | Agregar producto a wishlist |
| PUT | `/wishlist/:id` | 🔒| Eliminar producto de wishlist |
| DELETE | `/wishlist/:id` | 🔒 | Eliminar wishlist |

---

### ⭐ Reviews — `/api/reviews`

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/reviews` | 🔒 | Obtener todas las reseñas |
| GET | `/reviews/:id` | 🔒 | Obtener reseña por usuario |
| POST | `/reviews` | 🔒 | Crear reseña |
| PUT | `/reviews/:id` | 🔒 | Actualizar reseña |
| DELETE | `/reviews/:id` | 🔒 | Eliminar reseña |

---

## 🔑 Autenticación

El sistema usa **JSON Web Tokens (JWT)**. Al hacer login, el servidor devuelve un token que debe enviarse en cada petición protegida dentro del header HTTP:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

Las contraseñas se almacenan encriptadas usando **bcrypt** y nunca se guardan en texto plano.

---

## 🧪 Pruebas con Postman / Thunder Client

Puedes probar la API usando Postman, Thunder Client u otro cliente REST.

**Flujo de prueba sugerido:**

1. `POST /api/auth/register` — Crear tu usuario
2. `POST /api/auth/login` — Obtener el token JWT
3. Copia el token y agrégalo como `Bearer Token` en las peticiones protegidas
4. Explora los demás endpoints

---

## 🚧 Estado del proyecto

Este proyecto es parte de un ejercicio académico de desarrollo backend. Funcionalidades implementadas y probadas:

- [x] Autenticación (registro y login)
- [x] CRUD de productos
- [x] CRUD de categorías
- [x] CRUD de usuarios
- [x] Gestión de carrito
- [x] CRUD de address
- [x] CRUD de reviews
- [x] CRUD de wishlist
- [x] CRUD de payment-method
- [x] CRUD de orders
- [x] Middleware `isAdmin` para protección de rutas administrativas
- [] Faltantes: manejo de errores(errorHandler y netx(error)), validaciones (express-validator), paginación
(getProducts)
---

## 👩‍💻 Autora

**María G. Serna Domínguez**
Bióloga Molecular | Yogui | Desarrolladora en formación

Especialista en micología, bioinformática y reconstrucciones filogenéticas. Con la misma metodología que se aplica al estudio de hongos entomopatógenos —observación, iteración y paciencia— aprendiendo a construir sistemas backend.

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos.

---

*"De la biología molecular al desarrollo web: siempre explorando sistemas complejos."* 🍄
