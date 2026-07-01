# Fix Department Mismatch Error

## Problem
Getting "Department mismatch" error when logging in as Chief Executive.

## Root Cause
The `portal_users` table has the wrong department value. It should be `'Chief Executive'` but might be `'Chief Executive Office'`.

## Quick Fix

Run this SQL in Supabase SQL Editor:

```sql
-- Fix Chief Executive department
UPDATE portal_users 
SET department = 'Chief Executive'
WHERE email = 'chief.executive@woreda.gov.et';

-- Verify it's correct
SELECT email, department, department_am, role_key 
FROM portal_users 
WHERE email = 'chief.executive@woreda.gov.et';
```

Expected result:
- `email`: `chief.executive@woreda.gov.et`
- `department`: `Chief Executive` (NOT "Chief Executive Office")
- `department_am`: `ዋና ሥራ አስፈፃሚ`
- `role_key`: `ceo`

## Verify All Departments

Run this to check all departments are correct:

```sql
SELECT 
  email,
  department,
  department_am,
  role_key,
  CASE 
    WHEN email = 'chief.executive@woreda.gov.et' AND department = 'Chief Executive' THEN '✅'
    WHEN email = 'ceo@woreda.gov.et' AND department = 'Chief Executive Office' THEN '✅'
    WHEN email = 'trade@woreda.gov.et' AND department = 'Trade Office' THEN '✅'
    WHEN email = 'civil@woreda.gov.et' AND department = 'Civil Registration' THEN '✅'
    WHEN email = 'labor@woreda.gov.et' AND department = 'Labor & Skills' THEN '✅'
    WHEN email = 'council.speaker@woreda.gov.et' AND department = 'Woreda Council' THEN '✅'
    WHEN email = 'admin@woreda.gov.et' AND department = 'Admin' THEN '✅'
    ELSE '❌'
  END as status
FROM portal_users
ORDER BY department;
```

All should show ✅.

## Correct Department Values

| Email | Department | Department (Amharic) |
|-------|------------|---------------------|
| `trade@woreda.gov.et` | `Trade Office` | `ንግድ ጽ/ቤት` |
| `civil@woreda.gov.et` | `Civil Registration` | `ሲቪል ምዝገባ` |
| `labor@woreda.gov.et` | `Labor & Skills` | `ስራና ክህሎት` |
| `ceo@woreda.gov.et` | `Chief Executive Office` | `ዋና ሥራ አስፈፃሚ ጽ/ቤት` |
| `chief.executive@woreda.gov.et` | `Chief Executive` | `ዋና ሥራ አስፈፃሚ` |
| `council.speaker@woreda.gov.et` | `Woreda Council` | `ወረዳ ምክር ቤት` |
| `admin@woreda.gov.et` | `Admin` | `አስተዳደር` |

## After Fixing

Try logging in again with:
- **Department (Amharic)**: `ዋና ሥራ አስፈፃሚ`
- **Password**: `Chief2025!`

The login should work now!









