import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Auth routes (public) — actual URL paths (route groups are stripped)
const AUTH_PATHS = ["/login", "/signup"];

// Routes that need authentication
const APP_PATH_PREFIXES = [
  "/dashboard",
  "/workout",
  "/nutrition",
  "/body-stats",
  "/water",
  "/steps",
  "/calories",
  "/supplements",
  "/course",
  "/collection",
  "/badges",
  "/profile",
  "/settings",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Apply to request first
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Rebuild response to carry updated cookies
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: use getUser() not getSession() — getUser() validates with server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthPath = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isAppPath = APP_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Authenticated user hitting auth pages → send to dashboard
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated user hitting protected pages → send to login
  if (!user && isAppPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Root "/" → redirect based on auth state
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(user ? "/dashboard" : "/login", request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico, manifest.json, icons/*, sw.js (PWA assets)
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon|manifest|icons|sw\\.js|workbox|api).*)",
  ],
};
