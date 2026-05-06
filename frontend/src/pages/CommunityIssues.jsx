// src/pages/CommunityIssues.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  AlertTriangle, Plus, MapPin, ThumbsUp, Filter,
  Droplets, Car, GraduationCap, HeartPulse, Shield, Zap, Droplet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/lib/toast';

const categories = [
  { value: 'roads',              label: 'Roads',              icon: Car },
  { value: 'flooding',           label: 'Flooding',           icon: Droplets },
  { value: 'youth_unemployment', label: 'Youth Unemployment', icon: GraduationCap },
  { value: 'schools',            label: 'Schools',            icon: GraduationCap },
  { value: 'healthcare',         label: 'Healthcare',         icon: HeartPulse },
  { value: 'security',           label: 'Security',           icon: Shield },
  { value: 'electricity',        label: 'Electricity',        icon: Zap },
  { value: 'water',              label: 'Water',              icon: Droplet },
  { value: 'other',              label: 'Other',              icon: AlertTriangle },
];

const statusColors = {
  reported:     'bg-yellow-100 text-yellow-800 border-yellow-200',
  acknowledged: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress:  'bg-primary/10 text-primary border-primary/20',
  resolved:     'bg-green-100 text-green-800 border-green-200',
};

const wards = [
  'Obiaruku', 'Umukwata', 'Umuaja', 'Ebedei', 'Amai', 'Obinomba',
  'Umutu', 'Ekuku-Agbor', 'Onicha-Ugbo', 'Issele-Uku', 'Ogwashi-Uku',
  'Ubulu-Uku', 'Nsukwa', 'Emu', 'Idumuje',
];

const emptyForm = {
  title: '', description: '', category: '', community: '', ward: '',
  reporter_name: '', reporter_phone: '', reporter_email: '',
};

export default function CommunityIssues() {
  const [open, setOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [form, setForm] = useState(emptyForm);

  const queryClient = useQueryClient();

  const { data: issues = [], isLoading } = useQuery({
    queryKey: ['community-issues'],
    queryFn:  () => api.entities.CommunityIssue.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.entities.CommunityIssue.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-issues'] });
      setOpen(false);
      setForm(emptyForm);
      toast.success('Issue reported! Thank you for speaking up.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to submit. Please try again.');
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: (issueId) => api.issues.upvote(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-issues'] });
    },
  });

  const filteredIssues = filterCategory === 'all'
    ? issues
    : issues.filter(i => i.category === filterCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Community Issues</h1>
          <p className="text-muted-foreground mt-1">Report problems in your community. We will champion your cause.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" /> Report Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Report a Community Issue</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4 mt-4"
              onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }}
            >
              <div className="space-y-2">
                <Label>Issue Title *</Label>
                <Input placeholder="e.g. Bad road at Market Junction" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Community *</Label>
                  <Input placeholder="Your community" value={form.community} onChange={e => setForm({ ...form, community: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Ward</Label>
                  <Select value={form.ward} onValueChange={v => setForm({ ...form, ward: v })}>
                    <SelectTrigger><SelectValue placeholder="Select ward" /></SelectTrigger>
                    <SelectContent>
                      {wards.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the issue in detail..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input placeholder="Your name" value={form.reporter_name} onChange={e => setForm({ ...form, reporter_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="08x xxxx xxxx" value={form.reporter_phone} onChange={e => setForm({ ...form, reporter_phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-muted-foreground text-xs">(optional, for updates)</span></Label>
                <Input type="email" placeholder="your@email.com" value={form.reporter_email} onChange={e => setForm({ ...form, reporter_email: e.target.value })} />
              </div>
              <Button type="submit" className="w-full bg-primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Submitting...' : 'Submit Report'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant={filterCategory === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterCategory('all')}>
          <Filter className="h-3 w-3 mr-1" /> All
        </Button>
        {categories.map(c => (
          <Button key={c.value} variant={filterCategory === c.value ? 'default' : 'outline'} size="sm" onClick={() => setFilterCategory(c.value)}>
            {c.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No issues reported yet. Be the first to report a community issue.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredIssues.map((issue, i) => {
              const catInfo = categories.find(c => c.value === issue.category);
              const CatIcon = catInfo?.icon || AlertTriangle;
              return (
                <motion.div key={issue.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CatIcon className="h-4 w-4 text-primary shrink-0" />
                          <CardTitle className="text-sm font-semibold line-clamp-2">{issue.title}</CardTitle>
                        </div>
                        <Badge variant="outline" className={`${statusColors[issue.status] || ''} text-xs shrink-0`}>
                          {(issue.status || 'reported').replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {issue.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{issue.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <MapPin className="h-3 w-3" />
                        <span>{issue.community}{issue.ward ? `, ${issue.ward}` : ''}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => upvoteMutation.mutate(issue.id)}
                        disabled={upvoteMutation.isPending}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        {issue.upvotes || 0} Support
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}