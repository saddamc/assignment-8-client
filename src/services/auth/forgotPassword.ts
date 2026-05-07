"use server";

import { zodValidator } from "@/lib/zodValidator";
import { forgotPasswordZodSchema } from "@/zod/auth.validation";

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const forgotPassword = async (_currentState: any, formData: FormData): Promise<any> => {
    try {
        const payload = {
            email: formData.get("email") as string,
        };

        const validation = zodValidator(payload, forgotPasswordZodSchema);
        if (!validation.success) {
            const firstError = Array.isArray(validation.errors)
                ? validation.errors[0]?.message
                : "Validation failed";
            return { success: false, message: firstError };
        }

        const res = await fetch(`${API_URL}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validation.data),
        });

        const result = await res.json();

        if (!result.success) {
            return { success: false, message: result.message || "Request failed" };
        }

        return { success: true, message: result.message };
    } catch {
        return { success: false, message: "Something went wrong. Please try again." };
    }
};
