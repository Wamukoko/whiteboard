import Link from "next/link";
import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your WhiteBoard family account.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-unit-8">
      <div className="flex justify-center">
        <Brand size="lg" href="/" />
      </div>
      <div className="rounded-xl bg-surface-container-lowest shadow-card p-unit-8 flex flex-col gap-unit-6">
        <div className="flex flex-col gap-unit-2 text-center">
          <h1 className="font-display text-headline-lg text-on-surface">Welcome back</h1>
          <p className="text-body-sm text-on-surface-variant">
            Your family&apos;s learning board is ready.
          </p>
        </div>
        <LoginForm />
      </div>
      <p className="text-center text-body-sm text-on-surface-variant">
        New to WhiteBoard?{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}