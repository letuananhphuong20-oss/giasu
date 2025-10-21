import React, { useState, useEffect, useCallback, useRef } from 'react';
import MochiDisplay from './components/MochiDisplay';
import { UserInfoForm } from './components/UserInfoForm';
import { MochiState, UserProfile, ChatMessage, Subject } from './types';
import * as geminiService from './services/geminiService';
import * as alarmService from './services/alarmService';
import Clock from './components/Clock';
import { FullscreenButton } from './components/FullscreenButton';
import { ChatLog } from './components/ChatLog';
import { ChatInput } from './components/Controls';

const SubjectSelector: React.FC<{ onSelect: (subject: Subject) => void }> = ({ onSelect }) => (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in p-4">
        <h2 className="text-3xl font-bold text-gray-200 mb-8">Hôm nay chúng ta học môn gì?</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.values(Subject).map((subject) => (
                <button
                    key={subject}
                    onClick={() => onSelect(subject)}
                    className="p-4 bg-gray-800 rounded-lg text-white font-semibold transform hover:scale-105 hover:bg-blue-600 transition-all duration-200"
                >
                    {subject}
                </button>
            ))}
        </div>
    </div>
);


const App: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [mochiState, setMochiState] = useState<MochiState>(MochiState.IDLE);
    const [isAppFullscreen, setIsAppFullscreen] = useState(!!document.fullscreenElement);
    const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [ringingAlarmInfo, setRingingAlarmInfo] = useState<{ label: string; id: number; type: 'alarm' | 'reminder' } | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const appContainerRef = useRef<HTMLDivElement>(null);
    
    // Load user profile from local storage
    useEffect(() => {
        const savedProfile = localStorage.getItem('mochiUserProfile');
        if (savedProfile) {
            setUserProfile(JSON.parse(savedProfile));
        }
    }, []);

    // Function to initialize audio context safely on user gesture
    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            try {
                const newContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                audioContextRef.current = newContext;
            } catch (e) {
                console.error("Không thể tạo AudioContext:", e);
            }
        }
    }, []);

    // Handlers
    const handleProfileSubmit = (profile: UserProfile) => {
        setUserProfile(profile);
        localStorage.setItem('mochiUserProfile', JSON.stringify(profile));
        initAudioContext();
        alarmService.initAlarmAudio();
    };

    const handleSubjectSelect = (subject: Subject) => {
        if (!userProfile) return;
        setChatHistory([]); // Clear history for new subject
        setCurrentSubject(subject);
        geminiService.startChatSession(userProfile, subject);
        setMochiState(MochiState.IDLE);
    };

    const playAudio = useCallback(async (audioData: Uint8Array) => {
        if (!audioContextRef.current || audioContextRef.current.state === 'suspended') {
            await audioContextRef.current?.resume();
        }
        if (!audioContextRef.current) return;

        try {
            const audioBuffer = await geminiService.decodeAudioData(audioData, audioContextRef.current);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start();
            setMochiState(MochiState.SPEAKING);
            source.onended = () => {
                setMochiState(MochiState.IDLE);
            };
        } catch (error) {
            console.error("Lỗi khi phát âm thanh:", error);
            setMochiState(MochiState.IDLE);
        }
    }, []);

    const handleSendMessage = useCallback(async (message: string) => {
        setMochiState(MochiState.THINKING);
        setChatHistory(prev => [...prev, { speaker: 'user', text: message }]);
        
        let streamingMessageIndex = -1;

        const handleChunk = (chunk: string) => {
            setChatHistory(prev => {
                const newHistory = [...prev];
                if (streamingMessageIndex === -1) {
                    streamingMessageIndex = newHistory.length;
                    newHistory.push({ speaker: 'mochi', text: chunk, isStreaming: true });
                } else {
                    newHistory[streamingMessageIndex].text += chunk;
                }
                return newHistory;
            });
        };
        
        const handleComplete = async (fullText: string) => {
            setChatHistory(prev => {
                const newHistory = [...prev];
                if (streamingMessageIndex !== -1) {
                    newHistory[streamingMessageIndex].isStreaming = false;
                }
                return newHistory;
            });
            
            const audioData = await geminiService.textToSpeech(fullText);
            if (audioData) {
                await playAudio(audioData);
            } else {
                setMochiState(MochiState.IDLE);
            }
        };

        try {
            await geminiService.sendMessageStream(message, handleChunk, handleComplete);
        } catch (error) {
            console.error(error);
            setMochiState(MochiState.ERROR);
            setChatHistory(prev => [...prev, { speaker: 'mochi', text: (error as Error).message }]);
        }

    }, [playAudio]);


    const handleStateChange = useCallback((newState: MochiState) => {
        setMochiState(newState);
        if (newState !== MochiState.ALARM_RINGING) {
          setRingingAlarmInfo(null);
        }
      }, []);

    // Register alarm callbacks
    useEffect(() => {
        alarmService.registerCallbacks(
            (label, id, type) => {
                setRingingAlarmInfo({ label, id, type });
            },
            handleStateChange
        );
    }, [handleStateChange]);

    const handleDismissAlarm = useCallback(() => {
        alarmService.stopCurrentAlarm();
    }, []);

    const handleToggleAppFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            appContainerRef.current?.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen().catch(console.error);
        }
    }, []);

    useEffect(() => {
        const syncFullscreenState = () => setIsAppFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', syncFullscreenState);
        return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
    }, []);

    if (!userProfile) {
        return <UserInfoForm onSubmit={handleProfileSubmit} />;
    }
    
    if (mochiState === MochiState.ALARM_RINGING && ringingAlarmInfo) {
        return (
            <div className="flex flex-col items-center justify-around min-h-screen font-sans bg-black p-4 text-white animate-pulse-alarm">
                 <style>{`
                    @keyframes pulse-alarm { 0%, 100% { background-color: #000; } 50% { background-color: #2b0000; } }
                    .animate-pulse-alarm { animation: pulse-alarm 2s ease-in-out infinite; }
                 `}</style>
                 <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-400 mb-4 tracking-widest">BÁO THỨC</h1>
                    <p className="text-3xl mt-8 mb-12 animate-fade-in">{ringingAlarmInfo.label}</p>
                 </div>
                 <Clock variant="aod" />
                 <button
                     onClick={handleDismissAlarm}
                     className="px-12 py-5 text-2xl font-bold text-white bg-red-600 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-red-400"
                 >
                     TẮT
                 </button>
            </div>
        );
    }

    return (
      <div 
        ref={appContainerRef}
        className="flex flex-col items-center justify-center min-h-screen font-sans bg-black text-white outline-none"
        tabIndex={-1}
      >
        <div className="absolute top-4 right-4 z-50">
            <FullscreenButton isFullscreen={isAppFullscreen} onClick={handleToggleAppFullscreen} />
        </div>
        
        <main className="flex flex-col landscape:flex-row w-full h-screen max-w-screen-2xl mx-auto">
            {/* Left/Top Panel: Mochi and Info */}
            <div className="w-full landscape:w-1/3 h-1/2 landscape:h-full flex flex-col items-center justify-center bg-gray-900/30 relative p-4">
                 <MochiDisplay 
                    state={mochiState} 
                    speed={2.5} 
                    delay={1800}
                />
                 {currentSubject && (
                    <div className="absolute bottom-4 left-4 text-left">
                        <button onClick={() => setCurrentSubject(null)} className="text-sm text-gray-400 hover:text-white mb-2">← Đổi môn học</button>
                        <h3 className="text-xl font-bold">{currentSubject}</h3>
                        <p className="text-gray-300">Học sinh: {userProfile.name} ({userProfile.gradeLevel})</p>
                    </div>
                )}
                <div className="absolute top-4 left-4">
                    <Clock variant="chat" />
                </div>
            </div>

            {/* Right/Bottom Panel: Chat Interface */}
            <div className="w-full landscape:w-2/3 h-1/2 landscape:h-full flex flex-col bg-gray-800/50">
                {!currentSubject ? (
                    <SubjectSelector onSelect={handleSubjectSelect} />
                ) : (
                    <>
                        <ChatLog chatHistory={chatHistory} />
                        <ChatInput onSendMessage={handleSendMessage} mochiState={mochiState} />
                    </>
                )}
            </div>
        </main>
      </div>
    );
};

export default App;
