// src/pages/Media.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Video, Megaphone, FileText, Play, ExternalLink, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from '@/lib/toast';

const typeIcons = {
  photo:         Image,
  video:         Video,
  announcement:  Megaphone,
  press_release: FileText,
};

export default function Media() {
  const [tab, setTab] = useState('all');
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['media-posts'],
    queryFn:  () => api.entities.MediaPost.list(),
  });

  const likeMutation = useMutation({
    mutationFn: (id) => api.media.like(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media-posts'] }),
    onError: () => toast.error('Could not like post. Try again.'),
  });

  const filtered  = tab === 'all' ? posts : posts.filter(p => p.media_type === tab);
  const featured  = posts.filter(p => p.is_featured);

  const formatDate = (d) => {
    if (!d) return '';
    try { return format(new Date(d), 'MMM d, yyyy'); }
    catch { return ''; }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">News & Media Center</h1>
        <p className="text-muted-foreground mt-1">Stay updated with the latest campaign news, videos, and announcements.</p>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div className="mb-10">
          <Card className="overflow-hidden bg-primary text-primary-foreground">
            <CardContent className="p-8">
              <Badge className="bg-secondary text-secondary-foreground mb-3">Featured</Badge>
              <h2 className="font-heading text-2xl font-bold mb-2">{featured[0].title}</h2>
              <p className="opacity-80 mb-4 leading-relaxed">{featured[0].content || featured[0].description}</p>
              {featured[0].media_url && (
                <a href={featured[0].media_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" className="gap-2">
                    <ExternalLink className="h-4 w-4" /> View Media
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="announcement">Announcements</TabsTrigger>
          <TabsTrigger value="photo">Photos</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="press_release">Press</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No posts yet in this category. Check back for updates!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((post, i) => {
                const Icon = typeIcons[post.media_type] || Megaphone;
                return (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="hover:shadow-md transition-all h-full overflow-hidden flex flex-col">
                      {/* Thumbnail */}
                      {post.thumbnail_url || post.media_url ? (
                        <div className="relative h-44 bg-muted overflow-hidden shrink-0">
                          {post.media_type === 'video' ? (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              {post.thumbnail_url
                                ? <img src={post.thumbnail_url} alt={post.title} className="w-full h-full object-cover" />
                                : <Play className="h-12 w-12 text-primary/50" />
                              }
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                                  <Play className="h-5 w-5 text-primary ml-0.5" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={post.thumbnail_url || post.media_url}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="h-32 bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center shrink-0">
                          <Icon className="h-10 w-10 text-primary/30" />
                        </div>
                      )}

                      <CardContent className="p-4 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {(post.media_type || '').replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                        </div>
                        <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">{post.title}</h3>
                        {(post.content || post.description) && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {post.content || post.description}
                          </p>
                        )}
                        <div className="mt-auto flex items-center gap-2">
                          {post.media_url && (
                            <a href={post.media_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary px-2">
                                <ExternalLink className="h-3 w-3" /> View
                              </Button>
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-xs px-2 ml-auto"
                            onClick={() => likeMutation.mutate(post.id)}
                            disabled={likeMutation.isPending}
                          >
                            <ThumbsUp className="h-3 w-3" /> {post.likes || 0}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}