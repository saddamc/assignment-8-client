"use server";

import { redirect } from "next/navigation";
import { setCookie } from "./tokenHandlers";

const isProduction = process.env.NODE_ENV === "production";
const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1";

const decodeTokenPayload = (token: string) => {
    const parts = token.split(".");
    if (parts.length < 2) throw new Error("Invalid token format");
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8")) as { role?: string };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const registerSeller = async (_currentState: any, formData: FormData): Promise<any> => {
    try {
        const name = (formData.get("name") as string)?.trim();
        const email = (formData.get("email") as string)?.trim();
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;
        const storeName = (formData.get("storeName") as string)?.trim();
        const storeDescription = (formData.get("storeDescription") as string)?.trim();
        const contactNumber = (formData.get("contactNumber") as string)?.trim();
        const address = (formData.get("address") as string)?.trim();

        if (!name) return { success: false, message: "Full name is required." };
        if (!email) return { success: false, message: "Email is required." };
        if (!password || password.length < 6) return { success: false, message: "Password must be at least 6 characters." };
        if (password !== confirmPassword) return { success: false, message: "Passwords do not match." };
        if (!storeName) return { success: false, message: "Store name is required." };
        if (!contactNumber) return { success: false, message: "Contact number is required." };

        const payload = {
            password,
            seller: {
                name,
                email,
                storeName,
                storeDescription: storeDescription || undefined,
                contactNumber,
                address: address || undefined,
            },
        };

        const res = await fetch(`${API_URL}/user/create-seller`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await res.json();

        if (!result.success) {
            return { success: false, message: result.message || "Registration failed." };
        }

        // Auto-login: if tokens returned, set cookies and redirect
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
            if (decoded.role) {
                redirect("/seller/dashboard");
            }
        }

        // Registration succeeded but no auto-login tokens — redirect to login
        redirect("/login?registered=seller");
    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
        return { success: false, message: "Something went wrong during registration." };
    }
};
