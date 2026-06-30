# Reedhub

API DOCS:
# QA Testing Practice Platform - Backend API Documentation

Welcome to the Backend API for the QA Practice Platform. This API is purpose-built with standard features alongside hidden, intentional logical flaws and validation loopholes for QA students to uncover via manual or automated test execution.

## Core Setup Parameters
* **Base URL:** `http://localhost:5000`
* **Content-Type:** `application/json` (unless specified otherwise)

---

## 1. Authentication Endpoints

### 1.1 Register User Account
* **Endpoint:** `POST /api/auth/register`
* **Payload Structure:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}

RESPONSE
{
  "message": "User registered successfully!",
  "user": {
    "id": "usr_1719777600000",
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Hello, I am practicing QA testing!",
    "avatar": "",
    "friends": [],
    "createdAt": "2026-06-30T19:30:00.000Z"
  }
}



Endpoint: POST /api/auth/login