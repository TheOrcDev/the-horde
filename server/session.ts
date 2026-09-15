"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const getSession = async () =>
  auth.api.getSession({
    headers: await headers(),
  });

export const requireSession = async () => {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return session;
};
