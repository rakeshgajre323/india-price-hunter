import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — QuickCompare India" },
      { name: "description", content: "Log in to QuickCompare with your phone number and a one-time OTP." },
    ],
  }),
  component: LoginPage,
});

function normalizePhone(p: string) {
  const digits = p.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  return `+${digits}`;
}

function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizePhone(phone),
      options: { shouldCreateUser: false },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOtpSent(true);
    toast.success("OTP sent to your phone");
  };

  const verifyOtp = async () => {
    if (otp.length < 4) {
      toast.error("Enter the OTP you received");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: normalizePhone(phone),
      token: otp,
      type: "sms",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl items-center px-4 py-10">
      <div className="grid w-full gap-8 rounded-3xl border border-border bg-card p-6 shadow-sm md:grid-cols-2 md:p-10">
        {/* Left: pitch */}
        <div className="hidden flex-col justify-between rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 p-8 md:flex">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> OTP-secured login
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              Welcome back to QuickCompare
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Log in to sync your basket, price alerts and saved pincodes across
              devices.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            No password to remember. Just your phone + a 6-digit code.
          </div>
        </div>

        {/* Right: form — phone + OTP side by side on md+ */}
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-bold tracking-tight">Log in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We'll text you a one-time code.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            {/* Phone */}
            <div className="md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Mobile number
              </label>
              <div className="mt-1.5 flex items-center rounded-xl border border-border bg-background focus-within:border-primary">
                <span className="flex items-center gap-1 border-r border-border px-3 py-2.5 text-sm font-medium text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="98XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                />
              </div>
            </div>

            {/* OTP */}
            <div className="md:col-span-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                OTP
              </label>
              <div className="mt-1.5 flex items-center rounded-xl border border-border bg-background focus-within:border-primary">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={otp}
                  disabled={!otpSent}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-transparent px-3 py-2.5 text-sm tracking-[0.4em] outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="border-l border-border px-3 py-2.5 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-50"
                >
                  {otpSent ? "Resend" : "Send OTP"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={verifyOtp}
              disabled={!otpSent || loading}
              className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Log in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            New to QuickCompare?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
            By continuing you agree to our terms and confirm you're 18+. SMS rates
            from your carrier may apply.
          </div>
        </div>
      </div>
    </div>
  );
}