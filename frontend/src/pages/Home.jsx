// src/pages/Home.jsx

import React from 'react';
import HeroSection from '../components/home/HeroSection';
import PromisesSection from '../components/home/PromisesSection';
import StatsBar from '../components/home/StatsBar';
import CallToAction from '../components/home/CallToAction';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <StatsBar />
      <PromisesSection />
      <CallToAction />
    </div>
  );
}