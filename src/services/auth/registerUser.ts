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
                name: validation.data.name,
                email: validation.data.email,
                password: validation.data.password,
                role: validation.data.role || "CUSTOMER"
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

/* eslint-disable @typescript-eslint/no-explicit-any */
export const registerUser = async (_currentState: any, formData: FormData): Promise<any> => {
    try {
        // 1. Extract basic fields from the form
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const profileImage = formData.get('profileImage') as File; // Optional

        // 2. Validate input on the server side
        if (!firstName || !lastName || !email || !password) {
            return { success: false, message: "All fields are required" };
        }

        // 3. Construct the JSON data object expected by the backend schema
        const customerData = {
            password: password,
            customer: {
                name: `${firstName} ${lastName}`,
                email: email,
                contactNumber: "0000000000" // Optional based on backend schema
            }
        };

        // 4. Create the Multipart FormData payload for the backend
        const backendFormData = new FormData();
        // The backend expects the JSON object to be stringified inside a 'data' field!
        backendFormData.append('data', JSON.stringify(customerData));
        
        // If a file was uploaded, append it to the 'file' field
        if (profileImage && profileImage.size > 0) {
            backendFormData.append('file', profileImage);
        }

        // 5. Send the request to your backend Node.js API
        const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:5000/api/v1';
        
        const response = await fetch(`${apiUrl}/user/create-customer`, {
            method: 'POST',
            body: backendFormData, 
            // Note: When sending FormData, DO NOT set the 'Content-Type' header!
            // fetch will automatically set it to 'multipart/form-data' with the correct boundary.
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            return { success: false, message: data.message || "Registration failed" };
        }

        // 6. Registration successful! Usually, we redirect to login
        // If the backend returns a token upon registration, we can log them in immediately.
        
    } catch (error: any) {
        return { success: false, message: "Something went wrong during registration." };
    }

    // Redirect after successful completion (outside try-catch to allow Next.js redirect to work)
    redirect("/login?registered=true");
};
