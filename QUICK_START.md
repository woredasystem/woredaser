# 🚀 Quick Start: Create Portal Users

> **All login emails and passwords:** see [CREDENTIALS.md](./CREDENTIALS.md)

## Current Status
✅ Portal users table is ready (5 users)
❌ Auth users need to be created and linked

## Option 1: Automated Script (Recommended)

### Step 1: Get Service Role Key
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **service_role** key (⚠️ Keep secret!)

### Step 2: Run Script
```bash
node scripts/create-portal-users.js YOUR_SERVICE_ROLE_KEY
```

This will:
- ✅ Create all 5 auth users
- ✅ Link them to portal_users table
- ✅ Set up department_am fields
- ✅ Auto-confirm emails

## Option 2: Manual (Dashboard)

### Step 1: Create Auth Users
1. Go to **Authentication** → **Users** → **Add user**
2. Create each user:

| Email | Password | Auto Confirm |
|-------|----------|--------------|
| trade@woreda.gov.et | Trade2025! | ✅ |
| civil@woreda.gov.et | Civil2025! | ✅ |
| labor@woreda.gov.et | Labor2025! | ✅ |
| ceo@woreda.gov.et | CEO2025! | ✅ |
| admin@woreda.gov.et | Admin2025! | ✅ |

### Step 2: Link Users (SQL Editor)
Run this SQL:

```sql
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
```sql
SELECT 
  pu.email,
  pu.department_am,
  CASE WHEN pu.user_id IS NOT NULL THEN '✅' ELSE '❌' END as status
FROM portal_users pu;
```

## Login Credentials

After setup, login with:

| Department (Amharic) | Password |
|---------------------|----------|
| ንግድ ጽ/ቤት | Trade2025! |
| ሲቪል ምዝገባ | Civil2025! |
| ስራና ክህሎት | Labor2025! |
| ዋና ሥራ አስፈፃሚ ጽ/ቤት | CEO2025! |
| አስተዳደር | Admin2025! |

⚠️ **Change passwords in production!**









