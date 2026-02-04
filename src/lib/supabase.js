import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Using local storage fallback.')
}

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export const isSupabaseConfigured = () => !!supabase

// Helper to get current user
export const getCurrentUser = async () => {
    if (!supabase) return null
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

// Helper to get user profile
export const getProfile = async (userId) => {
    if (!supabase) return null
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return null
    }
    return data
}

// Helper to upsert profile
export const upsertProfile = async (profile) => {
    if (!supabase) return null
    const { data, error } = await supabase
        .from('profiles')
        .upsert(profile)
        .select()
        .single()

    if (error) {
        console.error('Error upserting profile:', error)
        return null
    }
    return data
}

// Helper to upload image to Supabase Storage
export const uploadImage = async (file, userId) => {
    if (!supabase) return null

    // Create unique filename
    const fileExt = file.name?.split('.').pop() || 'jpg'
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    // Convert base64 to blob if needed
    let uploadFile = file
    if (typeof file === 'string' && file.startsWith('data:')) {
        const res = await fetch(file)
        uploadFile = await res.blob()
    }

    const { data, error } = await supabase.storage
        .from('items')
        .upload(fileName, uploadFile, {
            cacheControl: '3600',
            upsert: false
        })

    if (error) {
        console.error('Error uploading image:', error)
        return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('items')
        .getPublicUrl(data.path)

    return publicUrl
}

