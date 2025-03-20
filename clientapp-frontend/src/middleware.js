// src/middleware.js or /middleware.js
import { NextResponse } from 'next/server'

// List of protected routes
const protectedRoutes = ['/home', '/clients', '/settings']

export function middleware(req) {
  const token = req.cookies.get('token')?.value
  const { pathname } = req.nextUrl

  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
