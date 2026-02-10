# Billing Module - Structure Documentation

## Overview
The billing module provides comprehensive payment management, usage tracking, and M-Pesa payment method configuration for the Unified Notifications platform.

## Features Implemented

### 1. **Payments Tab**
- View all payment transactions with detailed information
- Filter by status (completed, pending, failed)
- Search by organization, transaction ID, or M-Pesa reference
- View payment details in a modal
- Export functionality (UI ready, backend integration pending)

**Mock Data Includes:**
- Transaction ID
- Organization details
- Amount and tokens purchased
- Payment method (M-Pesa)
- M-Pesa transaction reference
- Payment status
- Phone number
- Timestamp

### 2. **Usage Tab**
- Track token usage by organization
- View messaging statistics (SMS, Email, WhatsApp)
- Usage trends with percentage indicators
- Progress bars showing token consumption
- Sort by usage, remaining tokens, or name
- Summary cards showing total messages sent across all channels

**Mock Data Includes:**
- Organization token allocation and usage
- Channel-specific message counts
- Usage trends (up/down with percentages)
- Last activity timestamps
- Visual progress indicators

### 3. **Payment Methods Tab**
- Configure multiple M-Pesa payment methods
- Set default payment method
- Toggle active/inactive status
- View transaction counts and usage statistics
- Support for both sandbox and production environments

**Mock Data Includes:**
- Payment method name
- M-Pesa shortcode (paybill/till number)
- Consumer key and secret (masked)
- Passkey (masked)
- Environment (sandbox/production)
- Active status
- Transaction count
- Created and last used dates

### 4. **Payment Method Modal**
- Add new M-Pesa payment configurations
- Edit existing payment methods
- Form validation for all required fields
- Secure credential input (password fields)
- Environment selection (sandbox/production)
- Active/default toggles
- Link to Safaricom Developer Portal

**Fields:**
- Payment method name
- Shortcode (paybill/till number)
- Consumer key
- Consumer secret
- Passkey
- Environment (sandbox/production)
- Active status
- Default status

## File Structure

```
admin/
├── app/
│   └── billing/
│       └── page.tsx                 # Main billing page with tabs
│
└── components/
    └── billing/
        ├── payments-tab.tsx         # Payments transaction list
        ├── payment-details-modal.tsx # Payment details modal
        ├── usage-tab.tsx            # Organization usage tracking
        ├── payment-methods-tab.tsx  # M-Pesa configuration list
        └── payment-method-modal.tsx # Add/Edit payment method
```

## Components Breakdown

### Main Page (`page.tsx`)
- **Stats Overview**: 4 cards showing key metrics
  - Total Revenue
  - This Month Revenue
  - Total Transactions
  - Active Payment Methods
- **Tabs**: Payments, Usage, Payment Methods

### Payments Tab (`payments-tab.tsx`)
- Transaction table with filtering and search
- Status badges (completed, pending, failed)
- Currency formatting (KES)
- Date formatting
- Export button (ready for backend integration)
- Payment details modal integration

### Payment Details Modal (`payment-details-modal.tsx`)
- Transaction information section
- Organization details section
- Purchase details section
- Transaction timeline
- Formatted currency and dates
- Status badges

### Usage Tab (`usage-tab.tsx`)
- Summary cards for total messages by channel
- Organization usage table
- Progress bars for token consumption
- Trend indicators (up/down)
- Sorting options
- Search functionality
- Usage percentage calculations with color coding

### Payment Methods Tab (`payment-methods-tab.tsx`)
- Payment method cards with credentials
- Active/inactive toggle switches
- Set default functionality
- Edit button for each method
- Transaction statistics
- Environment badges (sandbox/production)
- Info card with M-Pesa integration details

### Payment Method Modal (`payment-method-modal.tsx`)
- Form for adding/editing M-Pesa configurations
- Field validation
- Password-protected credential inputs
- Environment selection
- Active/default toggles
- Info alert with link to Safaricom Developer Portal
- Error handling and display

## Mock Data Summary

### Payments
- 5 sample transactions
- Mix of completed, pending, and failed statuses
- Different organizations
- Amounts ranging from 15,000 to 100,000 KES
- Realistic M-Pesa transaction references

### Usage
- 5 organizations with varying usage patterns
- Token allocations from 15,000 to 100,000
- Usage percentages from 31% to 86%
- Trends showing growth or decline
- Channel-specific message counts

### Payment Methods
- 3 M-Pesa configurations
- 1 production default
- 1 sandbox for testing
- 1 inactive backup
- Masked credentials for security
- Transaction counts and usage stats

## UI/UX Features

### Design Elements
- Gradient stat cards with icons
- Color-coded status badges
- Progress bars with dynamic colors
- Trend indicators with icons
- Responsive grid layouts
- Search and filter controls
- Modal dialogs for detailed views
- Form validation with error messages

### Color Coding
- **Green**: Completed, Active, Positive trends
- **Yellow**: Pending, High usage warning
- **Red**: Failed, Critical usage, Negative trends
- **Blue**: SMS channel
- **Orange**: Email channel
- **Green**: WhatsApp channel

### Responsive Design
- Mobile-friendly layouts
- Flexible grid systems
- Scrollable tables
- Collapsible sections

## Next Steps (Backend Integration)

### API Endpoints Needed

1. **Payments**
   - `GET /api/payments` - List all transactions
   - `GET /api/payments/:id` - Get payment details
   - `POST /api/payments/export` - Export transactions

2. **Usage**
   - `GET /api/usage/organizations` - Get usage by organization
   - `GET /api/usage/summary` - Get total usage statistics

3. **Payment Methods**
   - `GET /api/payment-methods` - List all payment methods
   - `POST /api/payment-methods` - Create new payment method
   - `PUT /api/payment-methods/:id` - Update payment method
   - `DELETE /api/payment-methods/:id` - Delete payment method
   - `PUT /api/payment-methods/:id/default` - Set as default

### Database Schema Needed

1. **Payments/Transactions Table**
   ```typescript
   {
     id: string
     organizationId: string
     amount: number
     tokens: number
     paymentMethod: string
     transactionRef: string
     status: 'completed' | 'pending' | 'failed'
     phoneNumber: string
     package: string
     createdAt: Date
     updatedAt: Date
   }
   ```

2. **Payment Methods Table**
   ```typescript
   {
     id: string
     name: string
     type: 'mpesa'
     provider: string
     shortcode: string
     passkey: string (encrypted)
     consumerKey: string (encrypted)
     consumerSecret: string (encrypted)
     environment: 'sandbox' | 'production'
     isDefault: boolean
     isActive: boolean
     transactionCount: number
     createdAt: Date
     lastUsed: Date
   }
   ```

3. **Usage Tracking**
   - Can be derived from existing message logs
   - Aggregate queries on message-log collection
   - Filter by organization and channel

### M-Pesa Integration
- STK Push implementation
- Callback URL handling
- Transaction verification
- Error handling and retry logic
- Webhook for payment notifications

## Testing Checklist

- [ ] All tabs render correctly
- [ ] Search and filter functionality works
- [ ] Modals open and close properly
- [ ] Form validation works
- [ ] Responsive design on mobile
- [ ] Dark mode compatibility
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Data formatting (currency, dates)
- [ ] Status badges display correctly
- [ ] Progress bars calculate correctly
- [ ] Sorting functionality
- [ ] Toggle switches work
- [ ] Default payment method selection

## Notes

- All credentials are masked with bullet points for security
- Environment badges help distinguish sandbox vs production
- Trend indicators provide quick insights into usage patterns
- Progress bars use color coding for usage warnings
- Export functionality is UI-ready but needs backend implementation
- Modal forms include comprehensive validation
- All mock data uses realistic Kenyan phone numbers and M-Pesa references
