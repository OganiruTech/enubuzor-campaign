// src/pages/Event.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Clock, Users, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from '@/lib/toast';

const eventTypeColors = {
  town_hall:        'bg-blue-100 text-blue-800',
  community_visit:  'bg-primary/10 text-primary',
  youth_meeting:    'bg-purple-100 text-purple-800',
  campaign_rally:   'bg-secondary/30 text-secondary-foreground',
  press_conference: 'bg-gray-100 text-gray-800',
  fundraiser:       'bg-amber-100 text-amber-800',
};

const emptyRsvp = { name: '', phone: '', email: '', ward: '', guests: 1 };

export default function Events() {
  const [rsvpEvent, setRsvpEvent] = useState(null);
  const [rsvpForm, setRsvpForm] = useState(emptyRsvp);
  const [rsvpDone, setRsvpDone] = useState(false);

  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['campaign-events'],
    queryFn:  () => api.entities.CampaignEvent.list(),
  });

  const rsvpMutation = useMutation({
    mutationFn: (data) => api.entities.RSVP.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-events'] });
      setRsvpDone(true);
      toast.success("You're registered! See you there.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to RSVP. Please try again.');
    },
  });

  const closeModal = () => {
    setRsvpEvent(null);
    setRsvpForm(emptyRsvp);
    setRsvpDone(false);
  };

  const upcomingEvents = events.filter(e => !e.status || e.status === 'upcoming' || e.status === 'active');
  const pastEvents     = events.filter(e => e.status === 'completed');

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    try { return format(new Date(dateStr), 'EEEE, MMMM d, yyyy'); }
    catch { return dateStr; }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold text-foreground">Campaign Events</h1>
        <p className="text-muted-foreground mt-1">Join us at our upcoming events across Ukwuani/Ndokwa Federal Constituency.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Upcoming */}
          <h2 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Upcoming Events
          </h2>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground mb-10">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No upcoming events yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {upcomingEvents.map((event, i) => (
                <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="hover:shadow-md transition-all h-full flex flex-col">
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={eventTypeColors[event.event_type] || 'bg-muted text-muted-foreground'}>
                          {(event.event_type || '').replace(/_/g, ' ')}
                        </Badge>
                        {event.rsvp_count > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" /> {event.rsvp_count}
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
                      )}
                      <div className="mt-auto space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 shrink-0" />
                            <span>{event.time}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span>{event.location}</span>
                        </div>
                        <Button className="w-full mt-3 bg-primary" onClick={() => { setRsvpEvent(event); setRsvpDone(false); }}>
                          RSVP Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Past */}
          {pastEvents.length > 0 && (
            <>
              <h2 className="font-heading text-xl font-semibold mb-4 text-muted-foreground">Past Events</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
                {pastEvents.map(event => (
                  <Card key={event.id}>
                    <CardContent className="p-5">
                      <Badge variant="outline" className="mb-2">{(event.event_type || '').replace(/_/g, ' ')}</Badge>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* RSVP Modal */}
      <Dialog open={!!rsvpEvent} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              {rsvpDone ? 'You\'re Registered!' : `RSVP: ${rsvpEvent?.title}`}
            </DialogTitle>
          </DialogHeader>

          {rsvpDone ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-16 w-16 mx-auto text-primary mb-4" />
              <p className="text-muted-foreground mb-2">
                See you at <strong>{rsvpEvent?.title}</strong>!
              </p>
              {rsvpForm.email && (
                <p className="text-sm text-muted-foreground">
                  A confirmation has been sent to <strong>{rsvpForm.email}</strong>.
                </p>
              )}
              <Button className="mt-6 w-full" onClick={closeModal}>Close</Button>
            </div>
          ) : (
            <form
              className="space-y-4 mt-2"
              onSubmit={e => {
                e.preventDefault();
                rsvpMutation.mutate({ ...rsvpForm, event_id: rsvpEvent.id });
              }}
            >
              <div className="space-y-2">
                <Label>Your Name *</Label>
                <Input value={rsvpForm.name} onChange={e => setRsvpForm({ ...rsvpForm, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input value={rsvpForm.phone} onChange={e => setRsvpForm({ ...rsvpForm, phone: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-muted-foreground text-xs">(for confirmation)</span></Label>
                <Input type="email" value={rsvpForm.email} onChange={e => setRsvpForm({ ...rsvpForm, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ward</Label>
                  <Input value={rsvpForm.ward} onChange={e => setRsvpForm({ ...rsvpForm, ward: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Number of Guests</Label>
                  <Input
                    type="number" min="1" max="10"
                    value={rsvpForm.guests}
                    onChange={e => setRsvpForm({ ...rsvpForm, guests: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary" disabled={rsvpMutation.isPending}>
                {rsvpMutation.isPending ? 'Registering...' : 'Confirm RSVP'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}