# Resolvio Backend

Node.js, Express, and MongoDB backend for the Resolvio complaint management modules.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Update `.env` with your MongoDB connection string and JWT secret.

## Core Endpoints

- `POST /api/auth/register` - student registration
- `POST /api/auth/login` - student/admin login using `identifier`, `password`, `role`
- `GET /api/auth/me` - current authenticated user
- `GET /api/student/dashboard`
- `POST /api/student/complaints`
- `GET /api/student/complaints`
- `GET /api/student/complaints/:id`
- `GET /api/student/notifications`
- `PATCH /api/student/notifications/:id/read`
- `GET /api/student/profile`
- `PUT /api/student/profile`
- `POST /api/student/feedback`
- `GET /api/admin/dashboard`
- `GET /api/admin/complaints`
- `PATCH /api/admin/complaints/:id`
- `GET /api/admin/users`
- `POST /api/admin/users/admins`
- `PATCH /api/admin/users/:id/status`
- `GET /api/admin/reports`
- `GET /api/categories`
- `POST /api/categories`

## Complaint Image Upload

Send complaint images as `multipart/form-data` with the file field named `image`.

```http
POST /api/student/complaints
Authorization: Bearer STUDENT_TOKEN
Content-Type: multipart/form-data
```

Form fields:

```text
complaintTitle: Fan not working
category: Electrical
roomNumber: 101
description: The ceiling fan stopped working.
image: select an image file
```

Uploaded images are stored in `uploads/`, saved in MongoDB as `/uploads/file-name`, and returned as `imageUrl` in complaint responses.

## Admin Login

Create the first admin by inserting an admin user in MongoDB or temporarily exposing a setup route. After one admin exists, use:

```http
POST /api/auth/login
{
  "identifier": "admin@example.com",
  "password": "password123",
  "role": "Admin"
}
```
