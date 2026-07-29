import { NextResponse, type NextRequest } from "next/server";
import crypto from "node:crypto";

const COOKIE_NAME = "puebla21k_gate";

function expectedCookieValue(): string | null {
  const password = process.env.APP_PASSWORD;
  if (!password) return null;
  return crypto.createHash("sha256").update(password).digest("hex");
}

function loginPage(error?: boolean): string {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Garmin Coach</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f9f9f7; color: #0b0b0b; display: flex; min-height: 100vh; align-items: center; justify-content: center; margin: 0; padding: 1.5rem; }
    @media (prefers-color-scheme: dark) { body { background: #0d0d0d; color: #fff; } input { background: #1a1a19; color: #fff; border-color: #2c2c2a !important; } }
    form { width: 100%; max-width: 320px; text-align: center; }
    h1 { font-size: 1.4rem; margin-bottom: 1.5rem; }
    input { width: 100%; box-sizing: border-box; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid #e1e0d9; font-size: 1rem; margin-bottom: 0.75rem; }
    button { width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: none; background: #2a78d6; color: #fff; font-size: 1rem; font-weight: 600; cursor: pointer; }
    p.error { color: #d03b3b; font-size: 0.875rem; margin-top: 0.75rem; }
  </style>
</head>
<body>
  <form method="POST" action="/api/gate">
    <h1>🏃 Garmin Coach</h1>
    <input type="password" name="password" placeholder="Contraseña" autofocus required />
    <button type="submit">Entrar</button>
    ${error ? `<p class="error">Contraseña incorrecta.</p>` : ""}
  </form>
</body>
</html>`;
}

export async function proxy(request: NextRequest) {
  const expected = expectedCookieValue();

  // No APP_PASSWORD configured (e.g. local dev without it set) — don't lock the owner out.
  if (!expected) return NextResponse.next();

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (cookie === expected) return NextResponse.next();

  const showError = request.nextUrl.searchParams.get("error") === "1";
  return new NextResponse(loginPage(showError), { status: 401, headers: { "content-type": "text/html; charset=utf-8" } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/gate).*)"],
};

export { COOKIE_NAME, expectedCookieValue };
