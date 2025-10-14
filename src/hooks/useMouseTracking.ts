import { useState, useEffect, useRef } from 'react';

interface MousePosition {
  x: number;
  y: number;
  xPercent: number;
  yPercent: number;
}

export function useMouseTracking() {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    xPercent: 50,
    yPercent: 50,
  });
  
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;

      setMousePosition({
        x,
        y,
        xPercent: Math.max(0, Math.min(100, xPercent)),
        yPercent: Math.max(0, Math.min(100, yPercent)),
      });
    };

    const element = elementRef.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
      return () => element.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return { mousePosition, elementRef };
}