# Gmail OAuth Setup for E2E Tests

This guide explains how to set up Gmail API access for Playwright E2E tests.

## Prerequisites

- A Gmail account (recommended: create a dedicated test account)
- Google Cloud Console access

## Step 1: Configure Google Cloud Project

Follow the setup instructions in [`libs/google-api/README.md`](../../libs/google-api/README.md#setting-up-gmail-oauth) to:

1. Create or select a Google Cloud project
2. Enable the Gmail API
3. Configure the OAuth consent screen
4. Create OAuth client credentials

### Step 2: Set Up Authorized Redirect URI

Add **both** redirect URIs to your OAuth client (this allows using either method):

1. Go to **Credentials** → Click your OAuth 2.0 Client ID
2. Under **Authorized redirect URIs**, add:
   - `http://localhost:3123/oauth/callback` (for programmatic setup with `pnpm oauth:setup`)
   - `https://developers.google.com/oauthplayground` (for manual setup with OAuth Playground)
3. Click **Save**

## Step 3: Obtain Refresh Token

You have two options for obtaining a refresh token:

### Option A: Using OAuth 2.0 Playground (Recommended for Initial Setup)

This is the easiest method for getting started:

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click the settings icon (⚙️) in the top right
3. Check **"Use your own OAuth credentials"**
4. Enter your **OAuth Client ID** and **OAuth Client Secret**
5. In the left panel under "Step 1", find **Gmail API v1**
6. Select the scope: `https://www.googleapis.com/auth/gmail.readonly`
7. Click **"Authorize APIs"**
8. Sign in with your Gmail test account
9. Grant the requested permissions
10. In **Step 2**, click **"Exchange authorization code for tokens"**
11. Copy the **refresh_token** value (you'll only see this once!)

### Option B: Programmatic OAuth Flow (For CI/CD)

**Best for:** CI/CD environments, automated setups, or if you prefer a command-line approach.

This project includes an OAuth setup script that handles the OAuth flow automatically.

**Steps:**

1. **Ensure your `.env` has the client credentials:**

   ```bash
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

2. **Run the OAuth setup script:**

   ```bash
   pnpm oauth:setup
   ```

   This will:
   - Start a temporary server at `http://localhost:3123`
   - Print a URL to authorize the application
   - Exchange the authorization code for tokens
   - Display your refresh token in both the browser and terminal

3. **Follow the printed instructions:**
   - Open `http://localhost:3123/auth` in your browser
   - Authorize the application with your Gmail test account
   - Copy the refresh token from the browser or terminal

4. **Add the refresh token to your `.env` file:**

   ```bash
   GOOGLE_REFRESH_TOKEN=1//0gxxxxx...
   ```

The script is located at `scripts/oauth-server.ts` if you need to review or modify it.

## Step 3: Store the Refresh Token

Add to your `.env` file:

```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3123/oauth/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

**Note:** When using Option B (programmatic flow), set `GOOGLE_REDIRECT_URI=http://localhost:3123/oauth/callback`. When using Option A (OAuth Playground), use `GOOGLE_REDIRECT_URI=https://developers.google.com/oauthplayground`.

**For CI/CD:** Store the refresh token as an encrypted secret (e.g., GitHub Secrets, Azure Key Vault) and inject it into the test environment.

## Step 4: Configure Test Email Addresses

Use Gmail's [plus addressing](https://gmail.googleblog.com/2008/03/2-hidden-ways-to-get-more-from-your.html) to create multiple test identities:

```bash
# In .env
TEST_E2E_EMAIL_ADMIN=youremail+admin@gmail.com
TEST_E2E_EMAIL_USER=youremail+user@gmail.com
```

All verification emails will arrive in `youremail@gmail.com`, but each plus-addressed email is treated as a unique identity by the application.

## Step 5: Register Test Users

1. Visit your Eventuras application
2. Register using `youremail+admin@gmail.com`
3. Check your Gmail inbox for the verification code
4. Complete registration
5. Repeat for `youremail+user@gmail.com`

Then follow the remaining steps in the main [README.md](./README.md#test-account-setup) to:

- Add users to the organization
- Grant admin rights (for admin user only)

## Troubleshooting

### "No verification emails received"

- Check that Gmail API is enabled in your Google Cloud project
- Verify the refresh token hasn't expired (refresh tokens can expire if unused for 6 months)
- Ensure the Gmail account receiving emails matches the one used for OAuth

### "Missing required Google OAuth credentials"

- Double-check all environment variables are set in `.env`
- Ensure there are no extra spaces in the values
- Verify the file is named `.env` exactly (not `.env.template`)

### "Failed to retrieve message details"

- Confirm the Gmail API scope includes `gmail.readonly`
- Check that the search query matches your application's email format
- Verify the email hasn't been deleted or moved to trash

## Security Notes

- **Never commit** the `.env` file or refresh token to version control
- Use a dedicated Gmail account for testing, not your personal account
- Consider rotating the refresh token periodically
- For CI/CD, store credentials in encrypted secrets management
