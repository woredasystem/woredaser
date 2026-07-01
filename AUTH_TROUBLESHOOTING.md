# Authentication Troubleshooting Guide

## Error: 400 Bad Request on Login

If you're getting a `400` error when trying to login, it means the user doesn't exist in Supabase Auth yet.

### Quick Fix: Create the User

You have two options:

#### Option 1: Use the Script (Recommended)

1. Get your Supabase Service Role Key:
   - Go to Supabase Dashboard → Settings → API
   - Copy the **service_role** key (⚠️ Keep this secret!)

2. Run the script:
   ```bash
   node scripts/create-portal-users.js <YOUR_SERVICE_ROLE_KEY>
   ```

   Or set it as environment variable:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node scripts/create-portal-users.js
   ```

#### Option 2: Create Manually in Dashboard

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email**: `chief.executive@woreda.gov.et`
   - **Password**: `Chief2025!`
   - **Auto Confirm**: ✅ (check this box - important!)
4. Click **"Create user"**

5. Link the user to portal_users table:
   - Go to **SQL Editor**
   - Run this query:
   ```sql
   UPDATE portal_users 
   SET user_id = (SELECT id FROM auth.users WHERE email = 'chief.executive@woreda.gov.et')
   WHERE email = 'chief.executive@woreda.gov.et';
   ```

### Verify User Exists

Run this query in SQL Editor to check:

```sql
SELECT 
  au.email,
  au.email_confirmed_at,
  pu.department,
  CASE WHEN pu.user_id IS NOT NULL THEN '✅ Linked' ELSE '❌ Not Linked' END as status
FROM auth.users au
LEFT JOIN portal_users pu ON au.id = pu.user_id
WHERE au.email = 'chief.executive@woreda.gov.et';
```

You should see:
- Email: `chief.executive@woreda.gov.et`
- `email_confirmed_at`: Should have a timestamp (not null)
- Status: `✅ Linked`

### Common Issues

#### Issue 1: User exists but not confirmed
**Solution**: Make sure "Auto Confirm" was checked when creating the user, or manually confirm:
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'chief.executive@woreda.gov.et';
```

#### Issue 2: User exists but not linked
**Solution**: Run the UPDATE query from Option 2 above to link the user_id.

#### Issue 3: Wrong email format
**Check**: Make sure you're using `chief.executive@woreda.gov.et` (with the dot, not underscore)

#### Issue 4: Password doesn't match
**Solution**: Reset the password in Supabase Dashboard → Authentication → Users → Edit user → Reset password

### All Portal Users

Make sure all these users exist:

| Email | Password | Department |
|-------|----------|------------|
| `trade@woreda.gov.et` | `Trade2025!` | Trade Office |
| `civil@woreda.gov.et` | `Civil2025!` | Civil Registration |
| `labor@woreda.gov.et` | `Labor2025!` | Labor & Skills |
| `ceo@woreda.gov.et` | `CEO2025!` | CEO Office |
| `chief.executive@woreda.gov.et` | `Chief2025!` | Chief Executive |
| `council.speaker@woreda.gov.et` | `Council2025!` | Woreda Council |
| `admin@woreda.gov.et` | `Admin2025!` | Admin |

### Quick Verification Script

Run this in SQL Editor to check all users:

```sql
SELECT 
  pu.email,
  pu.department,
  CASE WHEN au.id IS NOT NULL THEN '✅ Exists' ELSE '❌ Missing' END as auth_exists,
  CASE WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Confirmed' ELSE '❌ Not Confirmed' END as confirmed,
  CASE WHEN pu.user_id IS NOT NULL THEN '✅ Linked' ELSE '❌ Not Linked' END as linked
FROM portal_users pu
LEFT JOIN auth.users au ON pu.email = au.email
ORDER BY pu.department;
```

All should show ✅ for all three columns.









