import { useState, useEffect } from 'react'
import { User, MapPin, Phone, Mail, Shield, Check, Save, LogIn, LogOut, UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
    const { user, profile, loading, isConfigured, signIn, signUp, signOut, updateProfile } = useAuth()

    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [authError, setAuthError] = useState('')
    const [authLoading, setAuthLoading] = useState(false)

    const [formProfile, setFormProfile] = useState({
        name: '',
        phone: '',
        location: '',
        location_privacy: 'approximate'
    })

    const [isSaving, setIsSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    // Load profile data when available
    useEffect(() => {
        if (profile) {
            setFormProfile({
                name: profile.name || '',
                phone: profile.phone || '',
                location: profile.location || '',
                location_privacy: profile.location_privacy || 'approximate'
            })
        }
    }, [profile])

    // Fallback to localStorage if Supabase not configured
    useEffect(() => {
        if (!isConfigured) {
            const saved = localStorage.getItem('stufff-profile')
            if (saved) {
                const parsed = JSON.parse(saved)
                setFormProfile({
                    name: parsed.name || '',
                    phone: parsed.phone || '',
                    location: parsed.location || '',
                    location_privacy: parsed.locationPrivacy || 'approximate'
                })
            }
        }
    }, [isConfigured])

    const handleAuth = async (e) => {
        e.preventDefault()
        setAuthError('')
        setAuthLoading(true)

        try {
            const { error } = isLogin
                ? await signIn(email, password)
                : await signUp(email, password)

            if (error) {
                setAuthError(error.message)
            } else if (!isLogin) {
                setAuthError('Check your email to confirm your account!')
            }
        } catch (err) {
            setAuthError(err.message)
        } finally {
            setAuthLoading(false)
        }
    }

    const handleChange = (field, value) => {
        setFormProfile(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        setIsSaving(true)

        if (isConfigured && user) {
            await updateProfile(formProfile)
        } else {
            // Fallback to localStorage
            localStorage.setItem('stufff-profile', JSON.stringify({
                ...formProfile,
                locationPrivacy: formProfile.location_privacy
            }))
        }

        setIsSaving(false)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)
    }

    const privacyOptions = [
        { value: 'exact', label: 'Exact Location', description: 'Show your precise location to buyers', icon: MapPin },
        { value: 'approximate', label: 'Approximate', description: 'Show only your neighborhood or area', icon: Shield },
        { value: 'hidden', label: 'Hidden', description: "Don't show location until you share it", icon: EyeOff }
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
        )
    }

    // Show auth form if Supabase is configured but user not logged in
    if (isConfigured && !user) {
        return (
            <div className="p-4 max-w-md mx-auto animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <User size={24} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {isLogin ? 'Sign in to your account' : 'Join Stufff today'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="glass rounded-2xl p-4">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Mail size={16} className="text-blue-500" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="glass rounded-2xl p-4">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <Shield size={16} className="text-purple-500" />
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="w-full px-4 py-3 pr-12 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {authError && (
                        <div className={`p-3 rounded-xl text-sm ${authError.includes('Check your email')
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                            {authError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-lg shadow-xl btn-primary text-white"
                    >
                        {authLoading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : isLogin ? (
                            <>
                                <LogIn size={24} />
                                Sign In
                            </>
                        ) : (
                            <>
                                <UserPlus size={24} />
                                Create Account
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setAuthError('')
                        }}
                        className="w-full py-3 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </form>
            </div>
        )
    }

    // Profile form (shown when logged in or using localStorage fallback)
    return (
        <div className="p-4 max-w-lg mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <User size={24} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Your Profile</h2>
                        <p className="text-sm text-gray-500">
                            {user?.email || 'Local profile'}
                        </p>
                    </div>
                </div>
                {isConfigured && user && (
                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                )}
            </div>

            {/* Profile Avatar */}
            <div className="flex justify-center mb-8">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-xl">
                        {formProfile.name ? (
                            <span className="text-3xl font-bold text-white">
                                {formProfile.name.charAt(0).toUpperCase()}
                            </span>
                        ) : (
                            <User size={40} className="text-white" />
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <Check size={14} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-5">
                {/* Name */}
                <div className="glass rounded-2xl p-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <User size={16} className="text-purple-500" />
                        Display Name
                    </label>
                    <input
                        type="text"
                        value={formProfile.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="How should we call you?"
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* Phone */}
                <div className="glass rounded-2xl p-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Phone size={16} className="text-green-500" />
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        value={formProfile.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                            <Check size={10} className="text-green-600" />
                        </div>
                        <p className="text-xs text-green-600">Used for SMS notifications</p>
                    </div>
                </div>

                {/* Location */}
                <div className="glass rounded-2xl p-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <MapPin size={16} className="text-red-500" />
                        Your Location
                    </label>
                    <input
                        type="text"
                        value={formProfile.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="City, State or Neighborhood"
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* Location Privacy */}
                <div className="glass rounded-2xl p-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <Shield size={16} className="text-purple-500" />
                        Location Privacy
                    </label>
                    <div className="space-y-2">
                        {privacyOptions.map((option) => {
                            const Icon = option.icon
                            const isSelected = formProfile.location_privacy === option.value

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleChange('location_privacy', option.value)}
                                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${isSelected
                                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                                            : 'bg-white/50 text-gray-700 hover:bg-white/80'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-gray-100'
                                        }`}>
                                        <Icon size={20} className={isSelected ? 'text-white' : 'text-gray-500'} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                            {option.label}
                                        </p>
                                        <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                            {option.description}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                            <Check size={14} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-lg shadow-xl ${showSuccess
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                            : 'btn-primary text-white'
                        }`}
                >
                    {showSuccess ? (
                        <>
                            <Check size={24} />
                            Saved!
                        </>
                    ) : isSaving ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <>
                            <Save size={24} />
                            Save Profile
                        </>
                    )}
                </button>

                <div className="text-center py-4">
                    <p className="text-xs text-gray-400">
                        🔒 {isConfigured ? 'Stored securely in the cloud' : 'Stored locally on your device'}
                    </p>
                </div>
            </div>
        </div>
    )
}
