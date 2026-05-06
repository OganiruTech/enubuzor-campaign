// src/api/base44Client.js
//
// This file provides the same `base44.entities.X` surface the pages use,
// but routes every call to your real Express API instead of a Base44 cloud.

import apiClient from './apiClient';

// ── Generic entity wrapper ────────────────────────────────────────────────────
// list() ignores the old Base44 sort/limit positional args and instead accepts
// an optional plain params object: { status, ward, category, ... }
const createEntityWrapper = (endpoint) => ({
  create:  (data)         => apiClient.post(`/${endpoint}`, data).then(r => r.data),
  read:    (id)           => apiClient.get(`/${endpoint}/${id}`).then(r => r.data),
  list:    (params)       => {
    // If called with a string (old Base44 sort arg), discard it gracefully
    const p = typeof params === 'object' && params !== null ? params : {};
    return apiClient.get(`/${endpoint}`, { params: p }).then(r => r.data);
  },
  update:  (id, data)     => apiClient.put(`/${endpoint}/${id}`, data).then(r => r.data),
  delete:  (id)           => apiClient.delete(`/${endpoint}/${id}`).then(r => r.data),
});

// ── Typed entity wrappers ─────────────────────────────────────────────────────
const CampaignEvent   = createEntityWrapper('events');
const Volunteer       = createEntityWrapper('volunteers');
const CommunityIssue  = createEntityWrapper('issues');
const Donation        = createEntityWrapper('donations');
const MediaPost       = createEntityWrapper('media');

// RSVP lives under /admin/rsvps
const RSVP = {
  create: (data)     => apiClient.post('/admin/rsvps', data).then(r => r.data),
  list:   (params)   => apiClient.get('/admin/rsvps', { params }).then(r => r.data),
  read:   (id)       => apiClient.get(`/admin/rsvps/${id}`).then(r => r.data),
};

// ── Full API surface ──────────────────────────────────────────────────────────
export const api = {
  // Auth
  auth: {
    register:      (data) => apiClient.post('/auth/register', data).then(r => r.data),
    login:         (data) => apiClient.post('/auth/login', data).then(r => r.data),
    getMe:         ()     => apiClient.get('/auth/me').then(r => r.data),
    updateProfile: (data) => apiClient.put('/auth/profile', data).then(r => r.data),
  },

  // Entity wrappers (used by pages as base44.entities.X)
  entities: {
    CampaignEvent,
    Volunteer,
    RSVP,
    CommunityIssue,
    Donation,
    MediaPost,
  },

  // Named helpers (used by a few pages directly)
  events: {
    list:   (params)     => apiClient.get('/events', { params }).then(r => r.data),
    get:    (id)         => apiClient.get(`/events/${id}`).then(r => r.data),
    create: (data)       => apiClient.post('/events', data).then(r => r.data),
    update: (id, data)   => apiClient.put(`/events/${id}`, data).then(r => r.data),
    delete: (id)         => apiClient.delete(`/events/${id}`).then(r => r.data),
  },

  volunteers: {
    list:   (params)     => apiClient.get('/volunteers', { params }).then(r => r.data),
    get:    (id)         => apiClient.get(`/volunteers/${id}`).then(r => r.data),
    create: (data)       => apiClient.post('/volunteers', data).then(r => r.data),
    update: (id, data)   => apiClient.put(`/volunteers/${id}`, data).then(r => r.data),
  },

  issues: {
    list:         (params) => apiClient.get('/issues', { params }).then(r => r.data),
    get:          (id)     => apiClient.get(`/issues/${id}`).then(r => r.data),
    create:       (data)   => apiClient.post('/issues', data).then(r => r.data),
    upvote:       (id)     => apiClient.post(`/issues/${id}/upvote`).then(r => r.data),
    updateStatus: (id, status) => apiClient.put(`/issues/${id}`, { status }).then(r => r.data),
  },

  donations: {
    list:    (params) => apiClient.get('/donations', { params }).then(r => r.data),
    create:  (data)   => apiClient.post('/donations', data).then(r => r.data),
    getStats: ()      => apiClient.get('/donations/stats/summary').then(r => r.data),
  },

  media: {
    list:   (params)   => apiClient.get('/media', { params }).then(r => r.data),
    get:    (id)       => apiClient.get(`/media/${id}`).then(r => r.data),
    create: (data)     => apiClient.post('/media', data).then(r => r.data),
    like:   (id)       => apiClient.post(`/media/${id}/like`).then(r => r.data),
    update: (id, data) => apiClient.put(`/media/${id}`, data).then(r => r.data),
    delete: (id)       => apiClient.delete(`/media/${id}`).then(r => r.data),
  },

  admin: {
    getDashboardStats: ()          => apiClient.get('/admin/stats/dashboard').then(r => r.data),
    getUsers:          ()          => apiClient.get('/admin/users/all').then(r => r.data),
    updateUserRole:    (id, data)  => apiClient.put(`/admin/users/${id}/role`, data).then(r => r.data),
    getRsvps:          (eventId)   => apiClient.get(`/admin/rsvps/${eventId}`).then(r => r.data),
  },

  // File upload
  upload: {
    file: (formData) =>
      apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data),
  },

  // AI chat
  chat: {
    send: (message, history = []) =>
      apiClient.post('/chat', { message, history }).then(r => r.data),
  },
};

// Keep `base44` alias so existing imports don't break
export const base44 = api;
export default api;