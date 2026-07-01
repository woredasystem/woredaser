# Create Portal Users - Quick Guide

## Option 1: Using the Script (Recommended)

### Step 1: Get Service Role Key
1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (⚠️ Keep this secret! Never commit it to git)
4. This key has admin privileges

### Step 2: Create .env file
Create a `.env` file in the project root (if it doesn't exist):

```env
VITE_SUPABASE_URL=https://dfdgyzdyfqyivanfobap.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Run the Script
```bash
node scripts/create-portal-users.js
```

The script will:
- Create all 5 portal users in Supabase Auth
- Link them to the portal_users table
- Set up department_am fields
- Auto-confirm their emails

## Option 2: Manual Creation via Supabase Dashboard

### Step 1: Create Auth Users
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Create each user:

**Trade Office:**
- Email: `trade@woreda.gov.et`
- Password: `Trade2025!` (or your secure password)
- Auto Confirm: ✅

**Civil Registration:**
- Email: `civil@woreda.gov.et`
- Password: `Civil2025!`
- Auto Confirm: ✅

**Labor & Skills:**
- Email: `labor@woreda.gov.et`
- Password: `Labor2025!`
- Auto Confirm: ✅

**CEO Office:**
- Email: `ceo@woreda.gov.et`
- Password: `CEO2025!`
- Auto Confirm: ✅

**Admin:**
- Email: `admin@woreda.gov.et`
- Password: `Admin2025!`
- Auto Confirm: ✅

### Step 2: Link Users (Run in SQL Editor)

After creating auth users, run this SQL to link them:

```sql
-- Link all users
UPDATE portal_users 
SET user_id = (SELECT id FROM auth.users WHERE email = 'trade@woreda.gov.et')
WHERE email = 'trade@woreda.gov.et';

UPDATE portal_users 
SET user_id = (SELECT id FROM auth.users WHERE email = 'civil@woreda.gov.et')
WHERE email = 'civil@woreda.gov.et';

UPDATE portal_users 
SET user_id = (SELECT id FROM auth.users WHERE email = 'labor@woreda.gov.et')
WHERE email = 'labor@woreda.gov.et';

UPDATE portal_users 
SET user_id = (SELECT id FROM auth.users WHERE email = 'ceo@woreda.gov.et')
WHERE email = 'ceo@woreda.gov.et';

UPDATE portal_users 
SET user_id = (SELECT id FROM auth.users WHERE email = 'admin@woreda.gov.et')
WHERE email = 'admin@woreda.gov.et';
```

### Step 3: Verify

Run this query to verify all users are linked:

```sql
SELECT 
  pu.email,
  pu.department_am,
  pu.department,
  CASE WHEN au.id IS NOT NULL THEN '✅ Linked' ELSE '❌ Not Linked' END as status
FROM portal_users pu
LEFT JOIN auth.users au ON pu.user_id = au.id;
```

## Login Credentials

After setup, users can login with:

| Department (Amharic) | Password |
|---------------------|----------|
| ንግድ ጽ/ቤት | Trade2025! |
| ሲቪል ምዝገባ | Civil2025! |
| ስራና ክህሎት | Labor2025! |
| ዋና ሥራ አስፈፃሚ ጽ/ቤት | CEO2025! |
| አስተዳደር | Admin2025! |

**⚠️ Security Note:** Change these passwords immediately in production!









