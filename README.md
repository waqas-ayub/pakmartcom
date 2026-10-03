# 🛒 PakMart — Full-Stack Modern E-Commerce Platform

> **PakMart** ek modern, full-stack E-commerce platform hai jise scalable architecture aur seamless user shopping experience ko dhyan mein rakh kar banaya gaya hai. Yeh platform fast product browsing, real-time cart state management, Supabase database integration, aur ek dedicated Admin Management Dashboard provide karta hai.

---

## 🌐 Live Application
* **Live Demo:** [PakMart Web App](https://preview--pakmartcom.lovable.app/)

---

## 📸 Application Interface

| Home & Product Storefront | Checkout & Admin Dashboard |
| :---: | :---: |
| `<img width="947" alt="PakMart Home" src="YOUR_HOMEPAGE_SCREENSHOT_LINK_HERE" />` | `<img width="953" alt="PakMart Admin" src="YOUR_ADMIN_SCREENSHOT_LINK_HERE" />` |

---

## ✨ Key Features (A to Z)

### 🛍️ Shopper Experience
* **Dynamic Product Catalog & Filtering:** Clean layout along with interactive product detail views (`ProductDetail.tsx`).
* **Real-Time Shopping Cart:** Persistent state management for updating items, quantities, and price calculations (`CartContext.tsx`).
* **Wishlist Management:** Users can save favorite items for later viewing (`WishlistContext.tsx`).
* **Seamless Checkout Process:** Multi-step order submission flow with input validation (`Checkout.tsx`).
* **Order History & Tracking:** Registered users can track previous purchases and order statuses (`Orders.tsx`).

### 🔒 Authentication & Database
* **Supabase Integration:** Secure database connectivity for product storage, user management, and order records (`@supabase/supabase-js`).
* **User Authentication:** Auth state context supporting registration, login, and protected routes (`AuthContext.tsx`).

### 📊 Admin Panel & Management
* **Dedicated Admin Dashboard:** Comprehensive store administration view (`Admin.tsx`).
* **Sales Analytics & Visual Insights:** Interactive charts and sales reporting powered by `Recharts`.
* **Inventory & Order Management:** Direct overview of active customer orders and product catalog inventory.

### 🎨 UI & UX Features
* **Modern Component System:** Built using `shadcn/ui` components based on Radix UI primitives.
* **Fluid Animations:** Smooth transitions powered by `Framer Motion`.
* **Dark / Light Mode:** Native theme switcher using `next-themes`.
* **Toast Notifications:** Real-time visual feedback using `Sonner` and `Toaster`.

---

## 🛠 Tech Stack & Architecture

* **Frontend Framework:** React 18 + Vite
* **Language:** TypeScript
* **State Management:** React Context API (`Auth`, `Cart`, `Wishlist`) + `@tanstack/react-query`
* **Backend & Database:** Supabase (`@supabase/supabase-js`)
* **UI & Styling:** Tailwind CSS + `shadcn/ui` + Radix UI
* **Icons & Visuals:** Lucide React + Recharts
* **Form Validation:** React Hook Form + Zod (`@hookform/resolvers`)
* **Build Tool & Testing:** Vite + SWC + Vitest

---

## 🚀 Getting Started (Local Development)

Follow these steps to run PakMart locally on your machine:

### Prerequisites
Ensure you have **Node.js** (v18+) and **npm** installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/waqas-ayub/pakmart.git](https://github.com/waqas-ayub/pakmart.git)
   cd pakmart
