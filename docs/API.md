# 📡 API Reference

Base URL: `http://localhost:8000`  
Interactive Swagger UI: `http://localhost:8000/docs`  
ReDoc: `http://localhost:8000/redoc`

---

## Authentication

All protected endpoints require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

---

## Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login with email/password | ❌ |
| `POST` | `/api/auth/google` | Login with Google token | ❌ |
| `POST` | `/api/auth/forgot-password` | Send password reset email | ❌ |
| `POST` | `/api/auth/reset-password` | Reset password with token | ❌ |
| `GET`  | `/api/auth/me` | Get current user profile | ✅ |

#### POST `/api/auth/register`
```json
{
  "name": "Srinjoy Paul",
  "email": "user@example.com",
  "password": "securepassword"
}
```
Returns: `{ "access_token": "...", "token_type": "bearer" }`

#### POST `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```
Returns: `{ "access_token": "...", "token_type": "bearer", "user": { ... } }`

---

### Crops

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET`    | `/api/crops` | List all user's crops | ✅ |
| `POST`   | `/api/crops` | Add a new crop | ✅ |
| `GET`    | `/api/crops/{id}` | Get crop details | ✅ |
| `PUT`    | `/api/crops/{id}` | Update crop | ✅ |
| `DELETE` | `/api/crops/{id}` | Delete crop | ✅ |

#### POST `/api/crops`
```json
{
  "name": "Wheat",
  "location": "Kolkata, India",
  "area_hectares": 2.5,
  "soil_type": "loamy",
  "planting_date": "2026-01-15"
}
```

---

### ML Recommendations

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/recommendations` | Get AI crop recommendations | ✅ |

#### POST `/api/recommendations`
```json
{
  "temperature": 28.5,
  "humidity": 72,
  "ph": 6.5,
  "rainfall": 120,
  "nitrogen": 90,
  "phosphorus": 42,
  "potassium": 43
}
```
Returns: `{ "crop": "rice", "confidence": 0.94, "alternatives": [...] }`

---

### Contact

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/contact` | Send a contact message | ✅ |

#### POST `/api/contact`
```json
{
  "name": "Srinjoy Paul",
  "email": "user@example.com",
  "message": "I have a question about..."
}
```

---

### ML Service (Port 8001)

| Method | Endpoint | Description |
|---|---|---|
| `GET`  | `/health` | Health check |
| `POST` | `/predict` | Crop prediction from soil+weather data |
| `GET`  | `/model-info` | Model accuracy and metadata |

---

## Error Responses

All errors follow this structure:
```json
{
  "detail": "Error message here"
}
```

| Status | Meaning |
|---|---|
| `400` | Bad request / validation error |
| `401` | Unauthorized — missing or invalid token |
| `404` | Resource not found |
| `422` | Unprocessable entity — invalid input format |
| `500` | Internal server error |
