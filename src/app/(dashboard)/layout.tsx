import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-background">
        <OfflineBanner />
        <DashboardNav />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
      <InstallPrompt />
    </SessionProvider>
  );
}
