/**
 * "Now on your channel" card (feature spec C2)
 *
 * Renders the channel's current wire state with honest freshness labeling:
 * ready shows live data + when it was fetched, stale shows last-known data
 * labeled as such, error offers a manual retry, and unauthenticated shows a
 * sign-in prompt rather than a red error.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useChannelStatus } from '@/hooks/useChannelStatus';

import type { TwitchChannelResponse } from '@/types/TwitchAPI';

/** 'updated hh:mm' — the moment the shown data was fetched from Twitch. */
function formatFetchedAt(fetchedAt: number): string {
  return new Date(fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function CardFrame({ phase, children }: { phase: string; children: React.ReactNode }): JSX.Element {
  return (
    <section
      data-testid="channel-status-card"
      data-phase={phase}
      aria-label="Now on your channel"
      className="scandi-card mb-8 p-6"
    >
      <h2 className="text-lg font-medium text-neutral-900 mb-4">Now on your channel</h2>
      {children}
    </section>
  );
}

function ChannelData({ channel, fetchedAt }: { channel: TwitchChannelResponse; fetchedAt: number }): JSX.Element {
  return (
    <div className="space-y-2 text-sm">
      <div>
        <span className="text-neutral-500">Title:</span>{' '}
        <span className="text-neutral-700">{channel.title || 'Not set'}</span>
      </div>
      <div>
        <span className="text-neutral-500">Category:</span>{' '}
        <span className="text-neutral-700">{channel.game_name || 'Not set'}</span>
      </div>
      <div>
        <span className="text-neutral-500">Tags:</span>{' '}
        <span className="text-neutral-700">{channel.tags.length}</span>
      </div>
      <div className="text-xs text-neutral-400">Updated {formatFetchedAt(fetchedAt)}</div>
    </div>
  );
}

export function ChannelStatusCard(): JSX.Element {
  const [retryNonce, setRetryNonce] = useState(0);
  const status = useChannelStatus(retryNonce);

  if (status.phase === 'loading') {
    // Card skeleton, no numbers (spec state table).
    return (
      <CardFrame phase="loading">
        <div aria-busy="true" className="space-y-3">
          <div className="h-4 w-3/4 rounded bg-neutral-200 animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-neutral-100 animate-pulse" />
          <div className="h-3 w-2/3 rounded bg-neutral-100 animate-pulse" />
        </div>
      </CardFrame>
    );
  }

  if (status.phase === 'ready') {
    return (
      <CardFrame phase="ready">
        <ChannelData channel={status.channel} fetchedAt={status.fetchedAt} />
      </CardFrame>
    );
  }

  if (status.phase === 'stale') {
    return (
      <CardFrame phase="stale">
        <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block mb-3">
          stale · showing last known
        </p>
        <ChannelData channel={status.channel} fetchedAt={status.fetchedAt} />
      </CardFrame>
    );
  }

  if (status.phase === 'error') {
    return (
      <CardFrame phase="error">
        <p className="text-sm text-neutral-600 mb-4">{status.message}</p>
        <button onClick={() => setRetryNonce(n => n + 1)} className="scandi-btn">
          Retry
        </button>
      </CardFrame>
    );
  }

  // unauthenticated — reuse the app's sign-in affordance, not a red error.
  return (
    <CardFrame phase="unauthenticated">
      <p className="text-sm text-neutral-600 mb-4">
        Sign in to see what&apos;s currently set on your Twitch channel.
      </p>
      <Link to="/auth" className="scandi-btn inline-block">
        Sign in with Twitch
      </Link>
    </CardFrame>
  );
}
