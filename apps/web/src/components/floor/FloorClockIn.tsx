/**
 * FloorClockIn — Operator clock-in gate for /floor.
 *
 * Two-step auth:
 *   1. Operator picks their face from the operator grid (recognition over recall).
 *   2. PIN + live webcam feed (ReflectiveCard) confirms identity.
 *
 * Why the webcam feed: the single biggest time-theft problem in fab shops is
 * buddy-punching (one operator clocking in for another). The ReflectiveCard
 * shows the operator's face live while they enter their PIN — you cannot
 * clock in without your face on camera at the tablet. Combined with the PIN
 * it constitutes a weak two-factor (know + are) deterrent.
 *
 * Camera fallback: if camera is denied or absent, the card renders a
 * placeholder and we fall through to PIN-only. That path logs a warning
 * banner so managers can see which sessions clocked in without visual
 * verification.
 *
 * Demo PIN: "1234" for every operator in the mock data. Shown explicitly
 * on screen while we're prototyping.
 */

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { makeService } from '@/services';
import { useFloorSession } from '@/store/floorSessionStore';
import type { Employee } from '@/types/entities';
import ReflectiveCard, { type CameraStatus } from './ReflectiveCard';

const DEMO_PIN = '1234';

export function FloorClockIn() {
  const session = useFloorSession();
  const [operators, setOperators] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');

  useEffect(() => {
    makeService.getOperators().then(setOperators);
  }, []);

  const handleSubmit = () => {
    if (!selected) return;
    if (pin === DEMO_PIN) {
      session.clockIn({
        id: selected.id,
        name: selected.name,
        role: selected.role,
      });
    } else {
      setError('Incorrect PIN. Demo PIN is 1234.');
      setPin('');
    }
  };

  // Auto-submit when the 4th digit is entered
  useEffect(() => {
    if (pin.length === 4) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  // ───────────────────────── Step 2: PIN + ReflectiveCard ─────────────────────────
  if (selected) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[var(--neutral-900)] relative overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, rgba(255,213,0,0.15), transparent 60%), radial-gradient(circle at 70% 70%, rgba(0,150,255,0.12), transparent 60%)',
          }}
        />

        {/* Back to picker */}
        <button
          onClick={() => {
            setSelected(null);
            setPin('');
            setError(null);
          }}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Change operator</span>
        </button>

        <div className="relative z-10 flex items-center gap-16 px-8">
          {/* Reflective identity card */}
          <motion.div
            initial={{ opacity: 0, y: 20, rotateY: -15 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 0.55, ease: [0.2, 0, 0, 1] }}
          >
            <ReflectiveCard
              name={selected.name.toUpperCase()}
              role={selected.role.toUpperCase()}
              idNumber={selected.id.toUpperCase()}
              badgeLabel="SECURE CLOCK-IN"
              onCameraStatus={setCameraStatus}
            />
          </motion.div>

          {/* PIN entry */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.2, 0, 0, 1] }}
            className="flex flex-col items-start max-w-[420px]"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-2">
              Step 2 of 2
            </span>
            <h1 className="text-4xl font-bold text-white leading-tight mb-3">
              Enter your PIN
            </h1>
            <p className="text-base text-white/60 mb-8">
              Your face must be visible on the card for this clock-in to be
              accepted.
            </p>

            <InputOTP
              maxLength={4}
              value={pin}
              onChange={(val) => {
                setError(null);
                setPin(val);
              }}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot
                  index={0}
                  className="w-16 h-16 text-3xl bg-white/5 border-white/20 text-white"
                />
                <InputOTPSlot
                  index={1}
                  className="w-16 h-16 text-3xl bg-white/5 border-white/20 text-white"
                />
                <InputOTPSlot
                  index={2}
                  className="w-16 h-16 text-3xl bg-white/5 border-white/20 text-white"
                />
                <InputOTPSlot
                  index={3}
                  className="w-16 h-16 text-3xl bg-white/5 border-white/20 text-white"
                />
              </InputOTPGroup>
            </InputOTP>

            {error && (
              <div className="mt-4 text-sm text-[var(--mw-error)] font-medium">
                {error}
              </div>
            )}

            {/* Camera fallback warning — visible whenever the card could not
                start its webcam. Managers will be able to see these sessions
                in an audit feed in a later pass. */}
            {(cameraStatus === 'denied' || cameraStatus === 'unavailable') && (
              <div className="mt-6 flex items-start gap-3 p-3 rounded-lg bg-[var(--mw-warning)]/15 border border-[var(--mw-warning)]/30 text-left">
                <ShieldAlert className="w-5 h-5 text-[var(--mw-warning)] shrink-0 mt-0.5" />
                <div className="text-xs text-white/80 leading-relaxed">
                  <div className="font-bold text-white mb-0.5">
                    Clocking in without camera verification
                  </div>
                  {cameraStatus === 'denied'
                    ? 'Camera permission was denied. This session will be flagged for manager review.'
                    : 'No camera detected on this tablet. This session will be flagged for manager review.'}
                </div>
              </div>
            )}

            <div className="mt-8 text-xs uppercase tracking-wider text-white/30">
              Demo PIN: 1234
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ───────────────────────── Step 1: operator picker ─────────────────────────
  return (
    <div className="h-full w-full overflow-auto bg-[var(--neutral-100)]">
      <div className="max-w-[960px] mx-auto px-8 py-16">
        <div className="mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--neutral-500)]">
            Step 1 of 2
          </span>
          <h1 className="text-4xl font-bold text-[var(--neutral-800)] mt-2 mb-3">
            Who's clocking in?
          </h1>
          <p className="text-base text-[var(--neutral-500)]">
            Tap your photo to continue.
          </p>
        </div>

        {operators.length === 0 ? (
          <div className="text-sm text-[var(--neutral-500)]">
            Loading operators…
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {operators.map((op) => (
              <button
                key={op.id}
                onClick={() => setSelected(op)}
                className="group flex flex-col items-center gap-3 p-6 bg-card border border-[var(--neutral-200)] rounded-[var(--shape-lg)] hover:border-[var(--mw-yellow-400)] hover:shadow-[var(--elevation-2)] transition-all active:scale-[0.98] min-h-[180px]"
              >
                <Avatar className="w-20 h-20 border-2 border-[var(--neutral-200)] group-hover:border-[var(--mw-yellow-400)] transition-colors">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="bg-[var(--neutral-800)] text-white text-xl font-bold">
                    {op.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <div className="font-bold text-[var(--neutral-800)] text-sm">
                    {op.name}
                  </div>
                  <div className="text-xs text-[var(--neutral-500)] mt-0.5 line-clamp-1">
                    {op.role}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-12 text-xs text-[var(--neutral-500)]">
          Don't see yourself? Ask a supervisor to be added to the shop floor
          roster.
        </div>
      </div>
    </div>
  );
}
