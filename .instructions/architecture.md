# Architecture & Design Document

## 1. System Overview
**Secure Mailer Service** is an isolated microservice designed to handle transactional emails. It decouples email delivery from the legacy Laravel system, mitigating security risks (spam/open relay) and ensuring high availability via queuing.

## 2. High-Level Data Flow
1. **Trigger:** Legacy System (Laravel 5.7) sends a POST request to `/api/v1/send`.
2. **Gateway:** NestJS Controller validates the API Key and Payload (DTO).
3. **Queue:** Valid requests are pushed to a Redis Queue (`BullMQ`).
4. **Processing:** A Worker picks up the job.
   - Retrieves the specified **HTML Template**.
   - Injects dynamic variables (Context).
5. **Delivery:** Sends the email via **SMTP2GO** (SMTP Protocol).
6. **Management:** Admins can view/edit templates via a lightweight internal UI.

## 3. Technology Stack
- **Framework:** NestJS (Node.js).
- **Language:** TypeScript.
- **Queue Engine:** BullMQ (Redis).
- **Email Provider:** SMTP2GO (via `nodemailer`).
- **Template Engine:** **Handlebars (hbs)**.
  - *Why?* Secure (logic-less), fast, excellent integration with NestJS MVC for the Admin UI and Nodemailer for sending.

## 4. Template Management System (Simple UI)
To fulfill the requirement of editing and visualizing templates without external heavy CMS:
- **Approach:** NestJS MVC (Model-View-Controller).
- **Engine:** Handlebars (`.hbs`).
- **Route:** `/admin/templates` (Protected by Basic Auth or specific API Key).
- **Features:**
  - List all templates.
  - Live Preview (rendering with dummy data).
  - Code Editor (Monaco or simple Textarea) for HTML editing.
- **Storage:**
  - *Phase 1:* Filesystem (`/src/templates`).
  - *Phase 2:* Database (PostgreSQL).

## 5. Security Constraints
- **Isolation:** Service allows NO direct public access to send endpoints.
- **Sanitization:** All variables injected into templates must be escaped by default (Handlebars does this).
- **Rate Limiting:** `ThrottlerModule` configured to prevent flooding from the Legacy backend IP.

## 6. Integration: SMTP2GO
- **Docs:** https://developers.smtp2go.com/docs/introduction-guide
- **Method:** SMTP Transport (Port 2525 or 587).
- **Credentials:** Managed via Environment Variables (`SMTP_USER`, `SMTP_PASS`).