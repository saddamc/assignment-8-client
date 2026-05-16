"use client";

import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/hooks/useCartStore";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AddToCartButton({ product }: { product: any }) {
    const addItem = useCartStore((state) => state.addItem);
    const { items } = useCartStore();

    const handleAddToCart = () => {
        // Check if product is in stock
        if (!product.stock || product.stock <= 0) {
            toast.error("This product is out of stock");
            return;
        }

        // Check current cart quantity for this product
        const existingItem = items.find(item => item.productId === product.id);
        const currentQuantity = existingItem ? existingItem.quantity : 0;

        // Check if adding would exceed the limit
        if (currentQuantity >= 5) {
            toast.error("You can only have up to 5 of this item in your cart");
            return;
        }

        addItem({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '',
            category: product.category?.name || 'Uncategorized',
        }, 1);
        toast.success(`Added ${product.name} to cart`);
    };

    const isOutOfStock = !product.stock || product.stock <= 0;
    const currentQuantity = items.find(item => item.productId === product.id)?.quantity || 0;
    const isMaxReached = currentQuantity >= 5;

    return (
        <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isMaxReached}
            size="lg"
            className="flex-1 rounded-full text-lg h-14 bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-400 disabled:cursor-not-allowed"
        >
            <ShoppingBag className="w-5 h-5 mr-2" />
            {isOutOfStock ? "Out of Stock" : isMaxReached ? "Max Limit Reached" : "Add to Cart"}
        </Button>
    );
}
