/**
 * Channel Status Hook (feature spec C2 — "Now on your channel" card)
 *
 * Wires the previously dormant getCurrentChannel() module export and exposes
 * the channel's wire state with honest freshness labeling. Fetches on mount
 * and whenever the dashboard is actually looked at (window focus or
 * visibilitychange → visible), throttled to one request per
 * API_CONFIG.CHANNEL_STATUS_MIN_INTERVAL. No background polling.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentChannel, isAuthError } from '@/lib/api/twitchAPI';
import type { TwitchChannelResponse } from '@/types/TwitchAPI';
import { API_CONFIG } from '@/types/constants';

/**
 * Channel status state — union pinned by the feature spec (C2 state model).
 * stale carries the last-known channel data (offline, or the refresh failed
 * while cached data exists); unauthenticated covers both signed-out and
 * auth-error paths and renders a sign-in prompt, not a red error.
 */
export type ChannelStatusState =
  | { phase: 'loading' }
  | { phase: 'ready'; channel: TwitchChannelResponse; fetchedAt: number }
  | { phase: 'stale'; channel: TwitchChannelResponse; fetchedAt: number }
  | { phase: 'error'; message: string }
  | { phase: 'unauthenticated' };

/**
 * Track the channel's live status. Bump `retryNonce` to force a refresh that
 * bypasses the throttle (the error card's manual Retry affordance); automatic
 * mount/focus/visibility refreshes stay rate-limit friendly.
 */
export function useChannelStatus(retryNonce = 0): ChannelStatusState {
  const [status, setStatus] = useState<ChannelStatusState>({ phase: 'loading' });
  const lastGoodRef = useRef<{ channel: TwitchChannelResponse; fetchedAt: number } | null>(null);
  const lastFetchAtRef = useRef(0);
  const requestSeqRef = useRef(0);

  const refresh = useCallback(async (force: boolean) => {
    const now = Date.now();
    if (!force && now - lastFetchAtRef.current < API_CONFIG.CHANNEL_STATUS_MIN_INTERVAL) {
      return;
    }
    lastFetchAtRef.current = now;
    const seq = ++requestSeqRef.current;

    const result = await getCurrentChannel();

    // A newer request superseded this one — never apply stale results out of order.
    if (seq !== requestSeqRef.current) {
      return;
    }

    if (result.success) {
      const fresh = { channel: result.data, fetchedAt: Date.now() };
      lastGoodRef.current = fresh;
      setStatus({ phase: 'ready', ...fresh });
      return;
    }

    if (isAuthError(result.error)) {
      // Same class of failure useProfiles treats as "authentication required" —
      // the card shows a sign-in prompt rather than a red error.
      setStatus({ phase: 'unauthenticated' });
      return;
    }

    const cached = lastGoodRef.current;
    if (cached) {
      // Offline, or the refresh failed while we hold last-known wire truth.
      setStatus({ phase: 'stale', ...cached });
    } else {
      setStatus({
        phase: 'error',
        message: result.error?.message || 'Failed to load channel status'
      });
    }
  }, []);

  // First fetch on mount, then refresh only when the dashboard is looked at:
  // window focus, or the tab becoming visible again. No background polling.
  useEffect(() => {
    void refresh(false);

    const onFocus = (): void => {
      void refresh(false);
    };
    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        void refresh(false);
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [refresh]);

  // Manual retry: user-initiated, so it bypasses the 30s throttle.
  useEffect(() => {
    if (retryNonce > 0) {
      void refresh(true);
    }
  }, [retryNonce, refresh]);

  return status;
}
