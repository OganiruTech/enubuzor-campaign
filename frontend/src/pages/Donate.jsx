// src/pages/Donate.jsx

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { HandHeart, Heart, Building2, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/lib/toast';

const presetAmounts = [5000, 10000, 25000, 50000, 100000, 250000];

const empty = {
  donor_name: '', amount: 0, phone: '', email: '',
  payment_method: 'bank_transfer', message: '', is_anonymous: false,
};

export default function Donate() {
  const [submitted, setSubmitted]   = useState(false);
  const [customAmount, setCustom]   = useState('');
  const [form, setForm]             = useState(empty);

  const mutation = useMutation({
    mutationFn: (data) => api.entities.Donation.create(data),
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Thank you for your generous support!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Submission failed. Please try again.');
    },
  });

  const selectAmount = (amount) => {
    setForm({ ...form, amount });
    setCustom('');
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <Heart className="h-20 w-20 mx-auto text-primary mb-6" />
        </motion.div>
        <h1 className="font-heading text-3xl font-bold text-foreground mb-4">Thank You!</h1>
        <p className="text-muted-foreground text-lg mb-2">
          Your generous contribution will help build a stronger future for Ukwuani/Ndokwa Federal Constituency.
        </p>
        {form.email && (
          <p className="text-sm text-muted-foreground mb-6">
            A confirmation has been sent to <strong>{form.email}</strong>.
          </p>
        )}
        <div className="mt-4 bg-primary/5 rounded-xl p-6 text-left">
          <h3 className="font-semibold mb-3">Complete Your Bank Transfer</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Bank:</strong> [Campaign Bank Name]</p>
            <p><strong className="text-foreground">Account:</strong> [Account Number]</p>
            <p><strong className="text-foreground">Name:</strong> NDC Campaign - Enubuzor</p>
            <p><strong className="text-foreground">Amount:</strong> ₦{Number(customAmount || form.amount).toLocaleString()}</p>
          </div>
        </div>
        <Button className="mt-8" onClick={() => { setSubmitted(false); setForm(empty); setCustom(''); }}>
          Make Another Donation
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
          <HandHeart className="h-4 w-4 text-primary" />
          <span className="text-primary text-sm font-semibold">Donate to the Campaign</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Invest in Our Future
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Every contribution, no matter the size, helps us reach more communities and build a stronger campaign.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <form
              className="space-y-6"
              onSubmit={e => {
                e.preventDefault();
                const finalAmount = customAmount ? parseInt(customAmount) : form.amount;
                if (!finalAmount || finalAmount < 1) {
                  toast.error('Please select or enter a donation amount.');
                  return;
                }
                mutation.mutate({ ...form, amount: finalAmount });
              }}
            >
              {/* Amount */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Select Amount (₦)</Label>
                <div className="grid grid-cols-3 gap-3">
                  {presetAmounts.map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => selectAmount(amount)}
                      className={`p-3 rounded-xl border-2 text-center font-semibold transition-all text-sm ${
                        form.amount === amount && !customAmount
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      ₦{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <Input
                    type="number"
                    placeholder="Or enter custom amount (₦)"
                    value={customAmount}
                    min="1"
                    onChange={e => { setCustom(e.target.value); setForm({ ...form, amount: 0 }); }}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label className="text-base font-semibold mb-3 block">Payment Method</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
                    { value: 'online',        label: 'Online',        icon: CreditCard },
                    { value: 'cash',          label: 'Cash',          icon: HandHeart },
                  ].map(method => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setForm({ ...form, payment_method: method.value })}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          form.payment_method === method.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <Icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-xs font-medium">{method.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Donor Info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input value={form.donor_name} onChange={e => setForm({ ...form, donor_name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-muted-foreground text-xs">(for confirmation)</span></Label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Message <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea
                  placeholder="Leave a message of support..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="anon"
                  checked={form.is_anonymous}
                  onCheckedChange={v => setForm({ ...form, is_anonymous: v })}
                />
                <Label htmlFor="anon" className="text-sm text-muted-foreground cursor-pointer">
                  Make my donation anonymous
                </Label>
              </div>
              <Button type="submit" size="lg" className="w-full bg-primary font-bold" disabled={mutation.isPending}>
                {mutation.isPending ? 'Submitting...' : 'Submit Donation'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Bank Transfer Details</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Bank Name',       value: '[Campaign Bank]' },
                  { label: 'Account Number',  value: '[Account Number]' },
                  { label: 'Account Name',    value: 'NDC Campaign - Enubuzor' },
                ].map(item => (
                  <div key={item.label} className="bg-card rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">{item.label}</p>
                    <p className="font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-secondary/30">
            <CardContent className="p-6">
              <h3 className="font-heading font-bold text-base mb-2">Why Donate?</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                {[
                  'Fund community outreach programmes',
                  'Support ward-level mobilisation',
                  'Produce campaign materials',
                  'Enable transport for aspirant visits',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span> {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
                All donations are used solely for campaign activities. We are committed to full transparency and accountability.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}