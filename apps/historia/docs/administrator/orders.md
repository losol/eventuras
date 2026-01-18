# Order Management - Administrator Guide

**Last Updated:** 2026-01-18
**Version:** Historia CMS v3.x (Payload CMS 3.69+)
**Related Documentation:** [Role-Based Access Control](./role-based-access-control.md)

---

## Overview

Historia CMS provides a comprehensive order management system for e-commerce operations. Orders are managed through the **Orders** collection in the CMS admin panel, with role-based permissions that vary based on order status to protect completed transactions from accidental modifications.

---

## Order Statuses

Orders in Historia follow a standard e-commerce lifecycle with five distinct statuses:

### 🕐 Pending
**Description:** Order has been created but payment is not yet confirmed.

**Typical Use:** Initial state when customer places order, awaiting payment confirmation.

**Editable by:** Commerce managers, Admins, System admins

---

### ⚙️ Processing
**Description:** Payment confirmed, order is being prepared for shipment.

**Typical Use:** Order is being picked, packed, or otherwise prepared for delivery.

**Editable by:** Commerce managers, Admins, System admins

---

### ⏸️ On Hold
**Description:** Order is temporarily suspended (e.g., awaiting stock, payment issues, customer request).

**Typical Use:** Order needs attention before it can proceed.

**Editable by:** System admins only

---

### ✅ Completed
**Description:** Order has been fulfilled and delivered to the customer.

**Typical Use:** Final state for successfully completed orders.

**Editable by:** System admins only

---

### ❌ Canceled
**Description:** Order has been canceled (by customer or business).

**Typical Use:** Order will not be fulfilled.

**Editable by:** System admins only

---

## Role-Based Access Control

### General Permissions

| Operation | Member | Editor | Commerce | Admin | System Admin |
|-----------|--------|--------|----------|-------|--------------|
| **Create (Admin Panel)** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Create (Checkout)** | 🟡 All users can place orders via checkout | | | | |
| **Read** | Own only | ❌ | ✅ All in tenant | ✅ All in tenant | ✅ All |
| **Delete** | ❌ | ❌ | ❌ | ✅ | ✅ |

**Notes:**
- **Create (Admin Panel):** Manually creating orders for phone/email orders or administrative corrections
- **Create (Checkout):** All users (including guests) can create orders through the frontend checkout process
- **Tenant-scoped:** Users with commerce/admin roles can only access orders in their assigned tenants
- **System admins:** Have full access across all tenants

---

### Update Permissions (Status-Dependent)

Order update permissions are **status-dependent** to protect financial and fulfillment data integrity:

| Order Status | Commerce Manager | Site Admin | System Admin |
|--------------|------------------|------------|--------------|
| **Pending** | ✅ Can edit (own tenants) | ✅ Can edit (own tenants) | ✅ Can edit (all) |
| **Processing** | ✅ Can edit (own tenants) | ✅ Can edit (own tenants) | ✅ Can edit (all) |
| **On-Hold** | ❌ Read only | ❌ Read only | ✅ Can edit |
| **Completed** | ❌ Read only | ❌ Read only | ✅ Can edit |
| **Canceled** | ❌ Read only | ❌ Read only | ✅ Can edit |

**Why status-based permissions?**
Protecting completed and canceled orders from accidental changes maintains financial integrity and audit trails. Only system administrators with full platform access can modify locked orders (on-hold, completed, canceled).

---

## Practical Examples

### Example 1: Commerce Manager Updating Active Order
**Scenario:** A commerce manager needs to update a customer's shipping address on a processing order.

**Steps:**
1. Navigate to **Commerce → Orders** in admin panel
2. Find the order (filter by status = "Processing")
3. Click to edit the order
4. Update shipping address in the "Shipping Address" tab
5. Click Save

**Result:** ✅ Success — Commerce managers can edit pending/processing orders in their assigned tenants.

---

### Example 2: Commerce Manager Trying to Edit Completed Order
**Scenario:** A commerce manager notices a mistake in a completed order's total amount.

**Steps:**
1. Navigate to **Commerce → Orders**
2. Find the completed order
3. Click to edit the order
4. Attempt to modify total amount
5. Click Save

**Result:** ❌ Access Denied — The order status "completed" prevents editing by commerce managers. Only system admins can edit completed orders.

**Solution:** Contact a system administrator to review and make the correction if necessary.

---

### Example 3: Admin Changing Order Status to On-Hold
**Scenario:** A site admin needs to put an order on hold due to inventory shortage.

**Steps:**
1. Navigate to **Commerce → Orders**
2. Find the order (currently "Processing")
3. Click to edit
4. Change status to "On-Hold"
5. Click Save

**Result:** ✅ Success — Order is now on-hold.

**Important:** Once saved, the admin can no longer edit this order! Only system admins can edit on-hold orders. Make sure all necessary changes are made before changing status to on-hold, completed, or canceled.

---

### Example 4: System Admin Correcting Completed Order
**Scenario:** A system admin needs to update a completed order's metadata for accounting reconciliation.

**Steps:**
1. Navigate to **Commerce → Orders**
2. Find the completed order
3. Click to edit (system admins always have edit access)
4. Make necessary corrections
5. Click Save

**Result:** ✅ Success — System admins can edit any order regardless of status.

---

## Order Fields and Structure

### Order Details Tab
- **Order Items** — List of products/services in the order
  - Product name
  - Quantity
  - Unit price
  - Subtotal
- **Subtotal Amount** — Sum of all items before tax/shipping
- **Total Amount** — Final amount charged to customer
- **Currency** — Currency code (e.g., NOK, USD, EUR)
- **Tax Amount** — Tax/VAT charged
- **Tax Exempt** — Whether order is tax-exempt

### Shipping Address Tab
- Full address form for delivery location
- Required for physical product orders

### Sidebar Fields
- **Customer** — Link to user account (optional)
- **User Email** — Email for order notifications (required)
- **Status** — Current order status (see statuses above)
- **Tenant** — Website this order belongs to
- **Payment Intent ID** — Stripe/payment provider reference
- **Invoice** — Link to generated invoice (optional)

---

## Troubleshooting

### "Access Denied" when trying to edit an order

**Cause 1: Order status is locked**
- **Check:** What is the order's current status?
- **Solution:** If status is "on-hold", "completed", or "canceled", only system admins can edit. Contact a system admin if changes are needed.

**Cause 2: Tenant mismatch**
- **Check:** Is the order in a tenant you have access to?
- **Solution:** Verify your role assignments in your user profile. Contact a system admin to add you to the correct tenant.

---

### Order total not calculating correctly

**Cause:** Order prices are calculated by hooks on save
- **Solution:** Make sure all order items have valid prices. The `populateOrderPrices` hook runs automatically on save to recalculate totals.

---

### Cannot change order status back to "pending" or "processing"

**Cause:** Status workflow is designed to move forward
- **Solution:** While technically possible, moving orders backward in status is not recommended. If you need to reopen an order, consider creating a new order and canceling the old one. System admins can force status changes if absolutely necessary.

---

### Customer email is not auto-populated

**Cause:** No customer relationship selected
- **Solution:** If you select a customer from the "Customer" field, their email will be auto-populated in the "User Email" field. This happens automatically on save using the `beforeValidate` hook.

---

## Technical Implementation

For developers maintaining the order management system:

### Core Files
- **Collection:** `apps/historia/src/collections/Orders.ts`
- **Status Rules:** `apps/historia/src/lib/commerce/orderStatusRules.ts`
- **Access Control:** `apps/historia/src/lib/commerce/orderPermissions.ts`
- **Public API:** `apps/historia/src/lib/commerce/index.ts`

### Business Rules (Pure Functions)
The order status logic is implemented as pure functions for testability:

```typescript
import {
  isOrderEditableByCommerce,
  isOrderLocked,
  getOrderLockReason,
  EDITABLE_ORDER_STATUSES,
  LOCKED_ORDER_STATUSES,
} from '@/lib/commerce';

// Check if commerce/admin can edit
isOrderEditableByCommerce('pending')    // true
isOrderEditableByCommerce('processing') // true
isOrderEditableByCommerce('completed')  // false

// Check if order is locked
isOrderLocked('on-hold')    // true
isOrderLocked('completed')  // true
isOrderLocked('pending')    // false

// Get explanation for locked orders
getOrderLockReason('completed')
// Returns: "Orders with status 'completed' can only be edited by system administrators"
```

### Access Control Implementation
The `ordersUpdateAccess` function in `orderPermissions.ts` implements the status-based access control:

1. **System admins** → Always return `true` (full access)
2. **Other users** → Check order status
   - If status is locked (on-hold/completed/canceled) → return `false`
   - If status is editable (pending/processing) → check roles
     - Has commerce or admin role → return tenant constraint
     - No matching role → return `false`

### Tenant Scoping
Orders use Payload's tenant constraint system to ensure users can only edit orders in their assigned tenants:

```typescript
return { tenant: { in: [...commerceTenantIDs, ...adminTenantIDs] } };
```

---

## Best Practices

### ✅ Do
- Always verify order status before attempting edits
- Use "canceled" status instead of deleting orders for audit trails
- Update order status to reflect the current fulfillment state
- Contact system admins when locked orders need corrections

### ❌ Don't
- Don't manually change order totals without understanding the pricing hooks
- Don't delete orders unless absolutely necessary (use "canceled" instead)
- Don't change completed orders back to pending/processing
- Don't bypass access controls by asking system admins to lower security

---

## Related Documentation

- **[Role-Based Access Control](./role-based-access-control.md)** — Understanding roles and permissions
- **[Commerce Management](./commerce.md)** — Overview of commerce features (if exists)
- **[Payment Integration](./payments.md)** — Payment provider setup and troubleshooting (if exists)

---

## Need Help?

If you encounter issues not covered in this guide:

1. **Check Permissions:** Verify your role assignments for the relevant tenant
2. **Check Order Status:** Confirm whether the order status allows your role to edit
3. **Contact System Admin:** For locked orders or permission issues
4. **Report Bugs:** If you believe access control is not working correctly, contact the development team

---

**Technical Reference:** See `apps/historia/src/lib/commerce/` for implementation details.
