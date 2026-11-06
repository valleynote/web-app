import { requireSession } from "@/lib/session";

export default async function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();
  return (
    <div className="min-h-[100dvh] bg-[#f7f5f2] font-switzer text-ink">
      {children}
    </div>
  );
}
