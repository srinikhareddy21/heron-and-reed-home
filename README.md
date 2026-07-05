# Heron & Reed — Full-Stack E-Commerce Platform

A production-style full-stack e-commerce storefront for premium furniture and home décor,
built with a **TanStack Start (React + TypeScript)** frontend and a **Node.js + Express +
MongoDB** backend. Every product, category, cart, wishlist, order, and user record is served
from a real REST API and persisted in MongoDB — there is no static or mock data left in the
frontend.

> 🎓 Built as **Task 1** of the **CodeAlpha** Web Development Internship.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [MongoDB Setup](#mongodb-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [API Overview](#api-overview)
- [Future Enhancements](#future-enhancements)
- [Internship Information](#internship-information)
- [Author](#author)
- [License](#license)

---

## Overview

Heron & Reed started as a static, front-end-only storefront concept and has been migrated into
a complete full-stack application. The catalog (products and categories), authentication,
shopping cart, wishlist, checkout, and order history are all backed by a dedicated Express API
and a MongoDB database — the frontend no longer contains any hardcoded product or user data.

The UI/UX, layout, and visual design are untouched from the original concept; everything below
the surface — data fetching, authentication, and persistence — is now real.

## Key Features

**Storefront**
- Homepage with hero, shop-by-category, featured products, new arrivals, and best sellers — all
  loaded from the database
- Full shop page with category filters and live search
- Category landing pages with dynamically filtered products
- Product detail pages with specifications, care instructions, and "you may also like"
  recommendations pulled from the same category
- Client-side recently-viewed tracking
- Relevance-ranked product & category search with match highlighting

**Accounts & Authentication**
- Email/password registration and login (JWT + bcrypt password hashing)
- Persistent sessions across page refreshes (JWT stored client-side; profile, cart, wishlist,
  and orders are reloaded from MongoDB via the API on load — not from localStorage)
- Profile updates (name, email) and address management

> **Note on client-side storage:** the only data kept in the browser's `localStorage` is the
> JWT auth token (`api.ts`) and an optional, purely cosmetic "recently viewed products" list
> (`recently-viewed.ts`). Cart, wishlist, orders, profile, and addresses are never written to
> localStorage — they live exclusively in MongoDB and are fetched through the API.

**Shopping**
- Per-user cart and wishlist, persisted in MongoDB and isolated per account
- Guest (signed-out) cart/wishlist is session-only in the browser, as is standard for most
  storefronts that require sign-in to save a cart
- Checkout with multiple payment method UIs (card, UPI, cash on delivery, etc.) and address
  capture
- Server-side order pricing: every order is re-priced against the live `Product` collection at
  submit time so the client can never manipulate what is charged
- Order history with itemized order detail

**Data isolation**
- Every cart, wishlist, and order is scoped to the authenticated user's ID; there is no way for
  one account to see another account's data

## Tech Stack

| Layer          | Technology                                              |
|----------------|----------------------------------------------------------|
| Frontend       | TanStack Start, TanStack Router, TanStack Query, React 19, TypeScript |
| Styling        | Tailwind CSS, shadcn/ui (Radix primitives)              |
| Backend        | Node.js, Express.js                                      |
| Database       | MongoDB with Mongoose                                    |
| Authentication | JSON Web Tokens (JWT), bcrypt password hashing            |
| Tooling        | Vite, ESLint, Prettier                                    |

## System Architecture

```
┌──────────────────────────┐         HTTPS / JSON          ┌───────────────────────────┐
│        Frontend           │ ─────────────────────────────► │          Backend            │
│  TanStack Start (React)   │ ◄───────────────────────────── │  Node.js + Express API      │
│  - Routes & components    │        REST endpoints          │  - Auth (JWT + bcrypt)       │
│  - TanStack Query cache   │                                 │  - Products & Categories    │
└──────────────────────────┘                                 │  - Cart / Wishlist / Orders │
                                                               └─────────────┬─────────────┘
                                                                             │ Mongoose
                                                                             ▼
                                                                    ┌─────────────────┐
                                                                    │     MongoDB       │
                                                                    │  Users, Products,  │
                                                                    │  Categories, Carts, │
                                                                    │  Wishlists, Orders,  │
                                                                    │  Addresses           │
                                                                    └─────────────────┘
```

- The frontend never talks to MongoDB directly — all reads and writes go through the Express
  REST API.
- Product and category data is fetched from `/api/products` and `/api/categories` and cached
  client-side with TanStack Query (prefetched in the root route loader so pages render without
  a data flash).
- Cart, wishlist, order, and profile data require a valid JWT and are always scoped to
  `req.userId`, derived from the token — never from client-supplied identifiers.

## Project Structure

```
heron-and-reed-home-main/
├── backend/                      # Express + MongoDB API
│   ├── src/
│   │   ├── app.js                # Express app & route mounting
│   │   ├── server.js             # Entry point — connects DB, starts server
│   │   ├── seed.js               # Seeds MongoDB from src/data/*.json
│   │   ├── config/db.js          # Mongoose connection
│   │   ├── controllers/          # Auth controller
│   │   ├── middleware/           # requireAuth, error handling
│   │   ├── models/                # User, Product, Category, Cart, Wishlist, Order, Address
│   │   ├── routes/                # /api/auth, /api/products, /api/categories,
│   │   │                          #   /api/cart, /api/wishlist, /api/orders
│   │   ├── utils/token.js        # JWT signing helper
│   │   └── data/                  # Seed data (products.json, categories.json)
│   └── package.json
│
├── src/                           # TanStack Start frontend
│   ├── routes/                   # File-based routes (home, shop, category, product, cart,
│   │                              #   wishlist, checkout, account, order-success, sitemap)
│   ├── components/                # ProductCard, SiteHeader, SiteFooter, shadcn/ui primitives
│   ├── lib/
│   │   ├── api.ts                # Fetch wrapper + auth token storage
│   │   ├── queries.ts            # TanStack Query options/hooks for products & categories
│   │   ├── product-utils.ts      # Search, formatting, and badge helpers (pure functions)
│   │   ├── types.ts              # Shared Product / Category types
│   │   ├── store.tsx             # Global auth/cart/wishlist/order state (calls the API)
│   │   ├── recently-viewed.ts    # Client-side recently-viewed tracking
│   │   └── info-pages.ts         # Static content for FAQ/contact/policy pages
│   ├── hooks/
│   ├── assets/
│   └── styles.css
│
├── public/                        # Static assets served as-is (product & category images)
├── .env.example                   # Frontend environment variable template
└── package.json
```

## Installation & Setup

### Prerequisites

- Node.js 18+
- npm (or Bun — a `bun.lock` is included)
- A MongoDB instance (local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas)
  cluster)

### Quick start

```bash
# 1. Clone the repository
git clone <your-fork-url>
cd heron-and-reed-home-main

# 2. Set up and start the backend (see "Backend Setup" below)
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev            # http://localhost:4000

# 3. In a second terminal, set up and start the frontend (see "Frontend Setup" below)
cd ..
cp .env.example .env.local
npm install
npm run dev             # Vite prints the local URL, e.g. http://localhost:5173
```

## Environment Variables

### Backend (`backend/.env`, from `backend/.env.example`)

| Variable          | Description                                                                        |
|-------------------|--------------------------------------------------------------------------------------|
| `MONGODB_URI`     | MongoDB connection string, e.g. `mongodb://127.0.0.1:27017/heron-and-reed`           |
| `JWT_SECRET`      | Long random string used to sign auth tokens                                          |
| `JWT_EXPIRES_IN`  | Token lifetime, e.g. `7d`                                                             |
| `PORT`            | Port the API listens on (default `4000`)                                              |
| `CORS_ORIGIN`     | Comma-separated list of allowed frontend origins, e.g. `http://localhost:5173`        |

### Frontend (`.env.local`, from `.env.example`)

| Variable        | Description                                             |
|-----------------|-----------------------------------------------------------|
| `VITE_API_URL`  | Base URL of the backend API, e.g. `http://localhost:4000` |

Make sure `CORS_ORIGIN` on the backend matches the origin your frontend actually runs on, and
that `VITE_API_URL` on the frontend points at the backend's URL.

## MongoDB Setup

You need a running MongoDB instance before starting the backend:

- **Local**: install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
  and use `MONGODB_URI=mongodb://127.0.0.1:27017/heron-and-reed`.
- **Atlas (cloud, free tier)**: create a cluster at
  [mongodb.com/atlas](https://www.mongodb.com/atlas), create a database user, allow your IP,
  and copy the provided `mongodb+srv://...` connection string into `MONGODB_URI`.

Once `MONGODB_URI` is set, seed the catalog:

```bash
cd backend
npm run seed
```

This upserts the products and categories from `backend/src/data/*.json` into MongoDB — safe to
re-run at any time.

## Backend Setup

```bash
cd backend
cp .env.example .env      # fill in MONGODB_URI, JWT_SECRET, etc.
npm install
npm run seed               # populate products & categories
npm run dev                 # nodemon, restarts on file changes — http://localhost:4000
# or: npm start              # plain node, for production
```

Health check: `GET http://localhost:4000/api/health` → `{"ok":true}`

## Frontend Setup

```bash
cp .env.example .env.local   # set VITE_API_URL to your backend's URL
npm install                   # or: bun install
npm run dev                    # starts the Vite dev server
npm run build                  # production build
npm run preview                # preview the production build locally
```

The frontend fetches all product/category data from the backend on load — the API must be
running (and seeded) for the storefront to display anything.

## Verifying Your Setup

After following the steps above, confirm everything is wired correctly:

```bash
# 1. Backend dependencies install and the server boots
cd backend && npm install && npm run seed && npm run dev
#    → look for "[db] connected to MongoDB" and "[server] Heron & Reed API listening on ..."
#    → curl http://localhost:4000/api/health   should return {"ok":true}
#    → curl http://localhost:4000/api/products should return a JSON array of 25 products

# 2. Frontend dependencies install and the dev server boots
cd .. && npm install && npm run dev
#    → open the printed local URL; the homepage, shop, and category pages should populate
#      with products/categories (network tab shows calls to /api/products, /api/categories)

# 3. Production build succeeds
npm run build
```

Then exercise the app manually: sign up, sign in, add items to cart/wishlist, place an order,
refresh the page (cart/wishlist/orders should still be there), sign out, and sign in as a
second account to confirm it has a completely separate cart/wishlist/order history.

## API Overview

All endpoints are prefixed with `/api`. Endpoints marked 🔒 require an `Authorization: Bearer
<token>` header.

| Method | Endpoint                    | Description                                  |
|--------|------------------------------|-----------------------------------------------|
| GET    | `/health`                   | Health check                                   |
| POST   | `/auth/signup`               | Create an account                              |
| POST   | `/auth/login`                | Sign in                                        |
| GET 🔒 | `/auth/me`                   | Current user profile                           |
| PUT 🔒 | `/auth/profile`              | Update name/email                              |
| PUT 🔒 | `/auth/address`              | Save/update default address                    |
| GET    | `/products`                 | List products (`?category`, `?badge`, `?search`, `?isNew`, `?isBestseller`) |
| GET    | `/products/:slug`           | Get a single product                           |
| GET    | `/categories`                | List categories                                |
| GET    | `/categories/:slug`         | Get a single category                          |
| GET 🔒 | `/cart`                      | Get current user's cart                        |
| POST 🔒| `/cart/items`                | Add/increment a cart item                      |
| PATCH🔒| `/cart/items/:slug`         | Set an item's quantity                         |
| DELETE🔒| `/cart/items/:slug`        | Remove an item                                 |
| DELETE🔒| `/cart`                     | Clear the cart                                 |
| GET 🔒 | `/wishlist`                  | Get current user's wishlist                    |
| POST 🔒| `/wishlist/toggle`          | Add/remove a product from the wishlist         |
| GET 🔒 | `/orders`                    | List current user's orders                     |
| POST 🔒| `/orders`                    | Place an order (re-priced server-side)         |

## Future Enhancements

- Product reviews backed by the database (currently sample/static review copy on the product page)
- Admin dashboard for managing products, categories, and orders
- Image upload for product photography instead of a fixed seed dataset
- Order status transitions (Processing → Shipped → Delivered) with notifications
- Pagination/infinite scroll for large catalogs
- Payment gateway integration for the checkout flow
- Automated test coverage (API integration tests, component tests)

## Internship Information

This project was completed as **Task 1** of the **CodeAlpha** Web Development Internship
program.

## Author

**Baddam Srinikha**

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
