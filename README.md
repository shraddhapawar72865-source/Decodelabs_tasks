# TastyBite — DecodeLabs Full Stack Projects 1–4

TastyBite is a responsive restaurant ordering website built during the DecodeLabs Full Stack Development internship. This repository contains the final, cumulative version of Projects 1–4: the frontend, Express API, MongoDB database layer, and browser-to-API integration.

## Project milestones

| Project | Internship requirement | TastyBite implementation |
| --- | --- | --- |
| **Project 1** | Responsive frontend interface using HTML, CSS, and JavaScript | Responsive restaurant UI, navigation, menu filters, search, cart, contact form, mobile menu, and accessible live-status areas. |
| **Project 2** | Backend API development with GET/POST endpoints and input validation | Express server with menu, orders, contact messages, health, and dashboard API endpoints plus JSON errors and validation. |
| **Project 3** | Database integration and CRUD operations | MongoDB Atlas with Mongoose `Menu`, `Order`, and `Contact` schemas; create, read, update, and delete API operations. |
| **Project 4** | Frontend–backend integration with asynchronous requests, dynamic data, loading, and error handling | The browser loads and filters menu data from the API, creates orders and contact messages, and displays loading, success, empty, and error states. |

## Features

- Responsive restaurant website with menu browsing, search, category filtering, cart, checkout, and contact form
- Dynamic menu data from `GET /api/menu`, including server-side search and category filtering
- Asynchronous contact-message and order submissions with user-facing loading and error feedback
- MongoDB/Mongoose schemas with validation, timestamps, indexes, and default menu seeding
- CRUD APIs for menus, orders, and contact messages
- Dashboard totals, request IDs, centralized error handling, and a health endpoint

## Technology

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js and Express
- Database: MongoDB Atlas and Mongoose

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`, then enter your MongoDB Atlas connection string:

   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   ```

3. Start the application:

   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000).

On the first successful database connection, TastyBite seeds its initial six menu dishes. Never upload your `.env` file because it contains private database credentials.

## API reference

All JSON responses include `success` and `requestId`. List endpoints accept `page` (default `1`) and `limit` (default `20`, maximum `100`).

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API health check |
| GET, POST | `/api/menu` | List/create menu items; supports `search`, `category`, `page`, `limit` |
| GET, PUT, DELETE | `/api/menu/:id` | Read/update/delete one menu item by slug |
| GET, POST | `/api/orders` | List/create orders; supports `status`, `page`, `limit` |
| GET, PUT, DELETE | `/api/orders/:id` | Read/update/delete one order by order number |
| GET, POST | `/api/messages` | List/create contact messages |
| GET, PUT, DELETE | `/api/messages/:id` | Read/update/delete one contact message |
| GET | `/api/dashboard` | Order, revenue, and menu-item totals |

### Example: create an order

```json
{
  "customerName": "Aarav Sharma",
  "customerEmail": "aarav@example.com",
  "items": [{ "id": "double-cheese-burger", "quantity": 2 }]
}
```

## Verify the project

Run the automated backend and integration checks with:

```bash
npm test
```

## Repository

GitHub: [shraddhapawar72865-source/Decodelabs_tasks](https://github.com/shraddhapawar72865-source/Decodelabs_tasks)
