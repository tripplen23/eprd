"use client";

import ThemeToggleButton from "@/components/ThemeToggleButton";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeToggleButton />
      {children}
    </>
  );
}
