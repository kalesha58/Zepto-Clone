
# 📦 Order Controller Documentation

This document provides complete documentation for all controller functions related to **order management**, including order creation, confirmation, status updates, and retrieval.

_Last Updated: 2025-04-12_

---

## ✅ Routes & Controller Overview

| Method | Route                                | Description                              | Access                 |
|--------|--------------------------------------|------------------------------------------|------------------------|
| POST   | `/orders`                            | Create a new order                        | Customer (Private)     |
| PATCH  | `/orders/:orderId/confirm`           | Confirm an available order               | Delivery Partner (Private) |
| PATCH  | `/orders/:orderId/status`            | Update status of an order                | Delivery Partner (Private) |
| GET    | `/orders`                            | Get all orders with filters              | Admin / Internal       |
| GET    | `/orders/:orderId`                   | Get details of a single order            | Admin / Internal       |

---

## 🛒 `createOrder(req, res)`

### Description
Creates a new order for the logged-in customer by associating it with a branch and item list.

### Route
`POST /orders`

### Access
Private – Customer only

### Request Body
```json
{
  "items": [
    { "id": "itemId", "item": "itemObjectId", "count": 2 }
  ],
  "branch": "branchId",
  "totalPrice": 100
}
```

### Validations
- Must include at least one item.
- Must include a valid branch ID.
- `totalPrice` must be present.

### Success Response
```json
{
  "message": "Order created successfully",
  "order": { /* new order object */ }
}
```

### Possible Errors
- 400: Items missing or invalid
- 404: Customer or branch not found

---

## 📦 `confirmOrder(req, res)`

### Description
Allows a delivery partner to confirm an available order. Updates delivery partner info and sets tracking location.

### Route
`PATCH /orders/:orderId/confirm`

### Access
Private – Delivery Partner only

### Request Body
```json
{
  "deliveryPersonLocation": {
    "latitude": 12.34,
    "longitude": 56.78,
    "address": "Some Street"
  }
}
```

### Validations
- Order must be in `available` status.
- Order must not already have a delivery partner.
- Delivery location must be provided.

### Success Response
```json
{
  "message": "Order confirmed successfully",
  "order": { /* updated order */ }
}
```

### Possible Errors
- 400: Order already taken or no location provided
- 404: Order or delivery partner not found

---

## 🔄 `updateOrderStatus(req, res)`

### Description
Updates the order's delivery status (e.g. confirmed → delivered).

### Route
`PATCH /orders/:orderId/status`

### Access
Private – Delivery Partner only

### Request Body
```json
{
  "status": "delivered",
  "deliveryPersonLocation": {
    "latitude": 12.34,
    "longitude": 56.78,
    "address": "Updated Address"
  }
}
```

### Valid Status Transitions
- `confirmed`
- `delivered`
- `cancelled`

### Validations
- Order must not already be `cancelled` or `delivered`.
- Delivery partner must match order.
- Location required.

### Success Response
```json
{
  "message": "Order status updated successfully",
  "order": { /* updated order */ }
}
```

### Possible Errors
- 400: Invalid status or already finalized
- 403: Not authorized to update order
- 404: Order or delivery partner not found

---

## 📥 `getOrders(req, res)`

### Description
Fetches all orders with optional filters.

### Route
`GET /orders`

### Access
Private – Admin/Internal (can be adjusted with role-based filtering)

### Query Parameters
- `status`: Filter by status
- `customerId`: Filter by customer
- `deliveryPartnerId`: Filter by assigned delivery partner
- `branchId`: Filter by branch

### Success Response
```json
{
  "message": "Orders fetched successfully",
  "orders": [ /* order list */ ]
}
```

---

## 🔍 `getOrderById(req, res)`

### Description
Fetches a specific order by its ID, including populated references.

### Route
`GET /orders/:orderId`

### Access
Private – Admin/Internal

### Success Response
```json
{
  "message": "Order fetched successfully",
  "order": { /* single order object */ }
}
```

### Possible Errors
- 404: Order not found

---

## 🧾 Constants: `Messages`

Ensure these constants are available in `constants/messages.js`:
```js
export default {
  USER_NOT_FOUND: "Customer not found",
  BRANCH_NOT_FOUND: "Branch not found",
  DELIVERY_PARTNER_NOT_FOUND: "Delivery partner not found",
  ORDER_NOT_FOUND: "Order not found",
  ORDER_NOT_AVAILABLE: "Order is not available for confirmation",
  LOCATION_REQUIRED: "Delivery person location is required",
  ORDER_CONFIRMED: "Order confirmed successfully",
  ORDER_ALREADY_FINALIZED: "Cannot update a completed or cancelled order",
  INVALID_STATUS: "Invalid order status provided",
  NOT_AUTHORIZED: "You are not authorized to modify this order",
  ORDER_STATUS_UPDATED: "Order status updated successfully",
};
```

---

## 🧠 Suggestions

- 💡 Use Mongoose middlewares to auto-populate certain fields.
- 🔐 Enforce RBAC (role-based access control) with middleware.
- 🧪 Add unit & integration tests for each controller.
- 📈 Implement rate limiting on order creation to prevent abuse.

---
