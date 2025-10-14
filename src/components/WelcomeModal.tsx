import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface WelcomeModalProps {
    onClose: () => void;
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
    // Your blob video URLs
    const portraitVideoUrl =
        "https://nrayivs88v89b9qt.public.blob.vercel-storage.com/10percenttone.mp4";
    const wideVideoUrl =
        "https://nrayivs88v89b9qt.public.blob.vercel-storage.com/10percenttone_wide.mp4";

    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsDesktop(window.innerWidth >= 768);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white border-4 border-black modal-expand">
                {/* Corner Brackets */}
                <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-red-500" />
                <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-red-500" />
                <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-red-500" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-red-500" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 border-2 border-black bg-white hover:bg-red-500 hover:border-red-500 transition-all group"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 text-black group-hover:text-white" />
                </button>

                {/* Content */}
                <div className="p-4 md:p-8">
                    {/* Video - Portrait 9:16 on mobile, custom ratio on desktop */}
                    <div 
                        className={`relative mx-auto mb-4 md:mb-6 overflow-hidden border-2 border-black bg-black ${
                            isDesktop 
                                ? 'max-w-none' 
                                : 'aspect-[9/16] max-w-[200px] max-h-[356px]'
                        }`}
                        style={{
                            aspectRatio: isDesktop ? '1620/1080' : undefined
                        }}
                    >
                        {/* Mobile Portrait Video */}
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-cover md:hidden"
                        >
                            <source src={portraitVideoUrl} type="video/mp4" />
                            {/* Fallback to image if video fails */}
                            <ImageWithFallback
                                src="https://images.unsplash.com/photo-1549047608-55b2fd4b8427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvJTIwZ2FyYWdlJTIwc2hvcCUyMGludGVyaW9yfGVufDF8fHx8MTc1OTk1ODQxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                                alt="Pretty Tony's Auto Garage"
                                className="w-full h-full object-cover"
                            />
                        </video>

                        {/* Desktop Wide Video */}
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-cover hidden md:block"
                        >
                            <source src={wideVideoUrl} type="video/mp4" />
                            {/* Fallback to image if video fails */}
                            <ImageWithFallback
                                src="https://images.unsplash.com/photo-1549047608-55b2fd4b8427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvJTIwZ2FyYWdlJTIwc2hvcCUyMGludGVyaW9yfGVufDF8fHx8MTc1OTk1ODQxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                                alt="Pretty Tony's Auto Garage"
                                className="w-full h-full object-cover"
                            />
                        </video>

                        {/* Technical Overlay */}
                        <div className="absolute inset-0">
                            {/* Crosshair */}
                            <div className="absolute top-1/2 left-0 w-full h-px bg-red-500/30 grid-pulse" />
                            <div className="absolute top-0 left-1/2 w-px h-full bg-red-500/30 grid-pulse" />

                            {/* Corner Markers */}
                            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white/60" />
                            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white/60" />
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white/60" />
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white/60" />
                        </div>
                    </div>

                    {/* Special Offer Section */}
                    <div className="space-y-3 md:space-y-6">
                        <div
                            className="bg-white p-3 md:p-6 relative modal-offer-reveal"
                            style={{ animationDelay: "0.6s" }}
                        >
                            {/* Small Corner Brackets */}
                            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500 bracket-pulse" />
                            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500 bracket-pulse" />
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500 bracket-pulse" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500 bracket-pulse" />

                            <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
                                <div className="h-px w-8 md:w-12 bg-red-500/30" />
                                <span className="text-[10px] text-black/50 uppercase tracking-wider">
                                    Special Offer
                                </span>
                                <span className="text-red-500 pulse-red">
                                    ●
                                </span>
                                <span className="text-[10px] text-red-500 uppercase tracking-wider font-bold">
                                    Active
                                </span>
                                <div className="h-px w-8 md:w-12 bg-red-500/30" />
                            </div>

                            <div className="text-center mb-2 md:mb-4">
                                <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 mb-1 md:mb-2">
                                    <span className="text-black/50 uppercase tracking-wider text-[10px] md:text-sm">
                                        Standard Pricing
                                    </span>
                                    <div className="hidden md:block w-8 h-px bg-red-500" />
                                    <span
                                        className="text-xl md:text-3xl text-red-500 uppercase tracking-tight"
                                        style={{ fontWeight: 900 }}
                                    >
                                        10% OFF
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Enter Button */}
                        <div className="relative group">
                            {/* Button Corner Brackets */}
                            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-red-500 transition-all group-hover:w-8 group-hover:h-8 group-hover:-top-2 group-hover:-left-2" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-red-500 transition-all group-hover:w-8 group-hover:h-8 group-hover:-top-2 group-hover:-right-2" />
                            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-red-500 transition-all group-hover:w-8 group-hover:h-8 group-hover:-bottom-2 group-hover:-left-2" />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-red-500 transition-all group-hover:w-8 group-hover:h-8 group-hover:-bottom-2 group-hover:-right-2" />

                            <button
                                onClick={onClose}
                                className="relative w-full border-4 border-black bg-black text-white py-5 md:py-6 hover:bg-red-500 hover:border-red-500 transition-all duration-300 overflow-hidden"
                            >
                                {/* Scan line effect */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute top-0 left-0 w-full h-px bg-white scan-line" />
                                </div>

                                {/* Button content */}
                                <div className="relative flex items-center justify-center gap-3 md:gap-4">
                                    <span
                                        className="uppercase tracking-[0.2em] md:tracking-[0.3em] text-base md:text-lg"
                                        style={{ fontWeight: 900 }}
                                    >
                                        Enter
                                    </span>
                                </div>

                                {/* Technical markers */}
                                <div className="absolute top-2 right-2 text-[8px] text-white/40 uppercase tracking-wider group-hover:text-white/80 transition-all">
                                    &gt;&gt;
                                </div>
                            </button>
                        </div>

                        {/* System Info */}
                        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 text-[8px] text-black/30 uppercase tracking-wider">
                            <span>SYS_V2.0.25</span>
                            <div className="w-1 h-1 bg-black/20" />
                            <span className="hidden md:inline">
                                All Systems Operational
                            </span>
                            <span className="md:hidden">Ready</span>
                            <div className="w-1 h-1 bg-black/20" />
                            <span className="text-red-500/50">Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
