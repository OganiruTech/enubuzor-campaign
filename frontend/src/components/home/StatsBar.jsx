// src/components/home/StatsBar.jsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function StatsBar() {
  const { data: volunteers = [] } = useQuery({
    queryKey: ['stats-volunteers'],
    queryFn:  () => api.entities.Volunteer.list(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: issues = [] } = useQuery({
    queryKey: ['stats-issues'],
    queryFn:  () => api.entities.CommunityIssue.list(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: events = [] } = useQuery({
    queryKey: ['stats-events'],
    queryFn:  () => api.entities.CampaignEvent.list(),
    staleTime: 5 * 60 * 1000,
  });

  const stats = [
    { label: 'Volunteers',      value: volunteers.length || 0 },
    { label: 'Issues Reported', value: issues.length     || 0 },
    { label: 'Campaign Events', value: events.length     || 0 },
    { label: 'Communities',     value: '15+' },
  ];

  return (
    <section className="bg-primary/5 border-y border-border py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <p className="font-heading text-3xl font-bold text-primary">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}