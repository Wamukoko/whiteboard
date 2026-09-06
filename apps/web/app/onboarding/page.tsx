import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export const metadata: Metadata = {
  title: "Set up your family",
  description:
    "Name your family, add a child, and pick a curriculum to open your WhiteBoard dashboards.",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-dvh bg-surface px-margin-mobile md:px-margin-tablet lg:px-margin-desktop py-unit-12">
      <div className="mx-auto max-w-lg flex flex-col gap-unit-8">
        <div className="flex justify-center">
          <Brand size="lg" href="/parent" />
        </div>
        <OnboardingWizard />
        <p className="text-center text-body-sm text-on-surface-variant">
          Your data stays private to your family. You control every consent.
        </p>
      </div>
    </div>
  );
}