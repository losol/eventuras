
# Orders

Each event registration could have one or more orders associated with the registration.  Typical orders contain products like event tickets with variants with different prices. For most events it will be an associated *mandatory product* – the ticket. 

For conferences there will often be a "daily conference pack" for each day of the event, which is mandatory. 

In addition many events will have *optional product* as well. Examples could be dinners or sightseeing. Note that some products might be free addons. 

For both the participant and the admin, it is important to have an overview of which products which is ordered independant of which order they belong to. Orders keeps track of the person or organisation paying, and has a reference to the event. Each order may contain multiple order lines.

## Sample products and order
The user `John Doe` registers for `The great conference`.  This conference has the following products:
 - Ticket (K1) - price 1000, mandatory
 - Dinner (K2), is a product which has 2 product variants.
	 - Small dinner (K2-1) - price 400
	 - Large dinner (K2-2) - price 600
 - Daily rate (K3)  - price 200, a mandatory quantity of 2
 - Sightseeing  (K4) - price 800
 - Guided walk (K5) - price 0

In his first order (with OrderId 255) which he registers at the website he has the following products

**Order # 255**

| ItemCode | Product name | Quantity | Price | Line total
|--|--|--|--|--|
| K1 | Conference ticket (3 days) | 1 | 1000 | 1000|
| K2-1 | Small dinner | 1 | 400 | 400
| K3 | Daily rate | 2 | 200 | 400
|  | **Order total** |  |  | 1800

```
Ordered products are now
----------------------
1 × K1
1 × K2-1
2 × K3
```

## Order status

An order has a status. `OrderStatus` will could be:

1. Draft
1. Verified
1. Invoiced
1. Paid
1. Refunded

## Verification of orders

When the user registers for an event, he/she chooses which products he/she wants. The flow would be:

1. Web site visitor registers for event
1. The system sends an email with the order and orderlines for verification
1. When the user has clicked on the link, the order is marked as verified.

## Payment of orders

Orders could be paid by sending invoices, or that the user pays the order direct. For now we have only implemented the invoicing flow. 

### Invoicing

When the admin manually creates an invoice, the OrderStatus changes to Invoiced. The system has those options for invoicing: 

* `PowerOfficeEmailInvoice`: Uses PowerOffice SDK/API to transfer the invoice to the PowerOffice accounting system. The invoice needs to be confirmed in PowerOffice, which handles emailing it to the user. When the users pays the invoice by bank transfer, the orderstatus will change in PowerOffice. There is no webhooks or other way to notify this system of the change of status, but an API call could be sent to chekc `OutgoingInvoiceStatus Status` which would be either Draft/Approved/Sent/Paid. 
* `PowerOfficeEhfInvoice`: Uses PowerOffice SDK/API to send an invoice of type EHF. The flow is similar as above. 
* `StripeInvoice`: Uses Stripe SDK/API to send an invoice to the participant which could be paid by card. Stripe has the possibility to send webhooks after the payment is received, however this is not implemented yet. 

### Direct payment

Some payment options would be that the user after placing the order is redirected to an page where he/she could provide card details or other information allowing an payment to take place. Possibly options which would be of interest to implement is: 

* `StripeDirect`
* `VippsDirect`: An app on the phone giving the user the possibility of paying by phone. Approximately half the population in Norway has this app, however it is not used outside Norway. 

## Changing orders which is not Invoiced/Paid
As long as the order is not invoiced, it could be edited by admin. The user can also change his order until `EventInfo.LastCancellationDate`. 


## Refunding an invoiced order

Invoiced orders are refunded by issuing a new invoice that cancels all the items in the negative

Consider if we want to refund order #255 from above.  The refund order will be as follows:

**Order #256**

| ItemCode | Product name | Quantity | Price | Line total
|--|--|--|--|--|
| K1 | Refund of Conference ticket (3 days) | -1 | 1000 | -1000|
| K2-1 | Refund of Small dinner | -1 | 400 | -400
| K3 | Refund of Daily rate | -2 | 200 | -400
|  | **Order total** |  |  | -1800

```
Ordered products are now: 
----------------------
Null
```

## Changes to invoiced orders

Changes to orders are handled by editing a draft order, or issuing a new order that includes only the minimal orderlines needed so that the participant are registered for the intended products. 

For each registration it should not be more than one order that is in draft/verified state. 

Combinations of the following cases can make any change to an invoiced order possible.

#### Case 1: Adding Sightseeing to Order #255.

**Order #256**

| ItemCode | Product name | Quantity | Price | Line total
|--|--|--|--|--|
| K4 | Sightseeing | 1 | 800 | 800|
|  | **Order total** |  |  | 800


```text

Ordered products are now
----------------------
1 × K1
1 × K2-1
2 × K3
1 × K4
```

#### Case 2: Removing dinner from Order #255.

| ItemCode | Product name | Quantity | Price | Line total
|--|--|--|--|--|
| K2-1 | Refund of Dinner | -1 | 400 | -400|
|  | **Order total** |  |  | -400


```text

Ordered products are now
----------------------
1 × K1
2 x K3
```

#### Case 3: Increasing the quantity of an item from Order #255.

| ItemCode | Product name | Quantity | Price | Line total
|--|--|--|--|--|
| K3 | Daily rate | 1 | 200 | 200|
|  | **Order total** |  |  | 200

```text

Products
----------------------
1 × K1
1 x K2-1
3 x K3
```

#### Case 4: Decreasing the quantity of an item from Order #255.

Although K3 daily rate has a mandatory count of 2, the admin should be able to reduce this to 1.

**Order #256**

| ItemCode | Product name | Quantity | Price | Line total
|--|--|--|--|--|
| K3 | Daily rate | -1 | 200 | -200|
|  | **Order total** |  |  | -200


```text

Ordered products are now
----------------------
1 × K1
1 x K2-1
1 × K3
```

#### Case 5: Changing products for Order #255.
The user has ordered dinner (K2-1), but now wants sightseeing (K4) instead

**Order #256**

| ItemCode | Product name | Quantity | Price | Line total |
|--|--|--|--|--|
| K2-1 | Refund of Small dinner | -1 | 400 | -400 |
| K4 | Sightseeing | 1 | 800 | 800 |
|  | **Order total** |  |  | 400 |


```text

Ordered products are now
----------------------
1 × K1
2 × K3
1 x K4
```


#### Case 6: Changing variant for Order #255.
The user has ordered small dinner, but wants large dinner

**Order #256**

| ItemCode | Product name | Quantity | Price | Line total |
|--|--|--|--|--|
| K2-1 | Refund of Small dinner | -1 | 400 | -400 |
| K2-2 | Large dinner | 1 | 600 | 600 |
|  | **Order total** |  |  | 200 |


```text
Ordered products are now
----------------------
1 × K1
1 x K2-2
2 × K3
```

### Changes when combinations of invoiced and draft orders

John has placed those orders: 

| ItemCode | Product name | Quantity | Price | Line total
|--|--|--|--|--|
| | | | | |
| | **Order # 255 - Invoiced** | | | |
| K1 | Conference ticket (3 days) | 1 | 1000 | 1000|
| K2-1 | Small dinner | 1 | 400 | 400
| K3 | Daily rate | 2 | 200 | 400
| | | | | |
| | **Order # 256 - Verified** | | | |
| K2-1 | Refund of Small dinner | -1 | 400 | -400 |
| K2-2 | Large dinner | 1 | 600 | 600 |

Current products are now

| ItemCode | Product name | Current Quantity 
|--|--|--|
| K1 | Ticket | 1 |
| K2-1 | Small dinner | 0 | 
| K2-2 | Large dinner | 1 | 
| K3 | Daily rate | 2 |
| K4 | Sightseeing | 0 |
| K5 | Guided walk | 0 |

If he wants to change his products, we will be dropping his editable orders, and place the minimum orderlines to correct it to the wanted quantity of products.

**Remove dinner**
To get a baseline we sum all invoiced orders, and are skipping orderlines from orders with status draft/verified.

| ItemCode | Product name | Invoiced Quantity | Wanted Quantity | Difference |
|--|--|--|--|--|
| K1 | Ticket | 1 | 1 | 0 |
| K2-1 | Small dinner | 1 | 0 | -1 |
| K2-2 | Large dinner | 0 | 0 | 0 |
| K3 | Daily rate | 2 | 2 | 0 |
| K4 | Sightseeing | 0 | 0 | 0 |
| K5 | Guided walk | 0 | 0 | 0 |

To accomplish getting the right number of current products, we just delete all orderlines of draft invoices, and add orderlines to the difference between invoiced and wanted quantity.

**The new order #256**

| ItemCode | Product name | Quantity | Price | Line total |
|--|--|--|--|--|
| K2-1 | Refund of Small dinner | -1 | 400 | -400 |
|  | **Order total** |  |  | -400 |


### Changes when multiple orders are invoiced

John has placed those orders: 

| ItemCode | Product name | Quantity | Price | Line total
|--|--|--|--|--|
| | | | | |
| | **Order # 255 - Invoiced** | | | |
| K1 | Conference ticket (3 days) | 1 | 1000 | 1000|
| K2-1 | Small dinner | 1 | 400 | 400 |
| K3 | Daily rate | 2 | 200 | 400 |
| | | | | |
| | **Order # 256 - Invoiced** | | | |
| K4 | Sightseeing | 1 | 800 | 800|


Current products are now

| ItemCode | Product name | Current Quantity 
|--|--|--|
| K1 | Ticket | 1 |
| K2-1 | Small dinner | 1 | 
| K2-2 | Large dinner | 0 | 
| K3 | Daily rate | 2 |
| K4 | Sightseeing | 1 |
| K5 | Guided walk | 0 |

If he wants to change his current products, we can have the following cases.

**Change to large dinner and add guided walk**
To get a baseline we sum all invoiced orders, and are skipping orders which are draft/verified.

| ItemCode | Product name | Invoiced Quantity | Wanted Quantity | Difference |
|--|--|--|--|--|
| K1 | Ticket | 1 | 1 | 0 |
| K2-1 | Small dinner | 1 | 0 | -1 |
| K2-2 | Large dinner | 0 | 0 | 1 |
| K3 | Daily rate | 2 | 2 | 0 |
| K4 | Sightseeing | 1 | 0 | 0 |
| K5 | Guided walk | 0 | 0 | 1 |

To accomplish getting the right number of current products, we need to add a new order, with the orderlines below.

**The new order #257**

| ItemCode | Product name | Quantity | Price | Line total |
|--|--|--|--|--|
| K2-1 | Refund of Small dinner | -1 | 400 | -400 |
| K2-1 | Large dinner | 1 | 600 | 600 |
| K5 | Guided walk | 1 | 0 | 0 |

