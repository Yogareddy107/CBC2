import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session) {
      // If we have a provider token, store it in preferences for analysis
      if (session.provider_token) {
        const provider = session.user.app_metadata.provider || 'github';
        const tokenKey = `${provider}_token`;
        
        await supabase.auth.updateUser({
          data: {
            prefs: {
              ...(session.user.user_metadata?.prefs || {}),
              [tokenKey]: session.provider_token
            }
          }
        });
      }
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=Authentication failed', origin))
}
