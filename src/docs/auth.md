## Register

### POST /auth/register

```json
{
  "email": "student@example.com",
  "password": "secret123",
  "fullName": "Test Student",
  "role": "student"
}
```

## Login

### POST /auth/login

```json
{
  "email": "student@example.com",
  "password": "secret123"
}
```

## Refresh Token

### POST /auth/refresh-token

```json
{
  "refreshToken": "long_refresh_token_string"
}
```

## Logout (send refresh token in body or header)

### POST /auth/logout

```json
{
  "refreshToken": "..."
}
```

## Logout All (send current refresh token to exclude current session)

### POST /auth/logout-all

```json
{
  "refreshToken": "..."
}
```

## Forgot Password (sends OTP)

### POST /auth/forgot-password

```json
{
  "email": "student@example.com"
}
```

## Verify OTP

### POST /auth/verify-otp

```json
{
  "email": "student@example.com",
  "otp": "123456"
}
```

## Resend OTP

### POST /auth/resend-otp

```json
{
  "email": "student@example.com"
}
```

## Reset Password

### POST /auth/reset-password

```json
{
  "email": "student@example.com",
  "otp": "123456",
  "newPassword": "newpass123"
}
```

## Change Password (authenticated)

### POST /auth/change-password

```json
{
  "currentPassword": "secret123",
  "newPassword": "newpass123"
}
```

## Verify Email (GET)

### GET /auth/verify-email?token=hex_token



## Resend Verification Email

### POST /auth/resend-verification

```json
{
  "email": "student@example.com"
}
```

## Get User Profile

### GET /users/me


## Update Profile

### PUT /users/me

```json
{
  "fullName": "Updated Name",
  "bio": "I love learning",
  "avatar": "https://example.com/avatar.jpg"
}
```

## Delete Account

### DELETE /users/me

## List Active Sessions

### GET /auth/sessions

## Revoke a Specific Session

### DELETE /auth/sessions/123
