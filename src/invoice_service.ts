import { infrai } from "./infrai_client.js";
import { buildInvoiceHtml, invoiceRequestSchema } from "./invoice_domain.js";

export async function buildInvoiceJob(input: unknown) {
  const parsed = invoiceRequestSchema.parse(input);
  const built = buildInvoiceHtml(parsed.order);
  const pdf = await infrai.pdf.generate({
    html: built.html,
    page_size: "A4",
    orientation: "portrait",
    store: true
  });

  return {
    requestId: parsed.requestId,
    invoiceNumber: built.invoiceNumber,
    billable: built.decision.billable,
    followUpAction: built.decision.followUpAction,
    subtotal: built.subtotal,
    pdf
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = {
    requestId: "req_1001",
    order: {
      orderId: "wo_1001",
      customerName: "Avery Chen",
      serviceAddress: "14 Maple St, Austin, TX",
      technicianName: "Nina Patel",
      dispatchStatus: "completed",
      followUp: "revisit_required",
      photos: [
        { label: "before", caption: "Leaking valve under sink", takenAt: "2025-01-18T14:12:00Z" },
        { label: "after", caption: "Replacement valve installed", takenAt: "2025-01-18T15:03:00Z" }
      ],
      lineItems: [
        { description: "Service call", quantity: 1, unitPriceCents: 12500 },
        { description: "Replacement valve", quantity: 1, unitPriceCents: 4800 }
      ]
    }
  };

  buildInvoiceJob(demo)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
