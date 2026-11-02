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

The payer step starts with **Who pays the invoice?** (`customer.payerType`):

| Choice                  | `payerType`         | Payment method            |
| ----------------------- | ------------------- | ------------------------- |
| Me, as a private person | `Private`           | `PowerOfficeEmailInvoice` |
| My company              | `OwnCompany`        | `PowerOfficeEHFInvoice`   |
| Another organization    | `OtherOrganization` | `PowerOfficeEHFInvoice`   |

Fields per choice:

| Title                      | Field (`customer.*`)                | Private             | My company                               | Another organization |
| -------------------------- | ----------------------------------- | ------------------- | ---------------------------------------- | -------------------- |
| Name                       | `name`                              | Participant's name  | Organization name, required              | Same                 |
| Email                      | `email`                             | Participant's email | Contact person's email, required         | Same                 |
| Organization number        | `vatNumber`                         | –                   | Required                                 | Required             |
| Invoice reference          | `invoiceReference`                  | –                   | Optional                                 | Required             |
| Contact person             | `contactName`                       | –                   | Required, prefilled with the participant | Required             |
| Street, zip, city, country | `address`, `zip`, `city`, `country` | Required            | Required (invoice address)               | Required             |

Norwegian organization numbers (country Norway) are checked for nine digits and the modulus 11 control digit, and sent as digits only. The API enforces the organization rules whenever `payerType` is `OwnCompany` or `OtherOrganization`; requests without `payerType` are validated as before.

When the payer details change, the API copies them to the registration's orders that are not invoiced yet (`Order.CopyPayerFrom`), since those orders were created before the payer step's details were saved.

### Step 3: Perform Registration

After user har registered the info in step 2, we will create an registration.

**API:** `POST` `v3/registrations`

```json
{
    "customer": {
        "payerType": "OtherOrganization",
        "vatNumber": "974760673",
        "name": "Oslo kommune",
        "email": "contact.person@example.com",
        "address": "Rådhusplassen 1",
        "zip": "0037",
        "city": "Oslo",
        "country": "Norway",
        "invoiceReference": "12345",
        "contactName": "Per Hansen"
    },
    "notes": "string",
    "type": "Participant",
    "paymentMethod": "PowerOfficeEHFInvoice",
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

