import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string; // product id
    name: string;
    price: number;
    image: string;
    category: string;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            
            addItem: (newItem, quantity = 1) => {
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
            },
            
            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter(item => item.id !== id)
                }));
            },
            
            updateQuantity: (id, quantity) => {
                set((state) => ({
                    items: state.items.map(item =>
                        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
                    )
                }));
            },
            
            clearCart: () => set({ items: [] }),
            
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
        }
    )
);
