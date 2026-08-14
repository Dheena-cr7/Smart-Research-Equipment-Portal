# OptimusPrime — Smart Research Equipment Portal

> A complete, production-quality research equipment management platform built for the **SKCET CSE Department / ICE Workshop 2026**.

---

## What Is OptimusPrime?

OptimusPrime is a full-stack web application that allows students to discover and book advanced research equipment across campus laboratories. Faculty can approve restricted bookings; admins manage the catalog.

**Live flows:**
- Students browse & book equipment
- System auto-confirms instant bookings, sets restricted ones to pending
- Conflict detection prevents double-booking (HTTP 409)
- Faculty approve or reject pending requests
- Admins create, view, and delete equipment
- Role-based dashboards and navigation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, Django 6, Django REST Framework |
| Auth | DRF Token Authentication |
| Database | SQLite |
| CORS | django-cors-headers |
| Frontend | React 18, Vite 6, Tailwind CSS 3 |
| HTTP Client | Axios |
| Routing | React Router DOM v6 |
| Icons | Lucide React |

---

## Folder Structure

```
Smart Research Equipment Access Portal/
├── manage.py
├── db.sqlite3
├── venv/
├── labnexus_backend/          # Django project settings
│   ├── settings.py
│   └── urls.py
├── core/                      # Main Django app
│   ├── models.py              # User, Equipment, Booking
│   ├── serializers.py
│   ├── views.py               # Auth, Equipment, Booking, Dashboard
│   ├── urls.py
│   ├── permissions.py         # IsOwner, IsFacultyOrAdmin, IsAdminUser
│   ├── admin.py               # Django admin registrations
│   └── management/
│       └── commands/
│           └── seed_data.py   # 12 equipment + 3 demo users
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env
    └── src/
        ├── main.jsx
        ├── App.jsx            # Routes + Providers
        ├── index.css          # Global styles + Tailwind
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ToastContext.jsx
        ├── services/
        │   ├── api.js         # Axios instance
        │   ├── auth.js
        │   ├── equipment.js
        │   └── bookings.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── EquipmentCard.jsx
        │   ├── StatusBadge.jsx
        │   ├── MetricCard.jsx
        │   ├── Modal.jsx
        │   ├── EmptyState.jsx
        │   ├── LoadingSkeleton.jsx
        │   ├── ProtectedRoute.jsx
        │   └── RoleGuard.jsx
        └── pages/
            ├── HomePage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── EquipmentDetailPage.jsx
            ├── MyBookingsPage.jsx
            ├── DashboardPage.jsx
            └── NotFoundPage.jsx
```

---

## Setup — Backend

### Prerequisites
- Python 3.11+
- pip

### Steps (Windows)

```powershell
# 1. Navigate to project root
cd "Smart Research Equipment Access Portal"

# 2. Activate virtual environment
.\venv\Scripts\activate

# 3. Install dependencies (already done, but for fresh install)
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter pillow

# 4. Run migrations
python manage.py migrate

# 5. Seed sample data (12 equipment + 3 demo users)
python manage.py seed_data

# 6. Create a superuser for Django Admin
python manage.py createsuperuser

# 7. Start the backend server
python manage.py runserver
```

Backend runs at: **http://127.0.0.1:8000**
Django Admin: **http://127.0.0.1:8000/admin/**

### Mac/Linux

```bash
source venv/bin/activate
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

---

## Setup — Frontend

### Prerequisites
- Node.js 18+
- npm

### Steps

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Student | `student_demo` | `Student@123` |
| Faculty | `faculty_demo` | `Faculty@123` |
| Admin | `admin_demo` | `Admin@123` |
| Superuser | `superadmin` | `SuperAdmin@123` |

---

## API Endpoint Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | Public | Create account, returns token |
| POST | `/api/auth/login/` | Public | Returns `{token, user, role}` |
| GET | `/api/auth/profile/` | Token | Get current user profile |
| GET | `/api/equipment/` | Public | List all equipment (search/filter) |
| GET | `/api/equipment/:id/` | Public | Equipment detail |
| POST | `/api/equipment/` | Admin | Create equipment |
| PUT/PATCH | `/api/equipment/:id/` | Admin | Update equipment |
| DELETE | `/api/equipment/:id/` | Admin | Delete equipment |
| POST | `/api/bookings/` | Token | Create booking (conflict check → 409) |
| GET | `/api/bookings/` | Token | List bookings (own for student, all for faculty/admin) |
| POST | `/api/bookings/:id/approve/` | Faculty/Admin | Approve pending booking |
| POST | `/api/bookings/:id/reject/` | Faculty/Admin | Reject pending booking |
| POST | `/api/bookings/:id/cancel/` | Owner/Admin | Cancel booking |
| GET | `/api/dashboard/stats/` | Faculty/Admin | Dashboard metrics |

### Query Parameters (Equipment)
- `?search=ftir` — search by name, lab, department
- `?status=available` — filter by status
- `?department=Chemical+Engineering` — filter by department
- `?requires_approval=true` — filter by approval requirement

### Query Parameters (Bookings)
- `?status=pending` — filter by status (for dashboard)

### Auth Header
```
Authorization: Token <your-token-here>
```

---

## Test Flow

### 1. Student — Book Equipment
1. Register at `/register` with role `student`
2. Browse equipment at `/`
3. Click any available equipment → View Details
4. Fill in start/end datetime + purpose → Submit
5. If equipment has `requires_approval=false` → booking confirmed immediately
6. Check `/my-bookings`

### 2. Conflict Detection
1. Login as student_demo
2. Book an equipment slot (e.g., 2026-09-01 09:00 → 11:00)
3. Try booking same equipment same slot again
4. Should see error: "This time slot is already booked"

### 3. Approval Flow
1. Book restricted equipment (requires_approval=true) → status becomes `pending`
2. Login as faculty_demo → navigate to `/dashboard`
3. See pending booking in the approvals table
4. Click "Approve" → status becomes `confirmed`

### 4. Rejection Flow
1. Same as above but click "Reject" instead

### 5. Admin Flow
1. Login as admin_demo → navigate to `/dashboard`
2. See Equipment Management section
3. Click "Add Equipment" → fill form → save
4. Equipment appears in catalog at `/`
5. Click "Delete" → confirm → removed from catalog

### 6. Security
- Logged-out user → `/my-bookings` → redirected to `/login`
- Student → `/dashboard` → redirected to `/`
- Student API call to approve booking → 403 Forbidden

---

## Deployment Notes

### Backend
- Set `DEBUG=False` in production
- Set `DJANGO_SECRET_KEY` environment variable
- Add your domain to `ALLOWED_HOSTS`
- Update `CORS_ALLOWED_ORIGINS` with your frontend domain
- Use PostgreSQL instead of SQLite for production
- Run `python manage.py collectstatic`

### Frontend
- Set `VITE_API_BASE_URL=https://your-backend-domain.com` in `.env.production`
- Run `npm run build` → deploy `dist/` to any static host

---

## Features Implemented

- [x] DRF Token Authentication (register + login)
- [x] Role-based access: student / faculty / admin
- [x] Equipment catalog with search + filter
- [x] Equipment detail page
- [x] Booking with datetime-local inputs
- [x] Conflict detection → HTTP 409
- [x] Auto-confirm (no approval needed) vs. pending (approval required)
- [x] Faculty approve/reject pending bookings
- [x] Student cancel own booking (with confirmation modal)
- [x] My Bookings page (student sees own, faculty/admin see all)
- [x] Dashboard with metrics + pending approvals table
- [x] Admin equipment CRUD (add/delete via dashboard)
- [x] Django admin with list_display, filters, search
- [x] Toast notifications
- [x] Loading skeletons
- [x] Empty states
- [x] Error states with human-readable messages
- [x] Mobile-responsive layout (hamburger nav, card layout on mobile)
- [x] Role-based navigation (student/faculty/admin)
- [x] Protected routes + RoleGuard
- [x] Seed data (12 equipment + 3 demo users)
- [x] CORS configured for Vite dev server
- [x] No hardcoded secrets

---

*Built for SKCET CSE Department — ICE Workshop 2026*
