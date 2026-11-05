# API Reference

Base URL: `http://localhost:3333` (configurable with `PORT`). Interactive docs: `/swagger`.

All routes except `POST /auth` require the header `Authorization: Bearer <accessToken>`. Tokens expire after 1 hour. Request bodies are validated with Zod; invalid bodies return `400` with `{ message: "validation failed", errors: { formErrors, fieldErrors } }`.

Sample requests: [`client.http`](../client.http).

## Authentication

### `POST /auth`

Public.

```json
{ "email": "admin@crm.com", "password": "password" }
```

| Status | Meaning                                |
| ------ | -------------------------------------- |
| 201    | `{ "accessToken": "<jwt>" }`           |
| 401    | Wrong credentials or unknown e-mail    |
| 409    | Salesperson is inactive                |
| 400    | Validation error                       |

## Salespersons (manager only)

Non-manager callers receive `403`.

Public representation of a salesperson: `{ name, email, phone, role }`.

### `POST /salespersons`

| Field      | Rules                              |
| ---------- | ---------------------------------- |
| `name`     | string, min 3 chars                |
| `email`    | valid e-mail, unique               |
| `password` | string, min 6 chars                |
| `phone`    | string                             |
| `role`     | optional (`salesperson`, `manager`) |

Responses: `201` `{ message, salesperson }`, `400`, `401`.

### `GET /salespersons?page=1`

Lists salespersons, 20 per page. `page` defaults to `1` and must be >= 1.
Response `200`: `{ message, salespersons: [...] }`.

### `GET /salespersons/:id`

Response `200`: `{ message, salesperson }`. Errors: `403`, `404`.

### `PATCH /salespersons/:id`

All fields optional: `name` (min 3), `email`, `phone`, `role`.
Response `200`. Errors: `403`, `404`, `409` (e-mail already in use).

### `PATCH /salespersons/password/:id`

```json
{ "newPassword": "min-6-chars" }
```

Response `200`. Errors: `403`, `404`.

### `DELETE /salespersons/:id`

Soft delete: the salesperson is marked inactive and can no longer authenticate. Response `204`. Errors: `403`, `404`.

## Clients

Public representation of a client: `{ name, email, phone, status }`.

### `POST /clients`

Any authenticated user. The logged-in salesperson becomes the client's first owner and creator.

| Field     | Rules                                         |
| --------- | --------------------------------------------- |
| `name`    | string, min 3 chars                           |
| `email`   | valid e-mail, unique                          |
| `phone`   | string                                        |
| `segment` | string                                        |
| `status`  | optional (`lead` default, `active`, `inactive`) |

Responses: `201` `{ message, client }`, `409` (client already exists), `400`.

## Not yet exposed over HTTP

Use cases exist and are unit-tested for: fetching/getting/updating/inactivating clients and registering, fetching, getting, updating, marking as lost and marking as delivered for sales opportunities. See the [roadmap](../README.md#roadmap).
