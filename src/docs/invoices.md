## Create invoice (admin)

### POST /api/invoices

```json
{
  "invoiceNumber": "INV-2025-001",
  "userId": 2,
  "enrollmentId": 5,
  "couponId": 1,
  "subtotal": 49.99,
  "discount": 9.99,
  "total": 40.0,
  "status": "pending",
  "issuedAt": "2025-04-01T10:00:00Z"
}
```

## Get my invoices (student)

### GET /api/invoices/me?page=1&limit=10&status=pending

## Get all invoices (admin)

### GET /api/invoices?page=1&limit=20&userId=2&status=paid

## Get invoice by ID (with items)

### GET /api/invoices/1

## Mark invoice as paid (admin)

### PATCH /api/invoices/1/mark-paid (no body)

## Update invoice (admin)

### PATCH /api/invoices/1

```json
{
  "status": "refunded",
  "paidAt": null
}
```

## Delete invoice (admin)

### DELETE /api/invoices/1

## Create invoice item (admin)

### POST /api/invoice-items

```json
{
  "invoiceId": 1,
  "courseName": "Mastering Node.js",
  "quantity": 1,
  "unitPrice": 49.99,
  "total": 49.99
}
```

## Get items by invoice

### GET /api/invoice-items?invoiceId=1&page=1&limit=20

## Update invoice item (admin)

### PATCH /api/invoice-items/1

```json
{
  "quantity": 2,
  "total": 99.98
}
```

## Delete invoice item (admin)

### DELETE /api/invoice-items/1

multiple payments with installments

### Create an Invoice (Admin)

1. Create an Invoice (Admin)
   ## POST /api/invoices

```json
{
  "invoiceNumber": "INV-2025-INST-001",
  "userId": 2,
  "enrollmentId": 5,
  "subtotal": 1000.0,
  "discount": 0,
  "total": 1000.0,
  "status": "pending",
  "issuedAt": "2025-04-01T10:00:00Z"
}
```

Expected Response (201 Created)

```json
{
  "id": 101,
  "invoiceNumber": "INV-2025-INST-001",
  "userId": 2,
  "enrollmentId": 5,
  "subtotal": "1000.00",
  "discount": "0",
  "total": "1000.00",
  "status": "pending",
  "issuedAt": "2025-04-01T10:00:00.000Z",
  "paidAt": null,
  "createdAt": "2025-04-01T10:00:01.000Z",
  "updatedAt": "2025-04-01T10:00:01.000Z"
}
```

2. First Installment (Payment 1)
   ## POST /api/payments

```json
{
  "invoiceId": 101,
  "amount": 250.0,
  "paymentMethod": "sslcommerz",
  "transactionId": "TXN-INST-001",
  "receiptNumber": "RCT-INST-001",
  "status": "completed",
  "paidAt": "2025-04-01T10:05:00Z",
  "installmentNumber": 1,
  "note": "First installment"
}
```

Expected Response (201 Created)

```json
{
  "id": 1001,
  "invoiceId": 101,
  "amount": "250.00",
  "paymentMethod": "sslcommerz",
  "transactionId": "TXN-INST-001",
  "gatewayResponse": null,
  "receiptNumber": "RCT-INST-001",
  "status": "completed",
  "paidAt": "2025-04-01T10:05:00.000Z",
  "installmentNumber": 1,
  "note": "First installment",
  "createdAt": "2025-04-01T10:05:01.000Z",
  "updatedAt": "2025-04-01T10:05:01.000Z"
}
```

Invoice status remains pending (total paid = 250 < 1000).

3. Second Installment (Payment 2)
   ## POST /api/payments

```json
{
  "invoiceId": 101,
  "amount": 250.0,
  "paymentMethod": "stripe",
  "transactionId": "TXN-INST-002",
  "receiptNumber": "RCT-INST-002",
  "status": "completed",
  "paidAt": "2025-04-08T14:20:00Z",
  "installmentNumber": 2,
  "note": "Second installment"
}
```

Expected Response (201 Created)

```json
{
  "id": 1002,
  "invoiceId": 101,
  "amount": "250.00",
  "paymentMethod": "stripe",
  "transactionId": "TXN-INST-002",
  "gatewayResponse": null,
  "receiptNumber": "RCT-INST-002",
  "status": "completed",
  "paidAt": "2025-04-08T14:20:00.000Z",
  "installmentNumber": 2,
  "note": "Second installment",
  "createdAt": "2025-04-08T14:20:01.000Z",
  "updatedAt": "2025-04-08T14:20:01.000Z"
}
```

Invoice status: still pending (total paid = 500).

4. Third Installment (Payment 3)
   ## POST /api/payments

```json
{
  "invoiceId": 101,
  "amount": 250.0,
  "paymentMethod": "paypal",
  "transactionId": "TXN-INST-003",
  "receiptNumber": "RCT-INST-003",
  "status": "completed",
  "paidAt": "2025-04-15T09:45:00Z",
  "installmentNumber": 3,
  "note": "Third installment"
}
```

Expected Response (201 Created)

```json
{
  "id": 1003,
  "invoiceId": 101,
  "amount": "250.00",
  "paymentMethod": "paypal",
  "transactionId": "TXN-INST-003",
  "gatewayResponse": null,
  "receiptNumber": "RCT-INST-003",
  "status": "completed",
  "paidAt": "2025-04-15T09:45:00.000Z",
  "installmentNumber": 3,
  "note": "Third installment",
  "createdAt": "2025-04-15T09:45:01.000Z",
  "updatedAt": "2025-04-15T09:45:01.000Z"
}
```

Invoice status: still pending (total paid = 750).

5. Fourth Installment (Payment 4) – Final Payment
   ## POST /api/payments

```json
{
  "invoiceId": 101,
  "amount": 250.0,
  "paymentMethod": "cash",
  "transactionId": null,
  "receiptNumber": "RCT-INST-004",
  "status": "completed",
  "paidAt": "2025-04-22T11:30:00Z",
  "installmentNumber": 4,
  "note": "Final installment (cash)"
}
```

Expected Response (201 Created)

```json
{
  "id": 1004,
  "invoiceId": 101,
  "amount": "250.00",
  "paymentMethod": "cash",
  "transactionId": null,
  "gatewayResponse": null,
  "receiptNumber": "RCT-INST-004",
  "status": "completed",
  "paidAt": "2025-04-22T11:30:00.000Z",
  "installmentNumber": 4,
  "note": "Final installment (cash)",
  "createdAt": "2025-04-22T11:30:01.000Z",
  "updatedAt": "2025-04-22T11:30:01.000Z"
}
```

6. Verify Invoice Status (after final payment)
   ## GET /api/invoices/101

Expected Response (200 OK)

```json
{
  "id": 101,
  "invoiceNumber": "INV-2025-INST-001",
  "userId": 2,
  "enrollmentId": 5,
  "subtotal": "1000.00",
  "discount": "0",
  "total": "1000.00",
  "status": "paid",
  "issuedAt": "2025-04-01T10:00:00.000Z",
  "paidAt": "2025-04-22T11:30:01.000Z",
  "createdAt": "2025-04-01T10:00:01.000Z",
  "updatedAt": "2025-04-22T11:30:01.000Z"
}
```

Notice:

status changed to paid

paidAt is set to the timestamp of the last payment.

7. List All Payments for the Invoice
   ## GET /api/payments/invoice/101

Expected Response (200 OK)

```json
[
  {
    "id": 1001,
    "invoiceId": 101,
    "amount": "250.00",
    "paymentMethod": "sslcommerz",
    "transactionId": "TXN-INST-001",
    "receiptNumber": "RCT-INST-001",
    "status": "completed",
    "paidAt": "2025-04-01T10:05:00.000Z",
    "installmentNumber": 1,
    "note": "First installment",
    "createdAt": "2025-04-01T10:05:01.000Z",
    "updatedAt": "2025-04-01T10:05:01.000Z"
  },
  {
    "id": 1002,
    "invoiceId": 101,
    "amount": "250.00",
    "paymentMethod": "stripe",
    "transactionId": "TXN-INST-002",
    "receiptNumber": "RCT-INST-002",
    "status": "completed",
    "paidAt": "2025-04-08T14:20:00.000Z",
    "installmentNumber": 2,
    "note": "Second installment",
    "createdAt": "2025-04-08T14:20:01.000Z",
    "updatedAt": "2025-04-08T14:20:01.000Z"
  },
  {
    "id": 1003,
    "invoiceId": 101,
    "amount": "250.00",
    "paymentMethod": "paypal",
    "transactionId": "TXN-INST-003",
    "receiptNumber": "RCT-INST-003",
    "status": "completed",
    "paidAt": "2025-04-15T09:45:00.000Z",
    "installmentNumber": 3,
    "note": "Third installment",
    "createdAt": "2025-04-15T09:45:01.000Z",
    "updatedAt": "2025-04-15T09:45:01.000Z"
  },
  {
    "id": 1004,
    "invoiceId": 101,
    "amount": "250.00",
    "paymentMethod": "cash",
    "transactionId": null,
    "receiptNumber": "RCT-INST-004",
    "status": "completed",
    "paidAt": "2025-04-22T11:30:00.000Z",
    "installmentNumber": 4,
    "note": "Final installment (cash)",
    "createdAt": "2025-04-22T11:30:01.000Z",
    "updatedAt": "2025-04-22T11:30:01.000Z"
  }
]
```
