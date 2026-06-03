"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import DemoBanner from "./DemoBanner";

import TrialBanner from "./TrialBanner";
import PastDueBanner from "./PastDueBanner";
import CanceledOverlay from "./CanceledOverlay";

interface DashboardLayoutWrapperProps {
  usageCount: number;
  usageLimit: number;
  planName: string;
  projectCount: number;
  userState: string;
  trialEnd: string | null;
  children: React.ReactNode;
}

export default function DashboardLayoutWrapper({
  usageCount,
  usageLimit,
  planName,
  projectCount,
  userState,
  trialEnd,
  children,
}: DashboardLayoutWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load initial state from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
    setIsMounted(true);
  }, []);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("sidebar-collapsed", String(nextState));
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-surface)", color: "var(--color-fg)" }}>
      <Sidebar
        usageCount={usageCount}
        usageLimit={usageLimit}
        planName={planName}
        projectCount={projectCount}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
      />

      {/* Main content area — dynamic margin-left based on sidebar state */}
      <div 
        className="flex-1 min-h-screen flex flex-col relative transition-[margin-left] duration-300 ease-in-out"
        style={{ 
          marginLeft: isMounted ? (isCollapsed ? "72px" : "240px") : "240px" 
        }}
      >
        {userState === "demo" && <DemoBanner />}
        {userState === "trialing" && <TrialBanner trialEnd={trialEnd} />}
        {userState === "past_due" && <PastDueBanner />}
        {userState === "canceled" && <CanceledOverlay />}
        {children}
      </div>
    </div>
  );
}
