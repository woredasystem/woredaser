# Supabase Authentication Setup Guide

## Step 1: Create Auth Users in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** → **"Create new user"**
4. Create the following users with their emails and passwords:

### Portal Users:

1. **Trade Office**
   - Email: `trade@woreda.gov.et`
   - Password: `Trade2025!` (or your secure password)
   - Auto Confirm: ✅ (check this box)

2. **Civil Registration**
   - Email: `civil@woreda.gov.et`
   - Password: `Civil2025!` (or your secure password)
   - Auto Confirm: ✅

3. **Labor & Skills**
   - Email: `labor@woreda.gov.et`
   - Password: `Labor2025!` (or your secure password)
   - Auto Confirm: ✅

4. **CEO Office**
   - Email: `ceo@woreda.gov.et`
   - Password: `CEO2025!` (or your secure password)
   - Auto Confirm: ✅

5. **Admin**
   - Email: `admin@woreda.gov.et`
   - Password: `Admin2025!` (or your secure password)
   - Auto Confirm: ✅

## Step 2: Link Auth Users with Portal Users Table

After creating the auth users, run this SQL in the Supabase SQL Editor to link them:

```sql
-- Link Trade Office user
UPDATE portal_users 
SET user_id = (SELECT id FROM auth.users WHERE email = 'trade@woreda.gov.et')
WHERE email = 'trade@woreda.gov.et';

-- Link Civil Registration user
UPDATE portal_users 
SET user_id = (SELECT id FROM auth.users WHERE email = 'civil@woreda.gov.et')
WHERE email = 'civil@woreda.gov.et';

-- Link Labor & Skills user
UPDATE portal_users 
SET user_id = (SELECT id FROM auth.users WHERE email = 'labor@woreda.gov.et')
WHERE email = 'labor@woreda.gov.et';

-- Link CEO Office user
UPDATE portal_users 
SET user_id = (SELECT id FROM auth.users WHERE email = 'ceo@woreda.gov.et')
WHERE email = 'ceo@woreda.gov.et';

-- Link Admin user
UPDATE portal_users 
SET user_id = (SELECT id FROM auth.users WHERE email = 'admin@woreda.gov.et')
WHERE email = 'admin@woreda.gov.et';
```

## Step 3: Verify Setup

Run this query to verify all users are linked:

```sql
SELECT 
  pu.email,
  pu.username,
  pu.department,
  pu.role_key,
  pu.is_admin,
  au.id as auth_user_id,
  CASE WHEN au.id IS NOT NULL THEN 'Linked' ELSE 'Not Linked' END as status
FROM portal_users pu
LEFT JOIN auth.users au ON pu.user_id = au.id;
```

All users should show "Linked" status.

## Step 4: Test Login

1. Go to the portal access page
2. Select a department portal
3. The login screen will show the department name in Amharic (pre-filled)
4. Enter password:
   - Trade Office: Password set during user creation
   - Civil Registration: Password set during user creation
   - Labor & Skills: Password set during user creation
   - CEO Office: Password set during user creation
   - Admin: Password set during user creation

**Note:** The system uses the Amharic department name for login. The department name is automatically filled based on the selected portal.

## Security Notes

- Change default passwords immediately after setup
- Use strong passwords in production
- Consider enabling MFA for admin accounts
- Regularly review and audit portal user access

## Adding New Portal Users

To add a new portal user:

1. Create auth user in Supabase Dashboard
2. Insert into portal_users table:
```sql
INSERT INTO portal_users (email, username, full_name, department, role_key, is_admin, user_id)
VALUES (
  'newuser@woreda.gov.et',
  'newuser',
  'New User Name',
  'Department Name',
  'role_key',
  false,
  (SELECT id FROM auth.users WHERE email = 'newuser@woreda.gov.et')
);
```

