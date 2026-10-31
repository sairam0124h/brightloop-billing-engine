# Brightloop Subscription Management System (spec)

Build one platform for the full life of a subscription business: products and plans, quotes, subscriptions, automated invoicing, payments, and revenue reporting. Company: Brightloop Software sells software on subscription (monthly or yearly), add-ons switched on and off, and products with variants. Roles: Admin (controls everything: products, plans, taxes, discounts, staff), Staff (day-to-day customers, subscriptions, invoices, payments, limited access), Customer (portal: only their own subscriptions and invoices).

## Auth
- Signup with email and password. Each email belongs to only one account.
- Password must be MORE than 8 characters, with an uppercase letter, a lowercase letter and a special character.
- Forgot password sends a reset link to the registered email.
- Only the admin can add a new member of staff.

## Catalog
- Product: name, type, sales price, cost price, notes. Variants, e.g. by brand: choosing the Odoo brand adds 560 to the price.
- Plan: price, billing period (daily, weekly, monthly, yearly), minimum quantity, dates it is available. Per plan the admin decides: auto-close when it ends, can be closed early, can be paused, can be renewed.
- Quotation template: has the right plan and product lines, valid for a set number of days.

## Subscriptions
- Own number, customer, plan, start date, expiry date, payment terms. Lines: product, quantity, unit price, taxes, amount.
- Status flow: Draft, Quotation, Confirmed, Active, Closed. Anyone on the team can see where it stands.
- Can be created from a quotation template.

## Invoicing
- Created automatically from the subscription with customer details, product lines, taxes and totals filled in. Nobody types invoices by hand.
- Taxes calculated automatically from rules the admin sets.
- Team can confirm, cancel, send or print any invoice. Invoice status: Draft, Confirmed, Paid.
- Nothing is billed twice or skipped.

## Discounts
- Only the admin creates discount rules: fixed amount or percentage, minimum purchase or quantity, start and end dates, limit on number of uses.
- Applies to specific products or whole subscriptions.
- Appears on the next invoice automatically and stops when it expires or runs out.

## Payments
- Record method, amount, date and note against the right invoice.
- Team can see which invoices are paid and which are outstanding, and chase overdue ones.

## Finance dashboard
- One place to see active subscriptions, revenue, payments and overdue invoices, with filters and a summary view.
- With thousands of subscriptions on the books, every page must respond in under two seconds.
