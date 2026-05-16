import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartService, CartItem as APICartItem } from '@/services/cart/cart.service';
import { useAuthStore } from './useAuthStore';
import { toast } from 'sonner';

// Dedup: if a sync is already in-flight, return the same promise instead of firing a second request
let pendingSync: Promise<void> | null = null;

const getFinalProductPrice = (product: {
    price: number;
    discountPrice?: number | null;
    discount?: number | null;
}) => {
    if (
        typeof product.discountPrice === "number" &&
        product.discountPrice > 0 &&
        product.discountPrice < product.price
    ) {
        return product.discountPrice;
    }

    if (typeof product.discount === "number" && product.discount > 0) {
        return product.price * (1 - product.discount / 100);
    }

    return product.price;
};

export interface CartItem {
    id: string; // product id for local compatibility
    productId: string;
    name: string;
    price: number;
    image: string;
    category: string;
    slug?: string;
    size?: string;
    variantId?: string;
    quantity: number;
    cartItemId?: string; // backend cart item id
}

const getLineKey = (productId: string, size?: string) => `${productId}::${(size || "").trim()}`;

interface CartState {
    items: CartItem[];
    isLoading: boolean;
    isSynced: boolean;
    paymentCompletedAt: number | null; // Timestamp when payment was completed
    addItem: (item: Omit<CartItem, 'quantity' | 'cartItemId'>, quantity?: number) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    updateQuantity: (id: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    setPaymentCompleted: () => void; // Mark payment as completed
    syncWithBackend: () => Promise<void>;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isLoading: false,
            isSynced: false,
            paymentCompletedAt: null,
            
            addItem: async (newItem, quantity = 1) => {
                const authStore = useAuthStore.getState();
                if (!authStore.isAuthenticated || authStore.user?.role !== "CUSTOMER") {
                    // Fallback to local storage if not authenticated or not a customer
                    set((state) => {
                        const lineId = getLineKey(newItem.id, newItem.size);
                        const existingItem = state.items.find(item => item.id === lineId);
                        if (existingItem) {
                            return {
                                items: state.items.map(item =>
                                    item.id === lineId
                                        ? { ...item, quantity: item.quantity + quantity }
                                        : item
                                )
                            };
                        }
                        return {
                            items: [
                                ...state.items,
                                {
                                    ...newItem,
                                    id: lineId,
                                    productId: newItem.id,
                                    quantity
                                }
                            ]
                        };
                    });
                    return;
                }

                try {
                    set({ isLoading: true });
                    await cartService.addToCart(newItem.id, quantity, {
                        size: newItem.size,
                        variantId: newItem.variantId,
                    });
                    await get().syncWithBackend();
                    toast.success("Item added to cart!");
                } catch (error: any) {
                    // Handle specific error messages from server
                    if (error.message?.includes("Insufficient stock")) {
                        toast.error("Insufficient stock for this item");
                    } else if (error.message?.includes("max limit") || error.message?.includes("only add up to")) {
                        toast.error("You can only have up to 5 of this item in your cart");
                    } else {
                        toast.error("Failed to add item to cart");
                    }
                    console.error(error);
                } finally {
                    set({ isLoading: false });
                }
            },
            
            removeItem: async (id) => {
                const authStore = useAuthStore.getState();
                if (!authStore.isAuthenticated || authStore.user?.role !== "CUSTOMER") {
                    // Fallback to local storage
                    set((state) => ({
                        items: state.items.filter(item => item.id !== id)
                    }));
                    return;
                }

                try {
                    set({ isLoading: true });
                    const cartItem = get().items.find(item => item.id === id);
                    if (cartItem?.cartItemId) {
                        await cartService.removeFromCart(cartItem.cartItemId);
                    }
                    await get().syncWithBackend();
                    toast.success("Item removed from cart!");
                } catch (error) {
                    toast.error("Failed to remove item from cart");
                    console.error(error);
                } finally {
                    set({ isLoading: false });
                }
            },
            
            updateQuantity: async (id, quantity) => {
                const authStore = useAuthStore.getState();
                if (!authStore.isAuthenticated) {
                    // Fallback to local storage
                    set((state) => ({
                        items: state.items.map(item =>
                            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
                        )
                    }));
                    return;
                }

                try {
                    set({ isLoading: true });
                    const cartItem = get().items.find(item => item.id === id);
                    if (cartItem?.cartItemId) {
                        await cartService.updateCartItem(cartItem.cartItemId, quantity);
                    }
                    await get().syncWithBackend();
                } catch (error: any) {
                    // Handle specific error messages from server
                    if (error.message?.includes("Insufficient stock")) {
                        toast.error("Insufficient stock for this item");
                    } else if (error.message?.includes("max limit") || error.message?.includes("only have up to")) {
                        toast.error("You can only have up to 5 of this item in your cart");
                    } else {
                        toast.error("Failed to update item quantity");
                    }
                    console.error(error);
                } finally {
                    set({ isLoading: false });
                }
            },
            
            clearCart: async () => {
                const authStore = useAuthStore.getState();
                if (!authStore.isAuthenticated || authStore.user?.role !== "CUSTOMER") {
                    // Fallback to local storage
                    set({ items: [] });
                    return;
                }

                try {
                    set({ isLoading: true });
                    await cartService.clearCart();
                    set({ items: [] });
                    toast.success("Cart cleared!");
                } catch (error) {
                    toast.error("Failed to clear cart");
                    console.error(error);
                } finally {
                    set({ isLoading: false });
                }
            },

            setPaymentCompleted: () => {
                set({ paymentCompletedAt: Date.now() });
            },

            syncWithBackend: async () => {
                const authStore = useAuthStore.getState();
                if (!authStore.isAuthenticated || authStore.user?.role !== "CUSTOMER") {
                    set({ isSynced: false });
                    return;
                }

                const state = get();
                // Don't sync if payment was completed recently (within last 30 seconds)
                // This prevents cart items from reappearing after successful payment
                if (state.paymentCompletedAt && (Date.now() - state.paymentCompletedAt) < 30000) {
                    set({ isSynced: true });
                    return;
                }

                // If a sync is already in-flight, reuse it instead of firing another request
                if (pendingSync) return pendingSync;

                pendingSync = (async () => {
                    try {
                        const cart = await cartService.getMyCart();
                        const serverItems: CartItem[] = cart.items.map((item: APICartItem) => ({
                            id: getLineKey(item.productId, item.size),
                            productId: item.productId,
                            name: item.product.name,
                            price: getFinalProductPrice(item.product),
                            image: item.product.images[0] || '',
                            category: item.product.category.name,
                            slug: item.product.slug ?? undefined,
                            size: item.size || undefined,
                            variantId: item.variantId || undefined,
                            quantity: item.quantity,
                            cartItemId: item.id,
                        }));

                        // Get current local items (items without cartItemId)
                        const currentState = get();
                        const localItems = currentState.items.filter(item => !item.cartItemId);

                        // If we have local items, try to sync them to server first
                        if (localItems.length > 0) {
                            for (const localItem of localItems) {
                                try {
                                    await cartService.addToCart(localItem.productId, localItem.quantity, {
                                        size: localItem.size,
                                        variantId: localItem.variantId,
                                    });
                                } catch (error) {
                                    console.error("Failed to sync local item to server:", error);
                                    // If sync fails, keep the local item
                                    serverItems.push(localItem);
                                }
                            }
                            // Refetch cart after syncing local items
                            const updatedCart = await cartService.getMyCart();
                            const updatedServerItems: CartItem[] = updatedCart.items.map((item: APICartItem) => ({
                                id: getLineKey(item.productId, item.size),
                                productId: item.productId,
                                name: item.product.name,
                                price: getFinalProductPrice(item.product),
                                image: item.product.images[0] || '',
                                category: item.product.category.name,
                                slug: item.product.slug ?? undefined,
                                size: item.size || undefined,
                                variantId: item.variantId || undefined,
                                quantity: item.quantity,
                                cartItemId: item.id,
                            }));
                            set({ items: updatedServerItems, isSynced: true });
                        } else {
                            // No local items, just use server items
                            set({ items: serverItems, isSynced: true });
                        }
                    } catch (error) {
                        console.error("Failed to sync cart:", error);
                        set({ isSynced: false });
                        // On sync failure, keep existing items
                    } finally {
                        pendingSync = null;
                    }
                })();

                return pendingSync;
            },
            
            getTotal: () => {
                const state = get();
                return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
            },
            
            getItemCount: () => {
                const state = get();
                return state.items.reduce((count, item) => count + item.quantity, 0);
            }
        }),
        {
            name: 'luxecommerce-cart-storage',
            partialize: (state) => ({
                items: state.items.filter(item => !item.cartItemId && !state.isSynced), // Only persist unsynced local items
                paymentCompletedAt: state.paymentCompletedAt,
            }),
        }
    )
);
