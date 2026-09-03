/**
 * WebMCP registration lifecycle.
 *
 * `useModelContextTools` is the register-when-available / unregister-when-removed pattern the
 * WebMCP docs prescribe, expressed as a hook: tools are registered while `enabled` is true and
 * removed again on unmount or when `enabled` goes false (sign-out). Registration itself goes
 * through the `modelContext` adapter, so an unsupported browser is a silent no-op here too.
 *
 * The hook is deliberately generic — it knows about tool identity and lifecycle, not about
 * profiles or Twitch. The stream-profile surface is composed on top of it in `useStreamProfileTools`.
 */

import { useEffect } from 'react';
import {
  registerModelContextTool,
  unregisterModelContextTool,
  type ModelContextTool,
} from '@/lib/webmcp/modelContext';

/**
 * Registers `tools` with the browser's model context while `enabled` is true.
 *
 * Pass a referentially stable `tools` array (`useMemo`) — the effect re-runs whenever the array
 * identity changes, which unregisters the previous tools before registering the new ones. Handlers
 * that need fresh data should close over a ref rather than being rebuilt on every render.
 */
export function useModelContextTools(tools: readonly ModelContextTool[], enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    tools.forEach(registerModelContextTool);

    return () => {
      tools.forEach(tool => unregisterModelContextTool(tool.name));
    };
  }, [tools, enabled]);
}
