# Clothes E-shop

## Description
This is a full-stack e-commerce application built with React, Supabase, and Stripe. The application allows users to browse through a list of products, add them to the cart, and checkout using Stripe.

## Details
Express.js API accesses Supabase with Service Role key to fetch products and store orders whilst the frontend only uses the anon key for enhanced security. Stripe is used to handle payments and webhooks are used to update the order status in the database.

## Features
- Browse through a list of products
- Add products to the cart
- Checkout using Stripe
- View order history
- View order details

## Configuration
### Backend
1. Create a `.env` file in the root of the `backend` folder.
2. Add the following environment variables to the `.env` file:
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SUPABASE_URL=
SUPABASE_SECRET_KEY=
CLIENT_URL=http://localhost:5173
```

### Frontend
1. Create a `.env` file in the root of the `frontend` folder.
2. Add the following environment variables to the `.env` file:
```
VITE_STRIPE_PUBLISABLE_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Commands
You need to have Stripe CLI installed to run the following commands. To listen for events coming from Stripe, CLI is used to forward the events to the API server.
```
stripe login
stripe listen -e checkout.session.completed --forward-to http://localhost:3000/webhook
```

## Other
This project was bootstrapped with [Vite](https://vitejs.dev/), [React](https://reactjs.org/), [Supabase](https://supabase.io/), and [Stripe](https://stripe.com/).
