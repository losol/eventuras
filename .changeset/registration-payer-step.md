---
"@eventuras/api": minor
"@eventuras/event-sdk": minor
"@eventuras/web": minor
---

The registration flow asks who pays the invoice: the participant, their own company or another organization. Organization payers give an organization number (checked for Norwegian numbers), the organization's name, a contact person and an invoice address; another organization must also give an invoice reference. The API stores the payer type and contact person, and copies changed payer details to orders that are not invoiced yet, so the invoice goes to the chosen payer with the chosen payment method. PowerOffice matches organization customers on the organization number only, and no longer falls back to the participant's email.
