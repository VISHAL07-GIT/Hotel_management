# 🍽️ Foodie Hub - Luxury Fine Dining & Gourmet Ordering System

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Project-f39c12?style=for-the-badge&logo=google-chrome&logoColor=white)](index.html)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](index.html)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](styles.css)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](app.js)
[![GitHub License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

An award-winning, responsive web application for fine dining and gourmet online restaurant ordering. Built with modern dark-mode luxury aesthetics, glassmorphic UI elements, gold gradient accents, and an interactive client-side authentication and ordering engine.

---

## 🌟 Key Highlights & Features

### 🔐 1. Smart Authentication & Membership System
- **Entry Gate Modal**: Automatically welcomes new/unregistered visitors upon entering the website with a sleek Sign In & Sign Up modal prompt.
- **Permanent One-Time Registration**: Once a guest registers or logs in, their session is permanently stored in `localStorage`. They will **never be asked to sign in again** on subsequent visits!
- **Dedicated Auth Portal ([`auth.html`](auth.html))**: Full-screen split layout showcasing VIP membership perks, customer reviews, and security badges.
- **1-Click Demo Accounts**: Effortlessly test authentication without typing credentials:
  - 👑 **VIP Member**: `sophia.vip@example.com` / `VipChef#99`
  - 👤 **Gourmet Guest**: `alex.gourmet@example.com` / `Foodie@2026`
- **Security Features**:
  - Real-time password strength meter (Weak / Fair / Good / Very Strong).
  - Live confirm password match validator.
  - Password visibility toggles (Show/Hide password).
  - Forgot password modal with simulated 6-digit OTP code (`778899`) and password reset.
- **Direct Link Aliases**: [`login.html`](login.html) and [`signup.html`](signup.html) automatically route to the corresponding tab.
- **Navbar Profile Dropdown**: Logged-in guests receive a custom avatar pill showing their name, VIP tier, point balance, and a dropdown menu with a Sign Out option.

---

### 🍽️ 2. Gourmet Food Menu & Smart Food Finder
- **Interactive Menu Filtering**: Browse by categories (*All*, *Breakfast*, *Lunch*, *Dinner*, *Desserts*, *Drinks*) and dietary filters (*All*, *Pure Veg*, *Non-Veg*).
- **Instant Search**: Real-time keyword search across dish names, ingredients, and descriptions.
- **Smart Food Finder**: Interactive modal to filter recommendations based on a custom budget slider (`₹100` – `₹1000`) and dietary preference.
- **Rich Dish Metadata**: Calorie counts, preparation time, star ratings, chef badges, and crisp high-resolution culinary photography.

---

### 🛒 3. Cart & Payment Gateway Engine
- **Persistent Cart State**: Cart items, quantities, and dish-specific custom notes (e.g. *"Less spicy"*, *"Extra sauce"*) are preserved in `localStorage`.
- **Promo Code Discounts**:
  - `FOODIE20` – Instant 20% OFF your gourmet feast.
  - `WELCOME100` – Flat ₹100 discount on orders over ₹499.
- **Tip & Tax Calculation**: 5% GST calculation, free delivery on orders ₹499+, and optional delivery partner tips.
- **Simulated Payment Gateway**: Real-time 3-stage animated payment authorization supporting:
  - 📱 **UPI / Scan & Pay** (with generated dynamic QR code)
  - 💳 **Credit & Debit Cards** (with auto-formatting card number & expiry)
  - 🏦 **Net Banking**
  - 💵 **Cash on Delivery (COD)**

---

### 📍 4. Live GPS & Kitchen Order Tracker
- **4-Stage Visual Timeline**:
  1. *Order Confirmed*
  2. *Kitchen Preparing Masterpiece*
  3. *Out with Gourmet Valet*
  4. *Arrived & Enjoy*
- **Order ID Search**: Search and track any generated order ticket (e.g., `#FH-4819`).

---

### 🥂 5. Table Reservation Engine
- **Online Booking**: Select date, dinner time, number of guests, and ambience (Romantic Candlelight, Chef's Private Table, Family Lounge, Executive Cabana).
- **Auto-Fill Details**: Automatically pre-fills the guest's name and contact details if they are signed in.
- **Instant Confirmation Voucher**: Generates a verifiable reservation code (e.g., `#TB-2041`).

---

### 👑 6. VIP Rewards & Loyalty Program
- **Point Accrual**: Earn **1 VIP Point for every ₹10 spent**.
- **+200 Welcome Bonus**: New registered users receive 200 points upon sign-up.
- **Voucher Redemption**: Exchange accumulated points for ₹100, ₹250 discount vouchers, or complimentary chef desserts.

---

### ⭐ 7. Customer Reviews & Concierge
- **Live Review Submissions**: Submit feedback and star ratings that appear instantly on the wall of testimonials.
- **Floating WhatsApp Concierge**: Instant one-click direct communication with the restaurant manager.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Structure** | Semantic HTML5, W3C Accessible markup |
| **Styling** | Custom Vanilla CSS3 Design System (HSL & HEX variables, Flexbox, CSS Grid) |
| **Visuals & Effects** | Glassmorphism (`backdrop-filter`), Gold linear gradients, micro-animations |
| **Logic & State** | Vanilla Modern JavaScript (ES6+), LocalStorage & SessionStorage API |
| **Typography** | Google Fonts ([*Playfair Display*](https://fonts.google.com/specimen/Playfair+Display) & [*Outfit*](https://fonts.google.com/specimen/Outfit)) |
| **Icons** | [FontAwesome 6.5.1](https://fontawesome.com/) CDN |

---

## 📂 Project Directory Structure

```text
hotel.pr/
│
├── index.html          # Main restaurant application (Home, Menu, Cart, Booking, Tracker)
├── styles.css          # Core luxury design system, utilities, and components
├── app.js              # Application logic (Cart, Orders, Gate Modal, Rewards, Tracker)
│
├── auth.html           # Dedicated Sign In & Sign Up authentication page
├── auth.css            # Stylesheet for authentication forms & showcase cards
├── auth.js             # Authentication engine, demo users, validation & strength meter
│
├── login.html          # Shortcut redirect to auth.html#signin
├── signup.html         # Shortcut redirect to auth.html#signup
│
├── images/             # Local brand assets
│   ├── logo.jpg        # Foodie Hub gold circular brand logo
│   └── hero_banner.jpg # High-resolution gourmet hero photography
│
└── README.md           # Project documentation
```

---

## 🚀 Getting Started

No build tools, bundlers, or package installations are required! This project runs natively in any modern web browser.

### Option 1: Direct File Launch
Double-click [`index.html`](index.html) to open the application directly in your default web browser.

### Option 2: Run via Local HTTP Server

Using **Python**:
```bash
python -m http.server 8080
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

Using **Node.js (npx serve)**:
```bash
npx -y serve .
```

---

## 🔑 Demo Login Credentials

You can test the authentication system using the **1-Click Demo Buttons** or with the following accounts:

| User | Email | Password | Tier | Bonus Points |
|---|---|---|---|---|
| **Sophia Vance** | `sophia.vip@example.com` | `VipChef#99` | VIP Connoisseur | 850 Pts |
| **Alex Mercer** | `alex.gourmet@example.com` | `Foodie@2026` | Gold Gourmet | 350 Pts |
| **New Register** | *(Your Email)* | *(Min 6 chars)* | Gold VIP Member | **+200 Pts** |

---

## 📄 License

This project is licensed under the MIT License - feel free to customize and use it for your restaurant or portfolio projects.

Crafted with ❤️ for **Foodie Hub Gourmet Fine Dining**.
