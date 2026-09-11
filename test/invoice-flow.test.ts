import test from "node:test";
import assert from "node:assert/strict";
import { buildInvoiceHtml, decideBillable } from "../src/invoice_domain.js";

const order = {
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
} as const;

test("completed work with revisit follow-up is billable and keeps the follow-up action visible", () => {
  const decision = decideBillable(order);
  assert.equal(decision.billable, true);
  assert.equal(decision.followUpAction, "schedule technician follow-up");

  const invoice = buildInvoiceHtml(order);
  assert.equal(invoice.invoiceNumber, "INV-wo_1001");
  assert.match(invoice.html, /Dispatch status: completed/);
  assert.match(invoice.html, /Follow-up: schedule technician follow-up/);
  assert.match(invoice.html, /Subtotal: \$173.00/);
});
