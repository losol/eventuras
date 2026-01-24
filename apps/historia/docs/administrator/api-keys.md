# Using API Keys for Media and Notes

This guide explains how to create and use API keys to access Historia's Media and Notes collections programmatically.

## Overview

API keys allow external services and automation scripts to interact with Historia's API without requiring interactive user authentication. Each API key is associated with a user account and inherits that user's permissions.

## Use Cases

- **Automated media uploads** from photo management systems
- **Content synchronization** between Historia and other platforms
- **Batch operations** for importing or migrating content
- **Third-party integrations** that need to create or read notes
- **Headless CMS workflows** for consuming content via REST API

## Prerequisites

- You must be a **system administrator** to create and manage API keys
- Access to the Historia admin panel

## Creating an API Key

### Step 1: Create or Select a Service Account

It's recommended to create dedicated user accounts for API integrations rather than using personal accounts.

1. Navigate to **Users** collection in the admin panel
2. Click **Create New** to create a service account
3. Fill in the required fields:
   - **Email**: Use a descriptive email like `media-importer@historia.local`
   - **Given Name**: Optional, e.g., "Media Import Service"
4. **Important**: Assign appropriate roles:
   - For media uploads: Assign **Site Editor** role on the tenant
   - For admin operations: Assign **System Admin** global role
5. Save the user

### Step 2: Generate an API Key

1. Open the user document you created
2. Navigate to the **API Keys** tab
3. Click **Generate API Key**
4. **Copy the key immediately** - it will only be shown once
5. Store the key securely (e.g., in a password manager or environment variable)

### Step 3: Test the API Key

Test the API key using curl:

```bash
# Test reading media
curl -X GET "https://your-historia-domain.com/api/media" \
  -H "Authorization: users API-Key YOUR-API-KEY-HERE"

# Test creating a note
curl -X POST "https://your-historia-domain.com/api/notes" \
  -H "Authorization: users API-Key YOUR-API-KEY-HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Note",
    "content": {
      "root": {
        "type": "root",
        "children": [
          {
            "type": "paragraph",
            "children": [
              {
                "type": "text",
                "text": "This is a test note created via API."
              }
            ]
          }
        ]
      }
    }
  }'
```

## Using API Keys

### Authentication Header Format

All API requests must include the Authorization header:

```
Authorization: users API-Key YOUR-API-KEY-HERE
```

### Example: Upload Media

```bash
curl -X POST "https://your-historia-domain.com/api/media" \
  -H "Authorization: users API-Key YOUR-API-KEY-HERE" \
  -F "file=@/path/to/image.jpg" \
  -F "title=My Image" \
  -F "description=Description of the image"
```

### Example: Create a Note with TypeScript

```typescript
import fetch from 'node-fetch';

const API_KEY = process.env.HISTORIA_API_KEY;
const BASE_URL = 'https://your-historia-domain.com/api';

async function createNote(title: string, content: string) {
  const response = await fetch(`${BASE_URL}/notes`, {
    method: 'POST',
    headers: {
      'Authorization': `users API-Key ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: content }],
            },
          ],
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Usage
createNote('API Test', 'Created via API key')
  .then(data => console.log('Note created:', data))
  .catch(error => console.error('Error:', error));
```

### Example: Upload Media with Python

```python
import os
import requests

API_KEY = os.environ.get('HISTORIA_API_KEY')
BASE_URL = 'https://your-historia-domain.com/api'

def upload_media(file_path, title, description=None):
    headers = {
        'Authorization': f'users API-Key {API_KEY}'
    }

    with open(file_path, 'rb') as file:
        files = {'file': file}
        data = {
            'title': title,
            'description': description or ''
        }

        response = requests.post(
            f'{BASE_URL}/media',
            headers=headers,
            files=files,
            data=data
        )

        response.raise_for_status()
        return response.json()

# Usage
result = upload_media(
    '/path/to/image.jpg',
    'My Image',
    'Uploaded via API'
)
print(f"Media uploaded: {result['id']}")
```

## Permissions and Access Control

API keys inherit the permissions of their associated user:

| User Role | Media Permissions | Notes Permissions |
|-----------|------------------|-------------------|
| **System Admin** | Full CRUD (create, read, update, delete) | Full CRUD |
| **Site Editor** | Create, read, update (no delete) | Create, read, update (no delete) |
| **Member** | Read only | Read only |

### Principle of Least Privilege

Always create service accounts with the minimum necessary permissions:

- **For read-only access**: Create a user with no special roles (member)
- **For content creation**: Assign Site Editor role
- **For full access**: Only assign System Admin if absolutely necessary

## Managing API Keys

### Viewing Active Keys

1. Navigate to the user document
2. Go to the **API Keys** tab
3. You'll see a list of active keys with:
   - Creation date
   - Last used date (if tracked)

### Revoking an API Key

1. Open the user document
2. Navigate to the **API Keys** tab
3. Find the key you want to revoke
4. Click **Delete** next to the key

**Note**: Deleting a key immediately prevents its use. Any requests using the deleted key will be rejected.

### Rotating Keys

For security, rotate API keys periodically:

1. Generate a new API key for the user
2. Update your services/scripts to use the new key
3. Delete the old key once migration is complete

## Security Best Practices

### Storage

- **Never commit API keys to version control**
- Store keys in environment variables or secure secret management systems
- Use `.env` files locally (ensure `.gitignore` includes `.env`)

### Transmission

- **Always use HTTPS** in production - never transmit keys over HTTP
- Use secure channels when sharing keys with team members
- Avoid sending keys via email or chat

### Monitoring

- Regularly review API key usage in logs
- Monitor for suspicious activity (unusual patterns, high request rates)
- Set up alerts for failed authentication attempts

### Service Accounts

- Create dedicated service accounts for each integration
- Use descriptive emails (e.g., `slack-bot@historia.local`, `media-sync@historia.local`)
- Document which services use which accounts

## Troubleshooting

### "Unauthorized" Error

**Problem**: API returns 401 Unauthorized

**Solutions**:
1. Verify the API key is correct (copy-paste carefully)
2. Check the Authorization header format: `users API-Key YOUR-KEY`
3. Ensure the key hasn't been deleted or revoked
4. Verify the user account is still active

### "Forbidden" Error

**Problem**: API returns 403 Forbidden

**Solutions**:
1. Check the user's roles and permissions
2. Verify the user has access to the tenant/website if applicable
3. Confirm the operation is allowed (e.g., site editors can't delete)

### Media Upload Fails

**Problem**: File upload returns an error

**Solutions**:
1. Verify `Content-Type: multipart/form-data` header
2. Check file size limits in Historia configuration
3. Ensure the file field name is `file`
4. Verify the user has create permission on media collection

## API Reference

For complete API documentation, refer to:

- Payload CMS REST API: `https://payloadcms.com/docs/rest-api/overview`
- Your Historia API documentation: `/api-docs` (if enabled)

### Available Endpoints

- `GET /api/media` - List media items
- `POST /api/media` - Upload new media
- `GET /api/media/:id` - Get specific media item
- `PATCH /api/media/:id` - Update media item
- `DELETE /api/media/:id` - Delete media item (admin only)

- `GET /api/notes` - List notes
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get specific note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note (admin only)

## Related Documentation

- [ADR 0011: API Keys for Media and Notes](../adr/0011-api-keys-for-media-and-notes.md) - Technical architecture decision
- [Payload CMS API Keys Documentation](https://payloadcms.com/docs/authentication/api-keys)
- [Payload CMS REST API Documentation](https://payloadcms.com/docs/rest-api/overview)

## Getting Help

If you encounter issues:

1. Check the server logs for detailed error messages
2. Review the user's permissions and roles
3. Verify your API request format matches the examples above
4. Consult the technical team or system administrators
