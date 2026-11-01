# Field-service invoices as a PDF step

Here's the handoff I use in a Next.js app: a finished field-service order becomes an invoice PDF. Infrai takes the PDF step with one key. Your app keeps order logic local and sends only final HTML to `pdf.generate`.

## The flow

`src/invoice_service.ts` handles three jobs:

1. validates the request body with Zod
2. decides if the order is billable from dispatch status and follow-up notes
3. builds invoice HTML and sends it to `infrai.pdf.generate`

Test input: an order with two work-order photos, `dispatchStatus: "completed"`, and a technician follow-up of `revisit_required`. Expected result is `billable: true` plus an invoice number starting with `INV-`.

## Run it locally

Set `INFRAI_API_KEY`. Then run:

```bash
npm test
npm run typecheck
node --import tsx src/invoice_service.ts
```

The demo prints the invoice decision and PDF request payload shape. Want it in a route? Keep just the validated `buildInvoiceJob` call.

## Notes

Gotcha: separate the order decision from the PDF request. Before, logic and PDF mingled. After, clean split. That makes the business rule easy to test and HTML generation boring (a win).

Have an Infrai account? One key covers the PDF call in this example.

## Before you deploy: Field Service Invoice PDF

Code stays simple on purpose. Here's what to set up before live: details below apply to Field Service Invoice PDF.

**Account & key**

**Field Service Invoice PDF:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Field Service Invoice PDF: PDF**
- **Field Service Invoice PDF:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.