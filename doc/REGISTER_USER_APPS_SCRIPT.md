# registerUser Action Checklist (Google Apps Script)

## 1) users sheet columns
Create/confirm these columns in order:
- id
- email
- full_name
- phone
- password_hash
- auth_provider
- provider_user_id
- status
- created_at
- updated_at

## 2) Required behavior
- Reject if `email` already exists.
- Hash password before saving (`password_hash`), never store plain password.
- Default values:
  - `auth_provider`: `password`
  - `status`: `active`
  - `provider_user_id`: empty
- Return shape:
  - `{ success: true, data: { id, email, full_name, phone, ... } }`
  - `{ success: false, data: null, error: "..." }`

## 3) Frontend payload
Register page sends:
- `action=registerUser`
- `full_name`
- `email`
- `phone`
- `password`
- `auth_provider=password`

## 4) Minimal Apps Script pseudo handler
```javascript
if (action === "registerUser") {
  const email = String(params.email || "").trim().toLowerCase();
  const fullName = String(params.full_name || "").trim();
  const phone = String(params.phone || "").trim();
  const password = String(params.password || "");
  const authProvider = String(params.auth_provider || "password");

  // validate inputs
  // check duplicate email
  // hash password -> password_hash
  // append row to users
  // return ApiResponse
}
```
