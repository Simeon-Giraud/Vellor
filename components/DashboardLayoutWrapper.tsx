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
  hasSeenWelcome: boolean;
  children: React.ReactNode;
}

export default function DashboardLayoutWrapper({
  usageCount,
  usageLimit,
  planName,
  projectCount,
  userState,
  trialEnd,
  hasSeenWelcome,
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
      className="h-screen flex overflow-hidden" 
      style={{ 
        background: "#000000", 
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

      {/* Main content area — aligned next to the docked sidebar with dynamic margin & rounded left corners */}
      <div 
        className="flex-1 h-screen flex flex-col relative dashboard-main-content transition-[margin-left,border-radius] duration-300 ease-in-out"
        style={{ 
          marginLeft: "var(--sidebar-width)",
          "--sidebar-offset": "var(--sidebar-width)",
          background: "var(--color-surface)",
          borderTopLeftRadius: "24px",
          borderBottomLeftRadius: "24px",
          overflowY: "auto",
          overflowX: "hidden",
          boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.08)"
        } as React.CSSProperties}
      >
        {userState === "demo" && hasSeenWelcome && <DemoBanner />}
        {userState === "past_due" && hasSeenWelcome && <PastDueBanner />}
        {userState === "canceled" && hasSeenWelcome && <CanceledOverlay />}
        {children}
        {/* Bottom spacer to prevent content from touching the bottom edge of the screen */}
        {hasSeenWelcome && <div className="h-16 shrink-0 w-full" />}
      </div>
    </div>
  );
}
