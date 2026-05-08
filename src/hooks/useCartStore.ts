import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartService, CartItem as APICartItem } from '@/services/cart/cart.service';
import { useAuthStore } from './useAuthStore';
import { toast } from 'sonner';

export interface CartItem {
    id: string; // product id for local compatibility
    name: string;
    price: number;
    image: string;
    category: string;
    quantity: number;
    cartItemId?: string; // backend cart item id
}

interface CartState {
    items: CartItem[];
    isLoading: boolean;
    isSynced: boolean;
    addItem: (item: Omit<CartItem, 'quantity' | 'cartItemId'>, quantity?: number) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    updateQuantity: (id: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
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
            
            addItem: async (newItem, quantity = 1) => {
                const authStore = useAuthStore.getState();
                if (!authStore.isAuthenticated || authStore.user?.role !== "CUSTOMER") {
                    // Fallback to local storage if not authenticated or not a customer
                    set((state) => {
                        const existingItem = state.items.find(item => item.id === newItem.id);
                        if (existingItem) {
                            return {
                                items: state.items.map(item =>
                                    item.id === newItem.id
                                        ? { ...item, quantity: item.quantity + quantity }
                                        : item
                                )
                            };
                        }
                        return { items: [...state.items, { ...newItem, quantity }] };
                    });
                    return;
                }

                try {
                    set({ isLoading: true });
                    await cartService.addToCart(newItem.id, quantity);
                    await get().syncWithBackend();
                    toast.success("Item added to cart!");
                } catch (error) {
                    toast.error("Failed to add item to cart");
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
                } catch (error) {
                    toast.error("Failed to update item quantity");
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

            syncWithBackend: async () => {
                const authStore = useAuthStore.getState();
                if (!authStore.isAuthenticated || authStore.user?.role !== "CUSTOMER") {
                    set({ isSynced: false });
                    return;
                }

                try {
                    const cart = await cartService.getMyCart();
                    const items: CartItem[] = cart.items.map((item: APICartItem) => ({
                        id: item.productId,
                        name: item.product.name,
                        price: item.product.price,
                        image: item.product.images[0] || '',
                        category: item.product.category.name,
                        quantity: item.quantity,
                        cartItemId: item.id,
                    }));
                    set({ items, isSynced: true });
                } catch (error) {
                    console.error("Failed to sync cart:", error);
                    set({ isSynced: false });
                }
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
                items: state.items.filter(item => !item.cartItemId), // Only persist local items
            }),
        }
    )
);
