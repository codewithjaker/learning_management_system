## Create a payout (admin only)

### POST /api/payouts

```json
{
  "instructorId": 5,
  "amount": 1250.5,
  "periodStart": "2025-03-01T00:00:00Z",
  "periodEnd": "2025-03-31T23:59:59Z",
  "paymentMethod": "bank_transfer",
  "transactionId": "BANKTXN123",
  "notes": "March 2025 earnings",
  "status": "paid",
  "paidAt": "2025-04-05T10:00:00Z"
}
```

For a pending payout (no paidAt needed):

```json
{
  "instructorId": 5,
  "amount": 750.25,
  "periodStart": "2025-04-01T00:00:00Z",
  "periodEnd": "2025-04-30T23:59:59Z",
  "paymentMethod": "paypal",
  "status": "pending"
}
```

## Get my payouts (instructor)

### GET /api/payouts/me

## Get my total earnings (instructor)

### GET /api/payouts/me/total

Response:

```json
{
  "total": 2000.75
}
```

## Get payouts by instructor (admin or that instructor)

### GET /api/payouts/instructor/5

## Get total earnings for an instructor (admin or that instructor)

### GET /api/payouts/instructor/5/total

## Get all payouts with filters (admin only)

### GET /api/payouts?page=1&limit=10&status=paid&fromDate=2025-03-01T00:00:00Z

## Get payout by ID (admin or owner instructor)

### GET /api/payouts/1

## Update a payout (admin only)

### PATCH /api/payouts/1

```json
{
  "status": "paid",
  "transactionId": "NEWTXN456",
  "paidAt": "2025-04-06T09:30:00Z"
}
```

## Delete a payout (admin only)

### DELETE /api/payouts/1
