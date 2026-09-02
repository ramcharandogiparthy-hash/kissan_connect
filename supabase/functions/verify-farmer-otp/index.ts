// Supabase Edge Function: verify-farmer-otp
// Verifies 2Factor SMS OTP for Farmer authentication

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
    const { phone, otp, sessionId } = await req.json();

    if (!otp || otp.trim().length !== 6) {
      return new Response(
        JSON.stringify({ success: false, message: "Please enter the complete 6-digit OTP code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!sessionId) {
      return new Response(
        JSON.stringify({ success: false, message: "Session expired or invalid. Please request a new OTP." }),
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

    const cleanOtp = otp.trim().replace(/\D/g, "");

    // Official 2Factor VERIFY OTP SMS endpoint:
    // https://2factor.in/API/V1/{API_KEY}/SMS/VERIFY/{SESSION_ID}/{OTP_INPUT}
    const targetUrl = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${cleanOtp}`;

    const response = await fetch(targetUrl, { method: "GET" });
    const data = await response.json();

    if (data && data.Status === "Success" && data.Details === "OTP Matched") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "OTP verified successfully!",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const errorDetail = data?.Details || "Invalid OTP code.";
      let userFriendlyMessage = "Invalid OTP code. Please check and try again.";

      if (typeof errorDetail === "string") {
        if (errorDetail.toLowerCase().includes("mismatch")) {
          userFriendlyMessage = "Incorrect OTP entered. Please try again.";
        } else if (errorDetail.toLowerCase().includes("expired")) {
          userFriendlyMessage = "This OTP has expired. Please request a new OTP.";
        } else {
          userFriendlyMessage = errorDetail;
        }
      }

      return new Response(
        JSON.stringify({ success: false, message: userFriendlyMessage }),
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
