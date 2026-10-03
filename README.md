<div align="center">

# 🛒 PakMart — Modern Full-Stack E-Commerce Platform

[![Deploy Status](https://img.shields.io/badge/Deployment-Live-brightgreen?style=for-the-badge&logo=vercel)](https://preview--pakmartcom.lovable.app/)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Supabase-blue?style=for-the-badge&logo=react)](https://preview--pakmartcom.lovable.app/)
[![UI Library](https://img.shields.io/badge/UI-shadcn%2Fui-black?style=for-the-badge&logo=radixui)](https://ui.shadcn.com/)

**PakMart** is an enterprise-grade, full-stack e-commerce solution engineered for high scalability, real-time state synchronization, and an intuitive user experience. Built with a modular component architecture, robust authentication pipelines, and interactive analytics dashboards.

[Explore Live Platform](https://preview--pakmartcom.lovable.app/) • [Report Bug](https://github.com/waqas-ayub/pakmart/issues)

</div>

---

## 📸 Platform Overview

<div align="center">

| Consumer Storefront | Administrative Control Center |
| :---: | :---: |
| <img width="950" alt="PakMart Storefront Preview" src="YOUR_HOMEPAGE_SCREENSHOT_LINK_HERE" /> | <img width="950" alt="PakMart Admin Analytics Preview" src="YOUR_ADMIN_SCREENSHOT_LINK_HERE" /> |

</div>

---

## 🌟 Core Architecture & Feature Matrix

### 🛍️ E-Commerce Engine
* **Dynamic Product Navigation:** Responsive layout featuring deep route dynamic rendering and parameter-based catalog browsing (`ProductDetail.tsx`).
* **Optimized Cart State Management:** High-performance persistent context managing line-item mutations, quantity bounds, and real-time order subtotal computation (`CartContext.tsx`).
* **Persistent Wishlist Sync:** Customer item bookmarking engine backed by local state and account reference handlers (`WishlistContext.tsx`).
* **Structured Checkout Funnel:** Multi-stage checkout process with transactional state validation and input sanitization (`Checkout.tsx`).
* **Customer Order History:** Historical ledger interface providing real-time lifecycle tracking of user purchases (`Orders.tsx`).

### 🔒 Enterprise Backend & Authentication
* **Supabase Infrastructure:** Cloud-native PostgreSQL integration managing scalable product schemas, customer relational datasets, and transaction logs.
* **Granular Auth Management:** Protected route guards and session handling supporting multi-role platform access (`AuthContext.tsx`).

### 📊 Administrative & Analytics Dashboard
* **Real-Time Merchant Portal:** Comprehensive operational console designed for store management (`Admin.tsx`).
* **Visual Data Intelligence:** Interactive metrics visualization covering revenue streams, conversion rates, and fulfillment trends powered by `Recharts`.
* **Inventory Control System:** Direct CRUD interface for catalog updates, stock tracking, and incoming order management.

### 🎨 Design System & User Interface
* **Component-Driven UI:** Constructed on `shadcn/ui` and Radix UI primitives for full accessibility and UI consistency.
* **Hardware-Accelerated Motion:** Seamless micro-interactions and transitions orchestrated via `Framer Motion`.
* **Adaptive Theme Engine:** System-aware native Dark and Light mode customization (`next-themes`).
* **Feedback Architecture:** Real-time user event feedback provided through toast notification streams (`Sonner` & `Toaster`).

---

## 🛠 Tech Stack & Ecosystem
