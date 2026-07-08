# Reedhub

API DOCS:
# QA Testing Practice Platform - Backend API Documentation

Welcome to the Backend API for the QA Practice Platform. This API is purpose-built with standard features alongside hidden, intentional logical flaws and validation loopholes for QA students to uncover via manual or automated test execution.

## Core Setup Parameters
* **Base URL:** `http://localhost:5000`
* **Content-Type:** `application/json` (unless specified otherwise)

# Upgraded API Specification Blueprint - Editable Reference Contract

This specification maps the entire backend ecosystem, including newly deployed Chat and System Admin Auditing services.

---

## 1. Gateway Route Directory Matrix

| Endpoint Route Namespace | Primary HTTP Method | Authorization Header Hook Required? | Core Structural System Purpose | Target System Behavior Flaw / Loophole Pointer |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | NO | Instantiates a fresh user model profile. | **Missing Uniqueness Constraint Bug:** Bypasses verification of email redundancy. |
| `/api/auth/login` | `POST` | NO | Verifies access keys and yields a JWT session token. | **Token Permanence Security Defect:** Emits token parameters lacking expiration limits. |
| `/api/users/:id` | `GET` | YES | Extracts user profile data fields. | Yields active user profiles minus structural credential keys. |
| `/api/users/:id` | `PUT` | YES | Updates explicit name or bio strings. | **Critical IDOR/BOLA Bug:** Skips tracking verification mapping token owner to URL params. |
| `/api/users/:id` | `DELETE` | YES | Destroys targeted user accounts. | **Data Orphanage Logic Bug:** Purges profile headers but keeps posts intact. |
| `/api/users/friend/:friendId` | `POST` | YES | appends target ID into friends array lists. | Allows self-friending actions and unvalidated random inputs. |
| `/api/posts` | `POST` | YES | Creates write-ups with structural picture assets. | **Zero Validation Bug:** Accepts empty form fields completely. |
| `/api/posts` | `GET` | YES | Extracts global chronological posts timeline stream. | Yields reversed global data matrix lists. |
| `/api/posts/feed/liked` | `GET` | YES | Orders global posts sorted by trending interactions count. | Compiles ordered subset tracking maximum likes count length. |
| `/api/posts/:id/like` | `POST` | YES | Toggles specific user like markers. | Modifies and syncs targeted interaction states dynamically. |
| `/api/posts/:id/comment` | `POST` | YES | Appends text comments tracking arrays onto post nodes. | Inject strings directly into sub-post comment collections. |
| `/api/chat/:recipientId` | `GET` | YES | Extracts private conversation metrics logs. | Displays history arrays shared exclusively between target actors. |
| `/api/chat` | `POST` | YES | Forwards private message trace strings down the pipeline. | **Access Control Bug:** Allows zero-friend structural spam configurations. |
| `/api/admin/logs` | `GET` | YES | Extracts server side security trace audit streams. | **RBAC Privilege Escalation Bug:** Bypasses admin role checks on incoming tokens. |
| `/api/admin/announcement` | `POST` | YES | Adds arbitrary operational context markers into logs. | Writes diagnostics logging parameters across active records. |

---

## 2. Expanded Schema Model Context Payloads

### 2.1 Private Chat Packet Injection
* **Endpoint:** `POST /api/chat`
* **JSON Request Payload Structure:**
```json
{
  "recipientId": "usr_1782849000000",
  "message": "Executing automated verification trace suite packet..."
}

//Success Output Vector (211 Created)
{
  "id": "msg_1782859999999",
  "senderId": "usr_1234567890",
  "senderName": "QA Engineer Tester",
  "recipientId": "usr_1782849000000",
  "message": "Executing automated verification trace suite packet...",
  "timestamp": "2026-07-08T19:40:00.000Z"
}

{
  "message": "CRITICAL_TRACE_FLAG: Intercepting automated validation suite process run."
}

{
  "message": "Diagnostic alert distributed cleanly into data log stream."
}