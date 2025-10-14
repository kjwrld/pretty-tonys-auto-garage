import { useState, useEffect, useRef, useCallback } from 'react';

interface MousePosition {
  x: number;
  y: number;
  xPercent: number;
  yPercent: number;
  isHovering: boolean;
}

export function useMouseTracking() {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    xPercent: 50,
    yPercent: 50,
    isHovering: false,
  });
  
  const elementRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!elementRef.current) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const xPercent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const yPercent = Math.max(0, Math.min(100, (y / rect.height) * 100));

      setMousePosition({
        x,
        y,
        xPercent,
        yPercent,
        isHovering: true,
      });
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setMousePosition(prev => ({ ...prev, isHovering: true }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    setMousePosition(prev => ({ 
      ...prev, 
      xPercent: 50, 
      yPercent: 50, 
      isHovering: false 
    }));
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove, { passive: true });
      element.addEventListener('mouseenter', handleMouseEnter, { passive: true });
      element.addEventListener('mouseleave', handleMouseLeave, { passive: true });
      
      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave]);

  return { mousePosition, elementRef };
}