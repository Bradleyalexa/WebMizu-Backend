

# API Spec — WebMizu

## 0. Conventions

### 0.1 Base

* Base URL: `https://api.webmizu.com`
* Versioned prefix: `/api/v1`
  Example: `/api/v1/customers`

### 0.2 Auth

* Auth: **JWT** in `Authorization: Bearer <token>`
* User roles:

  * `admin`
  * `customer`
* Some endpoints are **admin-only**, some **customer-only**, some **public**.

### 0.3 Response Envelope

All JSON responses MUST follow:

```json
{
  "success": true,
  "data": { /* or array */ },
  "error": null
}
```

On error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Phone is required",
    "details": {
      "phone": "Required"
    }
  }
}
```

### 0.4 Pagination & Filtering

* Query params:

  * `?limit=20&offset=0`
  * Optional filters: `?status=active&customer_id=...&date_from=...&date_to=...`

### 0.5 Data Types

* `id`: UUID string
* `datetime`: ISO 8601 string
* `date`: `YYYY-MM-DD`
* Money fields: integer (in smallest currency unit, e.g. rupiah without decimals) or float (we predefined some as float; you can normalize later).

---

## 1. Auth & Session

> If you use Supabase Auth, some of these might be wrappers or simply reference Supabase endpoints; but we describe them anyway for clarity.

### 1.1 POST `/api/v1/auth/register` (optional if using Supabase UI)

* **Role:** Public
* **Description:** Register a new customer.
* **Body:**

  ```json
  {
    "name": "string",
    "phone": "string",
    "email": "string",
    "password": "string"
  }
  ```
* **Response (201):**

  ```json
  {
    "success": true,
    "data": {
      "token": "jwt",
      "user": {
        "id": "uuid",
        "name": "string",
        "phone": "string",
        "role": "customer"
      }
    },
    "error": null
  }
  ```

### 1.2 POST `/api/v1/auth/login`

* **Role:** Public
* **Body:**

  ```json
  {
    "phone_or_email": "string",
    "password": "string"
  }
  ```

### 1.3 GET `/api/v1/auth/me`

* **Role:** Authenticated (admin or customer)
* **Returns current user profile + role.**

---

## 2. Customer Core APIs (Admin-facing resources)

These are **admin APIs** for managing customers.

### 2.1 GET `/api/v1/customers`

* **Role:** Admin
* **Query:**

  * `q` (search by name/phone)
  * `limit`, `offset`
* **Response:**

  ```json
  {
    "success": true,
    "data": {
      "items": [ { /* Customer */ } ],
      "total": 123
    },
    "error": null
  }
  ```

Customer object:

```json
{
  "id": "uuid",
  "name": "string",
  "phone": "string",
  "address": "string|null",
  "address_type": "apartment|rumah|company",
  "created_at": "datetime"
}
```

### 2.2 POST `/api/v1/customers`

* **Role:** Admin
* **Body:**

  ```json
  {
    "name": "string",
    "phone": "string",
    "address": "string|null",
    "address_type": "apartment|rumah|company"
  }
  ```

### 2.3 GET `/api/v1/customers/:id`

* **Role:** Admin
* **Returns** customer basic data.

### 2.4 GET `/api/v1/customers/:id/full`

* **Role:** Admin
* **Description:** Full aggregated view for admin (“Customer 360 view”).
* **Response:**

  ```json
  {
    "success": true,
    "data": {
      "customer": { /* Customer */ },
      "products": [ /* customer_products */ ],
      "contracts": [ /* contracts (active+expired) */ ],
      "orders": [ /* orders */ ],
      "invoices": [ /* invoices */ ],
      "service_logs": [ /* service_log summary */ ],
      "tasks": [ /* tasks */ ]
    },
    "error": null
  }
  ```

### 2.5 PATCH `/api/v1/customers/:id`

* **Role:** Admin
* **Partial update of customer.**

---

## 3. Product Catalog APIs

### 3.1 GET `/api/v1/product-catalog`

* **Role:** Admin & Customer (read)
* **Query:** `category_id`, `q`, `limit`, `offset`
* **Used by:** Public website, customer product purchase page.

### 3.2 GET `/api/v1/product-catalog/:id`

* **Role:** Admin & Customer (read)

### 3.3 POST `/api/v1/product-catalog`

* **Role:** Admin
* **Body:**

  ```json
  {
    "category_id": "uuid|null",
    "name": "string",
    "model": "string",
    "description": "string|null",
    "price": 1500000
  }
  ```

### 3.4 PATCH `/api/v1/product-catalog/:id`

* **Role:** Admin

*(We won’t support delete to preserve referential integrity.)*

---

## 4. Customer Products (Installed Units)

### 4.1 GET `/api/v1/customer-products`

* **Role:** Admin
* **Query:** `customer_id`, `status`, `limit`, `offset`

### 4.2 GET `/api/v1/customer-products/:id`

* **Role:** Admin
* **Response includes:**

  ```json
  {
    "success": true,
    "data": {
      "customer_product": { /* base fields */ },
      "customer": { /* customer summary */ },
      "product_catalog": { /* product info */ },
      "contracts": { "active": {...}, "expired": [ ... ] },
      "installation_technician": { /* technician summary */},
      "service_history": [ /* service_log */ ]
    },
    "error": null
  }
  ```

### 4.3 POST `/api/v1/customer-products`

* **Role:** Admin
* **Body:**

  ```json
  {
    "customer_id": "uuid",
    "product_catalog_id": "uuid",
    "order_product_id": "uuid|null",
    "photo_url": "string|null",
    "installation_location": "string",
    "installation_technician_id": "uuid|null",
    "installation_date": "date",
    "notes": "string|null",
    "status": "active|inactive|tradeIn"
  }
  ```

### 4.4 PATCH `/api/v1/customer-products/:id`

* **Role:** Admin

---

## 5. Contracts APIs

### 5.1 GET `/api/v1/contracts`

* **Role:** Admin
* **Query:** `customer_product_id`, `status`, `limit`, `offset`

### 5.2 GET `/api/v1/contracts/:id`

* **Role:** Admin

### 5.3 POST `/api/v1/contracts`

* **Role:** Admin (manual contract creation), or System (after payment)
* **Body:**

  ```json
  {
    "customer_product_id": "uuid",
    "start_date": "date",
    "end_date": "date",
    "interval_months": 4,
    "total_service": 4,
    "status": "active",
    "contract_url": "string|null",
    "notes": "string|null"
  }
  ```

> On creation with `status=active`, backend MUST:
>
> * Validate no other active contract exists for this customer_product
> * Generate initial schedule_expected entries
> * Initialize services_used=0

### 5.4 PATCH `/api/v1/contracts/:id`

* **Role:** Admin
* **Use cases:** Set status, notes, attach contract_url.

---

## 6. Schedule Expected APIs

### 6.1 GET `/api/v1/schedules`

* **Role:** Admin
* **Query:**

  * `customer_product_id`
  * `contract_id`
  * `status`
  * `date_from`, `date_to`
* **Used for calendar and reports.**

### 6.2 GET `/api/v1/schedules/:id`

* **Role:** Admin

### 6.3 PATCH `/api/v1/schedules/:id`

* **Role:** Admin
* **Use cases:**

  * Mark manually as canceled
  * Adjust expected_date

> In most cases, Schedule update is done by **reschedule API** below rather than raw PATCH.

### 6.4 POST `/api/v1/schedules/:id/reschedule`

* **Role:** Admin
* **Body:**

  ```json
  {
    "new_date": "date",
    "reason": "string|null"
  }
  ```
* **Behavior:**

  * Old schedule.status → `canceled`
  * Create new schedule_expected with new_date
  * Update tasks accordingly

---

## 7. Technicians APIs

### 7.1 GET `/api/v1/technicians`

* **Role:** Admin
* Query by `q` or `phone`.

### 7.2 POST `/api/v1/technicians`

* **Role:** Admin

### 7.3 PATCH `/api/v1/technicians/:id`

* **Role:** Admin

---

## 8. Service Log APIs

### 8.1 GET `/api/v1/service-logs`

* **Role:** Admin
* **Query:** `customer_product_id`, `technician_id`, `date_from`, `date_to`, `service_type`

### 8.2 GET `/api/v1/service-logs/:id`

* **Role:** Admin

### 8.3 POST `/api/v1/service-logs`

* **Role:** Admin (logging after service)
* **Body:**

  ```json
  {
    "expected_id": "uuid|null",
    "customer_product_id": "uuid",
    "technician_id": "uuid",
    "service_date": "date",
    "service_type": "contract|perpanggil",
    "pekerjaan": "string",
    "harga_service": 150000,        // required if perpanggil
    "teknisi_fee": 50000,           // required for payout
    "job_evidence": [
      "https://storage-url/....jpg"
    ],
    "notes": "string|null"
  }
  ```
* **Backend MUST:**

  * If expected_id provided → update schedule_expected.status = done
  * If linked to contract → increment services_used; expire if reached
  * Generate next schedule_expected if contract still active
  * If `service_type = perpanggil` → auto generate invoice (configurable)

### 8.4 PATCH `/api/v1/service-logs/:id`

* **Role:** Admin (fixing notes / evidence)

---

## 9. Orders & Order Items APIs

### 9.1 GET `/api/v1/orders`

* **Role:** Admin
* **Query:** `customer_id`, `status`, `date_from`, `date_to`

### 9.2 GET `/api/v1/orders/:id`

* **Role:** Admin or Customer (if owner)
* **Response:**

  ```json
  {
    "success": true,
    "data": {
      "order": { /* order */ },
      "items": [ /* order_product */ ],
      "customer": { /* summary */ },
      "invoice": { /* if exists */ }
    },
    "error": null
  }
  ```

### 9.3 POST `/api/v1/orders`

* **Role:** Customer

* **Body:**

  ```json
  {
    "items": [
      {
        "product_catalog_id": "uuid",
        "qty": 1
      }
    ]
  }
  ```

* **Backend MUST:**

  * Fetch product_catalog prices
  * Compute totals server-side
  * Create order + order_product rows
  * Initiate payment session → return payment_url

* **Response:**

  ```json
  {
    "success": true,
    "data": {
      "order_id": "uuid",
      "payment_url": "https://payment-gateway/..."
    },
    "error": null
  }
  ```

### 9.4 POST `/api/v1/payments/webhook/:provider`

* **Role:** Public (secured via signature/secret)
* **Description:** Handles gateway callback for Xendit/Midtrans.
* **Backend MUST:**

  * Verify signature
  * Ensure idempotency
  * On success:

    * Set order.status = paid
    * Create invoice (if not exists)
    * Optionally create customer_products (if you want auto-assign)

### 9.5 PATCH `/api/v1/orders/:id/mark-paid`

* **Role:** Admin
* **Use case:** Manual override when webhook fails.

---

## 10. Invoices APIs

### 10.1 GET `/api/v1/invoices`

* **Role:** Admin
* **Query:** `customer_id`, `related_type`, `status`

### 10.2 GET `/api/v1/invoices/:id`

* **Role:** Admin, or Customer if invoice.customer_id = current user

### 10.3 POST `/api/v1/invoices`

* **Role:** Admin (manual invoice creation)
* **Body:**

  ```json
  {
    "customer_id": "uuid",
    "related_type": "order|contract|service|other",
    "related_id": "uuid|null",
    "invoice_number": "string|null", // optional if auto generated
    "total_amount": 150000,
    "status": "draft",
    "meta": { "notes": "string optional" }
  }
  ```

> Backend MAY auto-generate invoice_number if null.

### 10.4 POST `/api/v1/invoices/:id/generate-pdf`

* **Role:** Admin or System
* **Behavior:**

  * Render HTML template with invoice data
  * Use jsPDF to create PDF
  * Upload to Supabase storage
  * Update `pdf_url` and set status to `sent` (if not draft)

### 10.5 PATCH `/api/v1/invoices/:id`

* **Role:** Admin
* Use for status changes (`sent`, `paid`, `cancelled`).

---

## 11. Tasks & Calendar APIs

### 11.1 GET `/api/v1/tasks`

* **Role:** Admin
* **Query:**

  * `date_from`, `date_to`
  * `status`
  * `technician_id`
  * `customer_id`

### 11.2 GET `/api/v1/tasks/:id`

* **Role:** Admin

### 11.3 POST `/api/v1/tasks`

* **Role:** Admin (manual tasks, not schedule-based)
* **Body:**

  ```json
  {
    "task_date": "date",
    "customer_id": "uuid|null",
    "customer_product_id": "uuid|null",
    "expected_id": "uuid|null",
    "technician_id": "uuid|null",
    "task_type": "string",
    "title": "string",
    "description": "string",
    "status": "pending|completed|canceled"
  }
  ```

### 11.4 PATCH `/api/v1/tasks/:id`

* **Role:** Admin (assign technician, update status, etc.)

---

## 12. Customer Portal Aggregated APIs

These are “/customer/...” endpoints designed specifically for the Customer Portal UI.

All require role `customer` and infer `customer_id` from token.

### 12.1 GET `/api/v1/customer/dashboard`

* Returns:

  ```json
  {
    "success": true,
    "data": {
      "owned_products": [
        {
          "id": "uuid",
          "name": "string",
          "model": "string",
          "status": "active",
          "installation_location": "string",
          "next_service": {
            "expected_id": "uuid",
            "expected_date": "date",
            "technician": { "id": "uuid", "name": "string", "photo_url": "string|null" }
          },
          "active_contract": {
            "id": "uuid",
            "end_date": "date",
            "services_used": 1,
            "total_service": 4
          }
        }
      ],
      "reminders": [
        {
          "type": "service-reminder",
          "message": "Your filter is due on 2025-01-15"
        }
      ]
    },
    "error": null
  }
  ```

### 12.2 GET `/api/v1/customer/products`

* Returns array of customer_products (only those belonging to customer).

### 12.3 GET `/api/v1/customer/products/:id`

* Detailed view per product including:

  * product_catalog
  * active contract
  * expired contracts
  * service history

### 12.4 GET `/api/v1/customer/products/:id/service-history`

* Only service_log for that product.

### 12.5 GET `/api/v1/customer/service/schedules`

* Upcoming schedules for all products belonging to customer.

### 12.6 POST `/api/v1/customer/service/request`

* For **perpanggil** service.
* **Body:**

  ```json
  {
    "customer_product_id": "uuid",
    "preferred_date": "date",
    "notes": "string|null"
  }
  ```
* **Backend:**

  * Create schedule_expected (source_type=perpanggil, status=pending)
  * Create task
  * Notify admin

### 12.7 POST `/api/v1/customer/service/request-contract`

* Customer wants a new contract.
* **Body:**

  ```json
  {
    "customer_product_id": "uuid",
    "plan_id": "string|null",    // optional if you use contract templates
    "interval_months": 4,
    "total_service": 4,
    "price": 600000
  }
  ```
* **Backend:**

  * Create "pending_payment" contract placeholder (or simple metadata)
  * Create order/payment session
  * Return payment_url

### 12.8 GET `/api/v1/customer/invoices`

* List all invoices where `customer_id = token.customer_id`.

### 12.9 GET `/api/v1/customer/invoices/:id`

* Only if owned.

### 12.10 GET `/api/v1/customer/profile`

### 12.11 PATCH `/api/v1/customer/profile`

* Update `name`, `phone`, `address`, etc.

---

## 13. Public Website APIs

### 13.1 GET `/api/v1/public/products`

* Essentially alias to product catalog for public use.

### 13.2 GET `/api/v1/public/product/:id`

---

## 14. Chat APIs

> Implementation may be heavily offloaded to Supabase Realtime; but we still define REST edges.

### Entities (not previously in ERD, but conceptually):

`chat_threads` (optional)
`chat_messages`

### 14.1 GET `/api/v1/chat/threads`

* **Role:** Admin → list all customers with active chats
* **Role:** Customer → list own threads

### 14.2 GET `/api/v1/chat/threads/:thread_id/messages`

* **Role:** Admin or Customer (if belongs to them)

### 14.3 POST `/api/v1/chat/messages`

* **Role:** Admin or Customer
* **Body:**

  ```json
  {
    "thread_id": "uuid|null", // if null, system creates new for customer
    "to": "admin|customer",
    "message": "string",
    "attachment_url": "string|null"
  }
  ```
* Backend writes to DB; Supabase Realtime propagates event.

---

## 15. Notifications APIs 
15.1 GET /api/v1/notifications

Role: Customer / Admin
Description: Ambil semua notifikasi milik user.

Response:

{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "New Invoice",
      "message": "Your invoice INV-123 is ready",
      "type": "invoice",
      "entity_type": "invoice",
      "entity_id": "uuid",
      "is_read": false,
      "created_at": "datetime"
    }
  ],
  "error": null
}

15.2 PATCH /api/v1/notifications/:id/read

Role: Customer / Admin
Menandai notifikasi sebagai dibaca.

15.3 POST /api/v1/notifications (Admin or system-only)

Use case: Manual creation or fallback mechanism.

Body:

{
  "user_id": "uuid",
  "title": "string",
  "message": "string",
  "type": "service",
  "entity_type": "schedule",
  "entity_id": "uuid|null"
}

---

## 16. Reporting APIs (Admin)

### 16.1 GET `/api/v1/reporting/kpis`

* **Role:** Admin
* **Query:** `month`, `year`
* **Response:**

  ```json
  {
    "success": true,
    "data": {
      "total_orders": 10,
      "total_revenue": 2000000,
      "total_services": 50,
      "contract_services": 30,
      "perpanggil_services": 20
    },
    "error": null
  }
  ```

### 16.2 GET `/api/v1/reporting/technician-payout`

* **Role:** Admin
* **Query:** `technician_id`, `date_from`, `date_to`
* **Returns:** aggregated teknisi_fee + list of jobs.

Query params:

?technician_id=uuid
&week_start=YYYY-MM-DD
&week_end=YYYY-MM-DD


Returns:

{
  "success": true,
  "data": {
    "technician": { "id": "uuid", "name": "string" },
    "total_jobs": 12,
    "total_fee": 350000,
    "jobs": [
      {
        "service_log_id": "uuid",
        "date": "2025-02-01",
        "customer_product_id": "uuid",
        "pekerjaan": "Backwash & deep clean",
        "teknisi_fee": 30000
      }
    ]
  }
}

```

GET /reporting/monthly-service-report

(For admin’s monthly business summary)

Query:

?month=MM&year=YYYY


Returns:

{
  "success": true,
  "data": {
    "total_services": 55,
    "contract_services": 30,
    "perpanggil_services": 25,
    "services_by_date": [
      { "date": "2025-02-01", "count": 3 },
      { "date": "2025-02-02", "count": 5 }
    ],
    "top_technicians": [
      { "technician_id": "uuid", "name": "Budi", "jobs": 20 }
    ],
    "revenue_from_services": 1250000
  }
}
---

## 17. Error Codes (Global)

Examples:

* `VALIDATION_ERROR`
* `AUTH_REQUIRED`
* `FORBIDDEN`
* `NOT_FOUND`
* `CONFLICT` (e.g., second active contract)
* `PAYMENT_VERIFICATION_FAILED`
* `INVOICE_GENERATION_FAILED`

---
