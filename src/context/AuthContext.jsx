import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured, getProfile, upsertProfile } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isConfigured] = useState(isSupabaseConfigured())

    useEffect(() => {
        if (!isConfigured) {
            setLoading(false)
            return
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                loadProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) {
                    await loadProfile(session.user.id)
                } else {
                    setProfile(null)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [isConfigured])

    const loadProfile = async (userId) => {
        const profileData = await getProfile(userId)
        setProfile(profileData)
        setLoading(false)
    }

    const signUp = async (email, password) => {
        if (!isConfigured) return { error: { message: 'Supabase not configured' } }

        const { data, error } = await supabase.auth.signUp({
            email,
            password
        })
        return { data, error }
    }

    const signIn = async (email, password) => {
        if (!isConfigured) return { error: { message: 'Supabase not configured' } }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        return { data, error }
    }

    const signOut = async () => {
        if (!isConfigured) return

        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
    }

    const updateProfile = async (updates) => {
        if (!user) return null

        const updatedProfile = await upsertProfile({
            id: user.id,
            ...profile,
            ...updates,
            updated_at: new Date().toISOString()
        })

        if (updatedProfile) {
            setProfile(updatedProfile)
        }
        return updatedProfile
    }

    const value = {
        user,
        profile,
        loading,
        isConfigured,
        signUp,
        signIn,
        signOut,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
