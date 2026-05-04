/**
 * Drives the Auto-Schedule sequence:
 *   confirming -> running (steps 0..4 over ~4s) -> awaiting_approval
 *
 * The 5-step AI status panel advances on its own 800ms timer; the service
 * promise resolves in parallel (~3.5s) and the proposed snapshot is committed
 * once both the timer and the promise have completed.
 */
import { useCallback, useEffect, useRef } from 'react';

import { planService } from '@/services';
import { useScheduleEngineStore } from '@/store/scheduleEngineStore';
import type { AutoScheduleRequest } from '@/types/entities';

import { AI_STEP_DURATION_MS, AI_STEPS } from '../constants';

interface UseAutoScheduleRunnerReturn {
  start: (req: AutoScheduleRequest) => Promise<void>;
  cancel: () => void;
}

export function useAutoScheduleRunner(): UseAutoScheduleRunnerReturn {
  const setRunState = useScheduleEngineStore((s) => s.setRunState);
  const setStepIndex = useScheduleEngineStore((s) => s.setStepIndex);
  const setProposed = useScheduleEngineStore((s) => s.setProposed);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    setRunState('idle');
    setStepIndex(0);
  }, [setRunState, setStepIndex]);

  useEffect(() => {
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, []);

  const start = useCallback(
    async (req: AutoScheduleRequest) => {
      cancelledRef.current = false;
      setRunState('running');
      setStepIndex(0);

      // Stepper: advance every 800ms. Stop one step short of the final length;
      // step N-1 stays "active" until the service resolves below.
      let i = 0;
      stepTimerRef.current = setInterval(() => {
        i += 1;
        if (i >= AI_STEPS.length) {
          if (stepTimerRef.current) clearInterval(stepTimerRef.current);
          stepTimerRef.current = null;
          return;
        }
        setStepIndex(i);
      }, AI_STEP_DURATION_MS);

      const result = await planService.runAutoSchedule(req);

      if (cancelledRef.current) return;
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
        stepTimerRef.current = null;
      }
      setStepIndex(AI_STEPS.length - 1);
      setProposed(result.proposed, result.summary);
    },
    [setRunState, setStepIndex, setProposed],
  );

  return { start, cancel };
}
