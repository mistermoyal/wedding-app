// app/login/page.tsx
'use client';

import { Suspense, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
            credentials: 'same-origin',
        });
        if (res.ok) {
            const callback = searchParams.get('callbackUrl') ?? '/';
            router.push(callback);
        } else {
            const data = await res.json();
            setError(data.message ?? 'Invalid password');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-medium text-slate-700">
                    Enter password
                </label>
                <div className="relative mt-2">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition hover:text-slate-700"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>
            {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                </p>
            )}
            <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
                Log in
            </button>
        </form>
    );
}

export default function LoginPage() {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.12),_transparent_55%)]" />
            <div className="relative w-full max-w-md rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-xl backdrop-blur">
                <div className="mb-6 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                        Access
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                        Eve &amp; Tom!
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">August 9, 2026</p>
                </div>
                <Suspense fallback={<div className="h-24" />}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
