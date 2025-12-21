/** Simplified Textbook Page with Typing Animation for Heading */
import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import FloatingChatButton from '../components/Chatbot/FloatingChatButton';
import '../css/custom.css';

const TypingHeading: React.FC = () => {
  const fullText = 'Wellcome Physical AI';
  const [displayText, setDisplayText] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showCursor, setShowCursor] = useState<boolean>(true);

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 150); // Typing speed: 150ms per character

      return () => clearTimeout(timeout);
    } else {
      // Blinking cursor effect after typing is complete
      const cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);

      return () => clearInterval(cursorInterval);
    }
  }, [currentIndex, fullText]);

  // Reset the animation after it completes (optional - remove if you don't want it to repeat)
  useEffect(() => {
    if (currentIndex === fullText.length) {
      const resetTimeout = setTimeout(() => {
        setDisplayText('');
        setCurrentIndex(0);
        setShowCursor(true);
      }, 3000); // Wait 3 seconds before resetting

      return () => clearTimeout(resetTimeout);
    }
  }, [currentIndex, fullText.length]);

  return (
    <h1
      style={{
        fontSize: '2.5rem',
        color: '#1e88e5',
        marginBottom: '20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        position: 'relative',
        display: 'inline-block'
      }}
    >
      {displayText}
      <span
        style={{
          opacity: showCursor ? 1 : 0,
          transition: 'opacity 0.2s',
          backgroundColor: '#1e88e5',
          width: '2px',
          display: 'inline-block',
          marginLeft: '4px',
          height: '1.2em',
          verticalAlign: 'bottom'
        }}
      />
    </h1>
  );
};

const TextbookPage: React.FC = () => {
  return (
    <Layout title="Wellcome Physical AI" description="Physical AI combines artificial intelligence with robots and sensors to perceive, decide, and act in the real world, enabling machines to interact safely, autonomously, and adaptively with environments and humans.">
      <main style={{ padding: '20px', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <TypingHeading />
        <p style={{ fontSize: '1.2rem', color: '#7f8c8d', maxWidth: '600px', lineHeight: '1.6' }}>
          Physical AI combines artificial intelligence with robots and sensors to perceive, decide, and act in the real world, enabling machines to interact safely, autonomously, and adaptively with environments and humans.
        </p>
        <a
          href="/book/docs/introductory/introduction-to-physical-ai/"
          style={{
            display: 'inline-block',
            marginTop: '30px',
            padding: '15px 30px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: 'white',
            background: 'linear-gradient(145deg, #1e88e5, #0d47a1)',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            textDecoration: 'none',
            boxShadow: '0 6px 12px rgba(30, 136, 229, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLElement;
            target.style.background = 'linear-gradient(145deg, #2196F3, #1565C0)';
            target.style.boxShadow = '0 8px 16px rgba(30, 136, 229, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.4)';
            target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            const target = e.target as HTMLElement;
            target.style.background = 'linear-gradient(145deg, #1e88e5, #0d47a1)';
            target.style.boxShadow = '0 6px 12px rgba(30, 136, 229, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)';
            target.style.transform = 'translateY(0)';
          }}
        >
          Read Book
        </a>
      </main>
    </Layout>
  );
};

export default TextbookPage;