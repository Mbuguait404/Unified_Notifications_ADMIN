🎯 Objective

Allow organizations to:

Receive a public payment link

Customer/admin clicks the link

System triggers STK Push

On success → credit balance is updated

Without exposing protected internal routes

Without allowing abuse or misattribution

🧠 Core Challenge

The route must be public
But credits must go to the correct organization
And payment routes are currently protected

So we need controlled public access with identity baked into the link.

🏗 High-Level Architecture Plan

We introduce a concept:

Signed Payment Session

Instead of exposing a normal top-up route, we generate a secure, temporary, organization-bound payment session.

🪜 Step-by-Step System Plan
1️⃣ Create a Payment Link Generator (Protected)

Inside the dashboard (protected route):

Org admin clicks:

“Generate Payment Link”

Backend creates:

payment_session_id

organization_id

amount (optional pre-filled or flexible)

expires_at

status = pending

signature/token

Then returns:

https://uniflow.com/pay/{session_token}


This is what you send externally.

2️⃣ Public Payment Route (Safe Public Access)

Route example:

GET /pay/:session_token


This route:

Validates session exists

Checks:

Not expired

Not already paid

Signature valid

Loads organization name (display only)

Displays payment UI

Important:
⚠️ No sensitive data exposed.
⚠️ No organization ID in plain form.
⚠️ Only session token is visible.

3️⃣ Trigger STK Push

User enters phone number → clicks Pay.

Backend:

Looks up session by token

Retrieves organization_id internally

Initiates STK push

Stores:

checkout_request_id

merchant_request_id

links them to session

4️⃣ M-PESA Callback (Critical Step)

Your callback endpoint:

POST /api/mpesa/callback


When M-PESA responds:

Match checkout_request_id

Retrieve linked session

Verify:

Amount matches

Status is success

Mark session as:

status = completed


Credit organization wallet

Log transaction

🔐 How We Know Which Organization Paid

We never rely on the public request.

We rely on:

session_token → payment_session → organization_id


The organization identity is determined server-side only.

The public route only supplies:

session_token

phone number

Everything else is resolved internally.

🛡 Security Controls (Very Important)
1. Use Signed Tokens (Not Plain IDs)

Instead of:

/pay/12345


Use:

/pay/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...


Signed JWT or cryptographically random string.

2. Add Expiry

Every session should:

Expire after 24 hours (or configurable)

Auto invalidate after payment

3. Prevent Double Credit

Use:

unique constraint on checkout_request_id


And:

if session.status == completed → ignore

4. Prevent Amount Tampering

If amount is fixed:

Do not allow frontend to send amount

Use amount stored in session

If flexible:

Validate against min/max limits

5. Rate Limit Public Route

Add rate limiting to:

POST /pay/:session_token


To prevent spam.

🏦 Credit Update Strategy

When payment is confirmed:

BEGIN TRANSACTION
    update organization.balance += amount
    insert into transactions table
    mark payment_session as completed
COMMIT


Atomic database transaction.

📊 Optional Enhancements (Professional SaaS Level)
🔹 Branded Payment Page

Display:

Organization name

Logo (if available)

Amount

Reference ID

Makes it look trustworthy.

🔹 Support for Variable Amount

Add mode:

mode = fixed | flexible


Flexible allows custom input.

🔹 Add Metadata

Payment session can include:

purpose: "Topup"

created_by_user_id

notes

🔹 Email Notification

After successful payment:

Notify org admin

Send receipt

Update dashboard in real time (WebSocket)

🏗 Clean Architectural Flow
Admin Dashboard (Protected)
        |
        | Generate Payment Link
        v
Backend → Creates Signed Payment Session
        |
        v
Public Payment Page (/pay/token)
        |
        v
STK Push
        |
        v
M-PESA Callback
        |
        v
Verify → Credit Org → Log → Complete

🧠 Why This Works

Public route is safe

Organization identity is never guessed

No sensitive routes exposed

Works with STK push

Scalable

Prevents abuse

Professional fintech architecture

🔥 Final Recommendation for Uniflow

Introduce a new internal entity:

payment_sessions


This becomes the bridge between:

Public payments

Organization wallet system

Clean separation of concerns.