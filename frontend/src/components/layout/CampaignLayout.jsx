// src/components/layout/CampaignLayout.jsx

import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home, Users, Calendar, Megaphone, HandHeart, AlertTriangle,
  Menu, X, MessageCircle, BarChart3, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/',          label: 'Home',             icon: Home },
  { path: '/issues',    label: 'Community Issues', icon: AlertTriangle },
  { path: '/volunteer', label: 'Join Us',           icon: Users },
  { path: '/events',    label: 'Events',            icon: Calendar },
  { path: '/media',     label: 'News & Media',      icon: Megaphone },
  { path: '/donate',    label: 'Support',           icon: HandHeart },
  { path: '/chat',      label: 'Ask NDC Bot',       icon: MessageCircle },
];

const adminItems = [
  { path: '/admin', label: 'Dashboard', icon: BarChart3 },
];

export default function CampaignLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-primary-foreground hover:bg-primary/80"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shadow-sm">
                <span className="font-heading font-bold text-secondary-foreground text-sm">NDC</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-heading font-bold text-sm leading-tight">Ogbuefi Nicholas Enubuzor</p>
                <p className="text-[10px] opacity-80">NDC · Ukwuani/Ndokwa West</p>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === item.path
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link to="/volunteer">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold text-xs sm:text-sm shadow-sm">
              Join Campaign
            </Button>
          </Link>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar text-sidebar-foreground pt-20 p-4">
            <nav className="space-y-1">
              {[...navItems, ...adminItems].map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      location.pathname === item.path
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    <ChevronRight className="h-3 w-3 ml-auto opacity-50" />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4 mt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <span className="font-heading font-bold text-secondary-foreground text-xs">NDC</span>
              </div>
              <h3 className="font-heading font-bold text-lg">Ogbuefi Nicholas Enubuzor</h3>
            </div>
            <p className="text-sm opacity-80">NDC Candidate for House of Representatives, Ukwuani/Ndokwa West Constituency</p>
            <p className="text-sm opacity-60 mt-2 italic">Service to the People.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="space-y-2">
              {navItems.slice(0, 5).map(item => (
                <Link key={item.path} to={item.path} className="block text-sm opacity-70 hover:opacity-100 transition-opacity">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact Campaign</h4>
            <p className="text-sm opacity-70">Ukwuani/Ndokwa West, Delta State</p>
            <p className="text-sm opacity-70 mt-1">Nigeria</p>
            <div className="mt-4 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs hover:bg-secondary/80 cursor-pointer transition-colors">FB</div>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs hover:bg-secondary/80 cursor-pointer transition-colors">X</div>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs hover:bg-secondary/80 cursor-pointer transition-colors">IG</div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/20 text-center text-xs opacity-50">
          © 2026 Ogbuefi Nicholas Enubuzor Campaign. All rights reserved. Powered by NDC · Service to the People. <br></br> <br></br>Developed by{" "}
          <a
            href="https://oganiru.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
          >
            Oganiru Technologies Limited
          </a>
        </div>
      </footer>
    </div>
  );
}