import React, { useState, useEffect, useRef } from 'react';
import { MochiState } from '../types';

// FIX: Add declarations for Web Speech API to fix TypeScript errors.
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognition {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  abort: () => void;
  stop: () => void;
  start: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  mochiState: MochiState;
}

// Microphone Icon SVG
const MicIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 8.5a.5.5 0 01.5.5v1.5a.5.5 0 01-1 0V9a.5.5 0 01.5-.5z" /><path d="M10 18a5 5 0 005-5h-1.5a3.5 3.5 0 11-7 0H5a5 5 0 005 5z" /></svg>
);

// Send Icon SVG
const SendIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v6.19L6.22 8.22a.75.75 0 00-1.06 1.06l4.5 4.5a.75.75 0 001.06 0l4.5-4.5a.75.75 0 00-1.06-1.06L10.75 11.19V5z" clipRule="evenodd" /></svg>
);


export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, mochiState }) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        console.error('Lỗi nhận dạng giọng nói:', event.error);
        setIsListening(false);
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        onSendMessage(transcript); // Auto-send on result
      };
      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, [onSendMessage]);

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInputText('');
      recognitionRef.current?.start();
    }
  };

  const handleSendClick = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  const isMochiBusy = mochiState === MochiState.THINKING || mochiState === MochiState.SPEAKING;

  return (
    <div className="w-full p-2 bg-gray-900 border-t border-gray-700">
      <div className="flex items-end gap-2 bg-gray-800 rounded-lg p-2">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? 'Đang lắng nghe...' : 'Hỏi Mochi điều gì đó...'}
          className="flex-1 bg-transparent text-white placeholder-gray-400 resize-none border-none focus:outline-none max-h-40"
          rows={1}
          disabled={isMochiBusy}
        />
        <button
          onClick={handleMicClick}
          className={`p-2 rounded-full transition-colors duration-200 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          aria-label="Ghi âm"
          disabled={isMochiBusy}
        >
          <MicIcon />
        </button>
        <button
          onClick={handleSendClick}
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Gửi"
          disabled={!inputText.trim() || isMochiBusy}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};