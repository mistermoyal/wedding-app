// app/api/login/route.ts
import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

const COOKIE_NAME = 'site_auth';
const SITE_PASSWORD = process.env.SITE_PASSWORD ?? process.env.NEXT_PUBLIC_SITE_PASSWORD;
const JWT_SECRET = SITE_PASSWORD ?? 'fallback-secret';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: Request) {
    const { password } = await req.json();
    const inputPassword = typeof password === 'string' ? password.trim() : '';

    if (!SITE_PASSWORD) {
        return NextResponse.json(
            { message: 'Password not configured on the server' },
            { status: 500 }
        );
    }

    if (inputPassword !== SITE_PASSWORD) {
        return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
    }

    const token = sign({ authenticated: true }, JWT_SECRET, { expiresIn: COOKIE_MAX_AGE });

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        path: '/',
        maxAge: COOKIE_MAX_AGE,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });

    return response;
}
