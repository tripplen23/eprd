import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="relative flex-1 overflow-auto bg-background p-4">
        {children}
      </main>
    </div>
  );
}