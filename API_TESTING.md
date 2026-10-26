# Zayka Nest API Testing Guide

This guide covers the HTTP routes currently mounted by the backend in Postman. It uses placeholders for all credentials and tokens; do not save real passwords or tokens in a shared collection.

## 1. Start the API

From the repository:

```bash
cd server
npm run dev
```

The local base URL is `http://localhost:8000` unless `PORT` is configured differently.

## 2. Configure Postman

Create a Postman environment with these variables:

| Variable | Value |
| --- | --- |
| `base_url` | `http://localhost:8000` |
| `access_token` | Blank initially |
| `super_admin_token` | Blank initially |
| `restaurant_owner_token` | Blank initially |
| `restaurant_id` | A restaurant MongoDB ID |

Use `{{base_url}}/api/v1/...` for request URLs. For protected endpoints, select **Authorization → Bearer Token** and enter the appropriate token variable. For JSON requests, select **Body → raw → JSON** and set `Content-Type: application/json`.

> Keep the Postman cookie jar enabled for `localhost`. Login sets an HttpOnly refresh-token cookie; refresh and logout use that cookie.

## 3. Account and authentication flow

### Register a customer account

**POST** `{{base_url}}/api/v1/auth/register`

```json
{
  "name": "Example Customer",
  "email": "customer@example.com",
  "password": "ExamplePass123"
}
```

Optional field: `phoneNumber` (international format, for example `+14155552671`). Passwords must be 8–72 characters and include an uppercase letter, lowercase letter, and number. Public registration does not accept a role or account status.

Expected: **202 Accepted**. The account must verify its email before login. Follow the verification link delivered by the configured email service. Its token can also be tested directly:

**GET** `{{base_url}}/api/v1/auth/verify-email?token={{verification_token}}`

### Resend email verification

**POST** `{{base_url}}/api/v1/auth/resend-verification`

```json
{
  "email": "customer@example.com"
}
```

### Log in

**POST** `{{base_url}}/api/v1/auth/login`

```json
{
  "email": "customer@example.com",
  "password": "ExamplePass123"
}
```

Expected: **200 OK**. Copy `data.accessToken` into the suitable token variable. For a Super Admin, use the credentials configured for the seeded Super Admin account and save the access token to `super_admin_token`. The login response also sets the refresh cookie.

### Refresh an access token

**POST** `{{base_url}}/api/v1/auth/refresh`

No body or bearer token is required; Postman must send the refresh cookie from login. Save the returned `data.accessToken`.

### Get and update your profile

**GET** `{{base_url}}/api/v1/user/me` — requires a bearer token.

**PATCH** `{{base_url}}/api/v1/user/me` — requires a bearer token. Send one or more profile fields:

```json
{
  "name": "Updated Name",
  "phoneNumber": "+14155552671",
  "address": "123 Example Street"
}
```

Allowed fields are `name`, `phoneNumber`, `address`, and `profileImage`. Profile updates cannot change roles or account status.

### Log out

**POST** `{{base_url}}/api/v1/auth/logout` — requires a bearer token and the refresh cookie. This revokes the refresh token and previously issued access tokens for that account.

## 4. Restaurant owner onboarding and management

### Register a restaurant

Use a verified, active account. Login first, then:

**POST** `{{base_url}}/api/v1/restaurants` — bearer token required.

```json
{
  "name": "Sample Kitchen",
  "description": "A sample restaurant for API testing.",
  "contactPhone": "+14155552671",
  "address": {
    "street": "10 Market Street",
    "city": "San Francisco",
    "state": "California",
    "postalCode": "94105",
    "country": "United States"
  }
}
```

Optional fields: `logo` and `coverImage` (URLs or `null`). A new restaurant starts with `approvalStatus: "PENDING"` and `operationalStatus: "INACTIVE"`. The registering user gains the restaurant role.

### List your restaurants

**GET** `{{base_url}}/api/v1/restaurants/me` — requires a verified, active restaurant-owner account.

### Update your restaurant

**PATCH** `{{base_url}}/api/v1/restaurants/me` — requires a verified, active restaurant-owner account. Include the restaurant ID in the body and at least one field to change:

```json
{
  "restaurantId": "{{restaurant_id}}",
  "description": "Updated restaurant description."
}
```

Allowed update fields: `name`, `description`, `contactPhone`, `address`, `logo`, and `coverImage`. Changing the name or address of an approved restaurant sends it back to **PENDING** and **INACTIVE** for review.

### Activate or deactivate your restaurant

**PATCH** `{{base_url}}/api/v1/restaurants/{{restaurant_id}}/operational-status` — requires the restaurant owner’s bearer token.

```json
{
  "operationalStatus": "ACTIVE"
}
```

Use `"INACTIVE"` to deactivate. Only an approved restaurant can change its operational status; the owner must own the restaurant.

## 5. Super Admin restaurant review flow

Use **Authorization → Bearer Token → `{{super_admin_token}}`** for every endpoint in this section. These endpoints return **403 Forbidden** for a logged-in user without the Super Admin role and **401 Unauthorized** without a valid token.

### List all restaurants

**GET** `{{base_url}}/api/v1/admin/restaurants`

### Filter restaurants by approval status

**GET** `{{base_url}}/api/v1/admin/restaurants?approvalStatus=PENDING`

Supported values: `PENDING`, `APPROVED`, `REJECTED`, and `SUSPENDED`.

### Get restaurant details

**GET** `{{base_url}}/api/v1/admin/restaurants/{{restaurant_id}}`

The response includes the restaurant and owner summary.

### Approve a restaurant

**PATCH** `{{base_url}}/api/v1/admin/restaurants/{{restaurant_id}}/approval`

```json
{
  "approvalStatus": "APPROVED"
}
```

The API records the reviewer and review time, sets `approvedAt`, and clears any previous rejection reason. Approval does not activate the restaurant; it remains inactive until its owner activates it.

### Reject a restaurant

Use a separate test restaurant where possible.

**PATCH** `{{base_url}}/api/v1/admin/restaurants/{{restaurant_id}}/approval`

```json
{
  "approvalStatus": "REJECTED",
  "rejectionReason": "Restaurant information is incomplete."
}
```

A rejection reason is required. The restaurant is set inactive.

### Suspend a restaurant

**PATCH** `{{base_url}}/api/v1/admin/restaurants/{{restaurant_id}}/suspension`

```json
{
  "isSuspended": true,
  "reason": "Administrative review."
}
```

Suspension records the admin and time, changes approval status to `SUSPENDED`, and sets operational status to `INACTIVE`.

### Unsuspend a restaurant

**PATCH** `{{base_url}}/api/v1/admin/restaurants/{{restaurant_id}}/suspension`

```json
{
  "isSuspended": false
}
```

Unsuspending returns the restaurant to `PENDING` and `INACTIVE`; a Super Admin must approve it again before the owner can activate it.

## 6. Suggested end-to-end test order

1. Register and verify a customer/restaurant-owner test account.
2. Log in and save its access token.
3. Register a restaurant and save its returned ID as `restaurant_id`.
4. Confirm the owner sees it through `GET /api/v1/restaurants/me`.
5. Log in as the Super Admin and save that token separately.
6. List all restaurants and filter for `PENDING`.
7. Fetch the test restaurant details.
8. Approve the test restaurant.
9. Log in/use the owner token and activate it; then deactivate it.
10. Test rejection and suspension/unsuspension on disposable test restaurants.
11. Try an admin endpoint with an owner token and with no token; expect **403** and **401**, respectively.

## 7. Customer product ratings

Product listings include `rating` and `ratingCount` when customer ratings exist. Visitors can read the most recent reviews:

**GET** `{{base_url}}/api/v1/products/{{product_id}}/reviews`

Submit a rating with a customer access token. Ratings are integers from 1 to 5; the written comment is optional and limited to 500 characters. Submitting again updates that customer's existing rating.

**PUT** `{{base_url}}/api/v1/products/{{product_id}}/reviews` — requires a customer bearer token.

```json
{
  "rating": 5,
  "comment": "Fresh and delicious."
}
```

The response returns the saved review and the updated product average/count. Customers can retrieve their existing rating to edit it:

**GET** `{{base_url}}/api/v1/products/{{product_id}}/reviews/me` — requires a customer bearer token.

## 8. Opt-in location analytics

After a customer signs in, the frontend asks once whether they want to share approximate location. This is optional and does not block sign-in. The browser must be on HTTPS (or localhost) and the user must grant location permission. The profile page can turn sharing off or back on.

**PATCH** `{{base_url}}/api/v1/user/me/location-consent` — requires a bearer token.

```json
{ "consent": true }
```

Only customers with consent can record login activity:

**POST** `{{base_url}}/api/v1/user/location-activity` — requires a customer bearer token and saved consent.

```json
{
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

The backend rounds these coordinates into roughly 1 km cells and increments a daily cell counter. It does not save the user ID or exact GPS coordinates. Area counts under five login events are hidden from dashboards. Coarse aggregate counts are retained indefinitely; turning consent off stops future collection but does not remove existing aggregates.

Admins, Super Admins, and restaurant partners can retrieve filtered map analytics:

**GET** `{{base_url}}/api/v1/analytics/location-activity?from=2026-10-01&to=2026-10-31&search=28.61`

Restaurant addresses are geocoded using OpenStreetMap Nominatim when a restaurant is registered or its address is saved. To populate map points for restaurants already in the database, run the one-time backfill from a machine configured with the backend database environment:

```bash
cd server
npm run geocode:restaurants
```

The dashboard map uses OpenStreetMap tiles. Its public geocoder and tile services are best-effort and subject to their usage policies.

## 9. Response and validation notes

Successful API responses use `statusCode`, `success`, `message`, and `data`. Errors use `statusCode`, `success: false`, `message`, `data: null`, and `errors`. Schema validation failures generally return **422**; missing records return **404**; duplicate records can return **409**.

Use MongoDB ObjectIds for `restaurant_id` and `product_id`. Do not test rejection or suspension against a real restaurant unless the action is intended.

## 10. Additional routes

Product catalog, restaurant product management, and order APIs are also mounted by the backend; see `server/src/routes/product.route.js` and `server/src/routes/order.route.js` for their current endpoints.
