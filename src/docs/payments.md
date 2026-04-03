## Create a payment (admin only)

### POST /api/payments

```json
{
  "invoiceId": 1,
  "amount": 49.99,
  "paymentMethod": "sslcommerz",
  "transactionId": "SSL123456789",
  "gatewayResponse": "{\"status\":\"success\",\"bank_txn\":\"TXN123\"}",
  "receiptNumber": "RCT-2025-001",
  "status": "completed",
  "paidAt": "2025-04-10T14:30:00Z",
  "note": "Full payment"
}
```

## Get all payments (admin only)

### GET /api/payments?page=1&limit=10&status=completed&fromDate=2025-04-01T00:00:00Z

## Get payments by invoice (owner of invoice or admin)

### GET /api/payments/invoice/1

## Get payment by ID (owner of invoice or admin)

### GET /api/payments/5

## Update a payment (admin only)

### PATCH /api/payments/5

```json
{
  "status": "refunded",
  "note": "Refunded due to technical issue"
}
```

## Complete a payment (admin/webhook)

### PATCH /api/payments/5/complete

```json
{
  "transactionId": "SSL987654321",
  "receiptNumber": "RCT-2025-002"
}
```

## Delete a payment (admin only)

### DELETE /api/payments/5
