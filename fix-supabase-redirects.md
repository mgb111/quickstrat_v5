# Fix Supabase Redirect URLs for Local Development and Production

## Local Development

- In `.env.local`:
  ```
  VITE_REDIRECT_URI=http://localhost:5175
  ```
- In Supabase dashboard:
  - Site URL: `http://localhost:5175`
  - Redirect URLs:  
    ```
    http://localhost:5175
    http://localhost:5175/dashboard
    http://localhost:5175/auth
    ```
- In Google Cloud Console:
  - Authorized redirect URIs:
    ```
    http://localhost:5175/auth/callback
    ```

## Production

- In Vercel dashboard (Environment Variables):
  ```
  VITE_REDIRECT_URI=https://majorbeam.com
  ```
- In Supabase dashboard:
  - Site URL: `https://majorbeam.com`
  - Redirect URLs:  
    ```
    https://majorbeam.com
    https://majorbeam.com/dashboard
    https://majorbeam.com/auth
    ```
- In Google Cloud Console:
  - Authorized redirect URIs:
    ```
    https://majorbeam.com/auth/callback
    ```

## Code Usage

```js
const redirectBase = import.meta.env.VITE_REDIRECT_URI || window.location.origin;
redirectTo: `${redirectBase}/dashboard`
emailRedirectTo: `${redirectBase}/dashboard`
```

---

**This setup ensures you never have to change code for local vs. production—just set the right environment variable!**

## What This Does
- ✅ **Keeps you on localhost during development**
- ✅ **Prevents redirects to Netlify**
- ✅ **Maintains production URLs for deployment**
- ✅ **Works with both email and Google auth**

## Test It
1. Go to http://localhost:5175/
2. Try signing up or signing in
3. You should stay on localhost instead of redirecting to Netlify

## Alternative: Use Email/Password Only
If you want to avoid OAuth redirect issues during development:
- Use email/password signup instead of Google
- This avoids the OAuth redirect URL configuration
- Perfect for development and testing 