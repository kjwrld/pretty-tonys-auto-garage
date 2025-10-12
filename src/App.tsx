import { useState, useEffect } from "react";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Navbar } from "./components/Navbar";
import { ProductCard, Product } from "./components/ProductCard";
import { ProductPage } from "./components/ProductPage";
import { TechnicalGrid } from "./components/TechnicalGrid";
import { WelcomeModal } from "./components/WelcomeModal";
import { LoadingScreen } from "./components/LoadingScreen";
import { CartView } from "./components/CartView";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import shirtImage from "./assets/184f8b8fd945e5225c9c915577075c097cc4a131.webp";
import hatImage from "./assets/7ce726552727d9f5c4aa45166cf08eb9db2cc815.webp";
import bannerImage from "./assets/2f04bf86489c8bed8bdae3bfe555bd75f7eba7f1.webp";
import teeBackImage from "./assets/tee_back.webp";
import raffleTicketImage from "./assets/raffle-ticket.webp";

const PRODUCTS: Product[] = [
    {
        id: "1",
        name: "Classic Polo Shirt",
        description: "Premium red polo • Embroidered garage logo",
        longDescription:
            "Premium quality polo shirt featuring the iconic Pretty Tony's Auto Garage embroidered logo. Crafted from high-grade cotton blend for superior comfort and durability. Perfect for garage visits, car meets, or everyday wear. Limited edition design exclusive to our garage.",
        price: 79.99,
        originalPrice: 88.88,
        image: shirtImage,
        additionalImages: [shirtImage, shirtImage],
        sizes: ["S", "M", "L", "XL", "XXL"],
    },
    {
        id: "2",
        name: "Red Racing Hat",
        description: "Snapback cap • Blue car embroidery",
        longDescription:
            "Classic snapback hat in vibrant red with custom blue car embroidery. Adjustable fit with premium stitching and structured crown. Perfect for keeping the sun out while wrenching or cruising. Rep Pretty Tony's Auto Garage in style wherever you go.",
        price: 39.99,
        originalPrice: 44.44,
        image: hatImage,
        additionalImages: [hatImage, hatImage],
    },
    {
        id: "3",
        name: "White Graphic Tee",
        description: "Premium cotton • Bold garage graphics",
        longDescription:
            "Soft premium cotton t-shirt with bold Pretty Tony's Auto Garage graphics. Designed for comfort and style with reinforced stitching and fade-resistant print. The perfect garage wear for enthusiasts who appreciate quality craftsmanship and automotive culture.",
        price: 49.99,
        originalPrice: 55.55,
        image: teeBackImage,
        additionalImages: [
            teeBackImage,
            teeBackImage,
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
    },
    // {
    //     id: "4",
    //     name: "Raffle Tickets",
    //     description: "Win exclusive prizes • Multiple entry options",
    //     longDescription:
    //         "Enter for your chance to win exclusive prizes from Pretty Tony's Auto Garage. Choose from single tickets or value bundles for better odds. Proceeds support our garage community and upcoming automotive events. Winners announced monthly.",
    //     price: 10.0,
    //     originalPrice: 10.0,
    //     image: raffleTicketImage,
    //     additionalImages: [
    //         raffleTicketImage,
    //         raffleTicketImage,
    //     ],
    //     variants: [
    //         {
    //             id: "1-ticket",
    //             name: "1 Ticket",
    //             price: 10.0,
    //             originalPrice: 10.0,
    //         },
    //         {
    //             id: "3-tickets",
    //             name: "3 Tickets",
    //             price: 25.0,
    //             originalPrice: 30.0,
    //         },
    //         {
    //             id: "10-tickets",
    //             name: "10 Tickets",
    //             price: 50.0,
    //             originalPrice: 100.0,
    //         },
    //     ],
    // },
];

export default function App() {
    const [selectedProductId, setSelectedProductId] = useState<string | null>(
        null
    );
    const [cart, setCart] = useState<Map<string, number>>(new Map());
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Show loading screen, then welcome modal
        const loadingTimer = setTimeout(() => {
            setIsLoading(false);
            setShowWelcomeModal(true);
        }, 3000); // 3 second loading screen

        return () => clearTimeout(loadingTimer);
    }, []);

    const selectedProduct = selectedProductId
        ? PRODUCTS.find((p) => p.id === selectedProductId)
        : null;

    const handleAddToCart = (
        productId: string,
        quantity: number,
        variantOrSize?: string
    ) => {
        const cartKey = variantOrSize
            ? `${productId}-${variantOrSize}`
            : productId;
        setCart((prev) => {
            const newCart = new Map(prev);
            const currentCount = newCart.get(cartKey) || 0;
            newCart.set(cartKey, currentCount + quantity);
            return newCart;
        });
        const product = PRODUCTS.find((p) => p.id === productId);
        if (product) {
            let itemName = product.name;

            // Check if it's a variant (raffle tickets)
            if (variantOrSize && product.variants) {
                const variant = product.variants.find(
                    (v) => v.id === variantOrSize
                );
                if (variant) {
                    itemName = `${product.name} - ${variant.name}`;
                }
            }
            // Check if it's a size (shirts)
            else if (variantOrSize && product.sizes) {
                itemName = `${product.name} - Size ${variantOrSize}`;
            }

            toast.success(
                `CART_UPDATE: ${itemName.toUpperCase()} (×${quantity}) ADDED`
            );
        }
    };

    const getTotalCartCount = () => {
        return Array.from(cart.values()).reduce((sum, count) => sum + count, 0);
    };

    const handleBack = () => {
        setSelectedProductId(null);
    };

    const handleLogoClick = () => {
        setSelectedProductId(null);
    };

    const handleUpdateQuantity = (cartKey: string, quantity: number) => {
        if (quantity === 0) {
            handleRemoveItem(cartKey);
        } else {
            setCart((prev) => {
                const newCart = new Map(prev);
                newCart.set(cartKey, quantity);
                return newCart;
            });
        }
    };

    const handleRemoveItem = (cartKey: string) => {
        setCart((prev) => {
            const newCart = new Map(prev);
            newCart.delete(cartKey);
            return newCart;
        });

        // Parse cart key to get product and variant/size info
        const parts = cartKey.split("-");
        const productId = parts[0];
        const variantOrSize =
            parts.length > 1 ? parts.slice(1).join("-") : undefined;

        const product = PRODUCTS.find((p) => p.id === productId);
        if (product) {
            let itemName = product.name;

            // Check if it's a variant (raffle tickets)
            if (variantOrSize && product.variants) {
                const variant = product.variants.find(
                    (v) => v.id === variantOrSize
                );
                if (variant) {
                    itemName = `${product.name} - ${variant.name}`;
                }
            }
            // Check if it's a size (shirts)
            else if (variantOrSize && product.sizes) {
                itemName = `${product.name} - Size ${variantOrSize}`;
            }

            toast.success(`CART_UPDATE: ${itemName.toUpperCase()} REMOVED`);
        }
    };

    return (
        <div className="min-h-screen bg-background relative">
            {isLoading && <LoadingScreen />}

            <TechnicalGrid />

            {showWelcomeModal && (
                <WelcomeModal onClose={() => setShowWelcomeModal(false)} />
            )}

            <Navbar
                cartCount={getTotalCartCount()}
                onCartClick={() => setShowCart(true)}
                onLogoClick={handleLogoClick}
            />

            {selectedProduct ? (
                <ProductPage
                    product={selectedProduct}
                    onAddToCart={handleAddToCart}
                    onBack={handleBack}
                />
            ) : (
                <main className="pt-32 pb-12 px-4 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        {/* Hero Section */}
                        <div className="mb-12 border-2 border-black/20 overflow-hidden reveal-top">
                            {/* Banner Image */}
                            <div className="relative w-full aspect-[2.5/1] border-b-2 border-black/20">
                                <img
                                    src={bannerImage}
                                    alt="10% Off Banner"
                                    className="w-full h-full object-cover"
                                />
                                {/* Corner Brackets */}
                                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-500" />
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-500" />
                                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-500" />
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-500" />
                            </div>

                            {/* Content Section */}
                            <div className="p-8 hidden md:block">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-[10px] text-black/50 uppercase tracking-wider">
                                        CATALOG_V2.0
                                    </div>
                                    <div className="text-[10px] text-red-500">
                                        ●LIVE
                                    </div>
                                </div>
                                <div className="h-px bg-black/10 mb-4" />
                                <h1 className="mb-4 uppercase tracking-wider text-black">
                                    Premium Garage Gear
                                </h1>
                                <p className="text-black/70 max-w-2xl text-sm leading-relaxed">
                                    Exclusive merchandise collection from Pretty
                                    Tony's Auto Garage. Quality meets style with
                                    our limited edition apparel and accessories.
                                </p>
                                <div className="mt-4 flex items-center gap-4 text-[10px] text-black/50 uppercase tracking-wider">
                                    <span>ITEMS: {PRODUCTS.length}</span>
                                    <span>●</span>
                                    <span>CATEGORY: ALL</span>
                                    <span>●</span>
                                    <span>DISCOUNT: ACTIVE</span>
                                </div>
                            </div>
                        </div>

                        {/* Section Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-[10px] text-black/50 uppercase tracking-wider">
                                AVAILABLE_ITEMS
                            </span>
                            <div className="h-px flex-1 bg-black/20" />
                            <span className="text-[10px] text-black/30">
                                SORT: FEATURED
                            </span>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                            {PRODUCTS.map((product, index) => (
                                <div
                                    key={product.id}
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                    }}
                                >
                                    <ProductCard
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                        onClick={setSelectedProductId}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <Footer />
                </main>
            )}

            {showCart && (
                <CartView
                    cart={cart}
                    products={PRODUCTS}
                    onClose={() => setShowCart(false)}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                />
            )}

            <Toaster />
            <Analytics />
            <SpeedInsights />
        </div>
    );
}
