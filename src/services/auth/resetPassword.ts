"use server";

import { redirect } from "next/navigation";
import { zodValidator } from "@/lib/zodValidator";
import { resetPasswordZodSchema } from "@/zod/auth.validation";

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const resetPassword = async (_currentState: any, formData: FormData): Promise<any> => {
    const userId = formData.get("userId") as string;
    const token = formData.get("token") as string;

    try {
        if (!userId || !token) {
            return { success: false, message: "Invalid reset link. Please request a new one." };
        }

        const payload = {
            password: formData.get("password") as string,
            confirmPassword: formData.get("confirmPassword") as string,
        };

        const validation = zodValidator(payload, resetPasswordZodSchema);
        if (!validation.success) {
            const firstError = Array.isArray(validation.errors)
                ? validation.errors[0]?.message
                : "Validation failed";
            return { success: false, message: firstError };
        }

        const res = await fetch(`${API_URL}/auth/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
            },
            body: JSON.stringify({ id: userId, password: validation.data.password }),
        });

        const result = await res.json();

        if (!result.success) {
            return { success: false, message: result.message || "Password reset failed." };
        }

        return { success: true, message: "Password reset successfully!" };
    } catch {
        return { success: false, message: "Something went wrong. Please try again." };
    }
};

export const resetPasswordAndRedirect = async (_currentState: any, formData: FormData): Promise<any> => {
    const result = await resetPassword(_currentState, formData);
    if (result.success) {
        redirect("/login?reset=true");
    }
    return result;
};
