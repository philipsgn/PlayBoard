import { useRef, useCallback } from 'react';
import type { Cafe3DViewportRef } from './Cafe3DViewport';
import type { VenueId } from '../domain/types';

export function useCafeBridge() {
  const viewportRef = useRef<Cafe3DViewportRef | null>(null);

  const triggerEventAction = useCallback((eventId: string, optionId?: 'A' | 'B' | 'C') => {
    if (viewportRef.current) {
      viewportRef.current.playEventAction(eventId, optionId);
    }
  }, []);

  const triggerWorkShift = useCallback((shiftSeconds = 45) => {
    if (viewportRef.current) {
      viewportRef.current.startShift(shiftSeconds);
    }
  }, []);

  const resolveVenueFromDecisions = useCallback((activeDecisions: string[]): VenueId => {
    if (activeDecisions.includes('VENUE_ALLEY')) return 'alley';
    if (activeDecisions.includes('VENUE_KIOSK')) return 'kiosk';
    return 'main_street';
  }, []);

  return {
    viewportRef,
    triggerEventAction,
    triggerWorkShift,
    resolveVenueFromDecisions,
  };
}
