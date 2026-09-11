import { z } from "zod";

export const workOrderSchema = z.object({
  orderId: z.string().min(1),
  customerName: z.string().min(1),
  serviceAddress: z.string().min(1),
  technicianName: z.string().min(1),
  dispatchStatus: z.enum(["scheduled", "en_route", "completed"]),
  followUp: z.enum(["none", "parts_needed", "revisit_required"]),
  photos: z.array(
    z.object({
      label: z.string().min(1),
      caption: z.string().min(1),
      takenAt: z.string().min(1)
    })
  ).min(1).readonly(),
  lineItems: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPriceCents: z.number().int().nonnegative()
    })
  ).min(1).readonly()
});

export type WorkOrder = z.infer<typeof workOrderSchema>;

export function decideBillable(order: WorkOrder) {
  const billable = order.dispatchStatus === "completed" && order.followUp !== "parts_needed";
  return {
    billable,
    followUpAction:
      order.followUp === "revisit_required"
        ? "schedule technician follow-up"
        : order.followUp === "parts_needed"
          ? "hold invoice until parts arrive"
          : "close order"
  };
}

export function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function buildInvoiceHtml(order: WorkOrder) {
  const decision = decideBillable(order);
  const subtotal = order.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0);
  const photoRows = order.photos
    .map((photo) => `<li><strong>${photo.label}</strong>: ${photo.caption} <small>${photo.takenAt}</small></li>`)
    .join("");
  const itemRows = order.lineItems
    .map(
      (item) =>
        `<tr><td>${item.description}</td><td>${item.quantity}</td><td>${formatMoney(item.unitPriceCents)}</td><td>${formatMoney(item.quantity * item.unitPriceCents)}</td></tr>`
    )
    .join("");

  return {
    decision,
    subtotal,
    invoiceNumber: `INV-${order.orderId}`,
    html: `<!doctype html>
<html>
  <body>
    <h1>Invoice ${`INV-${order.orderId}`}</h1>
    <p>Customer: ${order.customerName}</p>
    <p>Address: ${order.serviceAddress}</p>
    <p>Technician: ${order.technicianName}</p>
    <p>Dispatch status: ${order.dispatchStatus}</p>
    <p>Follow-up: ${decision.followUpAction}</p>
    <h2>Photos</h2>
    <ul>${photoRows}</ul>
    <h2>Line items</h2>
    <table>
      <thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <p>Subtotal: ${formatMoney(subtotal)}</p>
    <p>Status: ${decision.billable ? "Ready to bill" : "Hold"}</p>
  </body>
</html>`
  };
}

export const invoiceRequestSchema = z.object({
  requestId: z.string().min(1),
  order: workOrderSchema
});

export type InvoiceRequest = z.infer<typeof invoiceRequestSchema>;
