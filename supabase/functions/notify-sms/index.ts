import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sms-secret",
};

type SmsEvent =
  | "complaint_created"
  | "complaint_status_changed"
  | "appointment_created"
  | "appointment_status_changed"
  | "appointment_rescheduled";

type SmsConfig = {
  webhookSecret: string;
  textbeeApiKey: string;
  textbeeDeviceId: string;
  publicSiteUrl: string;
};

const PORTAL = {
  am: "ወረዳ ዲጂታል ፖርታል",
  om: "Paanelii Tajaajila Dijitaalaa Aanaa",
  en: "Woreda Digital Portal",
};

const STATUS_LABELS: Record<string, { am: string; om: string; en: string }> = {
  Pending: { am: "በመጠባበቅ ላይ", om: "Eegaa jiru", en: "Pending" },
  "In Progress": { am: "በሂደት ላይ", om: "Adeemsa irratti", en: "In Progress" },
  Resolved: { am: "ተፈትቷል", om: "Furmaata argateera", en: "Resolved" },
  Escalated: { am: "ወደ ላይ ተላልፏል", om: "Gara olaanaatti ergameera", en: "Escalated" },
  Confirmed: { am: "በሂደት ላይ", om: "Mirkanaa'eera", en: "Confirmed" },
  Rescheduled: { am: "ቀኑ ተቀይሯል", om: "Irra deebi'ii qindeeffameera", en: "Rescheduled" },
  Completed: { am: "ተጠናቋል", om: "Xumurameera", en: "Completed" },
  Missed: { am: "ተቀርቷል", om: "Darbameera", en: "Missed" },
};

function citizenName(record: Record<string, unknown>, table: string): string {
  const raw = table === "complaints"
    ? record.complainant_name
    : record.citizen_name;
  const name = String(raw || "").trim();
  return name || "ደንበኛ";
}

function statusLabels(status: string) {
  return STATUS_LABELS[status] ?? { am: status, om: status, en: status };
}

/** Trilingual formal SMS (Style 3) — Amharic, Oromiffa, English */
function buildMessage(
  event: SmsEvent,
  record: Record<string, unknown>,
  table: string,
  siteUrl: string,
): string {
  const code = String(record.unique_code || "").toUpperCase();
  const base = siteUrl.replace(/\/$/, "");
  const name = citizenName(record, table);
  const trackUrl = table === "complaints"
    ? `${base}/complaints?code=${code}`
    : `${base}/appointments?code=${code}`;

  if (event === "complaint_created") {
    return [
      `ክቡር ${name}፣`,
      "",
      `ቅሬታዎ በ${PORTAL.am} በተሳካ ሁኔታ ተመዝግቧል።`,
      "",
      "የመከታተያ ኮድዎ፦",
      code,
      "",
      "ሁኔታውን ለመከታተል ይሄንን ድረ-ገጽ ይጎብኙ፦",
      trackUrl,
      "",
      "---",
      `Kabajamaa ${name},`,
      "",
      `Komii keessan ${PORTAL.om} irratti milkaa'inaan galmaa'ameera.`,
      "",
      "Koodii hordofaa keessanii:",
      code,
      "",
      "Haala isaa ilaaluuf as tuqaa:",
      trackUrl,
      "",
      "---",
      `Dear ${name},`,
      "",
      `Your complaint was successfully registered on the ${PORTAL.en}.`,
      "",
      "Your tracking code:",
      code,
      "",
      "To follow your status, visit:",
      trackUrl,
    ].join("\n");
  }

  if (event === "complaint_status_changed") {
    const s = statusLabels(String(record.status || ""));
    return [
      `ክቡር ${name}፣`,
      "",
      `የቅሬታዎ ሁኔታ ተዘምኗል። አሁን፦ ${s.am}`,
      "",
      "የመከታተያ ኮድዎ፦",
      code,
      "",
      "ሁኔታውን ለመከታተል ይሄንን ድረ-ገጽ ይጎብኙ፦",
      trackUrl,
      "",
      "---",
      `Kabajamaa ${name},`,
      "",
      `Haalli komii keessanii jijjiirameera. Amma: ${s.om}`,
      "",
      "Koodii hordofaa keessanii:",
      code,
      "",
      "Haala isaa ilaaluuf as tuqaa:",
      trackUrl,
      "",
      "---",
      `Dear ${name},`,
      "",
      `Your complaint status has been updated. Now: ${s.en}`,
      "",
      "Your tracking code:",
      code,
      "",
      "To follow your status, visit:",
      trackUrl,
    ].join("\n");
  }

  if (event === "appointment_created") {
    return [
      `ክቡር ${name}፣`,
      "",
      `ቀጠሮዎ በ${PORTAL.am} በተሳካ ሁኔታ ተመዝግቧል።`,
      "",
      "የመከታተያ ኮድዎ፦",
      code,
      "",
      "ቀጠሮዎን ለመከታተል ይሄንን ድረ-ገጽ ይጎብኙ፦",
      trackUrl,
      "",
      "---",
      `Kabajamaa ${name},`,
      "",
      `Beellamni keessan ${PORTAL.om} irratti milkaa'inaan qabameera.`,
      "",
      "Koodii hordofaa keessanii:",
      code,
      "",
      "Beellama keessan ilaaluuf as tuqaa:",
      trackUrl,
      "",
      "---",
      `Dear ${name},`,
      "",
      `Your appointment was successfully booked on the ${PORTAL.en}.`,
      "",
      "Your tracking code:",
      code,
      "",
      "To follow your appointment, visit:",
      trackUrl,
    ].join("\n");
  }

  if (event === "appointment_rescheduled") {
    return [
      `ክቡር ${name}፣`,
      "",
      `ቀጠሮዎ ቀኑ ተቀይሯል። እባክዎ አዲሱን ቀን በ${PORTAL.am} ይመልከቱ።`,
      "",
      "የመከታተያ ኮድዎ፦",
      code,
      "",
      "ዝርዝር ለመመልከት ይሄንን ድረ-ገጽ ይጎብኙ፦",
      trackUrl,
      "",
      "---",
      `Kabajamaa ${name},`,
      "",
      `Guyyaan beellama keessanii jijjiirameera. ${PORTAL.om} irratti ilaalaa.`,
      "",
      "Koodii hordofaa keessanii:",
      code,
      "",
      "Bal'inaaf as tuqaa:",
      trackUrl,
      "",
      "---",
      `Dear ${name},`,
      "",
      `Your appointment date has changed. Please check the ${PORTAL.en}.`,
      "",
      "Your tracking code:",
      code,
      "",
      "For details, visit:",
      trackUrl,
    ].join("\n");
  }

  const s = statusLabels(String(record.status || ""));
  return [
    `ክቡር ${name}፣`,
    "",
    `የቀጠሮዎ ሁኔታ ተዘምኗል። አሁን፦ ${s.am}`,
    "",
    "የመከታተያ ኮድዎ፦",
    code,
    "",
    "ቀጠሮዎን ለመከታተል ይሄንን ድረ-ገጽ ይጎብኙ፦",
    trackUrl,
    "",
    "---",
    `Kabajamaa ${name},`,
    "",
    `Haalli beellama keessanii jijjiirameera. Amma: ${s.om}`,
    "",
    "Koodii hordofaa keessanii:",
    code,
    "",
    "Beellama keessan ilaaluuf as tuqaa:",
    trackUrl,
    "",
    "---",
    `Dear ${name},`,
    "",
    `Your appointment status has been updated. Now: ${s.en}`,
    "",
    "Your tracking code:",
    code,
    "",
    "To follow your appointment, visit:",
    trackUrl,
  ].join("\n");
}

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (/^09\d{8}$/.test(digits)) return `+251${digits.slice(1)}`;
  if (/^251\d{9}$/.test(digits)) return `+${digits}`;
  return null;
}

async function loadSmsConfig(supabaseAdmin: ReturnType<typeof createClient>): Promise<SmsConfig> {
  const envConfig: SmsConfig = {
    webhookSecret: Deno.env.get("SMS_WEBHOOK_SECRET") || "",
    textbeeApiKey: Deno.env.get("TEXTBEE_API_KEY") || "",
    textbeeDeviceId: Deno.env.get("TEXTBEE_DEVICE_ID") || "",
    publicSiteUrl: Deno.env.get("PUBLIC_SITE_URL") || "",
  };

  if (envConfig.webhookSecret && envConfig.textbeeApiKey && envConfig.textbeeDeviceId) {
    return {
      ...envConfig,
      publicSiteUrl: envConfig.publicSiteUrl || "https://woreda-portal.vercel.app",
    };
  }

  const { data, error } = await supabaseAdmin.rpc("get_sms_config_internal");
  if (error || !data) {
    throw new Error("SMS config not found. Set Edge Function secrets or private.sms_settings.");
  }

  const row = data as Record<string, string>;
  return {
    webhookSecret: envConfig.webhookSecret || row.webhook_secret || "",
    textbeeApiKey: envConfig.textbeeApiKey || row.textbee_api_key || "",
    textbeeDeviceId: envConfig.textbeeDeviceId || row.textbee_device_id || "",
    publicSiteUrl: envConfig.publicSiteUrl || row.public_site_url || "https://woreda-portal.vercel.app",
  };
}

async function sendTextBee(config: SmsConfig, recipient: string, message: string) {
  if (!config.textbeeApiKey || !config.textbeeDeviceId) {
    throw new Error("TextBee credentials not configured");
  }

  const res = await fetch(
    `https://api.textbee.dev/api/v1/gateway/devices/${config.textbeeDeviceId}/send-sms`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.textbeeApiKey,
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

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const config = await loadSmsConfig(supabaseAdmin);
    const incomingSecret = req.headers.get("x-sms-secret");

    if (!config.webhookSecret || incomingSecret !== config.webhookSecret) {
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

    const message = buildMessage(event, record, table, config.publicSiteUrl);

    try {
      const providerResponse = await sendTextBee(config, phone, message);
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
