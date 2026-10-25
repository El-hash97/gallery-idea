import { redirect } from "next/navigation";
import { getSessionAdminId } from "@/lib/auth";
import AdminNav, { LogoutButton } from "./nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminId = await getSessionAdminId();
  if (!adminId) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <AdminNav />
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
