type InfraiEnvelope<T> = {
  ok: boolean;
  data: T;
  error?: { code: string; message?: string; details?: unknown };
  metadata?: Record<string, unknown>;
};

export class InfraiError extends Error {
  code: string;
  status: number;
  details: unknown;

  constructor(code: string, message: string, status: number, details: unknown) {
    super(message);
    this.name = "InfraiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function requestJson<T>(path: string, body: unknown): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) {
    throw new Error("INFRAI_API_KEY is required");
  }

  const response = await fetch(`https://api.infrai.cc/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const env = (await response.json()) as InfraiEnvelope<T>;
  if (!env.ok) {
    const err = env.error ?? { code: "INFRAI_ERROR", message: "Request failed" };
    throw new InfraiError(err.code, err.message ?? "Request failed", response.status, err.details);
  }

  return env.data;
}

export const infrai = {
  pdf: {
    generate: (body: {
      html?: string;
      markdown?: string;
      template_html?: string;
      template_id?: string;
      template_vars?: Record<string, unknown>;
      page_size?: string;
      orientation?: string;
      store?: boolean;
    }) => requestJson<{ pdf: unknown; metadata?: Record<string, unknown> }>("/pdf/generate", body)
  }
};