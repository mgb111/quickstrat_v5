# Quick Fix for "Invalid email or password" Error

## **Immediate Solutions:**

### **Option 1: Try Signing Up Again (Recommended)**
1. **Go to** http://localhost:5174/
2. **Click "Sign up"** (not login)
3. **Use the same email and password** you tried to login with
4. **You should be automatically signed in** and redirected to dashboard

### **Option 2: Use Google Login**
1. **Click "Sign in with Google"**
2. **This bypasses all email verification issues**

### **Option 3: Reset Password**
1. **On login page**, click "Forgot your password?"
2. **Enter your email**
3. **Check your email** for reset link
4. **Set a new password**

### **Option 4: Resend Verification**
1. **On login page**, click "Resend verification"
2. **Check your email** for verification link
3. **Click the link** to verify your account

## **Why This Happens:**

- **User was created with email confirmation enabled**
- **Email confirmation was later disabled**
- **User account exists but is not confirmed**
- **Supabase requires confirmation before login**

## **Permanent Fix:**

### **In Supabase Dashboard:**
1. **Go to** https://supabase.com/dashboard
2. **Select your project**
3. **Navigate to** Authentication > Users
4. **Find your user**
5. **Click "Confirm"** to manually confirm the user

### **Or via SQL:**
```sql
-- Confirm a specific user
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'your-email@example.com';

-- Confirm all users (be careful!)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
```

## **Test Steps:**
1. **Try signing up again** with the same email
2. **If that doesn't work**, use Google login
3. **If still having issues**, check the debug script 