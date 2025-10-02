import Sidebar from "@/components/app/Sidebar";
import type React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout w-screen h-screen flex overflow-hidden">
      <Sidebar />
      <main className="main-content flex-1 h-screen overflow-auto">{children}</main>
    </div>
  );
}
