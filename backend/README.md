# Osborne Motors Backend

FastAPI backend for the Osborne Motors inventory and lead capture flow.

## Endpoints

- `GET /health`
- `GET /vehicles`
- `GET /vehicles/filters`
- `GET /vehicles/{slug}`
- `POST /leads`

## Local Docker Run

```bash
docker compose up --build
```

API will be available at `http://localhost:8001`.
Swagger docs: `http://localhost:8001/docs`.
