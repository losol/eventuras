# Orders

To keep track of ordered events, as well as products. When a website visitor registers for an event, an order is created - even if the event is free. The order should also contain products selected - free or paid. 

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

Business rules to be implemented (later):
* If paymentmethod is EHF, it should be a VatNumber
