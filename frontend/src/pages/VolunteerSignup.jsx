// src/pages/VolunteerSignup.jsx

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CheckCircle2, Heart, Megaphone, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/lib/toast';

const roleTypes = [
  { value: 'volunteer',          label: 'General Volunteer',     icon: Heart,    desc: 'Help with general campaign activities' },
  { value: 'polling_unit_agent', label: 'Polling Unit Agent',    icon: Shield,   desc: 'Represent the party at your polling unit' },
  { value: 'ward_mobilizer',     label: 'Ward Mobilizer',        icon: Users,    desc: 'Mobilize voters in your ward' },
  { value: 'campaign_ambassador',label: 'Campaign Ambassador',   icon: Megaphone,desc: 'Spread the campaign message on social media' },
];

const wards = [
  'Obiaruku', 'Umukwata', 'Umuaja', 'Ebedei', 'Amai', 'Obinomba',
  'Umutu', 'Ekuku-Agbor', 'Onicha-Ugbo', 'Issele-Uku', 'Ogwashi-Uku',
  'Ubulu-Uku', 'Nsukwa', 'Emu', 'Idumuje',
];

const empty = {
  full_name: '', phone: '', email: '', ward: '', community: '',
  role_type: 'volunteer', occupation: '', age_group: '', skills: '',
};

export default function VolunteerSignup() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(empty);

  const mutation = useMutation({
    mutationFn: (data) => api.entities.Volunteer.create(data),
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Welcome to the movement!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Something went wrong. Please try again.');
    },
  });

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <CheckCircle2 className="h-20 w-20 mx-auto text-primary mb-6" />
        </motion.div>
        <h1 className="font-heading text-3xl font-bold text-foreground mb-4">Welcome to the Team!</h1>
        <p className="text-muted-foreground text-lg mb-2">
          Thank you for joining the movement. Together, we will build a stronger Ukwuani/Ndokwa West.
        </p>
        <p className="text-muted-foreground">A campaign coordinator will contact you shortly.</p>
        {form.email && (
          <p className="text-sm text-muted-foreground mt-2">
            A confirmation email has been sent to <strong>{form.email}</strong>.
          </p>
        )}
        <Button className="mt-8" onClick={() => { setSubmitted(false); setForm(empty); }}>
          Register Another Person
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-primary text-sm font-semibold">Join the Movement</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Become a Campaign Volunteer
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Your support makes a difference. Join committed citizens working for a better constituency.
        </p>
      </div>

      {/* Role Selection */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {roleTypes.map(role => {
          const Icon = role.icon;
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => setForm({ ...form, role_type: role.value })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                form.role_type === role.value
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <Icon className={`h-5 w-5 mb-2 ${form.role_type === role.value ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="font-semibold text-sm">{role.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{role.desc}</p>
            </button>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-6">
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); mutation.mutate(form); }}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="Your full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input placeholder="08x xxxx xxxx" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email <span className="text-muted-foreground text-xs">(for confirmation)</span></Label>
                <Input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Occupation</Label>
                <Input placeholder="Your occupation" value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Ward *</Label>
                <Select value={form.ward} onValueChange={v => setForm({ ...form, ward: v })}>
                  <SelectTrigger><SelectValue placeholder="Select ward" /></SelectTrigger>
                  <SelectContent>
                    {wards.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Community</Label>
                <Input placeholder="Your community" value={form.community} onChange={e => setForm({ ...form, community: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Age Group</Label>
                <Select value={form.age_group} onValueChange={v => setForm({ ...form, age_group: v })}>
                  <SelectTrigger><SelectValue placeholder="Age group" /></SelectTrigger>
                  <SelectContent>
                    {['18-25', '26-35', '36-45', '46-55', '56+'].map(a => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Skills / How You Can Help</Label>
              <Textarea placeholder="Tell us how you can contribute to the campaign..." value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} rows={3} />
            </div>
            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 font-bold text-base" disabled={mutation.isPending}>
              {mutation.isPending ? 'Registering...' : 'Join the Campaign'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}