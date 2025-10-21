import React, { useState, useEffect, useRef, useCallback } from 'react';

interface MochiProps {
  speed: number;
}

// NEW DESIGN: Professor Mochi
const MochiBase: React.FC<React.PropsWithChildren<MochiProps & { isIdle?: boolean }>> = ({ children, speed, isIdle }) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full transition-transform duration-300 transform hover:scale-105"
    style={{ '--animation-duration': `${speed}s` } as React.CSSProperties}
  >
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="4" stdDeviation="2" floodColor="#000000" floodOpacity="0.2"/>
      </filter>
    </defs>
    <g filter="url(#shadow)" className={isIdle ? 'animate-sway' : ''}>
      <g className="animate-squish">
        {/* Head */}
        <path
          d="M 20,85 C 10,85 10,75 10,65 L 10,25 C 10,15 20,5 30,5 L 70,5 C 80,5 90,15 90,25 L 90,65 C 90,75 80,85 70,85 Z"
          fill="white"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
        {/* Collar */}
        <path d="M 40,83 L 35,90 L 65,90 L 60,83 Z" fill="#F3F4F6" />
        {/* Bowtie */}
        <path d="M 50 83 L 40 77 L 40 89 Z" fill="#3B82F6" />
        <path d="M 50 83 L 60 77 L 60 89 Z" fill="#3B82F6" />
        <circle cx="50" cy="83" r="3" fill="#2563EB" />
      </g>
    </g>
    {children}
    <style>{`
      @keyframes squish {
        0%, 100% { transform: scale(1, 1) translateY(0); }
        50% { transform: scale(1.03, 0.97) translateY(1.5px); }
      }
      .animate-squish {
        animation: squish var(--animation-duration) ease-in-out infinite;
        transform-origin: bottom center;
      }
      @keyframes sway {
        0% { transform: rotate(-1.5deg); }
        100% { transform: rotate(1.5deg); }
      }
      .animate-sway {
        animation: sway calc(var(--animation-duration) * 1.5) ease-in-out infinite alternate;
        transform-origin: 50% 90%;
      }
    `}</style>
  </svg>
);


const Eyes: React.FC<{ leftPath: string; rightPath: string }> = ({ leftPath, rightPath }) => (
    <>
        <path d={leftPath} fill="black" />
        <path d={rightPath} fill="black" />
    </>
);

// --- Reusable Eye Components for Professor Mochi ---
const NormalEyes = () => <Eyes leftPath="M 35,45 a 5,5 0 1,1 0,0.1" rightPath="M 65,45 a 5,5 0 1,1 0,0.1" />;
const BlinkEyes = () => <Eyes leftPath="M 30,48 h 10" rightPath="M 60,48 h 10" />;
const HappyEyes = () => (
    <>
        <path d="M 32,45 Q 35,40 38,45" stroke="black" strokeWidth="2.5" fill="none" />
        <path d="M 62,45 Q 65,40 68,45" stroke="black" strokeWidth="2.5" fill="none" />
    </>
);
const LookLeftEyes = () => <Eyes leftPath="M 30,45 a 5,5 0 1,1 0,0.1" rightPath="M 60,45 a 5,5 0 1,1 0,0.1" />;
const LookRightEyes = () => <Eyes leftPath="M 40,45 a 5,5 0 1,1 0,0.1" rightPath="M 70,45 a 5,5 0 1,1 0,0.1" />;
const SquintEyes = () => (
    <>
        <path d="M 30,42 L 40,47 L 30,52" stroke="black" strokeWidth="2.5" fill="none" />
        <path d="M 70,42 L 60,47 L 70,52" stroke="black" strokeWidth="2.5" fill="none" />
    </>
);
const WinkLeftEyes = () => (
    <>
        <path d="M 30,48 h 10" stroke="black" strokeWidth="2.5" />
        <path d="M 65,45 a 5,5 0 1,1 0,0.1" fill="black" />
    </>
);

const NeutralMouth = () => <path d="M 45,68 h 10" stroke="black" strokeWidth="2.5" fill="none" />;
const HappyMouth = () => <path d="M 40,65 Q 50,75 60,65" stroke="black" strokeWidth="2.5" fill="none" />;
const SadMouth = () => <path d="M 40,70 Q 50,60 60,70" stroke="black" strokeWidth="2.5" fill="none" />;
const SurprisedMouth = () => <circle cx="50" cy="70" r="7" fill="black"/>;


const weightedListeningEyePool = [
    NormalEyes, NormalEyes, NormalEyes, NormalEyes, NormalEyes, NormalEyes,
    BlinkEyes, BlinkEyes, BlinkEyes,
    LookLeftEyes,
    LookRightEyes,
    HappyEyes,
];
const speakingEyeComponents = [NormalEyes, BlinkEyes, HappyEyes, SquintEyes, WinkLeftEyes];


export const NormalMochi: React.FC<MochiProps> = (props) => (
  <MochiBase {...props}>
    <NormalEyes />
    <NeutralMouth />
  </MochiBase>
);

export const BlinkMochi: React.FC<MochiProps> = (props) => (
  <MochiBase {...props}>
    <BlinkEyes />
    <NeutralMouth />
  </MochiBase>
);

export const LookLeftMochi: React.FC<MochiProps> = (props) => (
    <MochiBase {...props}>
        <LookLeftEyes />
        <NeutralMouth />
    </MochiBase>
);

export const LookRightMochi: React.FC<MochiProps> = (props) => (
    <MochiBase {...props}>
        <LookRightEyes />
        <NeutralMouth />
    </MochiBase>
);

export const HappyMochi: React.FC<MochiProps> = (props) => (
    <MochiBase {...props}>
        <HappyEyes />
        <HappyMouth />
    </MochiBase>
);

export const SadMochi: React.FC<MochiProps> = (props) => (
    <MochiBase {...props}>
        <path d="M 32,50 Q 35,55 38,50" stroke="black" strokeWidth="2.5" fill="none" />
        <path d="M 62,50 Q 65,55 68,50" stroke="black" strokeWidth="2.5" fill="none" />
        <SadMouth />
    </MochiBase>
);

export const SurprisedMochi: React.FC<MochiProps> = (props) => (
    <MochiBase {...props}>
        <circle cx="35" cy="45" r="6" fill="black"/>
        <circle cx="65" cy="45" r="6" fill="black"/>
        <SurprisedMouth />
    </MochiBase>
);

export const SquintMochi: React.FC<MochiProps> = (props) => (
    <MochiBase {...props}>
        <SquintEyes />
        <path d="M 40,65 Q 50,70 60,65" stroke="black" strokeWidth="2.5" fill="none" />
    </MochiBase>
);

export const WinkLeftMochi: React.FC<MochiProps> = (props) => (
    <MochiBase {...props}>
        <WinkLeftEyes />
        <HappyMouth />
    </MochiBase>
);

export const LoveMochi: React.FC<MochiProps> = (props) => (
    <MochiBase {...props}>
        <path d="M0 10 C-5 0, 5 0, 0 5 C5 10, -5 15, 0 10Z" transform="translate(35 40) scale(1.5)" fill="#FF4136" />
        <path d="M0 10 C-5 0, 5 0, 0 5 C5 10, -5 15, 0 10Z" transform="translate(65 40) scale(1.5)" fill="#FF4136" />
        <path d="M 40,70 Q 50,80 60,70" stroke="black" strokeWidth="2.5" fill="none" />
    </MochiBase>
);

export const DizzyMochi: React.FC<MochiProps> = (props) => (
    <MochiBase {...props}>
        <path d="M 30,40 L 40,50 M 40,40 L 30,50" stroke="black" strokeWidth="2.5" />
        <path d="M 60,40 L 70,50 M 70,40 L 60,50" stroke="black" strokeWidth="2.5" />
        <path d="M 45,68 Q 50,72 55,68" stroke="black" strokeWidth="2" fill="none" />
    </MochiBase>
);

export const AngryMochi: React.FC<MochiProps> = (props) => (
    <MochiBase {...props}>
        <path d="M 25,40 L 45,45" stroke="black" strokeWidth="2.5" />
        <path d="M 75,40 L 55,45" stroke="black" strokeWidth="2.5" />
        <Eyes leftPath="M 35,50 a 4,4 0 1,1 0,0.1" rightPath="M 65,50 a 4,4 0 1,1 0,0.1" />
        <path d="M 40,70 Q 50,60 60,70" stroke="black" strokeWidth="2.5" fill="none" />
    </MochiBase>
);

export const ConfusedMochi: React.FC<MochiProps> = (props) => (
    <MochiBase {...props}>
        <path d="M 25,45 L 45,40" stroke="black" strokeWidth="2.5" />
        <path d="M 65,45 a 5,5 0 1,1 0,0.1" fill="black" />
        <path d="M 40,70 C 45,65 55,75 60,70" stroke="black" strokeWidth="2.5" fill="none" />
        <text x="70" y="35" fontSize="20" fill="black" className="animate-fade-question">?</text>
        <style>{`
            @keyframes fade-question {
                0%, 100% { opacity: 0; transform: translateY(5px); }
                50% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-question { animation: fade-question 2s ease-in-out infinite; }
        `}</style>
    </MochiBase>
);

export const SleepyMochi: React.FC<MochiProps> = (props) => (
    <MochiBase {...props}>
        <path d="M 30,50 Q 35,55 40,50" stroke="black" strokeWidth="2" fill="none" />
        <path d="M 60,50 Q 65,55 70,50" stroke="black" strokeWidth="2" fill="none" />
        <path d="M 48,68 Q 50,70 52,68" stroke="black" strokeWidth="2" fill="none" />
    </MochiBase>
);

export const SleepingMochi: React.FC<MochiProps> = (props) => (
  <MochiBase {...props}>
    <path d="M 30,50 Q 35,55 40,50" stroke="black" strokeWidth="2" fill="none" />
    <path d="M 60,50 Q 65,55 70,50" stroke="black" strokeWidth="2" fill="none" />
    <path d="M 48,68 Q 50,70 52,68" stroke="black" strokeWidth="2" fill="none" />
    <g fill="#A0A0A0" opacity="0.8">
        <text x="75" y="45" fontSize="8" className="animate-zzz">z</text>
        <text x="80" y="35" fontSize="10" className="animate-zzz" style={{ animationDelay: '0.5s' }}>Z</text>
        <text x="83" y="25" fontSize="8" className="animate-zzz" style={{ animationDelay: '1s' }}>z</text>
    </g>
    <style>{`
        @keyframes zzz {
            0% { transform: translateY(0) translateX(0); opacity: 0.8; }
            100% { transform: translateY(-20px) translateX(5px); opacity: 0; }
        }
        .animate-zzz {
            animation: zzz 2.5s ease-out infinite;
        }
    `}</style>
  </MochiBase>
);


export const ProudMochi: React.FC<MochiProps> = (props) => (
    <MochiBase {...props}>
        <HappyEyes />
        <path d="M 40,65 C 45,70 55,70 60,65" stroke="black" strokeWidth="2.5" fill="none" />
    </MochiBase>
);

export const KawaiiMochi: React.FC<MochiProps> = (props) => (
    <MochiBase {...props}>
        <circle cx="35" cy="45" r="7" fill="black"/>
        <circle cx="65" cy="45" r="7" fill="black"/>
        <circle cx="32" cy="42" r="2" fill="white"/>
        <circle cx="62" cy="42" r="2" fill="white"/>
        <path d="M 45,65 Q 50,75 55,65" stroke="black" strokeWidth="2.5" fill="none" />
        <circle cx="28" cy="60" r="5" fill="#FFC0CB" opacity="0.8"/>
        <circle cx="72" cy="60" r="5" fill="#FFC0CB" opacity="0.8"/>
    </MochiBase>
);


export const ListeningMochi: React.FC<MochiProps> = (props) => {
    const [EyeComponent, setEyeComponent] = useState(() => NormalEyes);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const changeExpression = () => {
            setEyeComponent(currentEye => {
                let nextEye = currentEye;
                while (nextEye === currentEye) {
                    const randomIndex = Math.floor(Math.random() * weightedListeningEyePool.length);
                    nextEye = weightedListeningEyePool[randomIndex];
                }
                return nextEye;
            });
            timeoutRef.current = window.setTimeout(changeExpression, Math.random() * 2000 + 500);
        };
        
        timeoutRef.current = window.setTimeout(changeExpression, Math.random() * 2000 + 500);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <MochiBase {...props}>
            <EyeComponent />
            <path d="M 45,68 h 10" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round">
                <animate 
                    attributeName="d"
                    dur="calc(var(--animation-duration) / 2)"
                    repeatCount="indefinite"
                    keyTimes="0; 0.5; 1"
                    values="M 45,68 h 10; M 45,68 Q 50,71 55,68; M 45,68 h 10;"
                />
            </path>
        </MochiBase>
    );
};

export const ThinkingMochi: React.FC<MochiProps> = (props) => {
    return (
        <MochiBase {...props}>
            {/* Eyes looking up and to the side */}
            <g>
              <circle cx="32" cy="40" r="4" fill="black" />
              <circle cx="62" cy="40" r="4" fill="black" />
            </g>
            {/* A thoughtful mouth */}
            <path d="M 45,70 Q 50,68 55,70" stroke="black" strokeWidth="2.5" fill="none" />

            {/* A thinking bubble that appears */}
            <g className="animate-think-bubble">
              <circle cx="80" cy="30" r="10" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
              <circle cx="75" cy="45" r="5" fill="white" stroke="#E5E7EB" strokeWidth="1"/>
              <text x="77" y="35" fontSize="10" fill="black">...</text>
            </g>

            <style>{`
                @keyframes think-bubble {
                    0%, 100% { opacity: 0; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1); }
                }
                .animate-think-bubble {
                    animation: think-bubble 3s ease-in-out infinite;
                    transform-origin: 75px 45px;
                }
            `}</style>
        </MochiBase>
    );
};

export const SpeakingMochi: React.FC<MochiProps> = (props) => {
  const [EyeComponent, setEyeComponent] = useState(() => NormalEyes);

  useEffect(() => {
      const interval = setInterval(() => {
          const randomIndex = Math.floor(Math.random() * speakingEyeComponents.length);
          setEyeComponent(() => speakingEyeComponents[randomIndex]);
      }, 1000); // Change expression every 1 second while speaking

      return () => clearInterval(interval);
  }, []);
    
  return (
    <MochiBase {...props}>
      <EyeComponent />
      <path d="M 40,70 Q 50,70 60,70" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <animate 
          attributeName="d"
          dur="0.35s"
          repeatCount="indefinite"
          keyTimes="0; 0.25; 0.5; 0.75; 1"
          values="
            M 40,70 Q 50,70 60,70; 
            M 40,70 Q 50,82 60,70; 
            M 42,72 Q 50,75 58,72; 
            M 40,70 Q 50,82 60,70; 
            M 40,70 Q 50,70 60,70;"
        />
      </path>
    </MochiBase>
  );
};

export const LoadingMochi: React.FC<MochiProps> = (props) => (
    <MochiBase {...props}>
        <NormalEyes />
        <NeutralMouth />
        {/* A spinning bowtie for loading */}
        <g>
            <animateTransform attributeName="transform" type="rotate" from="0 50 83" to="360 50 83" dur="1s" repeatCount="indefinite" />
            <path d="M 50 83 L 40 77 L 40 89 Z" fill="#3B82F6" />
            <path d="M 50 83 L 60 77 L 60 89 Z" fill="#3B82F6" />
            <circle cx="50" cy="83" r="3" fill="#2563EB" />
        </g>
    </MochiBase>
);

export const ErrorMochi: React.FC<MochiProps> = (props) => (
    <MochiBase {...props}>
        <path d="M 30,40 L 40,50 M 40,40 L 30,50" stroke="black" strokeWidth="2.5" />
        <path d="M 60,40 L 70,50 M 70,40 L 60,50" stroke="black" strokeWidth="2.5" />
        <SadMouth />
    </MochiBase>
);

export const DeepSleepMochi: React.FC<MochiProps> = (props) => (
    <div className="w-64 h-64 md:w-80 md:h-80">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <g className="animate-pulse-slow">
            {/* Head */}
            <path
              d="M 20,85 C 10,85 10,75 10,65 L 10,25 C 10,15 20,5 30,5 L 70,5 C 80,5 90,15 90,25 L 90,65 C 90,75 80,85 70,85 Z"
              fill="#1F2937"
              stroke="#4B5563"
              strokeWidth="1"
            />
            {/* Collar */}
            <path d="M 40,83 L 35,90 L 65,90 L 60,83 Z" fill="#374151" />
            {/* Bowtie */}
            <path d="M 50 83 L 40 77 L 40 89 Z" fill="#4B5563" />
            <path d="M 50 83 L 60 77 L 60 89 Z" fill="#4B5563" />
            <circle cx="50" cy="83" r="3" fill="#6B7280" />
            
            {/* Static, normal eyes */}
            <path d="M 35,45 a 5,5 0 1,1 0,0.1" fill="#4B5563" />
            <path d="M 65,45 a 5,5 0 1,1 0,0.1" fill="#4B5563" />
            {/* Simple neutral mouth */}
            <path d="M 45,68 h 10" stroke="#4B5563" strokeWidth="2.5" />
        </g>
        <style>{`
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.9; }
            50% { opacity: 0.5; }
          }
          .animate-pulse-slow {
            animation: pulse-slow 8s ease-in-out infinite;
          }
        `}</style>
      </svg>
    </div>
  );