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
  Confirmed: { am: "ተፈርሟል", om: "Mirkanaa'eera", en: "Confirmed" },
  Rescheduled: { am: "ቀኑ ተቀይሯል", om: "Irra deebi'ii qindeeffameera", en: "Rescheduled" },
  Completed: { am: "ተቀባይነት አግኝቷል", om: "Fudhatama argateera", en: "Approved" },
  Missed: { am: "ተቀባይነት አላገኘም", om: "Fudhatama hin arganne", en: "Not approved" },
};

type Trilingual = { am: string; om: string; en: string };

function citizenName(record: Record<string, unknown>, table: string): string {
  const raw = table === "complaints"
    ? record.complainant_name
    : record.citizen_name;
  const name = String(raw || "").trim();
  return name || "ደንበኛ";
}

function statusLabels(status: string): Trilingual {
  return STATUS_LABELS[status] ?? { am: status, om: status, en: status };
}

/** Distinct body text per complaint status (and outcome when resolved). */
function complaintStatusBody(record: Record<string, unknown>): Trilingual {
  const status = String(record.status || "");
  const outcome = String(record.summary_response || "");

  if (status === "Pending") {
    return {
      am: "ቅሬታዎ ተቀብሏል እና በመጠባበቅ ላይ ነው። በቅርቡ ይመለሳሉ።",
      om: "Komii keessan fudhatameera akkasumas eegaa jira. Yeroo gabaabaa keessatti deebi'u.",
      en: "Your complaint has been received and is pending review.",
    };
  }

  if (status === "In Progress") {
    return {
      am: "ቅሬታዎ አሁን በሂደት ላይ ነው። ባለሙያዎች ጉዳዩን እየተመለከቱት ነው።",
      om: "Komii keessan amma adeemsa irratti jira. Ogeeyyiin dhimma kana ilaalaa jiru.",
      en: "Your complaint is now in progress and being reviewed by our team.",
    };
  }

  if (status === "Resolved") {
    if (outcome === "correct") {
      return {
        am: "ቅሬታዎ ትክክል ነው ተብሎ ተገምጥሟል። ጉዳዩ ተፈትቷል።",
        om: "Komii keessan sirrii ta'uu isaa mirkanaa'ee furmaata argateera.",
        en: "Your complaint was upheld as valid. The case is now resolved.",
      };
    }
    if (outcome === "incorrect") {
      return {
        am: "ቅሬታዎ ትክክል አይደለም ተብሎ ተገምጥሟል። ጉዳዩ ተፈትቷል።",
        om: "Komii keessan sirrii miti jedhamee furmaata argateera.",
        en: "Your complaint was reviewed and not upheld. The case is now closed.",
      };
    }
    return {
      am: "ቅሬታዎ ተፈትቷል። ዝርዝር ለማየት ከታች ያለውን ሊንክ ይጠቀሙ።",
      om: "Komii keessan furmaata argateera. Bal'inaaf liinkii armaan gadii fayyadamaa.",
      en: "Your complaint has been resolved. Use the link below for details.",
    };
  }

  if (status === "Escalated") {
    return {
      am: "ቅሬታዎ ወደ ከፍተኛ አመራር ተላልፏል። በቅርቡ ተጨማሪ መልስ ይደርስዎታል።",
      om: "Komii keessan gara hogganoota olaanaatti ergameera. Deebii dabalataa yeroo gabaabaa keessatti ni argattu.",
      en: "Your complaint has been escalated to senior leadership for further action.",
    };
  }

  const label = statusLabels(status);
  return {
    am: `የቅሬታዎ ሁኔታ ተዘምኗል። አሁን፦ ${label.am}`,
    om: `Haalli komii keessanii jijjiirameera. Amma: ${label.om}`,
    en: `Your complaint status has changed. Now: ${label.en}`,
  };
}

/** Distinct body text per appointment status. */
function appointmentStatusBody(status: string): Trilingual {
  if (status === "Confirmed") {
    return {
      am: "ቀጠሮዎ ተፈርሟል። እባክዎ በተጠቀሰው ቀን እና ሰዓት ይገኙ።",
      om: "Beellamni keessan mirkanaa'eera. Maaloo guyyaa fi sa'aatii kenname irratti argadhaa.",
      en: "Your appointment is confirmed. Please arrive on the scheduled date and time.",
    };
  }

  if (status === "Rescheduled") {
    return {
      am: "ቀጠሮዎ ቀኑ ተቀይሯል። አዲሱን ቀን እና ሰዓት በፖርታል ይመልከቱ።",
      om: "Guyyaan beellama keessanii jijjiirameera. Guyyaa fi sa'aatii haaraa paaneelii irratti ilaalaa.",
      en: "Your appointment has been rescheduled. Please check the portal for the new date and time.",
    };
  }

  if (status === "Completed") {
    return {
      am: "ቀጠሮዎ ተቀባይነት አግኝቷል። አገልግሎቱ ተሳክቷል።",
      om: "Beellamni keessan fudhatama argateera. Tajaajilli milkaa'inaan xumurameera.",
      en: "Your appointment was approved and completed successfully.",
    };
  }

  if (status === "Missed") {
    return {
      am: "ቀጠሮዎ ተቀባይነት አላገኘም። ለተጨማሪ መረጃ ወይም አዲስ ቀጠሮ ፖርታሉን ይጠቀሙ።",
      om: "Beellamni keessan fudhatama hin arganne. Odeeffannoo dabalataa yookaan beellama haaraa paaneelii fayyadamaa.",
      en: "Your appointment was not approved. Contact us or book again through the portal.",
    };
  }

  const label = statusLabels(status);
  return {
    am: `የቀጠሮዎ ሁኔታ ተዘምኗል። አሁን፦ ${label.am}`,
    om: `Haalli beellama keessanii jijjiirameera. Amma: ${label.om}`,
    en: `Your appointment status has changed. Now: ${label.en}`,
  };
}

function formatTrilingualSms(
  name: string,
  body: Trilingual,
  code: string,
  trackUrl: string,
  trackHint: Trilingual,
): string {
  return [
    `ክቡር ${name}፣`,
    "",
    body.am,
    "",
    "የመከታተያ ኮድዎ፦",
    code,
    "",
    trackHint.am,
    trackUrl,
    "",
    "---",
    `Kabajamaa ${name},`,
    "",
    body.om,
    "",
    "Koodii hordofaa keessanii:",
    code,
    "",
    trackHint.om,
    trackUrl,
    "",
    "---",
    `Dear ${name},`,
    "",
    body.en,
    "",
    "Your tracking code:",
    code,
    "",
    trackHint.en,
    trackUrl,
  ].join("\n");
}

const COMPLAINT_TRACK_HINT: Trilingual = {
  am: "ሁኔታውን ለመከታተል ይሄንን ድረ-ገጽ ይጎብኙ፦",
  om: "Haala isaa ilaaluuf as tuqaa:",
  en: "To follow your status, visit:",
};

const APPOINTMENT_TRACK_HINT: Trilingual = {
  am: "ቀጠሮዎን ለመከታተል ይሄንን ድረ-ገጽ ይጎብኙ፦",
  om: "Beellama keessan ilaaluuf as tuqaa:",
  en: "To follow your appointment, visit:",
};

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
    return formatTrilingualSms(
      name,
      complaintStatusBody(record),
      code,
      trackUrl,
      COMPLAINT_TRACK_HINT,
    );
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
    return formatTrilingualSms(
      name,
      appointmentStatusBody("Rescheduled"),
      code,
      trackUrl,
      APPOINTMENT_TRACK_HINT,
    );
  }

  return formatTrilingualSms(
    name,
    appointmentStatusBody(String(record.status || "")),
    code,
    trackUrl,
    APPOINTMENT_TRACK_HINT,
  );
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

    if (
      event.endsWith("_status_changed")
      && oldRecord?.status === record.status
      && table === "appointments"
    ) {
      return new Response(JSON.stringify({ skipped: true, reason: "status unchanged" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (
      event === "complaint_status_changed"
      && oldRecord?.status === record.status
      && oldRecord?.summary_response === record.summary_response
    ) {
      return new Response(JSON.stringify({ skipped: true, reason: "complaint outcome unchanged" }), {
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
