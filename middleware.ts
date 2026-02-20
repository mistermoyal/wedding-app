// middleware.ts (project root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'site_auth';
const SITE_PASSWORD = process.env.SITE_PASSWORD ?? process.env.NEXT_PUBLIC_SITE_PASSWORD;
const JWT_SECRET = SITE_PASSWORD ?? 'fallback-secret';
const encoder = new TextEncoder();

const base64UrlToUint8Array = (input: string) => {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
};

const base64UrlToJson = (input: string) => {
    const decoded = base64UrlToUint8Array(input);
    return JSON.parse(new TextDecoder().decode(decoded)) as {
        exp?: number;
        alg?: string;
    };
};

const verifyJwt = async (token: string, secret: string) => {
    const parts = token.split('.');
    if (parts.length !== 3) {
        return false;
    }

    const [headerPart, payloadPart, signaturePart] = parts;
    try {
        const header = base64UrlToJson(headerPart);
        if (header.alg && header.alg !== 'HS256') {
            return false;
        }

        const payload = base64UrlToJson(payloadPart);
        if (payload.exp && Date.now() / 1000 >= payload.exp) {
            return false;
        }

        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );
        const data = encoder.encode(`${headerPart}.${payloadPart}`);
        const signature = base64UrlToUint8Array(signaturePart);
        return crypto.subtle.verify('HMAC', key, signature, data);
    } catch {
        return false;
    }
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow login page and login API without auth
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/api/login') ||
        pathname.startsWith('/api/logout') ||
        pathname.startsWith('/_next') ||
        pathname === '/favicon.ico' ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
    }

    try {
        if (!SITE_PASSWORD) {
            return NextResponse.next();
        }

        const isValid = await verifyJwt(token, JWT_SECRET);
        if (isValid) {
            return NextResponse.next();
        }
    } catch {
        // Fall through to redirect.
    }

    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
}

export const config = {
    matcher: '/:path*',
};
