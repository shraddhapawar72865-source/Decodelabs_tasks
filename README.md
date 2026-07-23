# TastyBite API

Project 2 submission for the DecodeLabs Full Stack Development internship. TastyBite pairs the original responsive food-ordering frontend with an Express API that handles real menu data, validated orders, and contact messages.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service health and timestamp |
| GET | `/api/menu` | All menu items; supports `category` and `search` query parameters |
| GET | `/api/menu/:id` | One menu item |
| POST | `/api/orders` | Create a validated food order |
| GET | `/api/orders/:id` | Retrieve a saved order |
| POST | `/api/messages` | Submit a validated contact message |

### Create an order

```json
{
  "customerName": "Aarav Sharma",
  "customerEmail": "aarav@example.com",
  "items": [{ "id": "double-cheese-burger", "quantity": 2 }]
}
```

The API uses consistent JSON envelopes, appropriate `200`, `201`, `400`, and `404` status codes, a request ID header/body field, payload-size protection, and centralized error handling. Demo submissions are stored in `data/store.json`, which is created automatically and intentionally ignored by Git.
