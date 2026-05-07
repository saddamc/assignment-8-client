import { serverFetch } from "@/lib/server-fetch";
import { getCookie, setCookie } from "./tokenHandlers";

const isProduction = process.env.NODE_ENV === "production";

export const getNewAccessToken = async () => {
    try {
        const refreshToken = await getCookie("refreshToken");

        if (!refreshToken) {
            return { tokenRefreshed: false };
        }

        const res = await serverFetch.post("/auth/refresh-token", {
            headers: {
                Cookie: `refreshToken=${refreshToken}`
            }
        });

        const result = await res.json();

        if (result.success && result.data.accessToken) {
            await setCookie("accessToken", result.data.accessToken, {
                secure: isProduction,
                httpOnly: true,
                maxAge: 60 * 60,
                path: "/",
                sameSite: isProduction ? "none" : "lax",
            });
            return { tokenRefreshed: true };
        }

        return { tokenRefreshed: false };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return { tokenRefreshed: false };
    }
}
