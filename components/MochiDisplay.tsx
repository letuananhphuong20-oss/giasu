import React, { useState, useEffect } from 'react';
import { MochiState, IdleExpression } from '../types';
import {
  NormalMochi,
  BlinkMochi,
  LookLeftMochi,
  LookRightMochi,
  HappyMochi,
  ListeningMochi,
  ThinkingMochi,
  SpeakingMochi,
  LoadingMochi,
  ErrorMochi,
  SadMochi,
  SurprisedMochi,
  SquintMochi,
  WinkLeftMochi,
  LoveMochi,
  DizzyMochi,
  AngryMochi,
  ConfusedMochi,
  SleepyMochi,
  SleepingMochi,
  ProudMochi,
  KawaiiMochi,
} from './MochiExpressions';

interface MochiDisplayProps {
  state: MochiState;
  speed: number;
  delay: number;
  onDoubleClick?: () => void;
}

const MochiDisplay: React.FC<MochiDisplayProps> = ({ state, speed, delay, onDoubleClick }) => {
  const [idleExpression, setIdleExpression] = useState<IdleExpression>(IdleExpression.NORMAL);

  useEffect(() => {
    if (state === MochiState.IDLE) {
      // Create a weighted pool to make some expressions more common and give Mochi more personality.
      const idleExpressionPool = [
        IdleExpression.NORMAL, IdleExpression.NORMAL, IdleExpression.NORMAL, IdleExpression.NORMAL,
        IdleExpression.BLINK, IdleExpression.BLINK, IdleExpression.BLINK,
        IdleExpression.HAPPY, IdleExpression.HAPPY, // Make Happy more frequent
        IdleExpression.LOOK_LEFT,
        IdleExpression.LOOK_RIGHT,
        IdleExpression.SQUINT,
        IdleExpression.WINK_LEFT,
        IdleExpression.KAWAII,
        IdleExpression.SLEEPY,
        IdleExpression.CONFUSED,
        IdleExpression.PROUD,
      ];

      const idleAnimation = setInterval(() => {
        const nextExpression = idleExpressionPool[Math.floor(Math.random() * idleExpressionPool.length)];
        
        // Avoid setting the same expression back-to-back to make it feel more dynamic
        setIdleExpression(current => current === nextExpression ? IdleExpression.NORMAL : nextExpression);
      }, delay);
      return () => clearInterval(idleAnimation);
    }
  }, [state, delay]);
  
  const mochiProps = { speed };

  const renderIdleMochi = () => {
    switch (idleExpression) {
      case IdleExpression.BLINK:
        return <BlinkMochi {...mochiProps} />;
      case IdleExpression.LOOK_LEFT:
        return <LookLeftMochi {...mochiProps} />;
      case IdleExpression.LOOK_RIGHT:
        return <LookRightMochi {...mochiProps} />;
      case IdleExpression.HAPPY:
          return <HappyMochi {...mochiProps} />;
      case IdleExpression.SAD:
        return <SadMochi {...mochiProps} />;
      case IdleExpression.SURPRISED:
        return <SurprisedMochi {...mochiProps} />;
      case IdleExpression.SQUINT:
        return <SquintMochi {...mochiProps} />;
      case IdleExpression.WINK_LEFT:
        return <WinkLeftMochi {...mochiProps} />;
      case IdleExpression.LOVE:
        return <LoveMochi {...mochiProps} />;
      case IdleExpression.DIZZY:
        return <DizzyMochi {...mochiProps} />;
      case IdleExpression.ANGRY:
        return <AngryMochi {...mochiProps} />;
      case IdleExpression.CONFUSED:
        return <ConfusedMochi {...mochiProps} />;
      case IdleExpression.SLEEPY:
        return <SleepyMochi {...mochiProps} />;
      case IdleExpression.PROUD:
        return <ProudMochi {...mochiProps} />;
      case IdleExpression.KAWAII:
        return <KawaiiMochi {...mochiProps} />;
      case IdleExpression.NORMAL:
      default:
        return <NormalMochi {...mochiProps} />;
    }
  };

  const renderMochi = () => {
    switch (state) {
      case MochiState.IDLE:
        const idleMochi = renderIdleMochi();
        return React.cloneElement(idleMochi, { isIdle: true });
      case MochiState.LISTENING:
        return <ListeningMochi {...mochiProps} />;
      case MochiState.THINKING:
        return <ThinkingMochi {...mochiProps} />;
      case MochiState.SPEAKING:
        return <SpeakingMochi {...mochiProps} />;
      case MochiState.LOADING:
      // FIX: Add missing state to the enum to fix the error.
      case MochiState.ENTERING_DEEP_SLEEP:
        return <LoadingMochi {...mochiProps} />;
      case MochiState.ERROR:
        return <ErrorMochi {...mochiProps} />;
      default:
        return <NormalMochi {...mochiProps} />;
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center cursor-pointer"
      onDoubleClick={onDoubleClick}
    >
      <div className="w-64 h-64 md:w-80 md:h-80">
        {renderMochi()}
      </div>

      {/* Placeholder for text to prevent layout shift */}
      <div className="h-8 flex items-center justify-center" aria-live="polite"> 
        {state === MochiState.LISTENING && (
          <>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider animate-pulse-subtle">
              đang lắng nghe
            </p>
            <style>{`
              @keyframes pulse-subtle {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
              }
              .animate-pulse-subtle {
                animation: pulse-subtle 2s ease-in-out infinite;
              }
            `}</style>
          </>
        )}
      </div>
    </div>
  );
};

export default MochiDisplay;