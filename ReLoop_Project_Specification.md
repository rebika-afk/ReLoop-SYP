# ReLoop — Full Project Specification

## 1. Project Overview

**Project name:** ReLoop  
**Project type:** Multi-category pre-owned marketplace / resale and swapping platform  
**Primary purpose:** Provide a structured online platform where people can buy, sell, and swap second-hand items across multiple categories—not only clothes.

ReLoop is built around the idea of giving products a **second life**. A seller can list an unused or pre-owned item, provide accurate information about its condition, price, images, and category, and connect with potential buyers. Buyers can discover items, search and filter them, save items, make offers, purchase items, or request an item swap.

The platform should feel like a real product rather than a basic student CRUD application. The system therefore includes three meaningful roles:

1. **Buyer/User** — browses and purchases or swaps items.
2. **Seller** — lists and manages items and handles offers/orders/swaps.
3. **Admin** — moderates the platform and manages users, categories, listings, reports, and platform data.

A single account may eventually have both buyer and seller capabilities. In the UI, this can be presented as one normal user account with access to both marketplace and seller functions after the user creates a seller profile/listing.

---

# 2. Problem Statement

People frequently own items that they no longer use but still have value. Existing social-media selling often depends on direct messages, screenshots, spreadsheets, and informal arrangements. This makes it difficult to search for items, compare listings, negotiate prices, track transactions, maintain seller history, or handle reports.

Traditional ecommerce platforms also focus primarily on new products and fixed-price purchases. ReLoop is specifically designed around the second-hand lifecycle:

**List → Discover → Negotiate/Swap → Purchase → Receive → Review → Give the item a second life**

The system should make this process more organized, searchable, transparent, and manageable.

---

# 3. Main Objectives

## 3.1 Primary Objectives

- Build a multi-category marketplace for pre-owned goods.
- Allow users to create and manage second-hand listings.
- Provide powerful search and filtering based on category, price, condition, and location.
- Support wishlist functionality.
- Support a **Wantlist** system where users post what they are looking for.
- Support price offers and seller responses.
- Support normal purchases/orders.
- Support item-to-item swapping.
- Provide seller dashboards and sales/order management.
- Provide admin moderation and reporting tools.
- Build trust through condition details, reviews, ratings, and reports.

## 3.2 Secondary Objectives

- Create a visually modern marketplace interface.
- Keep the system realistic but manageable for a second-year project.
- Use clean role-based architecture.
- Keep payment handling simulated unless a real payment gateway is explicitly required later.
- Design the database so new categories and features can be added without redesigning the entire system.

---

# 4. Target Users

## 4.1 Buyers / Normal Users

People who want to find affordable pre-owned items.

Examples:
- Students
- Young adults
- Collectors
- People looking for used electronics
- People looking for vintage items
- People looking for affordable home items

## 4.2 Sellers

Users who want to sell unused or pre-owned items.

Examples:
- Individuals cleaning out their homes
- Students reselling belongings
- Small second-hand sellers
- Collectors selling items
- People upgrading electronics

## 4.3 Administrators

Platform staff responsible for keeping the marketplace safe, organized, and functional.

---

# 5. Marketplace Categories

ReLoop must not be limited to clothing. The initial category structure can be:

### Fashion
- Clothing
- Shoes
- Bags
- Accessories
- Jewellery

### Electronics
- Phones
- Tablets
- Laptops
- Cameras
- Headphones
- Gaming
- Accessories

### Books & Media
- Books
- Comics
- Magazines
- Music
- Movies

### Home & Living
- Furniture
- Décor
- Kitchen items
- Lighting
- Storage

### Sports & Outdoors
- Sports equipment
- Camping
- Fitness
- Outdoor accessories

### Hobbies & Collectibles
- Art supplies
- Board games
- Toys
- Collectibles
- Musical instruments

### Other
- Miscellaneous reusable items

Admin must be able to add, edit, deactivate, and remove categories.

---

# 6. Core Product Features

ReLoop's minimum core feature set should include the following.

## Feature 1 — Authentication and Accounts

Users can:
- Register
- Log in
- Log out
- Reset password
- Update profile
- Change password
- Manage profile picture
- View account activity

Role access must be enforced server-side.

---

## Feature 2 — Item Listing Management

Sellers can create a listing with:

- Title
- Description
- Category
- Subcategory
- Price
- Original price (optional)
- Condition
- Brand (optional)
- Size (optional for relevant categories)
- Color (optional)
- Quantity
- Location
- Delivery/pickup method
- Images
- Tags
- Listing status

Listing statuses:

`DRAFT → PENDING_REVIEW → ACTIVE → RESERVED → SOLD / SWAPPED / EXPIRED / REMOVED`

For a simpler implementation, the first version may omit `DRAFT` and `EXPIRED`.

---

## Feature 3 — Search and Filtering

Users should be able to search by keywords and filter by:

- Category
- Subcategory
- Minimum price
- Maximum price
- Condition
- Brand
- Location
- Availability
- Listing type
- Sort by newest
- Sort by lowest price
- Sort by highest price
- Sort by relevance

Search should work across listing title, description, tags, and brand where applicable.

---

## Feature 4 — Wishlist

Users can save listings to a wishlist.

Requirements:
- Add item to wishlist
- Remove item
- View wishlist
- Avoid duplicate wishlist entries
- Automatically show when a saved item becomes unavailable

Optional later enhancement:
- Notify the user if the seller lowers the price.

---

## Feature 5 — Wantlist

A Wantlist lets the buyer post what they are looking for rather than waiting for it to appear in the marketplace.

Example:

> Looking for: Used Fujifilm camera  
> Budget: NPR 60,000  
> Condition: Good or better  
> Category: Camera  
> Location: Kathmandu

Wantlist fields:
- Title
- Description
- Category
- Maximum budget
- Preferred condition
- Preferred location
- Status
- Created date
- Expiry date (optional)

Possible status:

`ACTIVE → MATCHED → CLOSED`

The first version can simply show matching listings manually or through a basic rule-based matching system.

---

## Feature 6 — Offers / Negotiation

Buyers can submit an offer lower than or equal to the seller's listed price.

Offer fields:
- Listing ID
- Buyer ID
- Seller ID
- Offered price
- Optional message
- Status
- Created date
- Updated date

Offer statuses:

`PENDING → ACCEPTED / REJECTED / COUNTERED / CANCELLED / EXPIRED`

When a seller accepts an offer:
- The listing can become `RESERVED`.
- A draft order can be created, or the buyer can be taken to checkout.

Do not allow two accepted offers to reserve the same item.

For a simple implementation, permit only one active offer per buyer per listing at a time.

---

## Feature 7 — Buying and Orders

Buyers can purchase an active listing.

Basic checkout flow:

`Cart / Buy Now → Delivery Details → Order Summary → Simulated Payment → Order Created`

Since this is a student project, payment should initially be simulated.

Possible simulated statuses:

**Payment:**
`PENDING → PAID / FAILED / REFUNDED`

**Order:**
`PENDING → CONFIRMED → PACKED → SHIPPED → DELIVERED → COMPLETED / CANCELLED`

Seller can update order progress. Buyer can view progress.

---

## Feature 8 — Swapping

Swapping is one of ReLoop's signature features.

A buyer does not always have to pay money. They can propose one of their own listed items in exchange.

Example:

> I want your denim jacket.  
> I am offering my Bluetooth headphones.

Swap flow:

`REQUESTED → SELLER_REVIEW → ACCEPTED / REJECTED → BOTH_CONFIRM → SWAPPED`

Swap record should store:
- Requester
- Recipient/listing owner
- Wanted listing
- Offered listing
- Optional cash adjustment
- Message
- Status
- Created/updated dates

Important rule:

Both items must be available when the swap is confirmed. If either item is already sold, swapped, removed, or reserved for a conflicting transaction, the swap cannot be completed.

---

## Feature 9 — Reviews and Seller Ratings

After a completed order or swap, the parties can leave feedback.

A review should contain:
- Rating: 1–5
- Comment
- Reviewer ID
- Reviewee/seller ID
- Related order/swap
- Created date

Rules:
- One review per completed transaction per eligible reviewer.
- Reviews cannot be created for cancelled transactions.
- Admin can remove abusive or fraudulent reviews.

Seller profile can show:

`4.7 ★ from 28 reviews`

Do not let users directly edit their rating after submission unless there is a clear controlled workflow.

---

## Feature 10 — Reports and Moderation

Users can report:
- Scam/suspicious listing
- Fake item
- Prohibited item
- Misleading condition
- Inappropriate content
- Suspicious seller
- Review abuse

Report fields:
- Reporter
- Target type
- Target ID
- Reason
- Description
- Evidence image (optional)
- Status
- Admin notes
- Created/updated dates

Report statuses:

`OPEN → UNDER_REVIEW → RESOLVED / DISMISSED`

Admin actions:
- View report
- Remove listing
- Warn user
- Suspend user
- Resolve report
- Dismiss report

---

# 7. Suggested Additional Features

These are optional depending on project scope.

## 7.1 Curated Drops

Admin creates collections such as:
- Under NPR 1000
- Vintage Finds
- Student Essentials
- Electronics Drop
- Room Makeover

A listing can belong to one or more collections.

## 7.2 Recently Viewed

Store the user's most recent listing views.

## 7.3 Seller Verification

Seller can submit verification data and admin can mark:

`UNVERIFIED / VERIFIED / REJECTED`

The listing/profile can display a verified badge.

## 7.4 Price Drop Notification

Notify users when a wishlisted item becomes cheaper.

## 7.5 Basic Recommendations

Start with rule-based recommendations:
- Same category
- Similar price
- Same brand
- Matching tags
- Similar condition

Do not require AI for the base system.

## 7.6 Admin Analytics

Show:
- Total users
- Active sellers
- Active listings
- Sold items
- Completed swaps
- Total order value
- Reports
- New users by month
- Listings by category
- Most popular categories

## 7.7 Seller Analytics

Show:
- Total listings
- Active listings
- Sold items
- Swap count
- Revenue from completed orders
- Most viewed item
- Most saved item
- Sales by month

---

# 8. Roles and Permissions

## 8.1 Buyer/User

Can:
- Register/login
- Manage own profile
- Browse listings
- Search/filter
- View listing details
- Wishlist
- Create Wantlist requests
- Make offers
- Buy items
- View orders
- Request swaps
- Manage own swap requests
- Review completed transactions
- Report listings/users

Cannot:
- Manage other users
- Access admin dashboard
- Edit another seller's listing
- Change platform categories

## 8.2 Seller

Seller is a normal authenticated user with additional marketplace controls.

Can:
- Create listings
- Edit own listings
- Remove/deactivate own listings
- Manage offers
- Accept/reject offers
- Manage orders for own items
- Respond to swap requests
- View sales analytics
- View buyer-related transaction details required to fulfill orders

Cannot:
- Modify another seller's listings
- Access platform admin functions

## 8.3 Admin

Can:
- View all users
- Activate/deactivate/suspend users
- View all listings
- Approve/remove listings
- Manage categories
- View reports
- Resolve reports
- Moderate reviews
- View all orders/swaps
- Manage curated collections
- View platform analytics
- Manage configuration settings

---

# 9. Main User Workflows

## 9.1 Register and Browse

1. User visits ReLoop.
2. User registers.
3. User logs in.
4. User browses marketplace.
5. User searches/filter listings.
6. User opens a listing.
7. User chooses:
   - Wishlist
   - Make Offer
   - Buy Now
   - Swap

---

## 9.2 Seller Creates Listing

1. Seller logs in.
2. Opens Seller Dashboard.
3. Clicks `Add Item`.
4. Enters listing information.
5. Uploads images.
6. Submits listing.
7. Listing enters `PENDING_REVIEW` if admin approval is enabled.
8. Admin approves.
9. Listing becomes `ACTIVE`.
10. Item appears in marketplace.

For a lower-complexity build, listings can become active immediately and admin moderation can happen afterward.

---

## 9.3 Offer Workflow

1. Buyer opens listing.
2. Clicks `Make Offer`.
3. Enters proposed price.
4. System validates offer.
5. Seller receives notification.
6. Seller accepts/rejects/counters.
7. If accepted, listing becomes reserved.
8. Buyer completes purchase.
9. Order is created.

---

## 9.4 Swap Workflow

1. Buyer opens listing.
2. Clicks `Propose Swap`.
3. System shows the buyer's own eligible listings.
4. Buyer selects offered item.
5. Buyer can add a message and optional cash adjustment.
6. Seller receives request.
7. Seller accepts or rejects.
8. Both sides confirm.
9. System marks both listings as unavailable/swapped.
10. Swap record becomes completed.
11. Users can review the transaction.

---

## 9.5 Order Workflow

1. Buyer selects item.
2. System verifies listing is active.
3. Buyer enters delivery information.
4. System creates order.
5. Simulated payment succeeds.
6. Listing becomes sold/reserved according to flow.
7. Seller confirms.
8. Seller packs and ships.
9. Buyer sees status updates.
10. Seller marks delivered.
11. Buyer confirms completion.
12. Review becomes available.

---

# 10. Listing Lifecycle

The most important listing state machine is:

```text
PENDING_REVIEW
       |
       v
    ACTIVE
   /  |  \
  /   |   \
 v    v    v
RESERVED SOLD SWAPPED
  |      
  v
ACTIVE (if reservation expires/cancels)
```

A listing cannot be purchased when it is:
- SOLD
- SWAPPED
- REMOVED
- EXPIRED

A listing should not be simultaneously reserved by two transactions.

---

# 11. Suggested Technology Stack

The following stack is recommended because it is modern, understandable, and suitable for a second-year web application.

## Option A — Recommended Full-Stack JavaScript

### Frontend
- React
- Vite
- React Router
- Axios or native Fetch
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL

### ORM
- Prisma

### Authentication
- JWT
- HTTP-only cookies preferred
- bcrypt/argon2 for password hashing

### Image Storage
For the student version:
- Local uploads during development, or
- Cloudinary / Supabase Storage if external image storage is allowed

### Validation
- Zod on frontend/server boundary, and/or
- Express validation middleware

### Development tools
- VS Code
- Git/GitHub
- Postman/Insomnia
- Prisma Studio
- npm

### Deployment options
- Frontend: Vercel / Netlify
- Backend: Render / Railway / similar
- PostgreSQL: Supabase / Neon / Railway / local PostgreSQL

The project must be able to run completely locally without relying on deployment services.

---

# 12. Alternative Technology Stack

If the course requires Java/Python instead of JavaScript, the same product can be implemented as:

### Java
- Spring Boot
- Spring Security
- PostgreSQL/MySQL
- JPA/Hibernate
- React frontend or server-rendered frontend

### Python
- Django
- Django REST Framework
- PostgreSQL
- React frontend or Django templates

The architecture and database entities in this specification remain the same.

---

# 13. Recommended Architecture

Use a clean three-layer structure:

```text
Frontend
   |
   | HTTP/JSON
   v
REST API / Backend
   |
   +--> Authentication
   +--> Business Logic
   +--> Validation
   +--> Authorization
   |
   v
Database
```

More detailed:

```text
React UI
  |
  +-- Components
  +-- Pages
  +-- Hooks
  +-- API client
  +-- Auth state
  |
  v
Express API
  |
  +-- Routes
  +-- Controllers
  +-- Services
  +-- Middleware
  +-- Validation
  +-- Authorization
  |
  v
Prisma ORM
  |
  v
PostgreSQL
```

Keep business logic out of React components as much as practical. Keep controllers thin and put complex workflows in service functions.

---

# 14. Database Design

Recommended database tables/entities:

1. `users`
2. `seller_profiles`
3. `categories`
4. `subcategories` (optional)
5. `listings`
6. `listing_images`
7. `wishlists`
8. `wishlist_items`
9. `wantlists`
10. `offers`
11. `orders`
12. `order_items` (useful for future cart support)
13. `addresses`
14. `payments`
15. `swap_requests`
16. `reviews`
17. `reports`
18. `notifications`
19. `collections`
20. `collection_items`
21. `user_favorites` can be merged into wishlist_items if desired
22. `audit_logs` (optional but useful for admin)

---

# 15. Core Database Relationships

## Users

A user can:
- create many listings
- make many offers
- make many purchases
- create many wantlists
- have many wishlist items
- create many swap requests
- write many reviews
- submit many reports
- receive notifications

Relationship concept:

```text
User 1 ---- * Listings
User 1 ---- * Offers
User 1 ---- * Orders
User 1 ---- * Reviews
User 1 ---- * Reports
```

## Categories

One category has many listings.

```text
Category 1 ---- * Listings
```

## Listings

A listing belongs to:
- one seller/user
- one category

A listing can have:
- many images
- many offers
- many wishlist references
- many reports

## Orders

An order belongs to:
- one buyer
- one seller in the simplest model

For future scalability, use `order_items` so one order can contain multiple listings.

## Reviews

A review belongs to:
- one reviewer
- one reviewee
- one completed transaction

## Swap Requests

A swap connects:
- one requester
- one target listing owner
- one wanted listing
- one offered listing

---

# 16. Simplified ER Diagram

```text
                         USERS
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
      LISTINGS          ORDERS           REVIEWS
          |                |                |
          |                |                |
          v                v                v
     LISTING_IMAGES      PAYMENTS       REPORTS
          |
          v
     CATEGORIES
          |
          v
   SUBCATEGORIES

USERS ---> OFFERS ---> LISTINGS
  |
  +----> WISHLISTS ---> LISTINGS
  |
  +----> WANTLISTS
  |
  +----> SWAP_REQUESTS <---- LISTINGS
  |
  +----> NOTIFICATIONS
```

---

# 17. Example Prisma-Style Data Models

These are conceptual examples. Adjust the exact syntax and fields to match the chosen implementation.

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         UserRole @default(USER)
  avatarUrl    String?
  phone        String?
  location     String?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  listings     Listing[]
  offersMade   Offer[]  @relation("BuyerOffers")
  orders       Order[]  @relation("BuyerOrders")
  reviewsGiven Review[] @relation("ReviewerReviews")
  reviewsGot   Review[] @relation("RevieweeReviews")
}

enum UserRole {
  USER
  ADMIN
}
```

A seller does not necessarily need a separate authentication role. A normal user can become a seller by creating listings/seller profile information. This avoids unnecessarily complicated permissions.

Example listing:

```prisma
model Listing {
  id             String        @id @default(cuid())
  sellerId       String
  categoryId     String
  title          String
  description    String
  price          Decimal
  originalPrice  Decimal?
  condition      ItemCondition
  brand          String?
  color          String?
  size           String?
  quantity       Int           @default(1)
  location       String?
  status         ListingStatus @default(PENDING_REVIEW)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  seller         User          @relation(fields: [sellerId], references: [id])
  category       Category      @relation(fields: [categoryId], references: [id])
  images         ListingImage[]
  offers         Offer[]
}

enum ItemCondition {
  LIKE_NEW
  EXCELLENT
  GOOD
  FAIR
}

enum ListingStatus {
  PENDING_REVIEW
  ACTIVE
  RESERVED
  SOLD
  SWAPPED
  REMOVED
  EXPIRED
}
```

---

# 18. API Structure

Use REST APIs with consistent JSON responses.

Base URL:

```text
/api/v1
```

## Authentication

```text
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/me
```

## Users

```text
GET    /users/me
PATCH  /users/me
PATCH  /users/me/password
GET    /users/:id/public
```

## Listings

```text
GET    /listings
POST   /listings
GET    /listings/:id
PATCH  /listings/:id
DELETE /listings/:id
PATCH  /listings/:id/status
```

Supported query parameters:

```text
?q=
&category=
&minPrice=
&maxPrice=
&condition=
&location=
&sort=
&page=
&limit=
```

## Categories

```text
GET    /categories
GET    /categories/:id
POST   /admin/categories
PATCH  /admin/categories/:id
DELETE /admin/categories/:id
```

## Wishlist

```text
GET    /wishlist
POST   /wishlist/:listingId
DELETE /wishlist/:listingId
```

## Wantlists

```text
GET    /wantlists
POST   /wantlists
GET    /wantlists/:id
PATCH  /wantlists/:id
DELETE /wantlists/:id
```

## Offers

```text
POST   /listings/:listingId/offers
GET    /offers/sent
GET    /offers/received
PATCH  /offers/:id
```

## Orders

```text
POST   /orders
GET    /orders
GET    /orders/:id
PATCH  /orders/:id/status
POST   /orders/:id/cancel
```

## Swaps

```text
POST   /swaps
GET    /swaps/sent
GET    /swaps/received
PATCH  /swaps/:id
```

## Reviews

```text
POST   /reviews
GET    /users/:id/reviews
```

## Reports

```text
POST   /reports
GET    /admin/reports
PATCH  /admin/reports/:id
```

## Admin

```text
GET    /admin/dashboard
GET    /admin/users
PATCH  /admin/users/:id/status
GET    /admin/listings
PATCH  /admin/listings/:id/moderate
GET    /admin/orders
GET    /admin/swaps
GET    /admin/analytics
```

---

# 19. API Response Convention

Successful response example:

```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "title": "Vintage Denim Jacket"
  }
}
```

Error response example:

```json
{
  "success": false,
  "error": {
    "code": "LISTING_UNAVAILABLE",
    "message": "This item is no longer available."
  }
}
```

Use meaningful HTTP status codes:

- `200` successful read/update
- `201` created
- `204` successful delete with no body
- `400` invalid input
- `401` unauthenticated
- `403` authenticated but not authorized
- `404` not found
- `409` conflict
- `422` validation error if chosen
- `500` unexpected server error

---

# 20. Frontend Page Structure

## Public Pages

```text
/
/explore
/listing/:id
/category/:slug
/login
/register
/forgot-password
/about
/contact
```

## User Pages

```text
/account
/account/profile
/account/wishlist
/account/wantlist
/account/offers
/account/orders
/account/swaps
/account/reviews
/account/notifications
```

## Seller Pages

```text
/seller
/seller/listings
/seller/listings/new
/seller/listings/:id/edit
/seller/orders
/seller/offers
/seller/swaps
/seller/analytics
/seller/profile
```

## Admin Pages

```text
/admin
/admin/users
/admin/listings
/admin/categories
/admin/reports
/admin/orders
/admin/swaps
/admin/reviews
/admin/collections
/admin/analytics
```

---

# 21. Homepage Structure

The homepage should feel like a marketplace, not an admin dashboard.

Suggested structure:

```text
------------------------------------------------
NAVBAR
Logo | Explore | Categories | Wantlist | Login
------------------------------------------------

HERO
"Give good things another life."
Search: Search for items...

[Explore Items] [Sell an Item]

------------------------------------------------
CATEGORY GRID
Fashion | Electronics | Home | Books | Hobbies
------------------------------------------------

FEATURED ITEMS
[card] [card] [card] [card]

------------------------------------------------
CURATED DROP / COLLECTION
"Student Essentials"
------------------------------------------------

HOW RELOOP WORKS
Sell → Find → Buy or Swap → Reuse
------------------------------------------------

RECENTLY LISTED
[card] [card] [card] [card]
------------------------------------------------

FOOTER
```

---

# 22. Listing Card Design

Each listing card should show:

- Main image
- Item title
- Price
- Condition badge
- Category
- Location
- Wishlist button
- Seller mini-profile

Example:

```text
┌───────────────────────┐
│        IMAGE          │
│                 ♡     │
├───────────────────────┤
│ Vintage Denim Jacket  │
│ Good Condition        │
│ NPR 2,500             │
│ Kathmandu             │
│ ● Becca               │
└───────────────────────┘
```

Avoid overcrowding cards with unnecessary metadata.

---

# 23. Listing Detail Page

Recommended sections:

### Left
Image gallery.

### Right
- Title
- Price
- Condition
- Seller
- Location
- Availability
- Buy Now
- Make Offer
- Propose Swap
- Add to Wishlist

### Below
- Description
- Item condition details
- Item story
- Specifications
- Seller information
- Reviews
- Similar listings
- Report listing

---

# 24. Seller Dashboard

Dashboard should immediately answer:

> What is happening with my items?

Top summary cards:

```text
Active Listings     24
Pending Offers       6
Orders This Month   17
Completed Sales     32
```

Charts:
- Monthly sales
- Listings by category
- Most viewed listings
- Most wishlisted listings

Tables:
- Recent orders
- Recent offers
- Recently added items

---

# 25. Admin Dashboard

Admin dashboard should focus on platform health.

Cards:

```text
Total Users          1,284
Active Listings        642
Orders This Month      187
Open Reports            14
Completed Swaps         43
```

Admin tables:
- New users
- Pending listings
- Recent reports
- Recent orders

Graphs:
- User growth
- Listings by category
- Sales volume
- Report volume

---

# 26. Authentication Design

Recommended:

```text
Register
   ↓
Validate input
   ↓
Hash password
   ↓
Create user
   ↓
Login
   ↓
Create session/JWT
   ↓
Access protected routes
```

Never store plain-text passwords.

Never trust a role supplied by the frontend.

Backend must determine the authenticated user from a valid token/session.

---

# 27. Authorization Rules

Every protected API must verify:

1. Is the user authenticated?
2. Does the user have permission for this resource?
3. Does the resource belong to that user where ownership matters?

Example:

```text
PATCH /listings/ABC
```

A seller must not be able to edit listing `ABC` merely because they are a seller.

The backend must verify:

```text
listing.sellerId === authenticatedUser.id
```

Admin routes require admin authorization.

---

# 28. Validation Rules

## Registration

- Name required
- Valid email
- Email unique
- Password minimum length
- Password confirmation must match

## Listing

- Title required
- Description required
- Category required
- Price must be greater than 0
- Condition required
- At least one image recommended
- Quantity must be >= 1

## Offer

- Listing must be active
- Offer price > 0
- Offer cannot be accepted if listing is unavailable

## Review

- Only completed transactions can be reviewed
- Rating must be 1–5

## Swap

- Offered listing must belong to requester
- Wanted listing must belong to another user
- Both must be eligible and available
- User cannot offer the same listing they are trying to obtain

---

# 29. Business Rules

These rules should be implemented in the backend service layer.

### Rule 1
A sold item cannot be purchased again.

### Rule 2
A swapped item cannot be purchased.

### Rule 3
A removed listing is invisible to normal marketplace searches.

### Rule 4
Only the seller can accept/reject offers for their listing.

### Rule 5
Only the buyer can cancel their pending order before seller confirmation, subject to the chosen project policy.

### Rule 6
Only eligible completed transactions can generate reviews.

### Rule 7
A user cannot review themselves.

### Rule 8
A user can only edit their own listings.

### Rule 9
Admin can moderate any listing.

### Rule 10
A listing cannot have contradictory states. For example, `SOLD` and `ACTIVE` must never both be true.

---

# 30. Image Handling

Listings need multiple images.

Recommended structure:

```text
Listing
  ├── image 1
  ├── image 2
  ├── image 3
  └── image 4
```

Store image URLs/paths in the database, not raw huge binary image data in normal listing records.

For a local student build:

```text
/backend/uploads/listings/
```

Use generated unique filenames.

Validate:
- MIME type
- File extension
- Maximum file size

Do not trust the file name sent by a user.

---

# 31. Notifications

Notifications should be generated for important events.

Examples:

- Listing approved
- Listing removed
- New offer received
- Offer accepted
- Offer rejected
- Counter-offer received
- Order confirmed
- Order shipped
- Order delivered
- Swap request received
- Swap accepted
- New review
- Report/update notification
- Wantlist match

Initial implementation can be an in-app notification center.

Email notifications can remain optional.

---

# 32. Search Strategy

Start simple.

For a second-year project, PostgreSQL search with indexed columns and case-insensitive matching is enough.

Example concept:

```text
?q=denim jacket
```

Search:
- title
- description
- brand
- tags

Later, full-text search can be added if required.

Do not start by introducing Elasticsearch unless the coursework specifically demands it.

---

# 33. Pagination

Marketplace lists must use pagination.

Example:

```text
GET /listings?page=2&limit=20
```

Return:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 126,
    "totalPages": 7
  }
}
```

This prevents loading the entire marketplace at once.

---

# 34. Cart Strategy

There are two possible designs.

## Simpler Version — Buy Now

User purchases one item at a time.

Advantages:
- Easier database logic
- Easier order workflow
- Easier seller ownership handling

## Expanded Version — Cart

User can add multiple items.

If using a cart, group orders by seller or allow a platform-level order with multiple sellers.

For a second-year project, **Buy Now first, cart later** is recommended.

---

# 35. Payment Strategy

Do not make real payment processing a requirement unless explicitly requested by the course.

Use a simulated flow:

```text
Checkout
   ↓
Choose payment method
   ↓
Simulate success/failure
   ↓
Create payment record
   ↓
Create/update order
```

Possible methods:
- Cash on Delivery
- Simulated Card
- Simulated Digital Wallet

Clearly label it as a project simulation if presented academically.

---

# 36. Seller Profile

Seller profile should display:

- Profile image
- Display name
- Location
- Joined date
- Verification badge if implemented
- Rating
- Review count
- Active listing count
- Completed sales/swaps
- Seller reviews

Privacy-sensitive information such as exact phone number should not be publicly displayed unless intentionally designed.

---

# 37. Admin Moderation Strategy

Admin moderation should not require approving every listing manually unless the project needs that flow.

Two possible approaches:

### Approach A — Approval First

```text
Seller submits
↓
Pending review
↓
Admin approves
↓
Listing active
```

### Approach B — Publish First

```text
Seller submits
↓
Listing active
↓
Users report problems
↓
Admin moderates
```

For a coursework demonstration, **Approach A is easier to explain** and demonstrates an additional workflow.

---

# 38. Prohibited Listings

Admin should be able to define prohibited categories/items.

Examples for demonstration only:
- Illegal goods
- Weapons
- Controlled substances
- Counterfeit goods
- Stolen goods
- Other prohibited products according to platform policy

The exact moderation policy should be documented in the final application.

---

# 39. Security Requirements

Minimum security:

- Password hashing
- Authentication middleware
- Role/permission checks
- Input validation
- Parameterized queries through ORM
- Server-side ownership checks
- File upload validation
- Rate limiting on sensitive endpoints where practical
- Safe error messages
- Environment variables for secrets
- No API keys committed to Git
- CORS configured deliberately

Never store:

```text
PASSWORD=123456
```

in plain text in the database.

---

# 40. Environment Variables

Example `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/reloop"
JWT_SECRET="replace-with-strong-secret"
PORT=5000
CLIENT_URL="http://localhost:5173"
UPLOAD_DIR="uploads"
```

Never commit real secrets.

Provide `.env.example`:

```env
DATABASE_URL=
JWT_SECRET=
PORT=5000
CLIENT_URL=
UPLOAD_DIR=uploads
```

---

# 41. Suggested Folder Structure

## Backend

```text
backend/
├── src/
│   ├── config/
│   │   └── env.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── listingController.js
│   │   ├── offerController.js
│   │   ├── orderController.js
│   │   ├── swapController.js
│   │   ├── reviewController.js
│   │   ├── reportController.js
│   │   └── adminController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── listingService.js
│   │   ├── offerService.js
│   │   ├── orderService.js
│   │   ├── swapService.js
│   │   ├── reviewService.js
│   │   └── notificationService.js
│   ├── routes/
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── validators/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── uploads/
└── package.json
```

## Frontend

```text
frontend/
├── src/
│   ├── components/
│   │   ├── navbar/
│   │   ├── cards/
│   │   ├── forms/
│   │   ├── modals/
│   │   └── common/
│   ├── pages/
│   │   ├── public/
│   │   ├── user/
│   │   ├── seller/
│   │   └── admin/
│   ├── layouts/
│   ├── services/
│   ├── hooks/
│   ├── context/
│   ├── routes/
│   ├── utils/
│   ├── assets/
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

---

# 42. UI / Design Direction

ReLoop should visually communicate:

- modern
- youthful
- sustainable
- trustworthy
- marketplace
- slightly playful

Avoid making it look like a corporate ERP.

### Suggested visual hierarchy

Use:
- large item imagery
- clear price typography
- condition badges
- generous whitespace
- simple cards
- clear status chips
- soft borders
- rounded but not excessive UI elements

### Brand concept

Potential tagline:

> **Give good things another life.**

Alternative:

> **Find it. Love it. ReLoop it.**

---

# 43. Important UX Principles

### Principle 1 — Marketplace first

The user should be able to discover items immediately.

### Principle 2 — Selling should be easy

Seller flow should feel like:

```text
Upload photos
→ Add details
→ Set price
→ Publish
```

### Principle 3 — Trust should be visible

Display:
- condition
- seller rating
- review count
- location
- verification status

### Principle 4 — Don't overload the listing card

Detailed information belongs on the listing detail page.

### Principle 5 — Status must always be understandable

Use plain wording:

`Offer Accepted`
`Order Shipped`
`Swap Request Pending`

instead of technical codes.

---

# 44. Recommended Dashboard Navigation

## User

```text
Dashboard
Explore
Wishlist
Wantlist
Offers
Orders
Swaps
Notifications
Profile
```

## Seller

```text
Overview
My Listings
Add Listing
Orders
Offers
Swaps
Analytics
Seller Profile
```

## Admin

```text
Overview
Users
Listings
Categories
Reports
Orders
Swaps
Reviews
Collections
Analytics
Settings
```

---

# 45. Seed/Demo Data

Create realistic demo data so the project does not look empty during presentation.

Suggested:

### Users
- 10–20 regular users
- 5–10 active sellers
- 1 admin

### Listings
At least 30–50 sample items across several categories.

Example:
- Vintage jacket
- Used camera
- Mechanical keyboard
- Desk lamp
- Study books
- Headphones
- Backpack
- Basketball
- Art supplies
- Gaming controller

### Orders
Create a few completed and active orders.

### Offers
Create pending, accepted, rejected, and countered examples.

### Swaps
Create at least:
- one pending
- one rejected
- one completed

### Reports
Create realistic moderation examples.

---

# 46. Seed Admin Account

For development only, seed a known admin account.

Example placeholder:

```text
Email: admin@reloop.local
Password: ChangeMe123!
```

The password should be changed before any real deployment.

---

# 47. Testing Plan

The project should test both happy paths and failure cases.

## Authentication Tests

- Register valid user
- Register duplicate email
- Login valid account
- Login invalid password
- Access protected route without authentication

## Listing Tests

- Create valid listing
- Reject missing required field
- Prevent non-owner from editing listing
- Search listing
- Filter listing
- Remove listing

## Offer Tests

- Make valid offer
- Prevent offer on sold listing
- Accept offer
- Reject offer
- Counter offer

## Order Tests

- Buy available item
- Prevent double purchase
- Cancel eligible order
- Update shipping status

## Swap Tests

- Offer own listing
- Prevent offering another user's listing
- Accept swap
- Reject swap
- Prevent swap when one item is unavailable

## Review Tests

- Review completed transaction
- Prevent review before completion
- Prevent duplicate review

## Admin Tests

- Admin can moderate listing
- Regular user cannot access admin routes
- Admin can resolve reports

---

# 48. Edge Cases That Must Be Considered

1. Two buyers attempt to buy the same single-quantity item.
2. Buyer makes an offer while another offer has already reserved it.
3. Seller deletes an item with active offers.
4. Seller removes a listing after an order is placed.
5. User tries to swap an item they do not own.
6. User tries to swap an item already sold.
7. User attempts to review before order completion.
8. User reports the same content repeatedly.
9. Uploaded image is too large or invalid.
10. Search returns no results.
11. Category is deactivated while listings still exist.
12. Seller account is suspended while they have active listings.

Define expected behavior for every critical edge case.

---

# 49. Transaction / Concurrency Rules

Because an item can only be sold or swapped once, the backend should use a transaction when changing critical states.

Conceptually:

```text
BEGIN TRANSACTION
    Check listing status
    Lock/check availability
    Create order or swap completion
    Change listing status
COMMIT
```

The exact implementation depends on the selected ORM/database.

This is especially important for single-quantity items.

---

# 50. Suggested MVP

Do **not** build every possible feature at once.

The minimum viable project should contain:

### Authentication
- Register/login/logout

### Marketplace
- Categories
- Listing creation
- Listing browsing
- Listing detail
- Search/filter

### User
- Wishlist
- Orders
- Offers

### Seller
- Listing management
- Offer management
- Order management

### Admin
- User management
- Listing moderation
- Category management
- Reports

### Signature feature
- **Swapping** OR **Wantlist**

A strong MVP with 7–9 complete workflows is much better than 20 unfinished features.

---

# 51. Phase 2 Features

Once MVP works:

- Wantlist matching
- Swap workflow
- Seller verification
- Curated collections
- Notifications
- Analytics
- Recently viewed
- Price-drop alerts
- Recommendation system

---

# 52. Phase 3 / Advanced Features

Only add these if the basic project is stable:

- Real payment gateway
- Email notifications
- Real-time offer updates
- Advanced full-text search
- Image optimization/CDN
- AI-based item categorization
- AI-assisted listing description
- AI price suggestions based on historical listings
- Recommendation engine
- Multi-language support
- PWA/mobile responsiveness improvements

Advanced features must never break the core marketplace.

---

# 53. AI Features — Optional, Not the Core

AI can be used carefully where it supports actual marketplace workflows.

## AI Listing Assistant

Seller uploads item information and receives a suggested listing description.

Input:

```text
Black leather jacket
Used for 1 year
Small scratch near sleeve
Size M
```

Possible generated result:

> Pre-owned black leather jacket in good condition. Size M with a small visible scratch near the sleeve. Suitable for casual and winter wear.

The seller must review before publishing.

## AI Category Suggestion

User uploads an image or enters a title, and the system suggests:

`Fashion → Jackets`

## AI Price Suggestion

Given:
- category
- condition
- original price
- age

The system can provide a suggested price range.

This should be presented as an estimate, not guaranteed valuation.

---

# 54. Do NOT Overengineer

Avoid these unless specifically required:

- Microservices
- Kubernetes
- Elasticsearch
- Complex event-driven architecture
- Real payment settlement
- Real-time WebSocket infrastructure everywhere
- Native Android/iOS apps
- Machine-learning model training from scratch
- Blockchain

A monolithic REST backend + relational database is completely sufficient.

---

# 55. Suggested Development Order

## Step 1 — Project setup

Create:
- frontend
- backend
- database
- Git repository
- environment files

## Step 2 — Database

Build:
- users
- categories
- listings
- listing images

Run migrations.

## Step 3 — Authentication

Implement:
- register
- login
- logout
- auth middleware

## Step 4 — Marketplace

Implement:
- listing creation
- listing editing
- browsing
- detail page
- search/filter

## Step 5 — User features

Implement:
- wishlist
- profile
- orders

## Step 6 — Seller features

Implement:
- seller dashboard
- offers
- order statuses
- analytics

## Step 7 — Admin

Implement:
- admin dashboard
- moderation
- users
- categories
- reports

## Step 8 — Signature features

Implement:
- swaps
- Wantlist

## Step 9 — Polish

Add:
- notifications
- empty states
- loading states
- error handling
- responsive design
- validation messages

## Step 10 — Testing

Test workflows from start to finish.

---

# 56. Git Strategy

Use meaningful commits.

Examples:

```text
feat: add user authentication
feat: create listing API
feat: add marketplace search
feat: implement wishlist
feat: add seller dashboard
feat: implement offer workflow
feat: add order status flow
feat: add admin moderation
feat: implement swap workflow
fix: prevent duplicate purchases
fix: validate listing ownership
style: improve listing cards
```

Avoid commits such as:

```text
update
final
final2
final-final
please-work
```

---

# 57. Coding Agent Instructions

If a coding agent is used, the agent should follow these rules.

## Rule 1 — Read this file first

Treat this specification as the source of truth for the project.

## Rule 2 — Do not invent major features

Do not add unnecessary features that increase complexity unless requested.

## Rule 3 — Ask before changing architecture

If a task would require changing the database model or authentication architecture, explain the impact before implementing a major structural change.

## Rule 4 — Build vertically

Prefer completing an entire workflow rather than building many disconnected screens.

Example:

```text
Listing DB
→ API
→ Listing Page
→ Seller Form
→ Marketplace Card
```

## Rule 5 — Validate on the backend

Frontend validation is for UX. Backend validation is mandatory.

## Rule 6 — Protect ownership

Never rely only on hidden UI buttons to protect resources.

## Rule 7 — Reuse components

Create reusable components for:
- Listing cards
- Form inputs
- Modal dialogs
- Status badges
- Pagination
- Empty states
- Loading states

## Rule 8 — Keep code readable

Use descriptive names and small functions.

## Rule 9 — Handle errors

Every API call should have an error path.

## Rule 10 — Keep API and frontend contracts explicit

Document request/response shapes.

---

# 58. Coding Standards

## JavaScript

Prefer:
- `const` by default
- `let` when reassignment is required
- async/await
- early returns
- descriptive variable names
- reusable functions

Avoid:
- giant components
- deeply nested callbacks
- duplicated API logic
- hard-coded IDs
- hard-coded user roles

## React

Prefer:
- functional components
- reusable hooks
- centralized API client
- controlled forms where appropriate

Avoid putting business rules in UI-only code.

## Backend

Prefer:

```text
route → controller → service → ORM
```

Avoid writing database logic directly in routes.

---

# 59. Error Messages

Messages should be understandable to a normal user.

Bad:

```text
ERR_409_LS_01
```

Better:

> This item is no longer available.

For developers, logs can include detailed error codes.

---

# 60. Empty States

Every list page needs an empty state.

Examples:

### Wishlist
> Your wishlist is empty. Start saving items you love.

### Orders
> You have not placed any orders yet.

### Seller Listings
> You haven't listed anything yet. Give one of your unused items a second life.

### Search
> No items found. Try another search or remove a filter.

---

# 61. Loading States

Use loading indicators for:
- marketplace results
- listing page
- dashboard charts
- orders
- offers
- admin tables

Avoid blank screens while requests are loading.

---

# 62. Responsive Design

The project must work on:
- Desktop
- Tablet
- Mobile

Important mobile screens:
- Home
- Explore
- Listing details
- Add listing
- Orders
- Seller dashboard

The marketplace should not require horizontal scrolling on mobile.

---

# 63. Accessibility Basics

At minimum:
- Semantic HTML
- Labels for form inputs
- Keyboard-focusable controls
- Alt text for listing images
- Reasonable contrast
- Buttons should have clear text/tooltips
- Do not communicate status through color alone

---

# 64. Performance Basics

- Paginate listings
- Compress/resize uploaded images
- Lazy-load listing images where appropriate
- Avoid fetching all admin data on initial dashboard load
- Add database indexes for commonly searched fields

Potential indexes:
- `users.email`
- `listings.categoryId`
- `listings.status`
- `listings.price`
- `listings.createdAt`
- search-related fields depending on DB implementation

---

# 65. Suggested Database Indexes

At minimum:

```text
users.email UNIQUE
listings.sellerId
listings.categoryId
listings.status
listings.price
listings.createdAt
offers.listingId
offers.buyerId
orders.buyerId
orders.sellerId
reports.status
notifications.userId
```

Tune based on actual queries.

---

# 66. Logging

Log important backend events:

- Authentication failure
- Admin actions
- Listing moderation
- Order failures
- Swap conflicts
- Unexpected server errors

Do not log sensitive information such as raw passwords or secrets.

---

# 67. Backup / Data Considerations

For local development:
- Keep seed script
- Keep schema migrations
- Keep sample data reproducible

For deployment:
- Use database backups through the chosen hosting provider
- Never store critical data only on the developer's machine

---

# 68. Project Demonstration Flow

A strong presentation/demo can follow one continuous story.

### Step 1
Register as a buyer.

### Step 2
Browse the marketplace.

### Step 3
Search for a specific item.

### Step 4
Add it to wishlist.

### Step 5
Open listing and make an offer.

### Step 6
Switch to seller account.

### Step 7
Show seller receiving the offer.

### Step 8
Accept the offer.

### Step 9
Complete simulated purchase.

### Step 10
Show order status.

### Step 11
Demonstrate a swap between another pair of items.

### Step 12
Show review.

### Step 13
Switch to admin.

### Step 14
Show listing moderation and report handling.

### Step 15
Show analytics.

This gives the examiner a clear picture of the entire system.

---

# 69. Possible Coursework Modules Demonstrated

Depending on the course, ReLoop can demonstrate:

- Software engineering
- Web development
- Database design
- Object-oriented programming if implemented in Java
- Authentication
- Authorization
- API development
- CRUD operations
- State management
- UI/UX
- Validation
- Security
- Testing
- Agile development
- Version control
- Data analysis/dashboarding

---

# 70. Potential UML Components

The project lends itself to several diagrams.

## Use Case Diagram

Actors:
- User/Buyer
- Seller
- Admin

Use cases:
- Register
- Login
- Browse listings
- Search/filter
- Wishlist
- Wantlist
- Make offer
- Buy item
- Request swap
- Manage listing
- Manage orders
- Moderate listings
- Manage reports

## Class Diagram

Potential classes/entities:

```text
User
SellerProfile
Category
Listing
ListingImage
Wishlist
Wantlist
Offer
Order
OrderItem
Payment
SwapRequest
Review
Report
Notification
Collection
```

## Activity Diagrams

Recommended:
- Selling an item
- Buying an item
- Making an offer
- Swapping items
- Admin moderation

---

# 71. Non-Functional Requirements

## Usability

Users should understand how to browse, sell, buy, and swap without training.

## Performance

Normal listing pages should load quickly under typical student/demo data volumes.

## Security

Only authorized users should access protected resources.

## Reliability

Critical transaction workflows should not leave inconsistent listing/order states.

## Maintainability

Use modular architecture and reusable components.

## Scalability

The database structure should support additional categories, listings, and users without structural redesign.

## Portability

The project should work on a standard developer machine with documented setup steps.

---

# 72. Constraints

The project should remain realistic for a second-year implementation.

### In scope
- Web application
- Three roles/panels
- Relational database
- Authentication
- Marketplace
- Seller functionality
- Admin moderation
- Offers
- Orders
- Wishlist
- Swap/Wantlist
- Simulated payment

### Out of scope for MVP
- Real banking settlement
- Complex logistics provider integration
- Full social network
- Native mobile apps
- Cryptocurrency
- Blockchain
- Machine learning model training
- Global multi-language infrastructure

---

# 73. Future Expansion

A future commercial version of ReLoop could support:

- Real payment gateways
- Delivery integration
- Seller subscriptions
- Featured listings
- Commission model
- Business seller accounts
- Multi-vendor cart
- Advanced recommendation engine
- AI-assisted listing creation
- Image-based category detection
- Price estimation
- Fraud detection
- Chat between buyer and seller
- Seller verification/KYC workflows
- Mobile application
- Location-based marketplace discovery
- Social following
- Public seller storefronts

These should remain future ideas rather than MVP requirements.

---

# 74. Possible Business Model

If ReLoop is later treated as a real startup/SaaS-style platform, possible revenue models include:

### Transaction fee
Take a small percentage from completed sales.

### Featured listing
Seller pays to promote an item.

### Seller subscription
Premium seller tools and analytics.

### Business seller plan
More listings, advanced analytics, storefront features.

### Sponsored collections
Businesses can promote collections.

For the academic project, these can be **simulated** through subscription/status fields rather than implementing actual payment billing.

---

# 75. Suggested SaaS Extension

If the assignment specifically expects a SaaS angle, ReLoop can become a broader platform where the marketplace itself is the main consumer product and a seller-facing workspace is provided as the business software layer.

Conceptually:

```text
                         ReLoop Platform
                                |
             +------------------+------------------+
             |                                     |
        Marketplace                         Seller Workspace
             |                                     |
       Buyers / Users                   Seller Accounts / Teams
             |                                     |
       Items / Orders                  Listings / Offers / Analytics
```

A future business seller subscription can unlock:
- Advanced analytics
- Bulk listings
- Featured listings
- Inventory tools
- Staff accounts
- Larger listing limits

Do not implement the full SaaS billing system unless required.

---

# 76. Definition of Done

A feature is considered complete only when:

1. Database model exists.
2. Backend route/service exists.
3. Validation exists.
4. Authorization exists where required.
5. Frontend UI exists.
6. Loading state exists.
7. Error state exists.
8. Success behavior works.
9. Edge cases are handled.
10. The feature has been manually tested.

Example:

Do not mark `Offers` complete just because the offer form exists.

It is complete when:

```text
Buyer creates offer
→ Seller receives offer
→ Seller sees details
→ Seller accepts/rejects/counters
→ Listing state updates correctly
→ Buyer sees updated status
→ Conflicting purchases are blocked
```

---

# 77. Recommended MVP Feature Matrix

| Feature | User | Seller | Admin | Priority |
|---|---|---|---|---|
| Register/Login | Yes | Yes | Yes | Must Have |
| Browse items | Yes | Yes | Yes | Must Have |
| Search/filter | Yes | Yes | Yes | Must Have |
| Create listing | No | Yes | Yes | Must Have |
| Edit listing | No | Own only | Yes | Must Have |
| Wishlist | Yes | Yes | No | Must Have |
| Wantlist | Yes | Yes | No | Should Have |
| Offers | Yes | Yes | View | Must Have |
| Orders | Yes | Yes | View | Must Have |
| Swaps | Yes | Yes | View | Signature |
| Reviews | Yes | Yes | Moderate | Must Have |
| Reports | Yes | Yes | Manage | Must Have |
| Categories | View | View | Manage | Must Have |
| Analytics | Basic | Yes | Yes | Should Have |
| Notifications | Yes | Yes | Yes | Should Have |
| Real payment | No | No | No | Future |
| AI tools | Optional | Optional | No | Future |

---

# 78. Recommended First Build

The first coding milestone should not be a beautiful landing page. Build the core transaction skeleton first.

### Milestone 1

```text
Database
→ User auth
→ Categories
→ Listings
→ Marketplace page
→ Listing details
```

### Milestone 2

```text
Wishlist
→ Offers
→ Seller dashboard
```

### Milestone 3

```text
Orders
→ simulated payment
→ order status
```

### Milestone 4

```text
Swaps
→ Wantlist
```

### Milestone 5

```text
Admin
→ moderation
→ reports
→ analytics
```

### Milestone 6

```text
UI polish
→ responsive design
→ validation
→ testing
→ demo data
```

---

# 79. Final Product Definition

### One-sentence definition

> **ReLoop is a multi-category pre-owned marketplace where people can buy, sell, negotiate, and swap reusable items through a trusted, organized platform.**

### Product philosophy

> **Items shouldn't have only one life.**

### Core marketplace loop

```text
SELL
  ↓
DISCOVER
  ↓
WISHLIST / WANTLIST
  ↓
OFFER / BUY / SWAP
  ↓
ORDER / EXCHANGE
  ↓
REVIEW
  ↓
SECOND LIFE
```

### Core technical loop

```text
React Frontend
      ↓
REST API
      ↓
Authentication + Authorization
      ↓
Business Logic
      ↓
Prisma ORM
      ↓
PostgreSQL
```

### Core project promise

ReLoop should demonstrate that a second-hand marketplace can be more than a list of products. The application should model the **full lifecycle of pre-owned items**, including discovery, ownership, negotiation, transactions, swapping, reviews, and moderation.

---

# 80. Quick Reference for Developers

When coding any feature, ask:

### Who?
Which user/role can use it?

### What?
What database record is being created or changed?

### When?
What status does the record have before and after the action?

### Validation?
What conditions must be true?

### Authorization?
Who owns the resource?

### UI?
Where does the user perform the action?

### Failure?
What happens when the action cannot be completed?

### Side effects?
Does it create a notification, update a listing status, or affect another record?

Example:

> **Accept Offer**

- Who: seller
- What: update offer
- Validation: listing still active
- Authorization: seller owns listing
- Result: offer accepted
- Side effect: listing reserved
- Notification: buyer notified
- Failure: show unavailable message if another transaction already reserved the item

This pattern should be used for every important workflow.

---

# 81. Final Reminder

The strongest version of ReLoop is **not** an Amazon-style ecommerce clone.

It should feel like a dedicated platform for the second-hand lifecycle:

```text
             RELOOP
                |
    +-----------+-----------+
    |           |           |
   BUY         SELL        SWAP
    |           |           |
    +------ DISCOVER ------+
                |
           WANTLIST
                |
             OFFERS
                |
             ORDERS
                |
            REVIEWS
                |
        SECOND LIFE ♻
```

Keep the MVP focused, make the signature workflows reliable, and only add advanced features after the core system works end-to-end.
