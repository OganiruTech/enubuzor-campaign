// src/pages/Admin.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Users, AlertTriangle, Calendar, Megaphone, HandHeart,
  Plus, Trash2, Upload, Lock, LogIn, Eye, EyeOff,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';

// ── Login Form ────────────────────────────────────────────────────────────────
function AdminLogin() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (!data.user?.is_admin) {
        setError('This account does not have admin privileges.');
        // log them back out
        localStorage.removeItem('auth_token');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="font-heading text-2xl">Admin Login</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in with your admin account to access the dashboard.
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <LogIn className="h-4 w-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Only registered admin accounts can access this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────
export default function Admin() {
  const { user, isLoadingAuth, logout } = useAuth();
  const queryClient = useQueryClient();

  // Still checking auth — show spinner
  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in — show login form
  if (!user) return <AdminLogin />;

  // Logged in but not admin
  if (!user.is_admin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-40" />
        <h1 className="font-heading text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          Your account (<strong>{user.email}</strong>) does not have admin privileges.
        </p>
        <Button variant="outline" onClick={logout}>Sign out</Button>
      </div>
    );
  }

  const { data: volunteers = [] } = useQuery({
    queryKey: ['admin-volunteers'],
    queryFn: () => api.entities.Volunteer.list(),
  });
  const { data: issues = [] } = useQuery({
    queryKey: ['admin-issues'],
    queryFn: () => api.entities.CommunityIssue.list(),
  });
  const { data: events = [] } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => api.entities.CampaignEvent.list(),
  });
  const { data: media = [] } = useQuery({
    queryKey: ['admin-media'],
    queryFn: () => api.entities.MediaPost.list(),
  });
  const { data: donations = [] } = useQuery({
    queryKey: ['admin-donations'],
    queryFn: () => api.entities.Donation.list(),
  });

  const totalDonations = donations.reduce((s, d) => s + Number(d.amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-heading text-3xl font-bold text-foreground">Campaign Dashboard</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
          <Button variant="outline" size="sm" onClick={logout}>Sign out</Button>
        </div>
      </div>
      <p className="text-muted-foreground mb-8">Manage and monitor all campaign activities.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Volunteers',  value: volunteers.length,               icon: Users,         color: 'text-primary' },
          { label: 'Issues',      value: issues.length,                   icon: AlertTriangle, color: 'text-amber-600' },
          { label: 'Events',      value: events.length,                   icon: Calendar,      color: 'text-blue-600' },
          { label: 'Media Posts', value: media.length,                    icon: Megaphone,     color: 'text-purple-600' },
          { label: 'Donations',   value: `₦${totalDonations.toLocaleString()}`, icon: HandHeart, color: 'text-green-600' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <Icon className={`h-5 w-5 ${stat.color} mb-2`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="media">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="media">
          <MediaManager media={media} queryClient={queryClient} />
        </TabsContent>
        <TabsContent value="events">
          <EventsManager events={events} queryClient={queryClient} />
        </TabsContent>
        <TabsContent value="issues">
          <IssuesManager issues={issues} queryClient={queryClient} />
        </TabsContent>
        <TabsContent value="volunteers">
          <VolunteersManager volunteers={volunteers} queryClient={queryClient} />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsView volunteers={volunteers} issues={issues} donations={donations} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Media Manager ─────────────────────────────────────────────────────────────
function MediaManager({ media, queryClient }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '', content: '', description: '', media_type: 'announcement',
    media_url: '', thumbnail_url: '', category: '', is_featured: false,
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.entities.MediaPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      setOpen(false);
      setForm({ title: '', content: '', description: '', media_type: 'announcement', media_url: '', thumbnail_url: '', category: '', is_featured: false });
      toast({ title: 'Media post created!' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.MediaPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast({ title: 'Post deleted' });
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await api.upload.file(formData);
      setForm(prev => ({ ...prev, media_url: result.file_url, thumbnail_url: result.file_url }));
      toast({ title: 'File uploaded!' });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading text-xl font-semibold">Media Posts</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Post</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Media Post</DialogTitle></DialogHeader>
            <form className="space-y-4 mt-4" onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }}>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.media_type} onValueChange={v => setForm({ ...form, media_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="press_release">Press Release</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Upload File</Label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer border border-border rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors text-sm">
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Choose file'}
                    <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                  </label>
                  {form.media_url && <span className="text-xs text-primary truncate max-w-[200px]">✓ File uploaded</span>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Or paste media URL</Label>
                <Input placeholder="https://..." value={form.media_url} onChange={e => setForm({ ...form, media_url: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.is_featured} onCheckedChange={v => setForm({ ...form, is_featured: v })} id="featured" />
                <Label htmlFor="featured" className="text-sm cursor-pointer">Feature this post on the media page</Label>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || uploading}>
                {createMutation.isPending ? 'Creating...' : 'Create Post'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {media.map(post => (
          <Card key={post.id}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Badge variant="outline">{post.media_type?.replace('_', ' ')}</Badge>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy') : ''}
                  </p>
                </div>
                {post.is_featured && <Badge className="bg-secondary text-secondary-foreground shrink-0">Featured</Badge>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(post.id)} className="shrink-0">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {media.length === 0 && <p className="text-center text-muted-foreground py-8">No media posts yet.</p>}
      </div>
    </div>
  );
}

// ── Events Manager ────────────────────────────────────────────────────────────
function EventsManager({ events, queryClient }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', event_type: 'community_visit',
    date: '', time: '', location: '', ward: '',
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.entities.CampaignEvent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      setOpen(false);
      setForm({ title: '', description: '', event_type: 'community_visit', date: '', time: '', location: '', ward: '' });
      toast({ title: 'Event created!' });
    },
    onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.CampaignEvent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      toast({ title: 'Event deleted' });
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-heading text-xl font-semibold">Campaign Events</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
            <form className="space-y-4 mt-4" onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }}>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.event_type} onValueChange={v => setForm({ ...form, event_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['town_hall', 'community_visit', 'youth_meeting', 'campaign_rally', 'press_conference', 'fundraiser'].map(t => (
                      <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input placeholder="10:00 AM" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Event'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {events.map(event => (
          <Card key={event.id}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{event.event_type?.replace(/_/g, ' ')}</Badge>
                  <p className="font-semibold text-sm">{event.title}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {event.date ? format(new Date(event.date), 'MMM d, yyyy') : 'TBD'} · {event.location}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(event.id)} className="shrink-0">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 && <p className="text-center text-muted-foreground py-8">No events yet.</p>}
      </div>
    </div>
  );
}

// ── Issues Manager ────────────────────────────────────────────────────────────
function IssuesManager({ issues, queryClient }) {
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.CommunityIssue.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-issues'] });
      toast({ title: 'Issue updated' });
    },
  });

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold mb-4">Community Issues ({issues.length})</h2>
      <div className="space-y-3">
        {issues.map(issue => (
          <Card key={issue.id}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{issue.title}</p>
                <p className="text-xs text-muted-foreground">
                  {issue.community} · {issue.category?.replace(/_/g, ' ')} · {issue.upvotes || 0} supporters
                </p>
              </div>
              <Select
                value={issue.status}
                onValueChange={v => updateMutation.mutate({ id: issue.id, data: { status: v } })}
              >
                <SelectTrigger className="w-36 shrink-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
        {issues.length === 0 && <p className="text-center text-muted-foreground py-8">No issues reported.</p>}
      </div>
    </div>
  );
}

// ── Volunteers Manager ────────────────────────────────────────────────────────
function VolunteersManager({ volunteers, queryClient }) {
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Volunteer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-volunteers'] });
      toast({ title: 'Volunteer updated' });
    },
  });

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold mb-4">Volunteers ({volunteers.length})</h2>
      <div className="space-y-3">
        {volunteers.map(vol => (
          <Card key={vol.id}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{vol.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {vol.phone} · {vol.ward || 'N/A'} · {(vol.role_type || '').replace(/_/g, ' ')}
                </p>
              </div>
              <Select
                value={vol.status}
                onValueChange={v => updateMutation.mutate({ id: vol.id, data: { status: v, role_type: vol.role_type } })}
              >
                <SelectTrigger className="w-28 shrink-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
        {volunteers.length === 0 && <p className="text-center text-muted-foreground py-8">No volunteers yet.</p>}
      </div>
    </div>
  );
}

// ── Analytics ─────────────────────────────────────────────────────────────────
function AnalyticsView({ volunteers, issues, donations }) {
  const COLORS = [
    'hsl(152,80%,28%)', 'hsl(42,85%,55%)', 'hsl(200,70%,45%)',
    'hsl(0,70%,55%)', 'hsl(280,60%,50%)',
  ];

  const volunteersByRole = ['volunteer', 'polling_unit_agent', 'ward_mobilizer', 'campaign_ambassador'].map(role => ({
    name: role.replace(/_/g, ' '),
    value: volunteers.filter(v => v.role_type === role).length,
  })).filter(r => r.value > 0);

  const issuesByCategory = ['roads', 'flooding', 'healthcare', 'schools', 'security', 'youth_unemployment', 'electricity', 'water']
    .map(cat => ({ name: cat.replace(/_/g, ' '), count: issues.filter(i => i.category === cat).length }))
    .filter(i => i.count > 0);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Volunteers by Role</CardTitle></CardHeader>
        <CardContent>
          {volunteersByRole.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={volunteersByRole} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {volunteersByRole.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-10">No data yet</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Issues by Category</CardTitle></CardHeader>
        <CardContent>
          {issuesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={issuesByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(152,80%,28%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-10">No data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}