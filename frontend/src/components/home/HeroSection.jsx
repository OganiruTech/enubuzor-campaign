// src/components/home/HeroSection.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Vote } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1604933762023-7213af7ff7e7?w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-transparent to-primary/30" />

      {/* Decorative blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Vote className="h-4 w-4 text-secondary" />
              <span className="text-secondary text-sm font-medium text-white">National Democratic Congress (NDC)</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Service to<br />
              <span className="text-secondary">the People.</span>
            </h1>

            <p className="text-white/80 text-lg mb-3 max-w-lg">
              Vote <strong className="text-white">Ogbuefi Nicholas Enubuzor</strong> for House of Representatives,
              Ukwuani/Ndokwa West Constituency.
            </p>
            <p className="text-white/60 text-base mb-8 max-w-lg">
              Together, we can build a stronger, prosperous future. Your decision today secures our tomorrow.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/volunteer">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-base px-8 gap-2">
                  <Users className="h-5 w-5" />
                  Join the Movement
                </Button>
              </Link>
              <Link to="/issues">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold gap-2">
                  Report an Issue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative">
              <div className="w-80 h-80 rounded-full bg-gradient-to-br from-secondary/30 to-primary/50 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="font-heading text-3xl font-bold">VOTE</p>
                    <p className="font-heading text-xl font-semibold text-secondary">NDC</p>
                    <div className="w-12 h-0.5 bg-secondary mx-auto my-2" />
                    <p className="text-xs opacity-70">Ukwuani/Ndokwa West</p>
                    <p className="text-xs opacity-50 mt-1">Service to the People</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground rounded-full px-4 py-2 font-bold text-sm shadow-lg">
                2027
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}