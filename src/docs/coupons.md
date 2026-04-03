## Create a coupon (admin only)

### POST /api/coupons

```json
{
  "code": "SAVE20",
  "type": "percentage",
  "value": 20,
  "courseId": 1,
  "maxUses": 100,
  "validFrom": "2025-04-01T00:00:00Z",
  "validUntil": "2025-05-01T00:00:00Z",
  "isActive": true
}
```

For a global (course-agnostic) coupon:

```json
{
  "code": "FLAT10",
  "type": "fixed",
  "value": 10.0,
  "courseId": null,
  "maxUses": 50,
  "validFrom": "2025-04-01T00:00:00Z",
  "validUntil": "2025-05-01T00:00:00Z"
}
```

## Update a coupon

### PATCH /api/coupons/1

```json
{
  "maxUses": 150,
  "isActive": false
}
```

## Get all coupons with filters

### GET /api/coupons?page=1&limit=10&isActive=true&sortBy=validUntil&sortOrder=asc

## Get coupon by ID

### GET /api/coupons/1

## Get coupon by code (any authenticated user)

### GET /api/coupons/code/SAVE20

## Validate a coupon (public)

### GET /api/coupons/validate?code=SAVE20&courseId=1

Response (valid):

```json
{
  "valid": true,
  "coupon": { ... }
}
```

Response (invalid):

```json
{
  "valid": false,
  "message": "Coupon has expired"
}
```

## Delete a coupon

### DELETE /api/coupons/1
