# AutoLeadss Membership Systems — Product Foundation

## Product decision

Build a reusable single-merchant system, not a broad multi-tenant SaaS. Each merchant gets a separately branded storefront and deployment. AutoLeadss reuses the product core but can transfer the repository, domain, database, and merchant credentials without separating shared customer data later.

## V1 surfaces

### Customer storefront

- Bilingual landing page and package comparison
- Hosted checkout through the merchant's own payment account
- Payment result and renewal pages
- Secure membership URL with QR pass, remaining units, renewal date, and history
- Mobile-first, accessible and SEO-ready

### Staff scanner

- Authenticated installable web app
- Camera scan and manual-code fallback
- Member/package/status confirmation
- Atomic redemption: the final unit cannot be spent twice
- Employee, branch, timestamp, service and adjustment audit trail

### Owner dashboard

- Active subscribers, monthly committed revenue, renewals and redemptions
- Package management
- Subscriber search and membership adjustments
- Cash/InstaPay activation alongside gateway payments
- Staff roles, transaction history, export and brand settings

## Technical direction

The marketing site remains Vite/React. The transactional product should live in a separate application so public marketing releases cannot endanger redemption or payment operations.

Recommended product stack:

- Next.js App Router, TypeScript and a custom design-token layer
- Supabase Postgres, Auth and Storage with RLS on every exposed table
- Paymob hosted checkout/webhooks; recurring card deductions only where the merchant account is enabled
- Resend for receipts and pass links
- Vercel deployment; one project and database per merchant during the founding-client stage

## Minimal data model

- `business_settings`
- `staff_users`
- `packages`
- `subscribers`
- `memberships`
- `payments`
- `redemptions`
- `webhook_events`
- `audit_log`

The QR contains an opaque public membership token, never a phone number or sequential database ID. Redemption runs on the server in a database transaction and is idempotent. Payment-provider secrets never enter browser code.

## Delivery boundary

Included: storefront, three launch packages, member pass, scanner, dashboard, merchant payment connection, domain, deployment, training, handoff, and 30-day bug warranty.

Separate: provider fees/approval, photography, logo redesign, ads, booking, inventory, accounting, native apps, and support after the warranty.

## Build order

1. Marketing repositioning and interactive product demonstration.
2. Product repository, schema, authentication and roles.
3. Packages, subscriber creation and manual payments.
4. QR pass and atomic redemption.
5. Paymob intention/webhook integration.
6. Dashboard, export, audit log and hardening.
7. First merchant theme, real content, QA and handoff.

## Acceptance tests

- A test payment creates exactly one membership.
- Replayed webhooks do not create duplicates.
- A valid QR redemption decreases the correct allowance exactly once.
- Expired, paused and empty memberships cannot be redeemed.
- Staff see only permitted actions; customers never see admin data.
- Arabic and English work at 360, 390 and 430 px widths.
- Storefront Lighthouse targets: performance 90+, accessibility 95+.
