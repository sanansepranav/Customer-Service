# Security Policy

## Supported Versions

Currently, only the `main` branch (v1.0.x) is actively supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Implemented Security Features

The Prince Tailor Studio application implements the following security measures:

1. **Authentication & Authorization**: 
   - Uses secure session cookies (`jose` library for JWTs) with `HttpOnly`, `Secure`, and `SameSite=Strict` flags.
   - All `/api/*` endpoints strictly verify session existence before performing read/write operations.
2. **HTTP Security Headers** (Enforced in `next.config.ts`):
   - `Content-Security-Policy`: Restricts the sources of executable scripts, stylesheets, and images to prevent XSS (Cross-Site Scripting).
   - `X-Frame-Options: DENY`: Prevents the site from being framed, mitigating Clickjacking attacks.
   - `X-Content-Type-Options: nosniff`: Prevents browsers from MIME-sniffing a response away from the declared content type.
   - `Strict-Transport-Security (HSTS)`: Enforces HTTPS connections exclusively for all subsequent requests.
   - `Referrer-Policy: strict-origin-when-cross-origin`: Protects referrer data when crossing origins.
3. **Database Security**:
   - Uses Prisma ORM to prevent SQL Injection attacks.
   - Environment variables isolate database connection strings (`DATABASE_URL`).

## Reporting a Vulnerability

If you discover a security vulnerability within Prince Tailor Studio, please do NOT create a public issue. 
Instead, please send an email to the repository owner or the lead developer.

We will acknowledge receipt of your vulnerability report within 48 hours and strive to send you regular updates about our progress. 

Thank you for helping keep our application secure!
