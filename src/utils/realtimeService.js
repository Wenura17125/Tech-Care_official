/**
 * Supabase Real-time Service
 * Handles real-time subscriptions for CRUD operations across all roles
 * Enables instant updates when admin/technician/user makes changes
 */

import { supabase } from '../lib/supabase';

class RealtimeService {
    constructor() {
        this.channels = new Map();
        this.callbacks = new Map();
        this.configs = new Map(); // Stores the configuration for re-subscription
        this.heartbeatInterval = null;
        this.startHeartbeat();
    }

    startHeartbeat() {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

        this.heartbeatInterval = setInterval(() => {
            console.log('[Realtime] Heartbeat check...');
            this.channels.forEach((channel, key) => {
                const status = channel.state;
                // If channel is in a bad state, re-subscribe
                if (status === 'closed' || status === 'errored') {
                    console.warn(`[Realtime] Channel ${key} is ${status}. Re-subscribing...`);
                    this.reSubscribe(key);
                }
            });
        }, 30000); // 30 seconds
    }

    reSubscribe(channelKey) {
        const config = this.configs.get(channelKey);
        if (!config) return;

        // Cleanup old channel
        const oldChannel = this.channels.get(channelKey);
        if (oldChannel) supabase.removeChannel(oldChannel);

        // Re-call the original subscription method
        const { methodName, args } = config;
        this[methodName](...args, true); // Pass true to indicate it's an internal re-subscription
    }

    // New method for AuthContext to call on TOKEN_REFRESHED
    refreshAllConnections() {
        console.log('[Realtime] Refreshing all connections due to auth change...');
        const keys = Array.from(this.configs.keys());
        keys.forEach(key => this.reSubscribe(key));
    }

    /**
     * Internal helper to handle the common subscription pattern
     */
    _subscribe(channelKey, options, callback, methodName, args, isInternal = false) {
        if (this.channels.has(channelKey) && !isInternal) {
            const callbacks = this.callbacks.get(channelKey) || [];
            if (!callbacks.includes(callback)) {
                callbacks.push(callback);
                this.callbacks.set(channelKey, callbacks);
            }
            return () => this.removeCallback(channelKey, callback);
        }

        // Store config for re-subscription
        if (!isInternal) {
            this.configs.set(channelKey, { methodName, args });
        }

        const channel = supabase
            .channel(channelKey + '-changes')
            .on(
                'postgres_changes',
                options,
                (payload) => {
                    console.log(`[Realtime] ${channelKey} change:`, payload.eventType);
                    const callbacks = this.callbacks.get(channelKey) || [];
                    callbacks.forEach(cb => cb(payload));
                }
            )
            .subscribe((status) => {
                console.log(`[Realtime] ${channelKey} status:`, status);
                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    // Optional: proactive re-try
                }
            });

        this.channels.set(channelKey, channel);
        if (!isInternal) {
            this.callbacks.set(channelKey, [callback]);
        }

        return () => this.removeCallback(channelKey, callback);
    }

    subscribeToTechnicians(callback, isInternal = false) {
        return this._subscribe('technicians', { event: '*', schema: 'public', table: 'technicians' }, callback, 'subscribeToTechnicians', [callback], isInternal);
    }

    subscribeToBookings(callback, userId = null, isInternal = false) {
        const channelKey = userId ? `bookings-${userId}` : 'bookings-all';
        return this._subscribe(channelKey, { event: '*', schema: 'public', table: 'bookings' }, callback, 'subscribeToBookings', [callback, userId], isInternal);
    }

    subscribeToReviews(callback, isInternal = false) {
        return this._subscribe('reviews', { event: '*', schema: 'public', table: 'reviews' }, callback, 'subscribeToReviews', [callback], isInternal);
    }

    subscribeToServices(callback, isInternal = false) {
        return this._subscribe('services', { event: '*', schema: 'public', table: 'services' }, callback, 'subscribeToServices', [callback], isInternal);
    }

    subscribeToGigs(callback, isInternal = false) {
        return this._subscribe('gigs', { event: '*', schema: 'public', table: 'gigs' }, callback, 'subscribeToGigs', [callback], isInternal);
    }

    subscribeToNotifications(userId, callback, isInternal = false) {
        const channelKey = `notifications-${userId}`;
        return this._subscribe(channelKey, {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
        }, callback, 'subscribeToNotifications', [userId, callback], isInternal);
    }

    subscribeToBids(callback, isInternal = false) {
        return this._subscribe('bids', { event: '*', schema: 'public', table: 'bids' }, callback, 'subscribeToBids', [callback], isInternal);
    }

    subscribeToMessages(bookingId, callback, isInternal = false) {
        const channelKey = `messages-${bookingId}`;
        return this._subscribe(channelKey, {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `booking_id=eq.${bookingId}`
        }, callback, 'subscribeToMessages', [bookingId, callback], isInternal);
    }

    removeCallback(channelKey, callback) {
        const callbacks = this.callbacks.get(channelKey) || [];
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
            this.callbacks.set(channelKey, callbacks);
        }

        if (callbacks.length === 0) {
            this.unsubscribe(channelKey);
            this.configs.delete(channelKey);
        }
    }

    unsubscribe(channelKey) {
        const channel = this.channels.get(channelKey);
        if (channel) {
            supabase.removeChannel(channel);
            this.channels.delete(channelKey);
            console.log(`[Realtime] Unsubscribed from ${channelKey}`);
        }
    }

    unsubscribeAll() {
        this.channels.forEach((channel, key) => {
            supabase.removeChannel(channel);
            console.log(`[Realtime] Unsubscribed from ${key}`);
        });
        this.channels.clear();
        this.callbacks.clear();
        this.configs.clear();
    }
}

const realtimeService = new RealtimeService();
export default realtimeService;
