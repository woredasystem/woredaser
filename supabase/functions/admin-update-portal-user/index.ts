import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control, pragma, expires",
};

async function requireAdmin(authHeader: string) {
  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
  if (userError || !user) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: adminRow } = await supabaseAdmin
    .from("portal_users")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();

  if (!adminRow?.is_admin) {
    return { error: "Forbidden: admin only", status: 403 as const };
  }

  return { supabaseAdmin, user };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = await requireAdmin(authHeader);
    if ("error" in auth) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { supabaseAdmin } = auth;
    const body = await req.json();
    const {
      portalUserId,
      email,
      password,
      username,
      fullName,
      department,
      departmentAm,
      roleKey,
      isAdmin,
    } = body;

    if (!portalUserId) {
      return new Response(JSON.stringify({ error: "portalUserId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("portal_users")
      .select("*")
      .eq("id", portalUserId)
      .single();

    if (fetchError || !existing) {
      return new Response(JSON.stringify({ error: "Portal user not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updates: Record<string, unknown> = {};
    if (email) updates.email = email;
    if (username) updates.username = username;
    if (fullName) updates.full_name = fullName;
    if (department) updates.department = department;
    if (departmentAm !== undefined) updates.department_am = departmentAm;
    if (roleKey) updates.role_key = roleKey;
    if (isAdmin !== undefined) updates.is_admin = !!isAdmin;

    const { data: portalUser, error: updateError } = await supabaseAdmin
      .from("portal_users")
      .update(updates)
      .eq("id", portalUserId)
      .select()
      .single();

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (existing.user_id) {
      const authUpdates: { email?: string; password?: string; user_metadata?: Record<string, unknown> } = {};
      if (email) authUpdates.email = email;
      if (password) {
        if (password.length < 8) {
          return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        authUpdates.password = password;
      }
      if (department || departmentAm || roleKey) {
        authUpdates.user_metadata = {
          department: department || existing.department,
          department_am: departmentAm ?? existing.department_am,
          role_key: roleKey || existing.role_key,
        };
      }

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
          existing.user_id,
          authUpdates,
        );
        if (authError) {
          return new Response(JSON.stringify({ error: authError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, portalUser }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
