"use server"

import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/lib/auth-utils";
import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { loginValidationZodSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";
import { setCookie } from "./tokenHandlers";

const isProduction = process.env.NODE_ENV === "production";

const decodeTokenPayload = (token: string) => {
    const tokenParts = token.split(".");
    if (tokenParts.length < 2) {
        throw new Error("Invalid access token format");
    }

    const payload = Buffer.from(tokenParts[1], "base64url").toString("utf-8");
    return JSON.parse(payload) as { role?: UserRole };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const loginUser = async (_currentState: any, formData: any): Promise<any> => {
    try {
        const redirectTo = formData.get('redirect') || null;
        const payload = {
            email: formData.get('email'),
            password: formData.get('password'),
        }

        const validation = zodValidator(payload, loginValidationZodSchema);
        if (!validation.success) {
            return validation;
        }

        const res = await serverFetch.post("/auth/login", {
            body: JSON.stringify(validation.data),
            headers: {
                "Content-Type": "application/json",
            }
        });

        const result = await res.json();

        const accessToken = result?.data?.accessToken as string | undefined;
        const refreshToken = result?.data?.refreshToken as string | undefined;

        if (!accessToken || !refreshToken) {
            throw new Error(result.message || "Tokens not found in response");
        }

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

        const decodedPayload = decodeTokenPayload(accessToken);
        const userRole = decodedPayload.role;

        if (!userRole) throw new Error("Invalid token role");

        if (redirectTo) {
            const requestedPath = redirectTo.toString();
            if (isValidRedirectForRole(requestedPath, userRole)) {
                redirect(`${requestedPath}`);
            } else {
                redirect(`${getDefaultDashboardRoute(userRole)}`);
            }
        } else {
            redirect(`${getDefaultDashboardRoute(userRole)}`);
        }

    } catch (error: any) {
        if (error?.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        return { success: false, message: error.message || "Login Failed." };
    }
}
