"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "@/components/ui/use-toast";
import { CircleDashed, Eye, EyeOff } from "lucide-react";
import {
  useGoogleReCaptcha,
  GoogleReCaptchaProvider,
} from "react-google-recaptcha-v3";
import { getStaffByEmail } from "@/components/dashboard/staff/services/staffCrud";

// This is the inner component that uses the reCAPTCHA hook.
const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [captchaToken, setCaptchaToken] = useState("");
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [code, setCode] = useState("");
  const [redirectPath, setRedirectPath] = useState("/dashboard");

  // Load brand logo and get redirect parameter
  useEffect(() => {
    if (typeof window !== "undefined") {

      // Get redirect from URL if present
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get("redirect");
      if (redirect) {
        setRedirectPath(redirect);
      }
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executeRecaptcha) {
      console.error("Execute recaptcha not yet available");
      return;
    }

    // Get the token and then update state
    const token = await executeRecaptcha("login");
    setCaptchaToken(token);

    startTransition(async () => {
      const staff = await getStaffByEmail(email);
      if (staff && staff.twoFactorEnabled && !code) {
        setStep("2fa");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        captcha: token,
        twoFaCode: code,
      });
      if (result?.error) {
        console.error("Error signing in:", result.error);
        setError(result.error);
      } else {
        toast({
          title: "Success",
          description: "You have successfully logged in",
          variant: "default",
        });
        router.push(redirectPath);
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-secondary to-accent px-4 md:px-0">
      {step === "credentials" ? (
        <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg">
          <div className="flex flex-col items-center mb-6">
            <Image
              src={"/logo.png"}
              height={60}
              width={60}
              alt="LML Logo"
              className="rounded-md"
            />
            <h1 className="text-2xl font-bold mt-4 mb-2 text-gray-800 rounded-full">
              Sign In
            </h1>
          </div>
          {error && (
            <p className="text-red-500 text-center text-sm mb-4">{error}</p>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full"
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pr-10"
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="text-secondary" size={15} />
                ) : (
                  <Eye className="text-secondary" size={15} />
                )}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-secondary hover:bg-secondary/80 text-white font-bold"
            >
              {isPending ? (
                <CircleDashed className="animate-spin transition-all" />
              ) : (
                "Login"
              )}
            </Button>
          </form>
          {/* <div className="flex justify-center mt-6">
            <span className="mr-2 text-sm">Don't have an account?</span>
            <span
              onClick={() => router.push("/auth/signup")}
              className="text-secondary text-sm font-bold cursor-pointer"
            >
              Create an account
            </span>
          </div>
          <div className="flex items-center flex-col mt-2">
            <div className="flex items-center gap-1">
              <p className="text-gray-600 text-sm">Forgot your password?</p>
              <span
                onClick={() => router.push("/auth/forgot-password")}
                className="text-secondary text-sm font-bold cursor-pointer hover:text-secondary/80"
              >
                Reset Password
              </span>
            </div>
          </div> */}
        </div>
      ) : (
        <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg">
          <div className="flex flex-col items-center mb-6">
            <Image
              src={"/logo.png"}
              height={60}
              width={60}
              alt="LML Logo"
              className="rounded-md"
            />
            <h1 className="text-2xl font-bold mt-4 mb-2 text-gray-800 rounded-full">
              Enter 2FA Code
            </h1>
          </div>
          <form onSubmit={onSubmit}>
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button
              type="submit"
              className="w-full bg-secondary hover:bg-secondary/80 text-white font-semibold mt-4"
            >
              {isPending ? (
                <CircleDashed className="animate-spin transition-all" />
              ) : (
                "Verify"
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

// The outer component wraps LoginForm with the GoogleReCaptchaProvider.
const LoginPageClient = () => {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
    >
      <LoginForm />
    </GoogleReCaptchaProvider>
  );
};

export default LoginPageClient; 