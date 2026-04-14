/**
 * ReflectiveCard — vendored from react-bits (MIT).
 *
 * Identity badge card with a live webcam feed in the background, wrapped in
 * metallic/glass SVG filters. Used on the Shop Floor clock-in screen to
 * deter buddy-punching: an operator cannot clock in without their face being
 * visible to the tablet camera.
 *
 * Differences from upstream:
 *  - Converted to TypeScript.
 *  - Content (name, role, id, badge label) parameterised via props.
 *  - Graceful fallback when camera permission is denied OR no camera is
 *    present — the card still renders with its metallic chrome, but without
 *    the live feed. The calling screen detects this via onCameraStatus and
 *    shows a banner + pushes the operator down a PIN-only path.
 *
 * Source: https://github.com/DavidHDev/react-bits — Components/ReflectiveCard
 */

import { useEffect, useRef, useState } from 'react';
import { Fingerprint, Activity, Lock, VideoOff } from 'lucide-react';
import './ReflectiveCard.css';

export type CameraStatus = 'idle' | 'granted' | 'denied' | 'unavailable';

export interface ReflectiveCardProps {
  /** Operator display name (large label) */
  name?: string;
  /** Operator role / station label (small uppercase line under name) */
  role?: string;
  /** Operator ID number shown in footer */
  idNumber?: string;
  /** Badge label in header, e.g. "SECURE CLOCK-IN" */
  badgeLabel?: string;
  /** Callback when webcam permission state resolves */
  onCameraStatus?: (status: CameraStatus) => void;

  // Visual knobs (from upstream, kept for theme parity)
  blurStrength?: number;
  color?: string;
  metalness?: number;
  roughness?: number;
  overlayColor?: string;
  displacementStrength?: number;
  noiseScale?: number;
  specularConstant?: number;
  grayscale?: number;
  glassDistortion?: number;

  className?: string;
  style?: React.CSSProperties;
}

export default function ReflectiveCard({
  name = 'UNKNOWN OPERATOR',
  role = 'SHOP FLOOR',
  idNumber = '—',
  badgeLabel = 'SECURE CLOCK-IN',
  onCameraStatus,
  blurStrength = 12,
  color = 'white',
  metalness = 1,
  roughness = 0.4,
  overlayColor = 'rgba(255, 255, 255, 0.1)',
  displacementStrength = 20,
  noiseScale = 1,
  specularConstant = 1.2,
  grayscale = 1,
  glassDistortion = 0,
  className = '',
  style = {},
}: ReflectiveCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    const startWebcam = async () => {
      // Feature-detect first so we don't throw on ancient browsers
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        if (!cancelled) {
          setCameraStatus('unavailable');
          onCameraStatus?.('unavailable');
        }
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraStatus('granted');
        onCameraStatus?.('granted');
      } catch (err) {
        // Distinguish "no device" from "permission denied"
        const msg = (err as Error)?.name ?? '';
        const next: CameraStatus =
          msg === 'NotFoundError' || msg === 'OverconstrainedError' ? 'unavailable' : 'denied';
        if (!cancelled) {
          setCameraStatus(next);
          onCameraStatus?.(next);
        }
      }
    };

    startWebcam();

    return () => {
      cancelled = true;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // onCameraStatus intentionally excluded — we only want this effect to
    // run once on mount; parent should stabilise the callback if they pass one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const baseFrequency = 0.03 / Math.max(0.1, noiseScale);
  const saturation = 1 - Math.max(0, Math.min(1, grayscale));

  const cssVariables = {
    '--blur-strength': `${blurStrength}px`,
    '--metalness': metalness,
    '--roughness': roughness,
    '--overlay-color': overlayColor,
    '--text-color': color,
    '--saturation': saturation,
  } as React.CSSProperties;

  return (
    <div
      className={`reflective-card-container ${className}`}
      style={{ ...style, ...cssVariables }}
    >
      <svg className="reflective-svg-filters" aria-hidden="true">
        <defs>
          <filter id="metallic-displacement" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency={baseFrequency} numOctaves={2} result="noise" />
            <feColorMatrix in="noise" type="luminanceToAlpha" result="noiseAlpha" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={displacementStrength}
              xChannelSelector="R"
              yChannelSelector="G"
              result="rippled"
            />
            <feSpecularLighting
              in="noiseAlpha"
              surfaceScale={displacementStrength}
              specularConstant={specularConstant}
              specularExponent={20}
              lightingColor="#ffffff"
              result="light"
            >
              <fePointLight x={0} y={0} z={300} />
            </feSpecularLighting>
            <feComposite in="light" in2="rippled" operator="in" result="light-effect" />
            <feBlend in="light-effect" in2="rippled" mode="screen" result="metallic-result" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="solidAlpha"
            />
            <feMorphology in="solidAlpha" operator="erode" radius={45} result="erodedAlpha" />
            <feGaussianBlur in="erodedAlpha" stdDeviation={10} result="blurredMap" />
            <feComponentTransfer in="blurredMap" result="glassMap">
              <feFuncA type="linear" slope={0.5} intercept={0} />
            </feComponentTransfer>
            <feDisplacementMap
              in="metallic-result"
              in2="glassMap"
              scale={glassDistortion}
              xChannelSelector="A"
              yChannelSelector="A"
              result="final"
            />
          </filter>
        </defs>
      </svg>

      {/* Live webcam feed. Hidden if denied/unavailable. */}
      {(cameraStatus === 'granted' || cameraStatus === 'idle') && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="reflective-video"
        />
      )}

      {/* Camera-denied fallback chrome — a darker solid backdrop with a hint */}
      {(cameraStatus === 'denied' || cameraStatus === 'unavailable') && (
        <div className="reflective-nocamera" aria-hidden="true">
          <VideoOff size={40} strokeWidth={1.25} />
          <span>
            {cameraStatus === 'denied' ? 'Camera access denied' : 'No camera detected'}
          </span>
        </div>
      )}

      <div className="reflective-noise" />
      <div className="reflective-sheen" />
      <div className="reflective-border" />

      <div className="reflective-content">
        <div className="card-header">
          <div className="security-badge">
            <Lock size={14} className="security-icon" />
            <span>{badgeLabel}</span>
          </div>
          <Activity className="status-icon" size={20} />
        </div>

        <div className="card-body">
          <div className="user-info">
            <h2 className="user-name">{name}</h2>
            <p className="user-role">{role}</p>
          </div>
        </div>

        <div className="card-footer">
          <div className="id-section">
            <span className="label">OPERATOR ID</span>
            <span className="value">{idNumber}</span>
          </div>
          <div className="fingerprint-section">
            <Fingerprint size={32} className="fingerprint-icon" />
          </div>
        </div>
      </div>
    </div>
  );
}
