import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface ChatLogProps {
  chatHistory: ChatMessage[];
}

function SimpleMarkdownParser({ text }: { text: string }) {
  const parse = (textToParse: string) => {
    // Escape HTML to prevent XSS
    let escapedText = textToParse
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Code blocks: ```lang\ncode\n``` -> <pre><code>...</code></pre>
    escapedText = escapedText.replace(/```(\w*\n)?([\s\S]*?)```/g, (_match, _lang, code) => {
      return `<pre class="bg-gray-900 p-3 rounded-md my-2 overflow-x-auto"><code class="font-mono text-sm text-white">${code.trim()}</code></pre>`;
    });

    // Inline code: `code` -> <code>...</code>
    escapedText = escapedText.replace(/`([^`]+)`/g, '<code class="bg-gray-700 rounded px-1 py-0.5 font-mono text-sm">$1</code>');

    // Bold: **text** -> <strong>...</strong>
    escapedText = escapedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Unordered lists: * item -> <ul><li>...</li></ul>
    escapedText = escapedText.replace(/^\s*\*\s(.+)/gm, '<ul><li>$1</li></ul>');
    escapedText = escapedText.replace(/<\/ul>\n<ul>/g, ''); // Join consecutive list items

    // Ordered lists: 1. item -> <ol><li>...</li></ol>
    escapedText = escapedText.replace(/^\s*\d+\.\s(.+)/gm, '<ol><li>$1</li></ol>');
    escapedText = escapedText.replace(/<\/ol>\n<ol>/g, ''); // Join consecutive list items
    
    // Newlines to <br> for non-list/preformatted text
    escapedText = escapedText.replace(/\n/g, '<br />');

    // Remove <br> inside pre and lists
    escapedText = escapedText.replace(/<pre(.*?)>(.*?)<\/pre>/gs, (match, attrs, content) => {
        return `<pre${attrs}>${content.replace(/<br \/>/g, '\n')}</pre>`;
    });
     escapedText = escapedText.replace(/<li(.*?)>(.*?)<\/li>/gs, (match, attrs, content) => {
        return `<li${attrs}>${content.replace(/<br \/>/g, '')}</li>`;
    });


    return { __html: escapedText };
  };

  return <div dangerouslySetInnerHTML={parse(text)} />;
}

export const ChatLog: React.FC<ChatLogProps> = ({ chatHistory }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {chatHistory.map((msg, index) => (
        <div key={index} className={`flex items-end gap-2 ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-lg lg:max-w-2xl px-4 py-2 rounded-xl ${
              msg.speaker === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-700 text-white rounded-bl-none'
            }`}
          >
            <div className="prose prose-invert prose-sm max-w-none">
                 <SimpleMarkdownParser text={msg.text} />
                 {msg.isStreaming && <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse" />}
            </div>
          </div>
        </div>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};
