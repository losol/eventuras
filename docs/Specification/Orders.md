# Orders

Each registration for an event could have one or more orders associated with the registration. Typical products on the orders are event tickets with variants with different prices. For most events it will be an associated mandatory product – the ticket. 

For conferences there will often be a "daily conference pack" for each day of the event, which is mandatory. 

In addition many events will have optional product as well. Examples could be dinners or sightseeing. Note that some products might be free addons. 

For both the participant and the admin, it is important to have an overview of which products which is ordered independant of which order they belong to. 

Orders keeps track of the person or organisation paying, and has a reference to the event. Each order may contain multiple order lines.

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

Consider the following order:

```text
Order #255
----------------------
K1  Item-A  ×1  Kr1000
K2  Item-B  ×1  Kr2000
K3  Item-C  ×5   Kr500
----------------------
Total:          Kr5500

Ordered products
----------------------
1 × A
1 × B
5 × C
```

The refund order will be as follows:
```text
Order #256
------------------------
K1  Item-A  × -1  Kr1000
K2  Item-B  × -1  Kr2000
K3  Item-C  × -5   Kr500
------------------------
Total:          Kr -5500

Ordered products
----------------------
Null
```

## Changes to invoiced orders

Changes to invoiced orders are handled by issuing a new order that includes the items to be added and refunds the items to be removed.

Combinations of the following cases can make any change to an invoiced order possible.

Case 1: Adding an item to Order #255.

```text
Order #256
----------------------
K4  Item-D  ×1  Kr1000
----------------------
Total:          Kr1000

Products
----------------------
1 × A
1 × B
5 × C
1 × D
```

Case 2: Removing an item from Order #255.

```text
Order #256
------------------------
K3  Item-C  × -5   Kr500
------------------------
Total:          Kr -2500

Products
----------------------
1 × A
1 × B
```

Case 3: Increasing the quantity of an item from Order #255.

```text
Order #256
----------------------
K1  Item-A  ×1  Kr1000
----------------------
Total:          Kr1000

Products
----------------------
2 × A
1 × B
5 × C
```

Case 4: Decreasing the quantity of an item from Order #255.

```text
Order #256
------------------------
K3  Item-C  × -2   Kr500
------------------------
Total:          Kr -1000

Products
----------------------
1 × A
1 × B
3 × C
```


Case 5: Changing products for Order #255.
The user has ordered Product B, but now wants product D instead

```text
Order #256
------------------------
K2  Item-B  × -1  Kr2000
K4  Item-D  × 1    Kr500
------------------------
Total:          Kr -1500

Products
----------------------
1 × A
3 × C
1 x D
```
