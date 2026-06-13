"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import DemoBanner from "./DemoBanner";

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

  const expandSidebar = () => {
    setIsCollapsed(false);
    localStorage.setItem("sidebar-collapsed", "false");
  };

  return (
    <div 
      className="min-h-screen flex" 
      style={{ 
        background: "var(--color-surface)", 
        color: "var(--color-fg)",
        "--sidebar-width": isMounted ? (isCollapsed ? "72px" : "240px") : "240px"
      } as React.CSSProperties}
    >
      <Sidebar
        usageCount={usageCount}
        usageLimit={usageLimit}
        planName={planName}
        projectCount={projectCount}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        collapseSidebar={collapseSidebar}
        expandSidebar={expandSidebar}
        userState={userState}
        trialEnd={trialEnd}
      />

      {/* Main content area — aligned next to the docked sidebar with dynamic margin */}
      <div 
        className="flex-1 min-h-screen flex flex-col relative dashboard-main-content transition-[margin-left] duration-300 ease-in-out"
        style={{ 
          marginLeft: "var(--sidebar-width)",
          "--sidebar-offset": "var(--sidebar-width)"
        } as React.CSSProperties}
      >
        {userState === "demo" && <DemoBanner />}
        {userState === "past_due" && <PastDueBanner />}
        {userState === "canceled" && <CanceledOverlay />}
        {children}
      </div>
    </div>
  );
}
