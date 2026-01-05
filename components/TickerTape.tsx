import { useEffect, useRef, useState } from 'react';

interface TickerTapeProps {
  memberCount: number;
  messages?: string[];
}

const TickerTape = ({ memberCount, messages = [] }: TickerTapeProps) => {
  const tickerRef = useRef<HTMLDivElement>(null);
  const [displayMessages, setDisplayMessages] = useState<string[]>([]);

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    // Reset animation on mount
    ticker.style.animation = 'none';
    setTimeout(() => {
      if (ticker) {
        ticker.style.animation = '';
      }
    }, 10);
  }, []);

  useEffect(() => {
    // Update display messages when new messages arrive
    if (messages.length > 0) {
      setDisplayMessages(prev => {
        // Add new messages and keep last 3
        const newMessages = [...prev, ...messages].slice(-3);
        return newMessages;
      });
      
    }
  }, [messages]);

  // Build ticker content
  const tickerContent = [];
  const baseMessage = `Welcome to Shaltabla - Current number of members: ${memberCount}`;
  
  // Add base message
  tickerContent.push(baseMessage);
  
  // Add dynamic messages if any
  if (displayMessages.length > 0) {
    displayMessages.forEach(msg => {
      tickerContent.push(msg);
    });
  }
  
  // Repeat content for seamless scrolling
  const fullContent = [...tickerContent, ...tickerContent, ...tickerContent];

  return (
    <div className="relative w-full overflow-hidden border-t border-b border-[#2a2a2a] py-1.5 md:py-2">
      <div
        ref={tickerRef}
        className="flex whitespace-nowrap animate-scroll"
        style={{
          animation: 'scroll 30s linear infinite',
        }}
      >
        {fullContent.map((text, index) => (
          <span key={index} className="text-xs text-gray-400 mr-12 md:mr-20">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TickerTape;

