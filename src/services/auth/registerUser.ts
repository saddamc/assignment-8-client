"use server";

import { redirect } from "next/navigation";
import { setCookie } from "./tokenHandlers";
import { zodValidator } from "@/lib/zodValidator";
import { registerValidationZodSchema } from "@/zod/auth.validation";
import { getDefaultDashboardRoute, UserRole } from "@/lib/auth-utils";

const isProduction = process.env.NODE_ENV === "production";
const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1";

const decodeTokenPayload = (token: string) => {
    const parts = token.split(".");
    if (parts.length < 2) throw new Error("Invalid token format");
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8")) as { role?: UserRole };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const registerUser = async (_currentState: any, formData: FormData): Promise<any> => {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;
        const role = (formData.get("role") as string) || "CUSTOMER";

        const payload = { name, email, password, confirmPassword, role: role as "CUSTOMER" | "SELLER" | "ADMIN" };

        const validation = zodValidator(payload, registerValidationZodSchema);
        if (!validation.success) {
            const firstError = Array.isArray(validation.errors)
                ? validation.errors[0]?.message
                : "Validation failed";
            return { success: false, message: firstError };
        }

        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: validation.data!.name,
                email: validation.data!.email,
                password: validation.data!.password,
                confirmPassword: validation.data!.confirmPassword,
                role: validation.data!.role || "CUSTOMER"
            }),
        });

        const result = await res.json();

        if (!result.success) {
            return { success: false, message: result.message || "Registration failed." };
        }

        const accessToken = result?.data?.accessToken as string | undefined;
        const refreshToken = result?.data?.refreshToken as string | undefined;

        if (accessToken && refreshToken) {
            await setCookie("accessToken", accessToken, {
                secure: isProduction,
                httpOnly: true,
                maxAge: 60 * 60,
                path: "/",
                sameSite: isProduction ? "none" : "lax",
            });
            await setCookie("refreshToken", refreshToken, {
                secure: isProduction,
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 90,
                path: "/",
                sameSite: isProduction ? "none" : "lax",
            });

            const decoded = decodeTokenPayload(accessToken);
            const userRole = decoded.role;
            if (userRole) {
                redirect(getDefaultDashboardRoute(userRole));
            }
        }

        return { success: true, message: "Registered successfully!" };
    } catch (error: any) {
        // Next.js redirect throws - let it propagate
        if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
        return { success: false, message: "Something went wrong during registration." };
    }
};

 
