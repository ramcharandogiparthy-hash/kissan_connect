// Supabase Edge Function: send-farmer-otp
// Integrates with official 2Factor SMS OTP API for Farmer authentication

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TWOFACTOR_API_KEY = Deno.env.get("TWOFACTOR_API_KEY") || Deno.env.get("VITE_2FACTOR_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, message: "Mobile number is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean phone number to 10 digits
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10);

    if (formattedPhone.length !== 10 || !/^[6-9]\d{9}$/.test(formattedPhone)) {
      return new Response(
        JSON.stringify({ success: false, message: "Please enter a valid 10-digit Indian mobile number." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = TWOFACTOR_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "2Factor API key is not configured on the server. Please set TWOFACTOR_API_KEY in secrets.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Official 2Factor AUTOGEN OTP SMS endpoint:
    // https://2factor.in/API/V1/{API_KEY}/SMS/{PHONE_NUMBER}/AUTOGEN
    const targetUrl = `https://2factor.in/API/V1/${apiKey}/SMS/${formattedPhone}/AUTOGEN`;

    const response = await fetch(targetUrl, { method: "GET" });
    const data = await response.json();

    if (data && data.Status === "Success") {
      // Return success and 2Factor session ID (Do NOT return the OTP code!)
      return new Response(
        JSON.stringify({
          success: true,
          sessionId: data.Details,
          message: `OTP sent successfully to +91 ${formattedPhone.slice(0, 2)}*****${formattedPhone.slice(7)}`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const errorMsg = data?.Details || "Failed to send SMS OTP via 2Factor.";
      return new Response(
        JSON.stringify({ success: false, message: errorMsg }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, message: error?.message || "Internal server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
