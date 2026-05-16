// src/components/home/CallToAction.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, AlertTriangle, Calendar } from 'lucide-react';

export default function CallToAction() {
  return (
    <section className="py-16 px-4 bg-muted">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-3">Get Involved Today</h2>
          <p className="text-muted-foreground">Your participation makes the difference. Choose how you want to contribute.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          <Link to="/volunteer">
            <div className="bg-primary text-primary-foreground rounded-2xl p-8 text-center">
              <Users className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-xl mb-2">Volunteer</h3>
              <p className="text-sm opacity-80">Join our grassroots team and help build a stronger constituency.</p>
            </div>
          </Link>
          <Link to="/issues">
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-primary" />
              <h3 className="font-heading font-bold text-xl text-foreground mb-2">Report Issue</h3>
              <p className="text-sm text-muted-foreground">Tell us about problems in your community. We'll champion your cause.</p>
            </div>
          </Link>
          <Link to="/events">
            <div className="bg-red-600 text-secondary-foreground rounded-2xl p-8 text-center">
              <Calendar className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-xl mb-2">Events</h3>
              <p className="text-sm opacity-80">Attend our campaign events and be part of the conversation.</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}