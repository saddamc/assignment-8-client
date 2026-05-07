"use client";

import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/hooks/useCartStore";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AddToCartButton({ product }: { product: any }) {
    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || '',
            category: product.category?.name || 'Uncategorized',
        }, 1);
        toast.success(`Added ${product.name} to cart`);
    };

    return (
        <Button 
            onClick={handleAddToCart}
            size="lg" 
            className="flex-1 rounded-full text-lg h-14 bg-zinc-900 text-white hover:bg-zinc-800"
        >
            <ShoppingBag className="w-5 h-5 mr-2" /> Add to Cart
        </Button>
    );
}
