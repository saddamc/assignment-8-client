import { clientFetch } from "@/lib/client-fetch";

export interface OrderItem {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: {
        name: string;
        images: string[];
    };
}

export interface Order {
    id: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    shippingAddress?: string;
    contactNumber?: string;
    createdAt: string;
    updatedAt: string;
    discountAmount: number;
    shippingAmount: number;
    taxAmount: number;
    items: OrderItem[];
    customer?: {
        name: string;
        email: string;
        contactNumber?: string;
        address?: string;
    };
    shipment?: {
        trackingNumber?: string;
        carrier?: string;
        estimatedDelivery?: string;
    };
}

export interface CreateOrderData {
    addressId?: string;
    contactNumber?: string;
    couponCode?: string;
    paymentMethod?: "STRIPE" | "COD";
    notes?: string;
}

export interface UpdateOrderStatusData {
    status: string;
}

export const orderService = {
    createOrder: async (orderData: CreateOrderData): Promise<Order> => {
        const res = await clientFetch("/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    getMyOrders: async (page = 1, limit = 10) => {
        const res = await clientFetch(`/orders/my-orders?page=${page}&limit=${limit}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    getOrderById: async (orderId: string): Promise<Order> => {
        const res = await clientFetch(`/orders/${orderId}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    cancelOrder: async (orderId: string) => {
        const res = await clientFetch(`/orders/${orderId}/cancel`, {
            method: "PATCH",
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    updateOrderStatus: async (orderId: string, statusData: UpdateOrderStatusData) => {
        const res = await clientFetch(`/orders/${orderId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(statusData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    getAllOrders: async (page = 1, limit = 10, filters?: { status?: string; paymentStatus?: string }) => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (filters?.status) params.append('status', filters.status);
        if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);

        const res = await clientFetch(`/orders?${params}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },
};