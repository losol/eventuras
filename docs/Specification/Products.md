# Products

Products is an important part of the registration system. Both the event ticket in it self, as well as add-ons as dinners, sightseeing and so on are considered products in this solution.

## Business user story

* As a event organizer I could add tickets and extra products to an event so that I could provide an flexible registration process.
* As a website visitor I could choose tickets and extra products, so that I could get the event I want.

## User stories

>As an administrator I could _add products_ to an event so that I can offer extra value for the customer.

Acceptance criteria

* Administrator can add products with prices.
* Visitors sees products on event info and register page

>As an administrator I could add _product variations_ to a product so that I can offer extra options for the customer.

Acceptance criteria

* Administrator can add product variations.
* Visitors sees product variations on event info and register page

>As an administrator I could set some products to be _mandatory_ so that I could order for mandatory services

Acceptance criteria

* Administrator can set mandatory products with nubmer.
* Visitor sees the mandatory products as added when they order

>As an web site visitor I could _choose_ which products and variants I would like to order so that I get what I want.

Acceptance criteria

* Visitor may choose among all available options
* Vistors options are saved when submitting form.

## Draft database model
Summary of current database model:

![Draft database model](Database-model-draft.png "Draft database model")

## Suggestions to the developer

We would like you to evaluate if it is suitable to use AJAX for saving variants to the backend, with jquery on the frontend updating the list of variants.

## Wireframes

![UI Admin](../Prototype/Products%20Admin%20UI.png)

![UI Visitor](../Prototype/Products%20Guest%20UI.png)


## Relevant models
* [EventInfo](../../Models/EventInfo.cs) - information about the event
* [Product](../../Models/Product.cs) - information about the event
* [ProductVariant](../../Models/ProductVariant.cs) - information about the event
