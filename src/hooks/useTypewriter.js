import { useState, useEffect } from 'react';

export function useTypewriter(text, speed = 12, enabled = true) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled || !text) {
      setDisplay(text || '');
      setDone(true);
      return;
    }
    setDone(false);
    setDisplay('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplay(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, enabled]);

  return { display, done };
}