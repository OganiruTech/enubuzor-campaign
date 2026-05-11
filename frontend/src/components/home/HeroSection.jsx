import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Vote } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[75vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('/enubuzor.jpeg')] bg-cover bg-center opacity-30" />
      <div className="absolute inset-0 bg-slate-950/80" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 bg-white/10 text-white text-sm font-medium">
              <Vote className="h-4 w-4 text-white" />
              National Democratic Congress (NDC)
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Service to the People.
            </h1>

            <p className="text-white text-lg mb-3 max-w-lg">
              Vote <strong className="font-heading text-white font-bold">Ogbuefi Nicholas Enubuzor</strong> for House of Representatives,
              Ukwuani/Ndokwa West Constituency.
            </p>
            <p className="text-white/70 text-base mb-8 max-w-lg">
              Together, we can build a stronger, prosperous future for everyone in our community.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/volunteer">
                <Button size="lg" className="bg-white text-slate-900 font-bold text-base px-8">
                  Join the Movement
                </Button>
              </Link>
              <Link to="/issues">
                <Button size="lg" variant="outline" className="border-white text-white font-semibold px-8">
                  Report an Issue
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="overflow-hidden rounded-3xl border border-white/10">
                <img
                  src="/enubuzor.jpeg"
                  alt="Ogbuefi Nicholas Enubuzor"
                  className="h-[26rem] w-full object-cover object-top"
                />
              </div>
              <div className="absolute bottom-0 left-4 right-4 rounded-3xl bg-slate-950/95 border border-white/10 p-4 text-white">
                <p className="text-sm opacity-80 mt-1">NDC Candidate • Ukwuani/Ndokwa West</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
