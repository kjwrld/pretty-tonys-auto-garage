interface HolographicLayerProps {
    type: "galaxy" | "rainbow" | "shine";
    mouseX: number;
    mouseY: number;
    opacity?: number;
    blendMode?:
        | "color-dodge"
        | "color-burn"
        | "screen"
        | "overlay"
        | "soft-light";
}

export function HolographicLayer({
    type,
    mouseX,
    mouseY,
    opacity = 0.8,
    blendMode = "color-dodge",
}: HolographicLayerProps) {
    const getLayerStyles = () => {
        const baseStyles = {
            position: "absolute" as const,
            inset: 0,
            opacity,
            mixBlendMode: blendMode,
            pointerEvents: "none" as const,
        };

        switch (type) {
            case "galaxy":
                return {
                    ...baseStyles,
                    backgroundImage:
                        "url(https://raw.githubusercontent.com/simeydotme/pokemon-cards-css/48e319a5138bfed5936247d58c65230b4bb6e3e9/public/img/galaxy.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transform: `translate(${(mouseX - 50) * 0.1}px, ${
                        (mouseY - 50) * 0.1
                    }px)`,
                };

            case "rainbow":
                return {
                    ...baseStyles,
                    backgroundImage:
                        "url(https://raw.githubusercontent.com/simeydotme/pokemon-cards-css/48e319a5138bfed5936247d58c65230b4bb6e3e9/public/img/rainbow.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: `${mouseX}% ${mouseY}%`,
                    transform: `scale(1.1) rotate(${(mouseX - 50) * 0.1}deg)`,
                };

            case "shine":
                return {
                    ...baseStyles,
                    background: `radial-gradient(circle at ${mouseX}% ${mouseY}%, 
            rgba(255, 255, 255, 0.8) 0%, 
            rgba(2, 1, 1, 0.1) 20%, 
            transparent 50%
          )`,
                    mixBlendMode: "screen" as const,
                };

            default:
                return baseStyles;
        }
    };

    return (
        <div
            className="absolute inset-0 transition-all duration-100 ease-out"
            style={getLayerStyles()}
        />
    );
}
