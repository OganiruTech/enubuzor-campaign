// src/components/home/PromisesSection.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, Building2, GraduationCap, HeartPulse, Shield, Eye
} from 'lucide-react';

const promises = [
  {
    icon: Megaphone,
    title: 'Quality Representation',
    description: 'Our voice that carries your feedback back to the assembly. Every community will be heard.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Building2,
    title: 'Infrastructure Development',
    description: 'Building roads, bridges, and facilities that connect our communities and drive economic growth.',
    color: 'bg-secondary/20 text-secondary-foreground',
  },
  {
    icon: GraduationCap,
    title: 'Education & Youth Development',
    description: 'Empowering our youth with quality education, skills training, and opportunities for the future.',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: HeartPulse,
    title: 'Healthcare for All',
    description: 'Accessible and affordable healthcare services in every ward and community.',
    color: 'bg-red-100 text-red-700',
  },
  {
    icon: Shield,
    title: 'Security & Peace',
    description: 'Ensuring the safety and security of all residents through community-driven initiatives.',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    icon: Eye,
    title: 'Transparency & Accountability',
    description: 'Open governance with regular reports on projects, spending, and legislative activities.',
    color: 'bg-amber-100 text-amber-700',
  },
];

export default function PromisesSection() {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Our Promise to You</p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Together We Build a Stronger Future
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            <strong className="font-semibold">Ogbuefi Nicholas Enubuzor</strong> is committed to representing the people of Ukwuani/Ndokwa West 
            with integrity, passion, and a clear vision for progress.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {promises.map((promise, index) => {
            const Icon = promise.icon;
            return (
              <motion.div
                key={promise.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${promise.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{promise.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{promise.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}