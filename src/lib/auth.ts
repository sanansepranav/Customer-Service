import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "pts_session";

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret");
}

export type SessionUser = { id: string; email: string; name: string; role: string };

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as SessionUser;
  } catch {
    return null;
  }
}

export async function verifyAuthToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}


export async function requireSession() {
  const session = await getSession();
  if (!session) {
    const err = new Error("Unauthorized");
    (err as Error & { status?: number }).status = 401;
    throw err;
  }
  return session;
}
