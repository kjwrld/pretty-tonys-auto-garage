import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Minus, Plus } from "lucide-react";
import { Product, ProductVariant } from "./ProductCard";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { useNavigation } from "../contexts/NavigationContext";

interface ProductPageProps {
    product: Product;
    onAddToCart: (
        productId: string,
        quantity: number,
        variantId?: string
    ) => void;
    onBack: () => void;
}

export function ProductPage({
    product,
    onAddToCart,
    onBack,
}: ProductPageProps) {
    const { getSelectedImageIndex, setSelectedImageIndex } = useNavigation();
    const [selectedImage, setSelectedImage] = useState(() => 
        getSelectedImageIndex(product.id)
    );
    const [selectedVariant, setSelectedVariant] =
        useState<ProductVariant | null>(
            product.variants ? product.variants[0] : null
        );
    const [selectedSize, setSelectedSize] = useState<string | null>(
        product.sizes ? product.sizes[0] : null
    );
    const [quantity, setQuantity] = useState(1);
    const allImages = [product.image, ...product.additionalImages];

    // Save selected image index when it changes
    useEffect(() => {
        setSelectedImageIndex(product.id, selectedImage);
    }, [selectedImage, product.id, setSelectedImageIndex]);

    const currentPrice = selectedVariant
        ? selectedVariant.price
        : product.price;
    const currentOriginalPrice = selectedVariant
        ? selectedVariant.originalPrice
        : product.originalPrice;
    const discount = Math.round(
        ((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100
    );
    const sku = `ITEM-${product.id.padStart(4, "0")}`;

    return (
        <div className="min-h-screen pt-32 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Technical Header */}
                <div className="border-2 border-black/20 p-3 mb-6 boot-up hidden md:block">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] text-black/50 uppercase tracking-wider">
                                PRODUCT_DETAIL
                            </span>
                            <span className="text-[10px] text-red-500">
                                ●VIEWING
                            </span>
                        </div>
                        <span className="text-[10px] text-black/50">{sku}</span>
                    </div>
                    <div className="h-px bg-black/10" />
                </div>

                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 mb-6 border border-black/20 px-4 py-2 hover:border-red-500 hover:text-red-500 transition-all uppercase text-xs tracking-wider text-black"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>[RETURN_TO_CATALOG]</span>
                </button>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <div>
                        {/* Image Counter */}
                        <div className="flex items-center gap-2 mb-3 text-[10px] text-black/50 uppercase tracking-wider">
                            <span>
                                IMG_{selectedImage + 1}/{allImages.length}
                            </span>
                            <div className="h-px flex-1 bg-black/10" />
                            <span>RESOLUTION: 1080x1440</span>
                        </div>

                        {/* Main Image */}
                        <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-white border-2 border-black/20 scan-effect bracket-container">
                            {/* Animated Corner Brackets */}
                            <div
                                className="bracket top-left"
                                style={{ width: "16px", height: "16px" }}
                            />
                            <div
                                className="bracket top-right"
                                style={{ width: "16px", height: "16px" }}
                            />
                            <div
                                className="bracket bottom-left"
                                style={{ width: "16px", height: "16px" }}
                            />
                            <div
                                className="bracket bottom-right"
                                style={{ width: "16px", height: "16px" }}
                            />

                            {/* Crosshair */}
                            <div className="absolute inset-0 z-10 pointer-events-none grid-pulse">
                                <div className="absolute top-1/2 left-0 w-full h-px bg-red-500/20" />
                                <div className="absolute top-0 left-1/2 w-px h-full bg-red-500/20" />
                            </div>

                            {allImages[selectedImage].endsWith(".mp4") ? (
                                <video
                                    src={allImages[selectedImage]}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <ImageWithFallback
                                    src={allImages[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    priority="high"
                                />
                            )}

                            {/* Image Info Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-white/80 border-t border-black/20 p-2 z-10">
                                <div className="flex items-center justify-between text-[8px] text-black/50 uppercase tracking-wider">
                                    <span>VIEW: PRIMARY</span>
                                    <span>FOCUS: AUTO</span>
                                    <span>ZOOM: 100%</span>
                                </div>
                            </div>
                        </div>

                        {/* Thumbnail Images */}
                        <div className="grid grid-cols-3 gap-3">
                            {allImages.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`relative aspect-square overflow-hidden bg-white border-2 transition-all ${
                                        selectedImage === index
                                            ? "border-red-500"
                                            : "border-black/20 hover:border-black/40"
                                    }`}
                                >
                                    {/* Corner Indicator */}
                                    {selectedImage === index && (
                                        <>
                                            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-red-500 z-10" />
                                            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-red-500 z-10" />
                                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-red-500 z-10" />
                                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-red-500 z-10" />
                                        </>
                                    )}
                                    {image.endsWith(".mp4") ? (
                                        <video
                                            src={image}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <ImageWithFallback
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            priority="medium"
                                        />
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-white/70 px-1 py-0.5 text-[8px] text-black/50 text-center">
                                        IMG_{index + 1}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        {/* Product Header */}
                        <div className="border-2 border-black/20 p-4 mb-6 reveal-left">
                            <div className="text-[10px] text-black/50 uppercase tracking-wider mb-2">
                                PRODUCT_DESIGNATION
                            </div>
                            <h1 className="uppercase tracking-wide text-black mb-2">
                                {product.name}
                            </h1>
                            <div className="h-px bg-black/10 my-2" />
                            <p className="text-[10px] text-black/50 uppercase tracking-wider">
                                {product.description}
                            </p>
                        </div>

                        {/* Size Selection */}
                        {product.sizes && (
                            <div className="border-2 border-black/20 p-4 mb-6">
                                <div className="text-[10px] text-black/50 uppercase tracking-wider mb-3">
                                    SELECT_SIZE
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() =>
                                                setSelectedSize(size)
                                            }
                                            className={`border-2 p-3 transition-all uppercase tracking-wider ${
                                                selectedSize === size
                                                    ? "border-red-500 bg-red-500 text-white"
                                                    : "border-black/20 hover:border-black/40 text-black"
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Variant Selection for Raffle Tickets */}
                        {product.variants && (
                            <div className="border-2 border-black/20 p-4 mb-6">
                                <div className="text-[10px] text-black/50 uppercase tracking-wider mb-3">
                                    SELECT_OPTION
                                </div>
                                <div className="space-y-2">
                                    {product.variants.map((variant) => {
                                        const variantDiscount = Math.round(
                                            ((variant.originalPrice -
                                                variant.price) /
                                                variant.originalPrice) *
                                                100
                                        );
                                        return (
                                            <button
                                                key={variant.id}
                                                onClick={() =>
                                                    setSelectedVariant(variant)
                                                }
                                                className={`w-full border-2 p-3 transition-all text-left ${
                                                    selectedVariant?.id ===
                                                    variant.id
                                                        ? "border-red-500 bg-red-500/5"
                                                        : "border-black/20 hover:border-black/40"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="uppercase tracking-wide text-black">
                                                        {variant.name}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {variantDiscount >
                                                            0 && (
                                                            <span className="text-black/40 price-slash text-sm">
                                                                $
                                                                {variant.originalPrice.toFixed(
                                                                    2
                                                                )}
                                                            </span>
                                                        )}
                                                        <span className="text-red-500 tracking-wider">
                                                            $
                                                            {variant.price.toFixed(
                                                                2
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                {variantDiscount > 0 && (
                                                    <div className="text-[10px] text-red-500 uppercase tracking-wider mt-1">
                                                        SAVE {variantDiscount}%
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Price Section */}
                        {!product.variants && (
                            <div className="border-2 border-red-500 bg-red-500/5 p-4 mb-6">
                                <div className="text-[10px] text-black/50 uppercase tracking-wider mb-3">
                                    PRICING_DATA
                                </div>
                                <div className="flex items-baseline gap-4 mb-2">
                                    <div>
                                        <div className="text-[8px] text-black/30 uppercase tracking-wider mb-1">
                                            ORIGINAL
                                        </div>
                                        <span className="text-black/40 price-slash">
                                            ${currentOriginalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-[8px] text-black/30 uppercase tracking-wider mb-1">
                                            CURRENT
                                        </div>
                                        <span className="text-red-500 text-2xl price-fade-in tracking-wider">
                                            ${currentPrice.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                {discount > 0 && (
                                    <div className="flex items-center gap-2 pt-2 border-t border-red-500/30">
                                        <div className="h-px flex-1 bg-red-500/30" />
                                        <span className="bg-red-500 text-white px-3 py-1 uppercase text-xs tracking-wider">
                                            SAVE {discount}%
                                        </span>
                                        <div className="h-px flex-1 bg-red-500/30" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Product Description */}
                        <div className="border border-black/20 p-4 mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[10px] text-black/50 uppercase tracking-wider">
                                    DESCRIPTION
                                </span>
                                <div className="h-px flex-1 bg-black/10" />
                            </div>
                            <p className="text-black/70 text-sm leading-relaxed">
                                {product.longDescription ||
                                    "Premium quality merchandise from Pretty Tony's Auto Garage. Each item is carefully selected to represent our brand and passion for automotive excellence."}
                            </p>
                        </div>

                        {/* Specifications */}
                        <div className="border border-black/20 p-4 mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[10px] text-black/50 uppercase tracking-wider">
                                    SPECIFICATIONS
                                </span>
                                <div className="h-px flex-1 bg-black/10" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-px bg-black/10" />
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-black/50">
                                        STATUS
                                    </span>
                                    <span className="text-red-500">
                                        ●LIMITED_QUANTITY
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quantity Selection */}
                        <div className="border-2 border-black/20 p-4 mb-6">
                            <div className="text-[10px] text-black/50 uppercase tracking-wider mb-3">
                                QUANTITY
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() =>
                                        setQuantity(Math.max(1, quantity - 1))
                                    }
                                    className="border-2 border-black/20 p-3 hover:border-red-500 hover:bg-red-500 hover:text-white transition-all group"
                                >
                                    <Minus className="w-5 h-5" />
                                </button>
                                <div className="flex-1 border-2 border-black/20 p-3 text-center">
                                    <span className="text-2xl tracking-wider text-black">
                                        {quantity}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="border-2 border-black/20 p-3 hover:border-red-500 hover:bg-red-500 hover:text-white transition-all group"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="mt-2 text-[10px] text-black/30 uppercase tracking-wider text-center">
                                MAX: 10
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto">
                            <button
                                onClick={() =>
                                    onAddToCart(
                                        product.id,
                                        quantity,
                                        selectedVariant?.id ||
                                            selectedSize ||
                                            undefined
                                    )
                                }
                                className="w-full border-2 border-black bg-black text-white py-4 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all uppercase tracking-wider flex items-center justify-center gap-3 group"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span>[ADD_TO_CART] ({quantity})</span>
                            </button>
                            <div className="mt-2 flex items-center justify-center gap-2 text-[8px] text-black/30 uppercase tracking-wider">
                                <span>SECURE_CHECKOUT</span>
                                <span>●</span>
                                <span>FREE_SHIPPING</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
