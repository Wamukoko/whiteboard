import Link from "next/link";
import { Brand } from "@/components/brand";
import { SignupForm } from "@/components/signup-form";

export const metadata = {
  title: "Create your account",
  description:
    "Create a WhiteBoard family account and start learning across CBC and Cambridge curricula.",
};

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-unit-8">
      <div className="flex justify-center">
        <Brand size="lg" href="/" />
      </div>
      <div className="rounded-xl bg-surface-container-lowest shadow-card p-unit-8 flex flex-col gap-unit-6">
        <div className="flex flex-col gap-unit-2 text-center">
          <h1 className="font-display text-headline-lg text-on-surface">
            Start your family&apos;s learning journal
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            One account for every child, on every curriculum.
          </p>
        </div>
        <SignupForm />
      </div>
      <p className="text-center text-body-sm text-on-surface-variant">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}