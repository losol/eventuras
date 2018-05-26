# Orders

To keep track of ordered events, as well as products. When a website visitor registers for an event, an order is created - even if the event is free. The order should also contain products selected - free or paid. **UPDATE: No Orders for free registrations.**

The orders keeps track of the person or organisation paying, and has a reference to the event. Each order may contain multiple order lines.

An order has a status. Orderstatus will typically be like
1. Draft
1. Verified
1. Invoiced
1. Paid
1. Refunded

After implementing orders, we should change from verification of registration to email verification for orders. Flow:
1. Web site visitor registers for event
1. The system sends an email with the order and orderlines for verification
1. When the user has clicked on the link, the order is marked as verified.
1. When the admin manually or by extension invoices the event, the OrderStatus changes to Invoiced. 
1. If the admin manually wants to, he could change status to paid, after receiving payment. 

**TODO: Update the flow to account for the different providers.**

~~~Business rules to be implemented (later):~~   
~~* If paymentmethod is EHF, it should be a VatNumber~~


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

Products
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

Products
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
K2  Item-C  × -1  Kr2000
K4  Item-D  × 1    Kr500
------------------------
Total:          Kr -1500

Products
----------------------
1 × A
3 × C
1 x D
```
