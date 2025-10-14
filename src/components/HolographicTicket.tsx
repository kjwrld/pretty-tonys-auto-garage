import { useMouseTracking } from '../hooks/useMouseTracking';
import { HolographicLayer } from './HolographicLayer';
import { TicketContent } from './TicketContent';

interface HolographicTicketProps {
  title?: string;
  status?: string;
  pricing?: string;
  discount?: string;
  className?: string;
  width?: number;
  height?: number;
}

export function HolographicTicket({
  title,
  status,
  pricing,
  discount,
  className = "",
  width = 300,
  height = 200
}: HolographicTicketProps) {
  const { mousePosition, elementRef } = useMouseTracking();

  return (
    <div
      ref={elementRef}
      className={`relative overflow-hidden rounded-lg border-2 border-black bg-black cursor-pointer transform transition-transform hover:scale-105 ${className}`}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        perspective: '1000px'
      }}
    >
      {/* Base Silver Background with Red Brackets */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400">
        {/* Red Corner Brackets on base layer */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-red-500" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-red-500" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-red-500" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-red-500" />
      </div>
      
      {/* Holographic Layers - Commented out for now */}
      {/* <HolographicLayer
        type="galaxy"
        mouseX={mousePosition.xPercent}
        mouseY={mousePosition.yPercent}
        opacity={0.8}
        blendMode="color-dodge"
      />
      
      <HolographicLayer
        type="rainbow"
        mouseX={mousePosition.xPercent}
        mouseY={mousePosition.yPercent}
        opacity={0.7}
        blendMode="color-burn"
      />
      
      <HolographicLayer
        type="shine"
        mouseX={mousePosition.xPercent}
        mouseY={mousePosition.yPercent}
        opacity={0.5}
      /> */}

      {/* Content */}
      <TicketContent
        title={title}
        status={status}
        pricing={pricing}
        discount={discount}
      />

      {/* 3D Tilt Effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `rotateY(${(mousePosition.xPercent - 50) * 0.1}deg) rotateX(${(50 - mousePosition.yPercent) * 0.1}deg)`,
          transformStyle: 'preserve-3d',
        }}
      />
    </div>
  );
}