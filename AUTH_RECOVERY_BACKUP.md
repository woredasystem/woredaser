# Authentication System Recovery Backup

**Created:** $(date)
**Purpose:** Recovery point before auth system improvements

## Current State Backup

### Files Modified
- `src/utils/auth.js`
- `src/lib/supabase.js`
- `src/App.jsx`
- `src/components/PortalLogin.jsx`

### Database Schema Backup

Run this SQL to restore the current state if needed:

```sql
-- This is a backup of the current auth system state
-- Run supabase-auth-migration.sql first, then this if recovery is needed

-- Verify portal_users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'portal_users'
);

-- Verify check_portal_user_access function exists
SELECT EXISTS (
  SELECT FROM pg_proc 
  WHERE proname = 'check_portal_user_access'
);

-- Check current RLS policies
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

### Recovery Steps

1. **If code changes break auth:**
   ```bash
   git checkout src/utils/auth.js
   git checkout src/lib/supabase.js
   git checkout src/App.jsx
   git checkout src/components/PortalLogin.jsx
   ```

2. **If database changes break auth:**
   - Run `supabase-auth-migration.sql` again
   - Verify portal_users table exists
   - Verify RLS policies are correct

3. **If session issues occur:**
   - Clear browser localStorage: `localStorage.clear()`
   - Clear browser sessionStorage: `sessionStorage.clear()`
   - Refresh page

4. **If users can't login:**
   - Verify portal_users table has correct data
   - Verify auth.users exist in Supabase Auth dashboard
   - Check that user_id is linked: `SELECT * FROM portal_users WHERE user_id IS NULL;`

## Current Auth Flow

1. User enters department name (Amharic) or email
2. System maps to email using `departmentToEmailMap`
3. Supabase Auth authenticates with email/password
4. System queries `portal_users` by `user_id` (preferred) or email (fallback)
5. Session stored in localStorage
6. Auth state changes trigger navigation

## Known Issues (Before Improvements)

1. No session caching - every check queries database
2. Multiple concurrent auth checks can cause race conditions
3. Token refresh not explicitly handled
4. No retry logic for failed auth operations
5. Session restoration can be slow on page load
6. No offline detection/handling

## Test Credentials (DO NOT COMMIT)

- Trade Office: `ንግድ ጽ/ቤት` / password
- Admin: `አስተዳደር` / password
- Email: `admin@woreda.gov.et` / password




