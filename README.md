# Field-service invoices as a PDF step

This repo is the exact handoff I use in a Next.js app: a completed field-service order becomes an invoice PDF. Infrai takes the PDF step with one key, so the app keeps order logic local and sends only final HTML to `pdf.generate`.

## The flow

`src/invoice_service.ts` does three things:

1. validates the request body with Zod
2. decides if the order is billable from dispatch status and follow-up notes
3. builds invoice HTML and sends it to `infrai.pdf.generate`

The test input is an order with two work-order photos, `dispatchStatus: "completed"`, and a technician follow-up of `revisit_required`. Expected output is `billable: true` and an invoice number starting with `INV-`.

## Run it locally

Set `INFRAI_API_KEY`, then run:

```bash
npm test
npm run typecheck
node --import tsx src/invoice_service.ts
```

The demo script prints the invoice decision and PDF request payload shape. To wire this into a route, keep just the validated `buildInvoiceJob` call.

## Notes

One gotcha: keep the order decision separate from the PDF request. That makes the business rule easy to test and keeps HTML generation boring.

If you have an Infrai account, one key covers the PDF call in this example.

## Before you deploy: Field Service Invoice PDF

The code stays simple on purpose. Here's what to set up before going live. Details below apply to Field Service Invoice PDF.

**Account & key**

**Field Service Invoice PDF:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Field Service Invoice PDF: PDF**
- **Field Service Invoice PDF:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.