**Delivery Application - Technical Flow Document**

---

### 1. **Overview**
This application is a delivery service backend built using **Fastify v4**, **MongoDB with Mongoose**, **JWT-based authentication**, and **Socket.IO** for real-time communication.

It supports multiple user roles:
- **Customer**: Can browse products, place orders.
- **Delivery Partner**: Can confirm and update orders.
- **Admin**: Has access to AdminJS panel for managing system data.

---

### 2. **Project Bootstrapping**

#### Entry File
```js
const start = async () => {
    await connectDB(process.env.MONGO_URL);
    const app = fastify();

    app.register(fastifySocketIO, { cors: { origin: '*' }, pingInterval: 10000, pingTimeout: 5000, transports: ['websocket'] });

    await registerRoutes(app);
    await buildAdminRouter(app);

    app.listen({ port: PORT, host: '0.0.0.0' });

    app.ready().then(() => {
        app.io.on('connection', (socket) => {
            socket.on('joinRoom', (orderId) => socket.join(orderId));
            socket.on('disconnect', () => {});
        });
    });
};
```

---

### 3. **Routing Structure**
All APIs are registered under the prefix `/api`.

#### `/api/categories`
- `GET` - Fetch all categories

#### `/api/products/:categoryId`
- `GET` - Get products under a category

#### `/api/order`
- `POST` - Create a new order (Customer)

#### `/api/order/:orderId/confirm`
- `POST` - Confirm order (Delivery Partner)

#### `/api/order/:orderId/status`
- `PATCH` - Update status (Delivery Partner)

#### `/api/order/:orderId`
- `GET` - Get order by ID

#### `/api/orders`
- `GET` - Get multiple orders (filtered)

#### `/api/customer/login`
- `POST` - Login customer with phone (creates if not exists)

#### `/api/delivery/login`
- `POST` - Login delivery partner with email/password

#### `/api/refresh-token`
- `POST` - Refresh JWT token

#### `/api/user`
- `GET`/`PATCH` - Fetch/update authenticated user

---

### 4. **Controllers**

#### Category
- `getAllCategories`: Fetches all categories.

#### Products
- `getProductsByCategoryId`: Gets products linked to a category.

#### Auth
- `loginCustomer`: Logs in a customer via phone (upserts).
- `loginDeliveryPartner`: Auth via email/password.
- `refreshToken`: Verifies refresh token and returns new tokens.
- `fetchUser`: Returns user info by ID & role.
- `updateUser`: Updates editable user fields.

#### Orders
- `createOrder`: Creates new order using customer & branch data.
- `confirmOrder`: Confirms order by delivery partner with location.
- `updateOrderStatus`: Updates status and broadcasts to clients via Socket.IO.
- `getOrderById`: Returns full order detail.
- `getOrders`: Filters and returns multiple orders.

---

### 5. **Socket.IO Integration**
- **Namespace**: Default
- **Events**:
  - `joinRoom(orderId)`: Clients join room named after order ID.
  - `orderConfirmed`: Broadcast to room when order is confirmed.
  - `liveTrackingUpdate` & `orderStatusUpdated`: Broadcast updates during delivery.

---

### 6. **Middleware and Utilities**
- **Token Verification (`verifyToken`)**: Applied globally for protected routes using `preHandler`.
- **tryCatchWrapper**: Handles async errors gracefully.
- **Messages & StatusCodes**: Centralized response messages and HTTP status codes defined in constants.

---

### 7. **Database Seeding**
Executed once at startup:
- Clears existing Categories and Products.
- Inserts predefined data.

---

### 8. **Security**
- JWT tokens (access & refresh) with role-based payloads.
- Route protection via `verifyToken`.
- Restricted field updates.
- Cookie-based session authentication for AdminJS.
- Password stored in plaintext temporarily; add **bcrypt hashing** for Admin users.

---

### 9. **Models & Relationships (Implied)**
- **Customer** & **DeliveryPartner** & **Admin**
- **Order**: Linked to Customer, Branch, DeliveryPartner, and Products.
- **Category** → **Product**

---

### 10. **AdminJS Integration**
- Admin panel available at `/admin`
- Uses cookie-based session authentication
- Integrated with MongoDB via `@adminjs/mongoose`
- Themes supported: dark (default), light, noSidebar
- Resources managed:
  - Customer, DeliveryPartner, Admin
  - Branch, Product, Order, Counter, Category
- Authentication logic:
  - `authenticate(email, password)` uses Admin model to verify login.
  - Session stored in MongoDB using `connect-mongodb-session`.

---

### 11. **AdminJS Setup Notes**

#### Dependencies
```bash
npm install adminjs @adminjs/fastify @adminjs/mongoose @adminjs/themes @fastify/session connect-mongodb-session @fastify/cookie
```

#### Environment Variables Required
```env
PORT=3000
MONGO_URL=your-mongodb-url
COOKIE_PASSWORD=your-secure-random-cookie-secret
NODE_ENV=development # or production
```

#### Code Setup Overview
- Initialize MongoDB connection with Mongoose.
- Define and register Mongoose models.
- Configure AdminJS instance with resources.
- Use `buildAuthenticatedRouter` with:
  - `authenticate(email, password)` to verify credentials from Admin model.
  - Mongo session store with `connect-mongodb-session`.
  - Session cookie options for secure login.

#### Password Handling
Currently, admin passwords are checked in plain text. It's recommended to use `bcrypt` for hashing and comparing passwords securely.

```js
import bcrypt from 'bcryptjs';

const user = await Admin.findOne({ email });
if (!user) return null;
const isValid = await bcrypt.compare(password, user.password);
if (!isValid) return null;
return Promise.resolve({ email });
```

---

### 12. **Potential Improvements**
- Add input validations (e.g., using `zod` or `fastify-schema`).
- Implement rate-limiting.
- Improve logging with structured loggers (e.g., `pino`).
- Secure WebSocket communications.
- Error monitoring (e.g., Sentry).
- Password hashing for Admin authentication.

---

### 13. **Conclusion**
This backend is modular, scalable, and designed with separation of concerns. It combines real-time functionality with REST APIs and supports multi-role access through a token-based and session-based auth system.

