# 🏘️ Multi-Tenant Property Listing Platform

A **production-ready full-stack property listing platform** built with **Next.js 14** and **NestJS**, supporting **multi-tenancy**, **role-based access control**, and a complete **property lifecycle** from draft to published listings.

This project was built as part of a **Full-Stack Practical Exam** for the **Intern Staff Developer (Hybrid)** role.

---

## 🎯 Live Deployment

### 🌐 Frontend (Vercel)
👉 https://property-listing-frontend.vercel.app

### 🔗 Backend API (Render)
👉 https://property-listing-backend-6fb4.onrender.com

### 📘 API Documentation (Swagger)
👉 https://property-listing-backend-6fb4.onrender.com/api/docs

### ❤️ Health Check
👉 https://property-listing-backend-6fb4.onrender.com/health

---

## 📁 Repositories

**Frontend**
👉 https://github.com/master12-ctr/property-listing-frontend.git

**Backend**
👉 https://github.com/master12-ctr/property-listing-backend.git

---

## 📋 Project Overview

This platform enables users to **browse, manage, and publish property listings** in a **multi-tenant environment**, with three distinct roles:

* **Admin** – System oversight and analytics  
* **Property Owner** – Property creation and publishing  
* **Regular User** – Browsing, favorites, and contacting owners  

The system enforces **strict business rules**, **tenant isolation**, and **secure authentication**, while remaining **simple, scalable, and production-ready**.

---

## ✅ Exam Requirements Checklist

### Backend
- ✅ JWT authentication with RBAC  
- ✅ Pagination & filtering (location, price, status)  
- ✅ Soft deletes using `deletedAt`  
- ✅ Transactional publishing logic  
- ✅ Environment-based configuration  
- ✅ Proper HTTP status codes & error handling  
- ✅ Multi-tenant data isolation  
- ✅ Cloud image storage (Cloudinary)  

### Frontend
- ✅ Login & registration pages  
- ✅ Public property listing (SSR)  
- ✅ Property detail page  
- ✅ Role-based dashboards  
- ✅ Persisted authentication  
- ✅ Favorites synced across tabs  
- ✅ Optimistic UI updates  
- ✅ Protected routes with loading & error states  
- ✅ Responsive UI (Tailwind CSS)  

### Deployment
- ✅ Frontend: Vercel  
- ✅ Backend: Render  
- ✅ Database: MongoDB Atlas  
- ✅ Image CDN: Cloudinary  

---

## 🧰 Tech Stack

### Frontend
* **Framework:** Next.js 14 (App Router)
* **State Management:** TanStack Query
* **Styling:** Tailwind CSS
* **Authentication:** JWT + HttpOnly cookies

### Backend
* **Framework:** NestJS (TypeScript)
* **Architecture:** Domain-Driven Design (DDD)
* **Database:** MongoDB + Mongoose
* **Authentication:** JWT (Access & Refresh Tokens)
* **Image Storage:** Cloudinary
* **API Docs:** Swagger / OpenAPI

---

## 🛠️ Technical Decisions

### Why Next.js?
* Server-side rendering for SEO and fast first paint  
* App Router for clean routing  
* Image optimization via `next/image`  
* TypeScript-first developer experience  

### Why TanStack Query?
* Purpose-built for server state  
* Automatic caching and refetching  
* Native optimistic updates  
* Minimal boilerplate compared to Redux  

### Why NestJS?
* Opinionated and scalable architecture  
* Built-in dependency injection  
* Guards and decorators simplify RBAC  
* Excellent Swagger integration  

### Why MongoDB?
* Flexible schema for evolving property data  
* High read performance  
* Native JSON document structure  
* Horizontal scalability & geospatial querying  

---

## 🔐 Access Control Model

### 🛡️ Three-Layer Security

#### 1️⃣ Tenant Isolation
* `X-Tenant-ID` extracted by middleware  
* All queries automatically scoped to tenant  

#### 2️⃣ Authentication
* JWT access tokens (15 minutes)  
* Refresh token rotation  
* Secure password hashing (bcrypt)  

#### 3️⃣ Authorization
* Role-based permissions  
* Resource ownership checks  
* Admin override privileges  

---

## 🏠 Property Lifecycle

```text
DRAFT → [Publish] → PUBLISHED → [Archive] → ARCHIVED
```

**Rules enforced at domain level:**
* Published properties cannot be edited  
* Validation required before publishing  
* Only owners can publish  
* Soft deletes only (no hard deletion)  

---

## ⭐ Key Features

### 🏘️ Property Management
* Create, update, publish, and archive listings  
* Multiple image uploads (Cloudinary)  
* Location & price filtering  
* Pagination & sorting  

### ❤️ Favorites System
* Optimistic UI updates  
* Synced across tabs  
* Persistent user favorites  

### 💬 Messaging
* Users can contact property owners  
* Read/unread tracking  
* Admin visibility  

### 📊 Admin Metrics
* Property counts  
* User overview  
* System health visibility  

---

## 🧪 Demo Accounts

| Role  | Email              | Password             |
|------|--------------------|----------------------|
| Admin | admin@example.com | SecureAdminPass123 |
| Owner | owner@example.com | OwnerPass123 |
| User  | user@example.com  | UserPass123 |

> You may also register new users for testing.

---

## 🚀 Environment Variables

### Frontend
```env
NEXT_PUBLIC_API_URL=https://property-listing-backend-6fb4.onrender.com
```

### Backend
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## 🏆 Hardest Technical Challenges

### Multi-Tenant Data Isolation
Ensuring strict tenant separation without duplicating logic.

### Property Lifecycle Enforcement
Preventing illegal state transitions at both API and domain levels.

### Optimistic UI with Cross-Tab Sync
Safely combining TanStack Query with persistent state.

### Production CORS Configuration
Coordinating secure communication between Vercel and Render.

---

## 📈 Scalability Considerations

### What Would Break First
* Database connection limits  
* Image upload rate limits  
* JWT verification overhead  

### Planned Mitigations
* Redis caching  
* Message queues for uploads  
* Database indexing & sharding  
* WebSockets for real-time features  

---

## 📝 Exam Notes

* **Time Taken:** 7 days  
* **Focus:** Correctness, clarity, and production readiness  
* Incomplete features were intentionally avoided in favor of strong fundamentals  

---

## 📄 License

This project was created as part of a technical assessment.  
All rights reserved by the candidate.

---

Built with ❤️ by **Tadese Worku**  
📅 **Submission Date:** January 22, 2026
