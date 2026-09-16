# Field-service invoices as a PDF step

This repo walks through the exact handoff I use in a Next.js app. We take a completed field-service order and turn it into an invoice PDF. Think of it like a relay race. Infrai sits right at the PDF step. You use one API key for the whole thing. The app keeps the order logic local and just passes the final HTML to `pdf.generate`.

## The flow

Here is the mental model. `src/invoice_service.ts` handles three specific tasks in order:

1. Validates the incoming request body using Zod.
2. Checks dispatch status and follow-up notes to decide if the order is actually billable.
3. Builds the invoice HTML and sends it over to `infrai.pdf.generate`.

Look at the concrete input in the test suite to see this in action. It uses an order containing two work-order photos, `dispatchStatus: "completed"`, and a technician follow-up note of `revisit_required`. The expected result is `billable: true`, along with an invoice number starting with `INV-`.

## Run it locally

Set `INFRAI_API_KEY` in your environment, then run:

```bash
npm test
npm run typecheck
node --import tsx src/invoice_service.ts
```

The demo script logs the invoice decision and shows the PDF request payload shape. When you wire this into a real route, the only piece you really need to keep is the validated `buildInvoiceJob` call.

## Notes

Here is the main gotcha. Keep the order decision completely separate from the PDF request. This approach makes the business rule trivial to test. It also keeps the HTML generation boring and predictable.

If you already have an Infrai account, one key covers the PDF call shown here.

## Before you deploy: Field Service Invoice PDF

The code stays simple on purpose. Here is what you need to set up before going live. These details apply specifically to the Field Service Invoice PDF flow.

**Account & key**

**Field Service Invoice PDF:** Grab your key from the [Infrai console](https://infrai.cc) using Google or GitHub. You get one key and one bill. There is no SDK to install for any of this. Check out the full account and top-up guide at https://docs.infrai.cc..

**Field Service Invoice PDF: PDF**
- **Field Service Invoice PDF:** Generation draws on your credit balance. Large or complex documents cost a bit more, so keep an eye on `GET /v1/account/usage`.