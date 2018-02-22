# Registration
Registration of users is a main focus of the solution. It should be simple, and have an attractive layout. 

## Business user story
* As a web site visitor I find information about events and extra products and may register for attending events, so that I could enhance my knowledge.

## User stories
- [x] As a web site visitor I could register for an event so that I may attend it.
- [ ] As a web site visitor I could overview over extra products
- [ ] As a web site visitor I may book extra products as dinners and adventures so that I have a great time when attending the course
- [x] As a web site visitor I receive an email with a link to confirm my registration so that nobody else is registering with my email.
- [ ] As a web site visitor I receive an final email confirmation on my order so that I know I could attend the event.

## Flow
1. User fills out information needed for registration, and submits
1. Valdition clientside and serverside, return to 1 if validation fails
1. If user does not exist, a new user should be created with the supplied name, email and phone number. 
1. If user is already registered to the event
    - If registered and not verified: Send new verification email 
    - If registered and verified: Send email about allready registered.
1. If user is not registered then register the new registration into database.
1. If succesful redirect visitor to the /Pages/Register/Confirm which shows information that the user needs to confirm in email.
1. Send email with confirmation link
1. Validate confirmation link from email. 
1. Redirect to /Pages/Register/Confirmed
1. Send email confirmation with whole order. 


## Success criteria
* The user fills out all necessary information
* The user has satisfactory information to order an event
* Registration is simple and intuitive

## Acceptance criteria
* Entering data results in proper validation and registration.
* The user is able to complete registration, including email validation.
* No user could register twice for the same event.

## Default fields
The registration of users should be as simple as possible, to enhance conversions from interest to decision. When an user registers, fields for this information should be provided:

Field   | Description               | Comments
---     | ---                       | ---
Name    | String 100 characters)    | required. Only alphanumerics
Email   | String 100 characters     | required, validate as email
Phone   | string 50 characters      | only +()0-9 allowed)
Occupation/Position | String 100 characters | Only alphanumerics
Employer| string 50 characters      | only +()0-9 allowed)
Show registration public | Bool | Permission to be shown on public attendant list
Comments | Textarea 500 characters  | only alphanumerics

## Products / add-ons
All events could have extra products which may be free or priced. The extra products are associated with the event in the admin interface. For the user registering, the products with pricing should be shown as options, with the possibility of adding them to the order. Some products may be mandatory, as conference fee (dagpakke?) or registration fee.

The total price of the order should be updated as soon as the user changes product selection.

## Flow after registration
After the information is validated and submitted into the database, an email should be sent to the user at the provided email address. 

The email sent should provide information about the whole order, including event and extra products.

A link should be provided for the user to confirm registration, as well as an fallback option to copy the link into a browser window. 

## Supplemental information
* Event administrator and global administratiors should have the possibility of registering users for event, both paid and free registrations. Admin interface is described as a separate part. 

---
## Future development options
The information below is being considered for future expansion.

### Registration of multiple persons
There may later be requested the option for registering multiple persons at once, with one order/invoice for multiple persons.

### Supplement user profile
When the user has confirmed hos attendance my verifying email, he/she could provide supplemental information to his/her user profile. 
* Date of Birth
* Municipality
* Biography / information about the user
* Website /Social media profile links

### Custom fields on registration
The admin could provide custom fields which should be filled out by the user registering. The fields might be volountary or mandatory. Some fields may alter the price for the user. The fields may be text fields, text area, checkbox and/or date/time pickers.
