# Event registration flow

## How is flow initiated

-   The user clicks on the "Register" button on the event details page.
-   If the user is not logged in, the user is redirected to the login page.

If the user needs to login or create a user, he should still be redirected back to the event registration flow when this task is finished.

## Flow description

### Step 1: Customize products

**API Endpoint:** `GET https://api.example.com/v3/events/{eventId}/products`

The user should see a list of products which is available for the event. If the users is allready registered, he should just see a message that he is registered.

-   Display mandatory products at the top. The user should not be able to change these products.
-   If `enableQuantity` is set, it should be possible to change the quantity in the UI
-   If `minimumQuantity` is set, we should have validation for this

If no products are available for the event. We will just let the user confirm his registration with something like: “Registration for {Event.Title}. Would you like to register? YES / NO.

### Step 2: Collect User Information

-   **API Endpoint:** `GET v3/users/me`

Retrieve user's name and email from the api endpoint

Collect this info in a form:

| Title                                                      | Field                        | Comment                                                                            |
| ---------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| Name                                                       | From users api. Not editable |                                                                                    |
| Email:email                                                | From users api. Not editable |                                                                                    |
| Zip                                                        | zip                          |                                                                                    |
| City                                                       | city                         |                                                                                    |
| Country                                                    | country                      |                                                                                    |
| VAT number                                                 | vatNumber                    |                                                                                    |
| Invoice reference                                          | invoiceReference             |                                                                                    |
| Payment method: radio buttons: Email or Electronic invoice | paymentMethod                | Maps to PowerOfficeEmailInvoice or PowerOfficeEHFInvoice as paymentMethod for now. |

### Step 3: Perform Registration

After user har registered the info in step 2, we will create an registration.

**API:** `POST` `v3/registrations`

```json
{
    "customer": {
        "vatNumber": "string",
        "name": "string",
        "email": "user@example.com",
        "zip": "string",
        "city": "string",
        "country": "string",
        "invoiceReference": "string"
    },
    "notes": "string",
    "type": "Participant",
    "paymentMethod": "EmailInvoice",
    "userId": "string",
    "eventId": 2147483647,
    "createOrder": true
}
```

Save the `registrationId` received in the registration object in the response.

### Step 4: Retrieve Order Details

-   **API Endpoint:** `GET` `/v3/registrations/{RegistrationId}/orders`
-   Retrieve order details based on the registration ID.
-   Note the orderId for later use.

### Step 5: Update Order

-   **API Endpoint:** `PUT` `/v3/orders/{OrderId}`
-   Update the order with selected optional products.

### Step 6: Display Confirmation

-   Show a confirmation message to the user.

## Backend for Frontend (BFF) Approach

We will look into if we could simplify step 4 and 5 bu providing an api. Then we will avoid having business logic for orders both backend and frontend.

### Frontend to Backend Communication

Frontend sends a POST request to the backend with selected product lines in JSON format. Example Request Body:

```json
{
    "products": [
        {
            "productId": 1,
            "productVariantId": 0,
            "quantity": 1
        },
        {
            "productId": 2,
            "productVariantId": 0,
            "quantity": 5
        }
    ]
}
```

Then backend will check which orders that has to be updated, and create new orders if need to correct invoiced orders.

