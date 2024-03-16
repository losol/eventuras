# Registrations Access Control

## Definitions

- **Owner**: The user associated with the registration.

- **Admin**: An user with administrative privileges for an organization

- **System admin**: An user with the highest level of access and control over the entire system.

- **Anonymous user**: A user who is not logged into the system.

## Access Control Rules

### Create Operations

| Rule ID           | Description                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| REG-ACL-CREATE-01 | Anonymous users are not allowed to create registrations.                                       |
| REG-ACL-CREATE-02 | Admins can create a registrations for events belonging to the organization for all users.      |
| REG-ACL-CREATE-03 | Users can create a registration if the event is open for registrations                         |
| REG-ACL-CREATE-04 | Users can create a registration with status `WaitingList` if the event status is `WaitingList` |

### Read Operations

| Rule ID         | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| REG-ACL-READ-01 | Admin can read a registration for events belonging to the organization   |
| REG-ACL-READ-01 | Users can read a registration if they are the owner of the registration. |

### Update Operations

| Rule ID           | Description                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| REG-ACL-UPDATE-01 | Admins can update any registration.                                                                                                         |
| REG-ACL-UPDATE-02 | Owners can update their registration until the last registration date, plus an additional 24 hours.                                         |
| REG-ACL-UPDATE-03 | Owners can update their registration after registration within the duration specified by `AllowedRegistrationEditHours` (default 24 hours). |
| REG-ACL-UPDATE-04 | Owners can update their registration until 48 hours before the event start if `AllowModificationsAfterLastCancellationDate` is set.         |

### Listing Operations

| Rule ID         | Description                                              |
| --------------- | -------------------------------------------------------- |
| REG-ACL-LIST-01 | Anonymous users cannot list any registrations.           |
| REG-ACL-LIST-02 | System admins can list any registration.                 |
| REG-ACL-LIST-03 | Admins can list registrations within their organization. |
| REG-ACL-LIST-04 | Owner can only list their own registrations.             |

### Delete Operations

| Rule ID           | Description                      |
| ----------------- | -------------------------------- |
| REG-ACL-DELETE-01 | Registrations cannot be deleted. |
