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

  const collapseSidebar = () => {
    setIsCollapsed(true);
    localStorage.setItem("sidebar-collapsed", "true");
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
        collapseSidebar={collapseSidebar}
      />

      {/* Main content area — stretches behind sidebar with dynamic padding */}
      <div 
        className="flex-1 min-h-screen flex flex-col relative dashboard-main-content transition-[padding-left] duration-300 ease-in-out"
        style={{ 
          paddingLeft: isMounted ? (isCollapsed ? "104px" : "272px") : "272px",
          "--sidebar-offset": isMounted ? (isCollapsed ? "104px" : "272px") : "272px"
        } as React.CSSProperties}
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
