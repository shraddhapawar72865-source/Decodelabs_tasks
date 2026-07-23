# TastyBite — Project 3 Database Integration

TastyBite is a responsive restaurant website upgraded from Project 2's JSON storage to MongoDB Atlas with Mongoose. The existing browser experience is preserved: it loads menu items, submits contact messages, and creates orders through the same API URLs.

## Project 3 features

- MongoDB Atlas connection through Mongoose and environment variables
- Validated `Menu`, `Order`, and `Contact` schemas with timestamps and indexes
- Full CRUD endpoints for menus, orders, and contact messages
- Menu name search, category filter, and pagination
- Dashboard totals for orders, non-cancelled revenue, and menu items
- Centralized JSON error handling and request IDs
- Automatic first-run seed of the six existing frontend dishes

## Configure MongoDB Atlas

1. Create a free MongoDB Atlas cluster and database user.
2. In Atlas **Network Access**, add your current IP address for development.
3. Copy `.env.example` to `.env` and replace the placeholder `MONGODB_URI` with the connection string from Atlas. Do not commit `.env`.
4. Install and run the project:

```bash
npm install
npm start
```

Open `http://localhost:3000`. On the first successful database connection, the existing six menu dishes are inserted into MongoDB.

## API reference

All responses include `success` and `requestId`. List endpoints accept `page` (default `1`) and `limit` (default `20`, maximum `100`).

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API health check |
| GET, POST | `/api/menu` | List/create menu items; accepts `search`, `category`, `page`, `limit` |
| GET, PUT, DELETE | `/api/menu/:id` | Read/update/delete a menu item by slug |
| GET, POST | `/api/orders` | List/create orders; accepts `status`, `page`, `limit` |
| GET, PUT, DELETE | `/api/orders/:id` | Read/update/delete an order by `TB-...` number |
| GET, POST | `/api/messages` | List/create contact messages |
| GET, PUT, DELETE | `/api/messages/:id` | Read/update/delete a contact message |
| GET | `/api/dashboard` | Total orders, revenue, and menu items |

### Example: create an order

```json
{
  "customerName": "Aarav Sharma",
  "customerEmail": "aarav@example.com",
  "items": [{ "id": "double-cheese-burger", "quantity": 2 }]
}
```

## Project 2 → Project 3 changes

### Modified existing files

- `server.js`: replaced in-file arrays and JSON-file reads/writes with MongoDB startup and routes.
- `package.json` and `package-lock.json`: added `mongoose` and `dotenv`.
- `.gitignore`: protects `.env` in addition to dependencies and old local JSON storage.
- `test.js`: tests the app shell and required Mongoose schema fields without needing a private Atlas connection.
- `README.md`: documents the database setup and API.

### New files

- `config/db.js`
- `models/Menu.js`, `models/Order.js`, `models/Contact.js`
- `controllers/menuController.js`, `controllers/orderController.js`, `controllers/contactController.js`, `controllers/dashboardController.js`
- `routes/menuRoutes.js`, `routes/orderRoutes.js`, `routes/contactRoutes.js`, `routes/dashboardRoutes.js`
- `middleware/asyncHandler.js`, `middleware/errorHandler.js`
- `data/defaultMenu.js`
- `.env` (local only) and `.env.example` (safe GitHub template)

The older Project 2 JSON files are not used by this version. MongoDB is the only runtime data store.
