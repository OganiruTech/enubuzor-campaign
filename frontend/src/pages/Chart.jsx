// src/pages/Chart.jsx

import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const QUICK_QUESTIONS = [
  'What are the campaign promises?',
  'Who is Nicholas?',
  'How can I volunteer?',
  'When is the next event?',
  'How do I report a community issue?',
];

const CANNED_REPLIES = {
  campaign_promises: `**Ogbuefi Nicholas Enubuzor**’s campaign for the Ukwuani/Ndokwa Federal Constituency is focused on people-centered leadership, quality representation, infrastructure development, youth empowerment, accessible healthcare, improved community security, and transparent governance. His vision is to deliver practical solutions and ensure the voices of the people are effectively represented at the National Assembly.`,
  who_is_nicholas: `**Ogbuefi Nicholas Enubuzor** is an aspirant under the National Democratic Congress (NDC) for the House of Representatives seat representing the Ukwuani/Ndokwa Federal Constituency in Delta State ahead of the 2027 general elections. His campaign is centered on the vision of “Service to the People,” with a focus on people-oriented leadership, effective representation, community development, and responsive governance for the constituency.`,
};

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Welcome! 🇳🇬 I'm the NDC Campaign Assistant for **Ogbuefi Nicholas Enubuzor**. I can help you learn about our Aspirant, campaign promises, upcoming events, or how to get involved. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const normalized = msg.toLowerCase().replace(/[?.]/g, '').trim();
    const cannedResponse =
      normalized === 'what are the campaign promises' || normalized.includes('campaign promises')
        ? CANNED_REPLIES.campaign_promises
        : normalized === 'who is nicholas' || normalized.includes('who is nicholas') || (normalized.includes('who is') && normalized.includes('nicholas'))
        ? CANNED_REPLIES.who_is_nicholas
        : null;

    const userMsg = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    if (cannedResponse) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: cannedResponse },
      ]);
      setLoading(false);
      return;
    }

    try {
      // Build a trimmed history (last 10 messages) to send for context
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const data = await api.chat.send(msg, history);
      // Ensure the candidate name appears bold in any external replies
      const reply = (data.reply || '').replace(/Ogbuefi Nicholas Enubuzor/g, '**Ogbuefi Nicholas Enubuzor**');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-3">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-primary text-sm font-semibold">NDC Campaign Assistant</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Ask About Our Campaign</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Chat with our assistant to learn about <strong className="font-semibold">Ogbuefi Nicholas Enubuzor</strong> and his vision for Ukwuani/Ndokwa Federal.
        </p>
      </div>

      {/* Quick question pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        {/* Messages */}
        <div className="h-[55vh] overflow-y-auto p-4 space-y-4 bg-muted/30">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <ReactMarkdown className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about our campaign..."
              className="flex-1"
              disabled={loading}
            />
            <Button
              type="submit"
              className="bg-primary shrink-0"
              disabled={loading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}