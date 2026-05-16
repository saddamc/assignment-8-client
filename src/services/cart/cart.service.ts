import { clientFetch } from "@/lib/client-fetch";

export interface CartItem {
    id: string;
    cartId: string;
    productId: string;
    variantId?: string | null;
    size?: string;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    product: {
        id: string;
        name: string;
        price: number;
        discountPrice?: number | null;
        discount?: number;
        images: string[];
        slug?: string;
        category: {
            name: string;
        };
        seller: {
            name: string;
            storeName: string;
        };
    };
}

export interface Cart {
    id: string;
    customerEmail: string;
    createdAt: string;
    updatedAt: string;
    items: CartItem[];
}

export const cartService = {
    getMyCart: async (): Promise<Cart> => {
        const res = await clientFetch("/cart");
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    addToCart: async (
        productId: string,
        quantity: number = 1,
        options?: { size?: string; variantId?: string }
    ): Promise<CartItem> => {
        const res = await clientFetch("/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity, size: options?.size, variantId: options?.variantId }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    updateCartItem: async (cartItemId: string, quantity: number): Promise<CartItem> => {
        const res = await clientFetch(`/cart/${cartItemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    removeFromCart: async (cartItemId: string): Promise<{ message: string }> => {
        const res = await clientFetch(`/cart/${cartItemId}`, {
            method: "DELETE",
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    clearCart: async (): Promise<{ message: string }> => {
        const res = await clientFetch("/cart", {
            method: "DELETE",
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },
};