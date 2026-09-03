/**
 * Apply History Hook
 *
 * Thin React hook exposing the recent-applications strip's data: every apply
 * attempt recorded by useProfiles.applyProfile, newest first. The strip's
 * Apply-again/Revert actions and rendering land with the Dashboard strip;
 * this hook owns reading (and clearing) the store.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ApplyRecord } from '@/types/Profile';
import { getApplyHistoryRepository } from '@/repositories/ApplyHistoryRepository';

/**
 * Loading state interface
 */
interface HistoryLoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Apply history management hook
 *
 * Loads all records ordered by appliedAt descending (the repository's
 * contract) and exposes a refresh for after new applies land.
 */
export const useApplyHistory = () => {
  const [records, setRecords] = useState<ApplyRecord[]>([]);
  const [historyState, setHistoryState] = useState<HistoryLoadingState>({
    isLoading: true,
    error: null
  });

  const historyRepository = getApplyHistoryRepository();

  /**
   * Load all history records from the repository, newest first
   */
  const loadHistory = useCallback(async () => {
    setHistoryState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await historyRepository.getAll();

      if (result.success && result.data) {
        setRecords(result.data);
        setHistoryState({ isLoading: false, error: null });
      } else {
        setHistoryState({
          isLoading: false,
          error: result.error?.message || 'Failed to load apply history'
        });
      }
    } catch (error) {
      setHistoryState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  }, [historyRepository]);

  /**
   * Clear all history records
   */
  const clearHistory = useCallback(async () => {
    try {
      const result = await historyRepository.clear();

      if (result.success) {
        setRecords([]);
        setHistoryState({ isLoading: false, error: null });
      } else {
        setHistoryState(prev => ({
          ...prev,
          error: result.error?.message || 'Failed to clear apply history'
        }));
      }
    } catch (error) {
      setHistoryState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }));
    }
  }, [historyRepository]);

  // Load history on hook initialization
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    // Data (newest first)
    records,

    // Loading state
    isLoading: historyState.isLoading,
    error: historyState.error,

    // Operations
    refreshHistory: loadHistory,
    clearHistory
  };
};
