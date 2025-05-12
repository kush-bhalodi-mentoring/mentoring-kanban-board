import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { ROUTES } from "@/constants/routes";

type Cookie = {
  name: string
  value: string
  options: CookieOptions
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await request.cookies).getAll()
        },
        setAll(cookiesToSet: Cookie[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const publicPaths = ['/', '/login', '/signup', '/set-password']
  if (!user && !publicPaths.includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.LOGIN
    return NextResponse.redirect(url)
  }

  return response
}