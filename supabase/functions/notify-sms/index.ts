import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sms-secret",
};

type Lang = "am" | "en" | "om";
type SmsEvent =
  | "complaint_created"
  | "complaint_status_changed"
  | "appointment_created"
  | "appointment_status_changed";

const STATUS_LABELS: Record<string, Record<Lang, string>> = {
  Pending: { am: "በመጠባበቅ ላይ", en: "Pending", om: "Eegaa jiru" },
  "In Progress": { am: "በሂደት ላይ", en: "In Progress", om: "Adeemsa irratti" },
  Resolved: { am: "ተፈትቷል", en: "Resolved", om: "Furmaata argateera" },
  Escalated: { am: "ወደ ላይ ተላልፏል", en: "Escalated", om: "Gara olaanaatti ergameera" },
  Confirmed: { am: "በሂደት ላይ", en: "Confirmed", om: "Mirkanaa'eera" },
  Rescheduled: { am: "ቀኑ ተቀይሯል", en: "Rescheduled", om: "Irra deebi'ii qindeeffameera" },
  Completed: { am: "ተጠናቋል", en: "Completed", om: "Xumurameera" },
  Missed: { am: "ተቀርቷል", en: "Missed", om: "Darbameera" },
};

function pickLang(value: unknown): Lang {
  if (value === "en" || value === "om" || value === "am") return value;
  return "am";
}

function statusLabel(status: string, lang: Lang): string {
  return STATUS_LABELS[status]?.[lang] ?? status;
}

function siteUrl(): string {
  return (Deno.env.get("PUBLIC_SITE_URL") || "https://woreda-portal.vercel.app").replace(/\/$/, "");
}

function buildMessage(event: SmsEvent, record: Record<string, unknown>, lang: Lang): string {
  const code = String(record.unique_code || "");
  const base = siteUrl();

  if (event === "complaint_created") {
    const ticket = String(record.ticket_number || "");
    const url = `${base}/complaints?code=${code}`;
    if (lang === "en") {
      return `Complaint received. Ticket ${ticket}. Code ${code}. Track: ${url}`;
    }
    if (lang === "om") {
      return `Komii galmaa'ame. Tikkeettii ${ticket}. Koodii ${code}. Hordofaa: ${url}`;
    }
    return `ቅሬታዎ ተመዝግቧል። ትኬት ${ticket}። ኮድ ${code}። ተከታተል: ${url}`;
  }

  if (event === "complaint_status_changed") {
    const status = statusLabel(String(record.status || ""), lang);
    const url = `${base}/complaints?code=${code}`;
    if (lang === "en") {
      return `Complaint update: ${status}. Code ${code}. Track: ${url}`;
    }
    if (lang === "om") {
      return `Haaromsa komii: ${status}. Koodii ${code}. Hordofaa: ${url}`;
    }
    return `የቅሬታ ሁኔታ: ${status}። ኮድ ${code}። ተከታተል: ${url}`;
  }

  if (event === "appointment_created") {
    const url = `${base}/appointments?code=${code}`;
    if (lang === "en") {
      return `Appointment booked. Code ${code}. Track: ${url}`;
    }
    if (lang === "om") {
      return `Beellamni qabame. Koodii ${code}. Hordofaa: ${url}`;
    }
    return `ቀጠሮዎ ተመዝግቧል። ኮድ ${code}። ተከታተል: ${url}`;
  }

  const status = statusLabel(String(record.status || ""), lang);
  const url = `${base}/appointments?code=${code}`;
  if (lang === "en") {
    return `Appointment update: ${status}. Code ${code}. Track: ${url}`;
  }
  if (lang === "om") {
    return `Haaromsa beellamaa: ${status}. Koodii ${code}. Hordofaa: ${url}`;
  }
  return `የቀጠሮ ሁኔታ: ${status}። ኮድ ${code}። ተከታተል: ${url}`;
}

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (/^09\d{8}$/.test(digits)) return `+251${digits.slice(1)}`;
  if (/^251\d{9}$/.test(digits)) return `+${digits}`;
  return null;
}

async function sendTextBee(recipient: string, message: string) {
  const apiKey = Deno.env.get("TEXTBEE_API_KEY");
  const deviceId = Deno.env.get("TEXTBEE_DEVICE_ID");
  if (!apiKey || !deviceId) {
    throw new Error("TextBee credentials not configured");
  }

  const res = await fetch(
    `https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/send-sms`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ recipients: [recipient], message }),
    },
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`TextBee error ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function logSms(
  supabaseAdmin: ReturnType<typeof createClient>,
  row: {
    event_type: string;
    table_name: string;
    record_id: string;
    phone: string;
    message: string;
    status: string;
    error_message?: string;
    provider_response?: unknown;
  },
) {
  await supabaseAdmin.from("sms_log").insert([row]);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get("SMS_WEBHOOK_SECRET");
    const incomingSecret = req.headers.get("x-sms-secret");
    if (!webhookSecret || incomingSecret !== webhookSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const event = body.event as SmsEvent;
    const table = body.table as string;
    const record = body.record as Record<string, unknown>;
    const oldRecord = body.old_record as Record<string, unknown> | undefined;

    if (!event || !table || !record?.id) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (event.endsWith("_status_changed") && oldRecord?.status === record.status) {
      return new Response(JSON.stringify({ skipped: true, reason: "status unchanged" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const phoneRaw = table === "complaints"
      ? String(record.complainant_phone || "")
      : String(record.citizen_phone || "");

    const phone = normalizePhone(phoneRaw);
    if (!phone) {
      return new Response(JSON.stringify({ error: "Invalid phone number" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lang = pickLang(record.preferred_lang);
    const message = buildMessage(event, record, lang);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    try {
      const providerResponse = await sendTextBee(phone, message);
      await logSms(supabaseAdmin, {
        event_type: event,
        table_name: table,
        record_id: String(record.id),
        phone,
        message,
        status: "sent",
        provider_response: providerResponse,
      });
      return new Response(JSON.stringify({ ok: true, phone, event }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (sendError) {
      const errMsg = sendError instanceof Error ? sendError.message : String(sendError);
      await logSms(supabaseAdmin, {
        event_type: event,
        table_name: table,
        record_id: String(record.id),
        phone,
        message,
        status: "failed",
        error_message: errMsg,
      });
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
