# Quick Fix: Chief Executive Login Error

## Problem
Getting `400 Bad Request` error when trying to login with `Chief2025!` password.

## Solution

The user `chief.executive@woreda.gov.et` doesn't exist in Supabase Auth yet. Create it now:

### Step 1: Create Auth User

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/dfdgyzdyfqyivanfobap
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** → **"Create new user"**
4. Fill in:
   - **Email**: `chief.executive@woreda.gov.et`
   - **Password**: `Chief2025!`
   - **Auto Confirm**: ✅ **CHECK THIS BOX** (very important!)
5. Click **"Create user"**

### Step 2: Link User to Portal

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this query:

```sql
UPDATE portal_users 
SET user_id = (SELECT id FROM auth.users WHERE email = 'chief.executive@woreda.gov.et')
WHERE email = 'chief.executive@woreda.gov.et';
```

### Step 3: Verify

Run this to check:

```sql
SELECT 
  pu.email,
  pu.department,
  au.email_confirmed_at,
  CASE WHEN pu.user_id IS NOT NULL THEN '✅ Ready' ELSE '❌ Not Linked' END as status
FROM portal_users pu
LEFT JOIN auth.users au ON pu.user_id = au.id
WHERE pu.email = 'chief.executive@woreda.gov.et';
```

You should see:
- `email_confirmed_at`: Should have a timestamp
- `status`: `✅ Ready`

### Step 4: Try Login Again

Now try logging in with:
- **Department (Amharic)**: `ዋና ሥራ አስፈፃሚ`
- **Password**: `Chief2025!`

Or with email:
- **Email**: `chief.executive@woreda.gov.et`
- **Password**: `Chief2025!`

## Alternative: Use Script

If you have the service role key, you can run:

```bash
node scripts/create-portal-users.js <YOUR_SERVICE_ROLE_KEY>
```

This will create ALL missing users at once.

## Still Not Working?

1. Check browser console for detailed error
2. Verify email is exactly: `chief.executive@woreda.gov.et` (with dot, not underscore)
3. Make sure password is exactly: `Chief2025!` (case sensitive)
4. Check Supabase Dashboard → Authentication → Users to see if user exists
5. Check if `email_confirmed_at` is set (should not be null)









