import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isCloudReady, supabase } from '../lib/supabase'

interface Profile {
  full_name: string | null
  avatar_url: string | null
  email: string | null
}

interface AuthContextValue {
  ready: boolean
  cloudReady: boolean
  session: Session | null
  user: User | null
  profile: Profile | null
  signInWithGoogle: () => Promise<{ error: string | null }>
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithPassword: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ error: string | null; needsConfirm: boolean }>
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>
  updatePassword: (password: string) => Promise<{ error: string | null }>
  /** Magic link tetap ada — banyak orang males bikin password. */
  signInWithEmail: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Error Supabase masih bahasa Inggris teknis ("Invalid login credentials").
 * Diterjemahkan di sini, bukan di komponen, supaya pesannya konsisten
 * di semua tempat yang memakainya.
 */
function humanize(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Email atau password salah.'
  if (m.includes('email not confirmed')) return 'Email belum dikonfirmasi. Cek inbox kamu dulu ya.'
  if (m.includes('user already registered')) return 'Email ini udah terdaftar. Coba masuk aja.'
  if (m.includes('password should be at least')) return 'Password minimal 6 karakter.'
  if (m.includes('unable to validate email')) return 'Format email-nya kayaknya salah.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Kebanyakan percobaan. Tunggu sebentar ya.'
  return message
}

function readProfile(user: User | null): Profile | null {
  if (!user) return null
  const meta = user.user_metadata ?? {}
  const name = typeof meta.full_name === 'string' ? meta.full_name : typeof meta.name === 'string' ? meta.name : null
  const avatar = typeof meta.avatar_url === 'string' ? meta.avatar_url : typeof meta.picture === 'string' ? meta.picture : null
  return { full_name: name, avatar_url: avatar, email: user.email ?? null }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(!isCloudReady)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setReady(true)
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { error: 'Supabase belum dikonfigurasi di .env' }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/galeri` },
    })
    return { error: error?.message ?? null }
  }, [])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase belum dikonfigurasi di .env' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? humanize(error.message) : null }
  }, [])

  const signUpWithPassword = useCallback(async (email: string, password: string, fullName?: string) => {
    if (!supabase) return { error: 'Supabase belum dikonfigurasi di .env', needsConfirm: false }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/galeri`,
        // Profil diisi dari sini; trigger handle_new_user() baca full_name.
        data: fullName?.trim() ? { full_name: fullName.trim() } : undefined,
      },
    })
    if (error) return { error: humanize(error.message), needsConfirm: false }
    // Kalau konfirmasi email aktif, session masih null -> user harus cek inbox.
    return { error: null, needsConfirm: !data.session }
  }, [])

  const sendPasswordReset = useCallback(async (email: string) => {
    if (!supabase) return { error: 'Supabase belum dikonfigurasi di .env' }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/masuk?mode=reset`,
    })
    return { error: error ? humanize(error.message) : null }
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    if (!supabase) return { error: 'Supabase belum dikonfigurasi di .env' }
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error ? humanize(error.message) : null }
  }, [])

  const signInWithEmail = useCallback(async (email: string) => {
    if (!supabase) return { error: 'Supabase belum dikonfigurasi di .env' }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/galeri` },
    })
    return { error: error ? humanize(error.message) : null }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      cloudReady: isCloudReady,
      session,
      user: session?.user ?? null,
      profile: readProfile(session?.user ?? null),
      signInWithGoogle,
      signInWithPassword,
      signUpWithPassword,
      sendPasswordReset,
      updatePassword,
      signInWithEmail,
      signOut,
    }),
    [
      ready,
      session,
      signInWithGoogle,
      signInWithPassword,
      signUpWithPassword,
      sendPasswordReset,
      updatePassword,
      signInWithEmail,
      signOut,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
