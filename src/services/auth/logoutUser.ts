"use server";

import { deleteCookie } from "./tokenHandlers";
import { redirect } from "next/navigation";

export async function logoutUser() {
  await deleteCookie("accessToken");
  await deleteCookie("refreshToken");
  redirect("/login");
}
