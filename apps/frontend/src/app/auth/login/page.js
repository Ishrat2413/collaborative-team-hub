/**
 * @fileoverview Login page — email/password authentication form.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import useAuthStore from "../../../stores/authStore";
import useWorkspaceStore from "../../../stores/workspaceStore";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { fetchWorkspaces } = useWorkspaceStore();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form);
    if (result.success) {
      await fetchWorkspaces();
      router.push("/dashboard/dashboard");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4'>
      <div className='w-full max-w-md'>
        {/* Logo */}
        <div className='text-center mb-8'>
          <div className='inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4'>
            <svg
              className='w-7 h-7 text-white'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
              />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
            Welcome back
          </h1>
          <p className='text-slate-500 dark:text-slate-400 mt-1'>
            Sign in to Team Hub
          </p>
        </div>

        <div className='card p-8'>
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                Email address
              </label>
              <input
                type='email'
                required
                className='input-base'
                placeholder='ishrat@demo.com'
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5'>
                Password
              </label>
              <input
                type='password'
                required
                className='input-base'
                placeholder='••••••••'
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button
              type='submit'
              className='btn-primary w-full'
              disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Demo credentials */}
          <div className='mt-6 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-xs text-indigo-700 dark:text-indigo-300'>
            <p className='font-semibold mb-1'>🎯 Demo credentials</p>
            <p>
              Email: <span className='font-mono'>ishrat@demo.com</span>
            </p>
            <p>
              Password: <span className='font-mono'>Password1</span>
            </p>
          </div>

          <p className='text-center text-sm text-slate-500 dark:text-slate-400 mt-6'>
            Don&apos;t have an account?{" "}
            <Link
              href='/auth/register'
              className='font-medium text-indigo-600 hover:underline dark:text-indigo-400'>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
