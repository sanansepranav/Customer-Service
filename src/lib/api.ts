import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function withAuth<T>(handler: () => Promise<T>) {
  const session = await getSession();
  if (!session) return jsonError("Unauthorized", 401);
  return handler();
}
