import React from 'react';
import { Outlet } from 'react-router-dom';
import GlassSidebar from './GlassSidebar';
import GlassNavbar from './GlassNavbar';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function GlassLayout() {
  usePageTitle();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="glass-bg" />

      {/* Floating Sidebar */}
      <GlassSidebar />

      {/* Main Content Area */}
      <div className="md:pl-[304px] transition-all duration-300">
        {/* Floating Navbar */}
        <GlassNavbar />

        {/* Page Content */}
        <div className="p-6 md:p-8 glass-page">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
