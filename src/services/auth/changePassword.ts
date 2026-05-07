"use server";

import { getCookie } from "./tokenHandlers";
import { zodValidator } from "@/lib/zodValidator";
import { changePasswordZodSchema } from "@/zod/auth.validation";

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const changePassword = async (_currentState: any, formData: FormData): Promise<any> => {
    try {
        const payload = {
            oldPassword: formData.get("oldPassword") as string,
            newPassword: formData.get("newPassword") as string,
            confirmNewPassword: formData.get("confirmNewPassword") as string,
        };

        const validation = zodValidator(payload, changePasswordZodSchema);
        if (!validation.success) {
            const firstError = Array.isArray(validation.errors)
                ? validation.errors[0]?.message
                : "Validation failed";
            return { success: false, message: firstError };
        }

        const accessToken = await getCookie("accessToken");

        if (!accessToken) {
            return { success: false, message: "You are not logged in." };
        }

        const res = await fetch(`${API_URL}/auth/change-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${accessToken}`,
            },
            body: JSON.stringify({
                oldPassword: validation.data.oldPassword,
                newPassword: validation.data.newPassword,
            }),
        });

        const result = await res.json();

        if (!result.success) {
            return { success: false, message: result.message || "Password change failed." };
        }

        return { success: true, message: "Password changed successfully!" };
    } catch {
        return { success: false, message: "Something went wrong. Please try again." };
    }
};
