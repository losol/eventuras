# Products

All events may have products. Products may have product variants.

## Products creation

-   Products must have a name and a description.
-   Products can be enabled for quantity-based ordering.
-   Minimum quantity for ordering can be set
-   Products have a price and a VAT (Value Added Tax) percentage.
-   Products can be published or unpublished.

## Product variants

-   Products can have multiple variants.
-   If variants are available, the user has to choose one of them
-   Variant names and descriptions are optional.
-   Variants have their own prices

## Products in orders

-   Orders consist of one or more order lines.
-   Order lines reference products and variants.
-   Each order line includes the product name, description, variant name (if applicable), price, quantity, and VAT information.
-   The price when order is placed should be saved on the orderline
-   Multiple variants can be ordered, they should be saved on different orderlines

## Calculations

-   For each line we need methods for quantity multiplied with cost without tax, tax, and total price.
-   If a product has variants, the variant's price and VAT percentage are used.
-   For the order in total we also need total price without tax, taxes and total price as separate methods.

## Validation

-   The quantity ordered could not be 0. It may be positive number for adding products, but may also be a negative number for refunding orderlines.
-   Product variants must belong to the corresponding product.

## Integrations

-   A unique item code is generated for each product-variant combination. In the poweroffice integration there will be prepended a K- to the product id. For product id 2, with variant id 9 the identifier will be `K-2-9`

## Refund Handling

-   Refund order lines are created for corrected quantities.
-   Refund order lines include a reference to the original order line and order.
-   Refund order lines have negative quantities.

## Display and Ordering

-   Products and variants are displayed based on their display order.
-   Products with lower display order values are shown first.

## Mandatory Products

-   Products can be marked as mandatory if a minimum quantity is set.
-   Mandatory products enforce a minimum quantity during ordering.

