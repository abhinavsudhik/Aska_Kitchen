# Aska Kitchen - Traditional Home Food Ordering Platform

A modern web application for ordering nostalgic home-cooked food with timeslot-based delivery. Built with React and Convex, featuring Google OAuth authentication, UPI payments with QR codes, and real-time order notifications via Telegram.

## 🌐 Live Demo

**[View Live Application →](https://aska-kitchen.vercel.app)**

Experience the application in action at: [https://aska-kitchen.vercel.app](https://aska-kitchen.vercel.app)

## 🚀 Tech Stack

- **Frontend**: React 19.2 with TypeScript
- **Build Tool**: Vite 7.2
- **Styling**: TailwindCSS 3.4
- **Backend**: Convex (Serverless Backend)
- **Authentication**: Convex Auth with Google OAuth & Email/Password
- **Icons**: Lucide React
- **Routing**: React Router DOM 7.12

## 📋 Table of Contents

- [Screenshots](#-screenshots)
- [Features](#features)
- [Integrations](#integrations)
  - [Google OAuth](#1-google-oauth-integration)
  - [Convex Backend](#2-convex-backend-integration)
  - [Telegram Bot Integration](#3-telegram-bot-integration)
  - [UPI Payment with QR Code](#4-upi-payment-with-qr-code-integration)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Usage](#usage)

## 📸 Screenshots

Experience the clean, homely design of Aska Kitchen:

````carousel
![Landing Page - Nostalgic Home Food hero section with green theme and call-to-action](screenshots/landing-hero.png)
<!-- slide -->
![Landing Page - Join the ASKA Family section with food imagery](screenshots/landing-join-family.png)
<!-- slide -->
![Sign Up Page - Registration form with Google OAuth and email/password options](screenshots/signup-page.png)
<!-- slide -->
![Login Page - Sign in with Google OAuth or email/password authentication](screenshots/login-page.png)
<!-- slide -->
![Customer Home Page - Personalized welcome, timeslot selection, and menu browsing](screenshots/customer-homepage.png)
````


### Key UI Highlights

- **🎨 Homely Theme**: Green color palette with serif typography creating a warm, trustworthy feel
- **🔐 Seamless Authentication**: One-click Google sign-in alongside traditional email/password
- **📱 Responsive Design**: Clean, modern interface that works across all devices
- **🍽️ Intuitive Ordering**: Easy timeslot and location selection for personalized experience

## ✨ Features

- 🔐 **Multi-Provider Authentication** (Google OAuth + Email/Password)
- 🍽️ **Timeslot-Based Ordering** (Breakfast, Lunch, Dinner)
- 📍 **Location-Based Delivery**
- 💳 **UPI Payment with Dynamic QR Codes**
- 📱 **Telegram Order Notifications**
- 👨‍💼 **Admin Dashboard** for order & inventory management
- 🛒 **Shopping Cart** with real-time updates
- 📊 **Order Tracking** with invoice generation
- 🎨 **Responsive Design** with homely theme

---

## 🔌 Integrations

### 1. Google OAuth Integration

**Purpose**: Enables users to sign up and sign in using their Google accounts.

#### Implementation Details

**Package Used**: `@auth/core` (v0.37.0)

**Files Involved**:
- [`convex/auth.ts`](file:///Users/abhinavsudhi/Desktop/Aska_Kitchen/convex/auth.ts) - Authentication configuration
- [`convex/auth.config.ts`](file:///Users/abhinavsudhi/Desktop/Aska_Kitchen/convex/auth.config.ts) - OAuth provider config

#### Setup Steps

1. **Create Google OAuth Application**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Navigate to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client IDs**
   - Configure OAuth consent screen
   - Add authorized redirect URIs:
     ```
     https://your-domain.convex.site/api/auth/callback/google
     http://localhost:3000/api/auth/callback/google (for development)
     ```
   - Copy **Client ID** and **Client Secret**

2. **Configure Environment Variables**
   ```bash
   # In Convex Dashboard or via CLI
   npx convex env set AUTH_GOOGLE_ID "your-google-client-id"
   npx convex env set AUTH_GOOGLE_SECRET "your-google-client-secret"
   npx convex env set SITE_URL "https://your-domain.com"
   ```

3. **Generate Auth Private Key**
   ```bash
   npx convex env set CONVEX_AUTH_PRIVATE_KEY "$(openssl rand -base64 32)"
   ```

#### Code Example

```typescript
// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";

export const { auth, signIn, signOut } = convexAuth({
  providers: [Google],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      return args.existingUserId ?? await ctx.db.insert("users", {
        email: args.profile.email,
        name: args.profile.name,
        role: "customer",
      });
    },
  },
});
```

#### Features Enabled
- ✅ One-click Google Sign Up
- ✅ One-click Google Sign In
- ✅ Automatic user profile creation
- ✅ Secure session management

---

### 2. Convex Backend Integration

**Purpose**: Provides a serverless backend with real-time data synchronization, built-in authentication, and file storage.

#### Implementation Details

**Package Used**: `convex` (v1.31.5), `@convex-dev/auth` (v0.0.90)

**Core Features**:
- Real-time database queries and mutations
- Type-safe API with TypeScript
- Built-in authentication system
- File storage for item images
- Scheduled functions support

#### Setup Steps

1. **Install Convex**
   ```bash
   npm install convex
   npx convex dev
   ```

2. **Deploy to Production**
   ```bash
   npx convex deploy
   ```

3. **Configure Convex Client** ([`src/ConvexClientProvider.tsx`](file:///Users/abhinavsudhi/Desktop/Aska_Kitchen/src/ConvexClientProvider.tsx))
   ```typescript
   import { ConvexProvider, ConvexReactClient } from "convex/react";
   
   const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
   
   export function ConvexClientProvider({ children }) {
     return <ConvexProvider client={convex}>{children}</ConvexProvider>;
   }
   ```

#### Database Schema

The application uses the following tables defined in [`convex/schema.ts`](file:///Users/abhinavsudhi/Desktop/Aska_Kitchen/convex/schema.ts):

- **users** - User accounts with roles (admin/customer)
- **items** - Food menu items with pricing and availability
- **locations** - Delivery locations
- **timeslots** - Ordering time windows (breakfast, lunch, dinner)
- **orders** - Order records with status tracking

#### Key Convex Functions

**Queries** (Read Data):
```typescript
const user = useQuery(api.verification.getCurrentUser);
const items = useQuery(api.items.getAllItems);
```

**Mutations** (Write Data):
```typescript
const createOrder = useMutation(api.orders.createOrder);
await createOrder({ userId, items, totalAmount });
```

**Actions** (External API Calls):
```typescript
const sendNotification = useAction(api.telegram.sendOrderNotification);
await sendNotification({ orderId, amount });
```

---

### 3. Telegram Bot Integration

**Purpose**: Sends real-time order notifications to administrators via Telegram when customers place orders.

#### Implementation Details

**File**: [`convex/telegram.ts`](file:///Users/abhinavsudhi/Desktop/Aska_Kitchen/convex/telegram.ts)

**Trigger**: Automatically called when a customer confirms payment

#### Setup Steps

1. **Create Telegram Bot**
   - Open Telegram and search for [@BotFather](https://t.me/botfather)
   - Send `/newbot` command
   - Follow instructions to create your bot
   - Copy the **Bot Token** (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

2. **Get Chat ID**
   - Add your bot to a channel or group (recommended for team notifications)
   - Send a message to the bot/channel
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find the `chat.id` in the response

3. **Configure Environment Variables**
   ```bash
   npx convex env set TELEGRAM_BOT_TOKEN "123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
   npx convex env set TELEGRAM_CHAT_ID "-1001234567890"
   ```

#### Notification Format

When an order is placed, admins receive:

```
🔔 *New Order Received!*
------------------------
🆔 Order ID: #001
👤 Customer: John Doe
💰 Amount: ₹450
📦 Status: Paid

🛒 *Items:*
- 2x Dal Tadka
- 1x Roti
- 1x Rice

------------------------
_Check the dashboard for more details._
```

#### Code Implementation

```typescript
// convex/telegram.ts
export const sendOrderNotification = action({
  args: { orderId, amount, status, customerName, items },
  handler: async (ctx, args) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    const message = `🔔 *New Order Received!*\n...`;
    
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  },
});
```

---

### 4. UPI Payment with QR Code Integration

**Purpose**: Enables customers to pay via UPI (Google Pay, PhonePe, Paytm) by scanning a dynamically generated QR code.

#### Implementation Details

**Package Used**: `qrcode.react` (v4.2.0)

**File**: [`src/pages/customer/PaymentPage.tsx`](file:///Users/abhinavsudhi/Desktop/Aska_Kitchen/src/pages/customer/PaymentPage.tsx)

#### Setup Steps

1. **Get UPI ID**
   - Obtain a UPI ID from your payment provider (e.g., `yourshop@paytm`, `business@oksbi`)
   - This is the account where customer payments will be received

2. **Configure Environment Variable**
   ```bash
   # Create .env file in project root
   VITE_UPI_ID=yourshop@paytm
   ```

3. **QR Code Generation**
   The application automatically generates a QR code using the UPI deep link format:
   ```
   upi://pay?pa=<UPI_ID>&pn=<PAYEE_NAME>&am=<AMOUNT>&cu=INR
   ```

#### UPI Deep Link Parameters

- `pa` (payee address) - Your UPI ID
- `pn` (payee name) - Business name (e.g., "ASKA")
- `am` (amount) - Order total amount
- `cu` (currency) - Currency code (INR for Indian Rupees)

#### Code Implementation

```typescript
// Generate UPI URL
const upiId = import.meta.env.VITE_UPI_ID || "example@upi";
const payeeName = "ASKA";
const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${finalAmount}&cu=INR`;

// Render QR Code
<QRCodeCanvas
  value={upiUrl}
  size={200}
  bgColor="#ffffff"
  fgColor="#000000"
  level="Q"
  includeMargin={true}
/>
```

#### Payment Flow

1. Customer adds items to cart and proceeds to checkout
2. System calculates total amount (items + delivery charge)
3. Dynamic QR code is generated with exact amount
4. Customer scans QR code with any UPI app
5. Payment is completed in the UPI app
6. Customer clicks "I Have Paid" button
7. Order is created and marked as "Paid"
8. Telegram notification is sent to admin
9. Customer receives bill/invoice

#### Security Features

- ✅ Amount is embedded in QR code (prevents wrong amounts)
- ✅ QR code disappears after payment confirmation
- ✅ Order tracking with unique invoice numbers
- ✅ Admin verification before order fulfillment

---

## 💻 Installation

### Prerequisites

- Node.js 18+ and npm
- Convex account ([convex.dev](https://convex.dev))
- Google Cloud Console account (for OAuth)
- Telegram account (for notifications)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Aska_Kitchen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```
   - This will create a new Convex project
   - Copy the generated `VITE_CONVEX_URL` to your `.env` file

4. **Configure environment variables**
   
   Create `.env` file:
   ```env
   VITE_CONVEX_URL=https://your-project.convex.cloud
   VITE_UPI_ID=yourshop@paytm
   ```

   Set Convex environment variables:
   ```bash
   npx convex env set AUTH_GOOGLE_ID "your-google-client-id"
   npx convex env set AUTH_GOOGLE_SECRET "your-google-client-secret"
   npx convex env set SITE_URL "http://localhost:5173"
   npx convex env set CONVEX_AUTH_PRIVATE_KEY "$(openssl rand -base64 32)"
   npx convex env set TELEGRAM_BOT_TOKEN "your-bot-token"
   npx convex env set TELEGRAM_CHAT_ID "your-chat-id"
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Convex dashboard: Output in terminal

---

## 🔐 Environment Variables

### Frontend Environment Variables (`.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_CONVEX_URL` | Convex deployment URL | `https://happy-animal-123.convex.cloud` |
| `VITE_UPI_ID` | UPI ID for payments | `yourshop@paytm` |

### Convex Environment Variables (Set via CLI or Dashboard)

| Variable | Description | Required | How to Get |
|----------|-------------|----------|------------|
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | Yes | Google Cloud Console |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | Yes | Google Cloud Console |
| `SITE_URL` | Application URL | Yes | Your domain or localhost |
| `CONVEX_AUTH_PRIVATE_KEY` | Auth encryption key | Yes | `openssl rand -base64 32` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | Optional | @BotFather on Telegram |
| `TELEGRAM_CHAT_ID` | Telegram chat/channel ID | Optional | Bot API getUpdates |

---

## 📁 Project Structure

```
Aska_Kitchen/
├── convex/                      # Convex backend
│   ├── auth.ts                  # Authentication configuration (Google OAuth + Password)
│   ├── auth.config.ts           # OAuth provider settings
│   ├── schema.ts                # Database schema definition
│   ├── telegram.ts              # Telegram notification action
│   ├── orders.ts                # Order mutations and queries
│   ├── items.ts                 # Menu items management
│   └── users.ts                 # User management
│
├── src/
│   ├── pages/
│   │   ├── customer/
│   │   │   ├── HomePage.tsx     # Menu browsing
│   │   │   ├── CartPage.tsx     # Shopping cart
│   │   │   └── PaymentPage.tsx  # UPI QR code payment
│   │   ├── admin/               # Admin dashboard pages
│   │   ├── LoginPage.tsx        # Login with Google/Email
│   │   └── SignupPage.tsx       # Registration
│   │
│   ├── context/
│   │   └── CartContext.tsx      # Global cart state
│   │
│   ├── components/              # Reusable UI components
│   ├── ConvexClientProvider.tsx # Convex client setup
│   └── main.tsx                 # Application entry point
│
├── package.json                 # Dependencies
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # TailwindCSS settings
└── README.md                    # This file
```

---

## 🎯 Usage

### For Customers

1. **Sign Up / Login**
   - Click "Login/Register" on landing page
   - Sign up with Google or email/password
   - Provide your name during registration

2. **Browse Menu**
   - Select delivery timeslot (Breakfast, Lunch, Dinner)
   - Select delivery location
   - Browse available items for selected timeslot

3. **Place Order**
   - Add items to cart with desired quantities
   - Review cart and proceed to payment
   - Scan the generated QR code with any UPI app
   - Complete payment and click "I Have Paid"
   - View your bill/invoice

### For Admins

1. **Access Admin Dashboard**
   - Login with admin credentials
   - Navigate to `/admin/dashboard`

2. **Manage Orders**
   - View all orders in real-time
   - Confirm pending orders
   - Mark orders as delivered

3. **Manage Menu**
   - Add/edit food items
   - Set pricing and availability
   - Upload item images
   - Assign items to timeslots

4. **Manage Timeslots & Locations**
   - Configure ordering windows
   - Set delivery times
   - Manage delivery locations

---

## 🚀 Deployment

### Deploy Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy the 'dist' folder
```

**Environment Variables to Set**:
- `VITE_CONVEX_URL` (from Convex production deployment)
- `VITE_UPI_ID`

### Deploy Backend (Convex)

```bash
npx convex deploy --cmd 'npm run build'
```

**Update Production Environment Variables**:
```bash
npx convex env set AUTH_GOOGLE_ID "..." --prod
npx convex env set AUTH_GOOGLE_SECRET "..." --prod
npx convex env set SITE_URL "https://your-domain.com" --prod
npx convex env set CONVEX_AUTH_PRIVATE_KEY "..." --prod
npx convex env set TELEGRAM_BOT_TOKEN "..." --prod
npx convex env set TELEGRAM_CHAT_ID "..." --prod
```

---

## 🛠️ Development

### Run Development Server
```bash
npm run dev
```

### Lint Code
```bash
npm run lint
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 📝 License

This project is private and proprietary.

---

## 👥 Support

For issues or questions:
- Check existing documentation
- Review Convex logs in the dashboard
- Test integrations individually (OAuth, Telegram, UPI)

---

## 🔗 Useful Links

- [Convex Documentation](https://docs.convex.dev)
- [Convex Auth Guide](https://docs.convex.dev/auth)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [UPI Deep Linking](https://www.npci.org.in/what-we-do/upi/upi-link-specification)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

---

**Built with ❤️ for traditional home food lovers**
