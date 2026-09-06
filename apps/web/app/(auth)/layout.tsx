export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh grid place-items-center bg-surface px-margin-mobile md:px-margin-tablet py-unit-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}