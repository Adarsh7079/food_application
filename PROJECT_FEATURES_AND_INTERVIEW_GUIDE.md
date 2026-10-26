# ZaykaNest Food Ordering App: Features and Interview Guide

This guide describes the features and architecture currently implemented in this repository. It is intended as both project documentation and a quick interview-preparation reference.

## Project overview

ZaykaNest is a food-ordering web application with a React frontend and an Express/MongoDB backend. Customers can browse food, manage a cart, maintain a profile, and place orders. Restaurants can apply to join the platform and manage their menu and orders after approval. Platform admins manage restaurant approvals and platform operations.

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Redux Toolkit, React Context, Axios, Tailwind CSS, React Toastify |
| Backend | Node.js, Express 5, MongoDB, Mongoose, Zod |
| Authentication | JWT access tokens, refresh tokens in HttpOnly cookies, bcrypt password hashing |
| Email | Resend for verification, enquiry, restaurant-application, and order notification email |
| Location | Browser Geolocation API and OpenStreetMap Nominatim reverse geocoding |

The frontend is a single-page application. It calls versioned JSON API routes under `/api/v1`; the backend connects to MongoDB through Mongoose.

## Location: how it works

The location selector is in the navbar and is available on desktop and mobile.

1. **Default or manually selected address:** The app starts with Gurugram Cyber City as its default location. A user can type an area or street and choose that text as the selected location. A signed-in user can also select the address saved in their profile.
2. **Current location:** When the user selects **Use current location**, the frontend calls `navigator.geolocation.getCurrentPosition`. The browser asks for permission and returns latitude and longitude. Location access requires a secure context (HTTPS or localhost) and browser/device location services.
3. **Readable address:** The frontend sends those coordinates to the public OpenStreetMap Nominatim reverse-geocoding endpoint and formats the returned address fields. If reverse geocoding fails, the app can fall back to showing coordinates or the previously selected address.
4. **Persistence:** The selected label, address, and optional coordinates are saved in browser `localStorage` under `deliveryLocation`, so they remain selected after a page reload on that browser.
5. **Checkout:** Checkout can use the selected location and optionally request current location. If permission or lookup fails, the user can continue with the delivery address instead. The app currently restricts checkout to Gurugram/Gurgaon.

**Interview version:** “I use the browser’s Geolocation API to get coordinates after the user grants permission, then reverse-geocode them with OpenStreetMap Nominatim to show a readable address. I don’t use Google Maps or require a Google API key. I persist the selected location in local storage and provide manual, profile-address, and fallback options.”

**Important boundaries:** The manual search field currently accepts a text address; it does not provide autocomplete or convert typed text into coordinates. The app does not use GPS coordinates for proximity-based restaurant search, nor does it store them as a geospatial field in the order database. Nominatim is an external public service, so address detail and availability depend on OpenStreetMap data and the service.

Relevant implementation: [`location.js`](./client/frontend/src/lib/location.js), [`Navbar.jsx`](./client/frontend/src/components/Navbar.jsx), [`ShopContext.jsx`](./client/frontend/src/context/ShopContext.jsx), and [`PlaceOrder.jsx`](./client/frontend/src/pages/PlaceOrder.jsx).

## Frontend features

### Customer experience

- Home, menu, category, collection, product detail, about, and contact pages.
- Promotional home-page sections for tiffin services/offers, kitchen hygiene, policies, testimonials, and FAQs. The newsletter form is currently presentation-only; it does not submit or store subscriptions.
- Product browsing with search, categories, food-type filtering, and sorting.
- Product detail and portion selection where an item has portions.
- Cart with item quantities, pricing summary, and browser persistence.
- Login and registration screens, email-verification flow, and resend-verification screen.
- Profile page to view and update personal details, phone number, and saved delivery address.
- Checkout that loads the signed-in user's profile to prefill contact and address fields.
- Order history for signed-in customers.
- Navbar location picker with current-location, manual-address, default-location, and signed-in saved-address options.
- Success, error, and informational feedback using toast notifications.
- Responsive desktop and mobile navigation.

### Checkout and order paths

- **Standard online order:** Signed-in customers can submit an order when all cart items belong to one approved, active restaurant and are valid published products. The currently supported payment method is Cash on Delivery (COD).
- **WhatsApp-assisted checkout:** Guest checkout, legacy menu items without a restaurant association, and carts spanning multiple restaurants are routed to a prefilled WhatsApp message rather than submitted as a standard platform order. The backend also attempts to email the checkout details to the configured admin recipient through Resend.
- **Order email:** After a standard order is saved, the backend attempts to email the order summary to the configured admin recipient. Email failure is reported separately; it does not turn a successfully saved order into a failed order.

The WhatsApp handoff opens a `wa.me` link with an encoded message; it is not an integration with the WhatsApp Business API.

### Restaurant and administration workspaces

- Restaurant partner application form.
- Restaurant dashboard with order, menu, availability, and profile workspaces.
- Operations admin dashboard for platform restaurant and order views.
- Super-admin dashboard for restaurant approvals, restaurant management, and menu categories.
- Role-aware routes and navigation for customer, restaurant, admin, and super-admin roles.

### Contact

- Contact enquiry form with client-side success/error toasts.
- Enquiries are submitted to the backend, validated and rate-limited, then sent through Resend with the subject “ZaykaNest Enquiry.”

## Backend features

### API surface

| Area | Representative routes | Purpose |
| --- | --- | --- |
| Authentication | `/api/v1/auth/register`, `/login`, `/refresh`, `/logout`, `/verify-email`, `/resend-verification` | Account creation, email verification, sign-in, token refresh, and sign-out |
| User profile | `/api/v1/user/me` | Read and update the signed-in user's profile |
| Public menu | `/api/v1/products`, `/api/v1/categories` | List public products and categories |
| Restaurant | `/api/v1/restaurants`, `/me`, `/:restaurantId/operational-status` | Apply, view/update own restaurant, and change operating status |
| Restaurant menu | `/api/v1/restaurants/:restaurantId/products` | List/create restaurant products and update availability |
| Customer orders | `/api/v1/orders`, `/api/v1/orders/me` | Place an order and retrieve the customer's order history |
| Restaurant orders | `/api/v1/orders/restaurants/:restaurantId` | View restaurant orders and update order status |
| Admin | `/api/v1/admin/restaurants`, `/api/v1/admin/orders` | Manage platform restaurants and view platform orders |
| Super admin | `/api/v1/admin/categories`, restaurant approval/suspension routes | Manage categories and review or suspend restaurant partners |
| Contact | `/api/v1/contact` | Validate, limit, and forward contact enquiries |
| WhatsApp checkout notification | `/api/v1/orders/whatsapp-notification` | Email details for a checkout that will be confirmed through WhatsApp |

### Business logic and data

- Mongoose models represent users, restaurants, products, categories, and orders.
- Users have role and account-status fields; restaurant partners are associated with their restaurant.
- Restaurants have approval and operational statuses. Restaurant ownership and approval are checked before protected restaurant actions.
- Products belong to a restaurant and category, and include availability, publication status, food type, price, and optional discount fields.
- Orders store customer, restaurant, item snapshots, delivery details, payment method/status, order status, and pricing.
- Standard order creation only accepts COD, checks that the restaurant is approved and active, and verifies each ordered product is published, available, and owned by that restaurant.
- Restaurant partners can update order statuses. The order lifecycle includes placed, confirmed, preparing, out for delivery, delivered, and cancelled.
- Zod schemas validate request bodies, query strings, and route parameters. Authentication, role authorization, restaurant ownership, and approval checks are handled with middleware.
- Public contact and notification routes use rate limiting.

### Email notifications

Resend is used server-side for account verification, restaurant application notifications, successful-order notifications, contact enquiries, and WhatsApp-assisted checkout notifications. Recipient addresses and sender/API credentials are configured in the backend environment. A configured Resend API key and valid sender configuration are required for real delivery.

## Interview-ready project explanation

### Short introduction

> “I built ZaykaNest, a full-stack food-ordering application. The React frontend supports browsing, cart management, profile-based checkout, location selection, and role-specific dashboards. The Express API uses MongoDB and Mongoose for users, restaurants, products, categories, and orders. I added JWT-based authentication, role and ownership checks, request validation, restaurant approval workflows, COD ordering, and Resend email notifications.”

### If asked about the location feature

> “The browser obtains the user’s coordinates through the Geolocation API only after permission is granted. I reverse-geocode those coordinates with OpenStreetMap Nominatim, which avoids a Google Maps API key. The selected address is persisted in local storage, and the UI also supports a manually entered address and a saved profile address. If GPS or reverse geocoding is unavailable, the checkout can continue using the delivery address.”

### If asked about order handling

> “For a standard order, the backend checks the restaurant’s approval and operating status and validates that the submitted products are currently published and available at that restaurant. The backend creates the COD order and then attempts the admin email separately. If the cart is guest-based, spans multiple restaurants, or contains legacy items not connected to a restaurant, the frontend switches to a WhatsApp confirmation path and the backend attempts to email those details.”

### If asked about security and reliability

> “Passwords are hashed with bcrypt. The backend issues JWT access tokens and stores refresh tokens in HttpOnly cookies, with a hashed refresh token stored server-side. Protected endpoints use authentication, role authorization, and restaurant ownership checks. Zod validates incoming requests, and public contact/notification endpoints are rate-limited.”

## Current scope and caveats

- Payment processing is not integrated; the standard order path currently supports Cash on Delivery only.
- Delivery validation is limited to Gurugram/Gurgaon.
- The selected location is a convenience for address display and checkout; it is not a full maps, geofencing, or restaurant-distance feature.
- Text entered in the location field is accepted as entered. There is no address autocomplete or typed-address geocoding in that flow.
- Email attempts depend on the deployed backend having valid Resend configuration and the latest API routes deployed. This guide documents repository behavior, not live deployment status.
- Some home-page content and sample food entries are frontend presentation/fallback data; the database-backed public menu is fetched from the API when enabled and available.

## Source map

- Frontend routes and app shell: [`App.jsx`](./client/frontend/src/App.jsx), [`main.jsx`](./client/frontend/src/main.jsx)
- API configuration: [`api.js`](./client/frontend/src/config/api.js)
- Authentication/profile: [`auth.route.js`](./server/src/routes/auth.route.js), [`user.route.js`](./server/src/routes/user.route.js), [`user.model.js`](./server/src/models/user.model.js)
- Restaurant/product administration: [`restaurant.route.js`](./server/src/routes/restaurant.route.js), [`product.route.js`](./server/src/routes/product.route.js), [`admin.route.js`](./server/src/routes/admin.route.js)
- Orders: [`order.route.js`](./server/src/routes/order.route.js), [`order.service.js`](./server/src/services/order.service.js), [`order.model.js`](./server/src/models/order.model.js)
- Contact and email: [`contact.route.js`](./server/src/routes/contact.route.js), [`email.service.js`](./server/src/services/email.service.js)
