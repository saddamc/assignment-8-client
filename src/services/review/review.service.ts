import { clientFetch } from "@/lib/client-fetch";

export interface ProductReview {
    id: string;
    rating: number;
    comment?: string;
    images?: string[];
    createdAt: string;
    isVerifiedPurchase: boolean;
    customer: {
        name: string;
        profilePhoto?: string;
    };
}

export interface SellerReview {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    seller: {
        name: string;
        storeName: string;
    };
    order: {
        id: string;
    };
}

export interface CreateReviewData {
    rating: number;
    comment?: string;
    images?: string[];
}

export interface CreateSellerReviewData {
    rating: number;
    comment?: string;
}

export const reviewService = {
    // Product reviews
    getProductReviews: async (productId: string, page = 1, limit = 10) => {
        const res = await clientFetch(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    createProductReview: async (productId: string, reviewData: CreateReviewData) => {
        const res = await clientFetch(`/reviews/product/${productId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reviewData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    updateProductReview: async (reviewId: string, reviewData: Partial<CreateReviewData>) => {
        const res = await clientFetch(`/reviews/${reviewId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reviewData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    deleteProductReview: async (reviewId: string) => {
        const res = await clientFetch(`/reviews/${reviewId}`, {
            method: "DELETE",
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    getMyProductReviews: async (page = 1, limit = 10) => {
        const res = await clientFetch(`/reviews/my-reviews?page=${page}&limit=${limit}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    // Seller reviews
    getSellerReviews: async (sellerEmail: string, page = 1, limit = 10) => {
        const res = await clientFetch(`/reviews/seller/${sellerEmail}?page=${page}&limit=${limit}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    createSellerReview: async (orderId: string, reviewData: CreateSellerReviewData) => {
        const res = await clientFetch(`/reviews/seller/order/${orderId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reviewData),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    getMySellerReviews: async (page = 1, limit = 10) => {
        const res = await clientFetch(`/reviews/my-seller-reviews?page=${page}&limit=${limit}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        return data.data;
    },
};