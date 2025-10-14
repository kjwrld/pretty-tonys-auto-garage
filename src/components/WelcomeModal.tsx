import { X, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useMouseTracking } from "../hooks/useMouseTracking";

interface WelcomeModalProps {
    onClose: () => void;
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
    // Your blob video URLs
    const portraitVideoUrl =
        "https://nrayivs88v89b9qt.public.blob.vercel-storage.com/10percenttone.mp4";
    const wideVideoUrl =
        "https://nrayivs88v89b9qt.public.blob.vercel-storage.com/10percenttone_wide.mp4";

    const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [timeLeft, setTimeLeft] = useState("");
    const videoRef = useRef<HTMLVideoElement>(null);
    const { mousePosition, elementRef: ticketRef } = useMouseTracking();

    useEffect(() => {
        const checkScreenSize = () => {
            setIsDesktop(window.innerWidth >= 768);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const saleEndDate = new Date("2025-11-01T00:00:00").getTime();
            const now = new Date().getTime();
            const difference = saleEndDate - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor(
                    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                const minutes = Math.floor(
                    (difference % (1000 * 60 * 60)) / (1000 * 60)
                );
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeLeft("Sale Ended");
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    const toggleMute = () => {
        setIsMuted(false);
        if (videoRef.current) {
            videoRef.current.muted = false;
            videoRef.current.play();
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lato:wght@900&display=swap');
                @keyframes mobileGlare {
                    0% { background-position: -50% 50%; }
                    50% { background-position: 150% 50%; }
                    100% { background-position: -50% 50%; }
                }
                .mobile-glare-animation {
                    animation: mobileGlare 5s ease-in-out infinite;
                }
                .lato-black {
                    font-family: 'Lato', sans-serif;
                    font-weight: 900;
                }
                .watermark-10 {
                    font-family: Inter, sans-serif;
                    -webkit-text-stroke: 2px rgba(255, 255, 255, 0.1);
                    text-shadow: rgba(0, 0, 0, 0.8) 0px 0px 20px;
                    font-size: 4rem;
                    font-weight: 900;
                    opacity: 0.04;
                    transition: opacity 0.3s ease;
                }
                @media (min-width: 768px) {
                    .watermark-10 {
                        font-size: 8rem;
                    }
                }
            `}</style>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div
                    className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden border-4 border-black modal-expand"
                    style={{ backgroundColor: "#0244fd" }}
                >
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
                            className={`relative mx-auto mb-4 md:mb-6 overflow-hidden ${
                                isDesktop
                                    ? "max-w-none"
                                    : "aspect-[9/16] max-w-[200px] max-h-[356px]"
                            }`}
                            style={{
                                aspectRatio: isDesktop
                                    ? "1620/1080"
                                    : undefined,
                            }}
                        >
                            {/* Conditionally render only the appropriate video */}
                            {isDesktop === null ? (
                                /* Loading state with fallback image */
                                <ImageWithFallback
                                    src="https://images.unsplash.com/photo-1549047608-55b2fd4b8427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvJTIwZ2FyYWdlJTIwc2hvcCUyMGludGVyaW9yfGVufDF8fHx8MTc1OTk1ODQxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                                    alt="Pretty Tony's Auto Garage"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted={isMuted}
                                    loop
                                    playsInline
                                    preload="metadata"
                                    className="w-full h-full object-cover"
                                >
                                    <source
                                        src={
                                            isDesktop
                                                ? wideVideoUrl
                                                : portraitVideoUrl
                                        }
                                        type="video/mp4"
                                    />
                                    {/* Fallback to image if video fails */}
                                    <ImageWithFallback
                                        src="https://images.unsplash.com/photo-1549047608-55b2fd4b8427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvJTIwZ2FyYWdlJTIwc2hvcCUyMGludGVyaW9yfGVufDF8fHx8MTc1OTk1ODQxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                                        alt="Pretty Tony's Auto Garage"
                                        className="w-full h-full object-cover"
                                    />
                                </video>
                            )}

                            {/* Technical Overlay */}
                            <div
                                className="absolute inset-0"
                                onClick={toggleMute}
                            >
                                {/* Crosshair */}
                                <div className="absolute top-1/2 left-0 w-full h-px bg-red-500/30 grid-pulse pointer-events-none" />
                                <div className="absolute top-0 left-1/2 w-px h-full bg-red-500/30 grid-pulse pointer-events-none" />

                                {/* Corner Markers - Mobile Only */}
                                {!isDesktop && (
                                    <>
                                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white/60 pointer-events-none" />
                                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white/60 pointer-events-none" />
                                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white/60 pointer-events-none" />
                                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white/60 pointer-events-none" />
                                    </>
                                )}

                                {/* Centered Mute/Unmute Button - only show when muted */}
                                {isMuted && (
                                    <button
                                        onClick={toggleMute}
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 border-2 border-white/80 bg-white/20 hover:bg-white/30 hover:border-white transition-all group backdrop-blur-sm"
                                        aria-label="Unmute video"
                                    >
                                        <VolumeX className="w-8 h-8 text-white" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sale End Timer */}
                        <div className="text-center mb-3 md:mb-4">
                            <div className="text-sm md:text-base text-white/60 uppercase tracking-widest lato-black mb-1">
                                SALE ENDS SOON!
                            </div>
                            <div className="text-xl md:text-2xl text-white lato-black uppercase tracking-wide">
                                {timeLeft}
                            </div>
                        </div>

                        {/* Special Offer Section */}
                        <div className="space-y-3 md:space-y-6">
                            <div
                                ref={ticketRef}
                                className="p-3 md:p-6 relative overflow-hidden border-2"
                                style={{
                                    backgroundColor: "#dc2626",
                                    backgroundImage: "none",
                                    borderRadius: "8px",
                                    borderColor: "rgba(224,224,224, 0.6)",
                                    transform: isDesktop
                                        ? `perspective(1000px) rotateX(${
                                              (mousePosition.yPercent - 50) *
                                              0.15
                                          }deg) rotateY(${
                                              (mousePosition.xPercent - 50) *
                                              0.15
                                          }deg)`
                                        : "none",
                                    transformStyle: "preserve-3d",
                                    transition: mousePosition.isHovering
                                        ? "transform 0.1s ease-out"
                                        : "transform 0.5s ease-out",
                                }}
                            >
                                {/* Small Corner Brackets */}
                                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500 bracket-pulse" />
                                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500 bracket-pulse" />
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500 bracket-pulse" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500 bracket-pulse" />

                                {/* Cosmos Holo Layer - Base Galaxy with Shine */}
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        backgroundImage: `
                                        url(/src/assets/galaxy.webp),
                                        radial-gradient(
                                            farthest-corner circle at ${mousePosition.xPercent}% ${mousePosition.yPercent}%, 
                                            hsla(180, 100%, 89%, 0.2) 5%, 
                                            hsla(180, 14%, 57%, 0.15) 40%, 
                                            hsl(0, 0%, 0%) 130%
                                        )
                                    `,
                                        backgroundBlendMode:
                                            "color-burn, multiply",
                                        backgroundPosition:
                                            "center center, center center",
                                        backgroundSize: "cover, cover",
                                        mixBlendMode: "screen",
                                        opacity: 0.15,
                                        filter: "brightness(1) contrast(1) saturate(0.8)",
                                        willChange: "background-image",
                                    }}
                                />

                                {/* Watermark 10s Layer */}
                                <div
                                    className="absolute inset-0 pointer-events-none flex items-center justify-between px-4"
                                    style={{
                                        mixBlendMode: "screen",
                                    }}
                                >
                                    {/* Left 10 */}
                                    <div className="watermark-10 text-white select-none">
                                        10
                                    </div>
                                    {/* Right 10 */}
                                    <div className="watermark-10 text-white select-none">
                                        10
                                    </div>
                                </div>

                                {/* Glare Layer */}
                                <div
                                    className={`absolute inset-0 pointer-events-none ${
                                        !isDesktop
                                            ? "mobile-glare-animation"
                                            : ""
                                    }`}
                                    style={{
                                        background: `linear-gradient(
                                        115deg,
                                        transparent 0%,
                                        transparent 25%,
                                        rgba(0, 231, 255, 0.7) 45%,
                                        rgba(255, 0, 231, 0.7) 55%,
                                        transparent 70%,
                                        transparent 100%
                                    )`,
                                        backgroundPosition: isDesktop
                                            ? `${mousePosition.xPercent}% ${mousePosition.yPercent}%`
                                            : "0% 0%",
                                        backgroundSize: "300% 300%",
                                        mixBlendMode: "color-dodge",
                                        opacity: 0.25,
                                        willChange: isDesktop
                                            ? "background-position"
                                            : "none",
                                    }}
                                />

                                {/* Shine Layer */}
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        background: `radial-gradient(
                                        farthest-corner circle at ${mousePosition.xPercent}% ${mousePosition.yPercent}%, 
                                        hsla(204, 100%, 95%, 0.6) 5%, 
                                        hsla(250, 15%, 20%, 0) 150%
                                    )`,
                                        mixBlendMode: "overlay",
                                        opacity: 0.4,
                                        zIndex: 3,
                                        willChange: "background",
                                    }}
                                />

                                <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
                                    <div className="h-px w-8 md:w-12 bg-white/30" />
                                    <span className="text-[10px] text-white uppercase tracking-wider font-bold">
                                        Special Offer
                                    </span>
                                    <span className="text-white pulse-white font-bold">
                                        ●
                                    </span>
                                    <span className="text-[10px] text-white uppercase tracking-wider font-bold">
                                        Active
                                    </span>
                                    <div className="h-px w-8 md:w-12 bg-white/30" />
                                </div>

                                <div className="text-center mb-2 md:mb-4">
                                    <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 mb-1 md:mb-2">
                                        <span className="text-white/70 uppercase tracking-wider text-[10px] md:text-sm font-bold">
                                            Standard Pricing
                                        </span>
                                        <div className="hidden md:block w-8 h-px bg-white/50" />
                                        <span
                                            className="text-xl md:text-3xl text-white uppercase tracking-tight font-black"
                                            style={{ fontWeight: 900 }}
                                        >
                                            10% OFF
                                        </span>
                                    </div>
                                </div>
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
        </>
    );
}
