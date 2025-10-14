interface TicketContentProps {
  title?: string;
  status?: string;
  pricing?: string;
  discount?: string;
  className?: string;
}

export function TicketContent({
  title = "Special Offer",
  status = "Active", 
  pricing = "Standard Pricing",
  discount = "10% OFF",
  className = ""
}: TicketContentProps) {
  return (
    <div className={`relative z-10 p-6 text-center space-y-4 ${className}`}>
      {/* Header Section */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="h-px w-8 bg-white/30" />
        <span className="text-[10px] text-white/70 uppercase tracking-wider">
          {title}
        </span>
        <span className="text-red-500 pulse-red text-sm">●</span>
        <span className="text-[10px] text-red-500 uppercase tracking-wider font-bold">
          {status}
        </span>
        <div className="h-px w-8 bg-white/30" />
      </div>

      {/* Pricing Section */}
      <div className="space-y-2">
        <div className="text-center">
          <span className="text-white/50 uppercase tracking-wider text-sm">
            {pricing}
          </span>
        </div>
        
        <div className="text-center">
          <span 
            className="text-3xl text-red-500 uppercase tracking-tight font-black drop-shadow-lg"
            style={{ 
              textShadow: '0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)',
              fontWeight: 900 
            }}
          >
            {discount}
          </span>
        </div>
      </div>

    </div>
  );
}