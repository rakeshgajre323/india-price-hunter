import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Phone, ShieldCheck, ArrowRight, Loader2, User, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — QuickCompare India" },
      { name: "description", content: "Create your QuickCompare account in seconds with phone + OTP." },
    ],
  }),
  component: SignupPage,
});

const detailsSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone: z.string().regex(/^\d{10}$/, "Enter a 10-digit mobile number"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
});

function normalizePhone(p: string) {
  return `+91${p.replace(/\D/g, "")}`;
}

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [otp, setOtp] = useState("");

  const sendOtp = async () => {
    const parsed = detailsSchema.safeParse({ fullName, email, phone, pincode });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the form");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizePhone(phone),
      options: {
        shouldCreateUser: true,
        data: {
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          pincode: pincode.trim(),
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setStep("otp");
    toast.success(`OTP sent to +91 ${phone}`);
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
    toast.success("Account created — welcome!");
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl items-center px-4 py-10">
      <div className="grid w-full gap-8 rounded-3xl border border-border bg-card p-6 shadow-sm md:grid-cols-2 md:p-10">
        {/* Left pitch */}
        <div className="hidden flex-col justify-between rounded-2xl bg-gradient-to-br from-accent/15 via-primary/5 to-primary/10 p-8 md:flex">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Free forever
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              Save on every grocery order
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Create an account to save your delivery pincode, track basket prices
              across 6 apps and get free price-drop alerts.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-foreground/80">
              <li>· Price alerts on staples like Atta &amp; Milk</li>
              <li>· Multi-app basket optimizer</li>
              <li>· Pincode-aware live ETAs</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">
            Already a member?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>

        {/* Right form */}
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Takes less than 30 seconds. Phone + OTP — no password.
          </p>

          {step === "details" ? (
            <div className="mt-6 grid gap-4">
              <Field icon={<User className="h-3.5 w-3.5" />} label="Full name">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Priya Sharma"
                  className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                />
              </Field>
              <Field icon={<Mail className="h-3.5 w-3.5" />} label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field icon={<Phone className="h-3.5 w-3.5" />} label="Mobile (+91)">
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="98XXXXXXXX"
                    className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                  />
                </Field>
                <Field icon={<MapPin className="h-3.5 w-3.5" />} label="Delivery pincode">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    placeholder="560001"
                    className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                  />
                </Field>
              </div>

              <button
                type="button"
                onClick={sendOtp}
                disabled={loading}
                className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<>Send OTP <ArrowRight className="h-4 w-4" /></>)}
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              <div className="rounded-xl border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
                Code sent to <span className="font-semibold text-foreground">+91 {phone}</span>.{" "}
                <button onClick={() => setStep("details")} className="text-primary hover:underline">
                  Edit
                </button>
              </div>
              <Field icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Enter OTP">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit code"
                  className="w-full bg-transparent px-3 py-2.5 text-sm tracking-[0.4em] outline-none"
                />
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="border-l border-border px-3 py-2.5 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-50"
                >
                  Resend
                </button>
              </Field>
              <button
                type="button"
                onClick={verifyOtp}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<>Verify &amp; create account <ArrowRight className="h-4 w-4" /></>)}
              </button>
            </div>
          )}

          <div className="mt-6 text-sm text-muted-foreground md:hidden">
            Already a member?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
            By creating an account you agree to our terms and privacy policy. We
            never share your number with the listed quick-commerce apps.
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <div className="mt-1.5 flex items-center rounded-xl border border-border bg-background focus-within:border-primary">
        <span className="flex items-center gap-1 border-r border-border px-3 py-2.5 text-muted-foreground">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}