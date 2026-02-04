import { useState, useRef } from 'react'
import { Camera, Sparkles, Loader2, Facebook, Check, MapPin, DollarSign, Tag, Image, Zap } from 'lucide-react'
import { useStuffs } from '../context/StuffsContext'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured, uploadImage } from '../lib/supabase'
import { generateDescription, postToFacebook } from '../services/integrations'

export default function PostPage({ onSuccess }) {
  const { user } = useAuth()
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('other')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [postToFb, setPostToFb] = useState(true)
  const [fbPosted, setFbPosted] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const { addItem } = useStuffs()
  const isConfigured = isSupabaseConfigured()

  const handleImageCapture = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateDescription = async () => {
    if (!imagePreview) return

    setIsGenerating(true)
    try {
      const result = await generateDescription(imagePreview)
      if (result.title && !title) setTitle(result.title)
      if (result.description) setDescription(result.description)
      if (result.category) setCategory(result.category)
      if (result.suggestedPrice && !price) setPrice(result.suggestedPrice.toString())
    } catch (error) {
      console.error('Failed to generate description:', error)
    }
    setIsGenerating(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!imagePreview || !title || !price) return

    setIsPosting(true)

    // Upload image to Supabase Storage if configured
    let imageUrl = imagePreview
    if (isConfigured && user) {
      const uploadedUrl = await uploadImage(imagePreview, user.id)
      if (uploadedUrl) {
        imageUrl = uploadedUrl
      }
    }

    const newItem = await addItem({
      title,
      description,
      price: parseFloat(price),
      image: imageUrl,
      location,
      category
    })

    if (postToFb && newItem) {
      try {
        await postToFacebook(newItem)
        setFbPosted(true)
      } catch (error) {
        console.error('Failed to post to Facebook:', error)
      }
    }

    setIsPosting(false)
    setShowSuccess(true)

    setTimeout(() => {
      setImage(null)
      setImagePreview(null)
      setTitle('')
      setDescription('')
      setPrice('')
      setLocation('')
      setCategory('other')
      setFbPosted(false)
      setShowSuccess(false)
      onSuccess?.()
    }, 1500)
  }

  const categories = [
    { value: 'electronics', label: '📱 Electronics', color: 'from-blue-500 to-cyan-500' },
    { value: 'furniture', label: '🪑 Furniture', color: 'from-amber-500 to-orange-500' },
    { value: 'clothing', label: '👕 Clothing', color: 'from-pink-500 to-rose-500' },
    { value: 'sports', label: '⚽ Sports', color: 'from-green-500 to-emerald-500' },
    { value: 'music', label: '🎸 Music', color: 'from-purple-500 to-violet-500' },
    { value: 'kitchen', label: '🍳 Kitchen', color: 'from-red-500 to-orange-500' },
    { value: 'books', label: '📚 Books', color: 'from-indigo-500 to-blue-500' },
    { value: 'toys', label: '🧸 Toys', color: 'from-yellow-500 to-amber-500' },
    { value: 'other', label: '📦 Other', color: 'from-gray-500 to-slate-500' }
  ]

  // Success overlay
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center z-50 animate-fade-in">
        <div className="text-center text-white">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <Check size={48} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Posted!</h2>
          <p className="opacity-80">Your item is now live</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Post Your Stufff</h2>
          <p className="text-sm text-gray-500">Snap, describe, sell!</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image Capture */}
        <div className="space-y-2">
          {!imagePreview ? (
            <div className="flex gap-3">
              {/* Camera Button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 aspect-video glass rounded-2xl flex flex-col items-center justify-center card-hover group"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera size={28} className="text-white" />
                </div>
                <span className="text-purple-600 font-semibold">Take Photo</span>
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
                className="hidden"
              />

              {/* Gallery Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 aspect-video glass rounded-2xl flex flex-col items-center justify-center card-hover group"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Image size={28} className="text-white" />
                </div>
                <span className="text-gray-600 font-semibold">Choose Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageCapture}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <button
                type="button"
                onClick={() => {
                  setImage(null)
                  setImagePreview(null)
                }}
                className="absolute top-3 right-3 w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors"
              >
                ✕
              </button>

              {/* AI Generate Button */}
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGenerating}
                className="absolute bottom-3 right-3 btn-primary text-white px-5 py-3 rounded-full flex items-center gap-2 disabled:opacity-50 shadow-xl"
              >
                {isGenerating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Sparkles size={18} />
                )}
                <span className="font-semibold">
                  {isGenerating ? 'Analyzing...' : 'AI Describe'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="glass rounded-2xl p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Tag size={16} className="text-purple-500" />
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you selling?"
            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Description */}
        <div className="glass rounded-2xl p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your item..."
            rows={4}
            className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
          />
        </div>

        {/* Price and Location Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <DollarSign size={16} className="text-green-500" />
              Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div className="glass rounded-2xl p-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MapPin size={16} className="text-red-500" />
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Your area"
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Category */}
        <div className="glass rounded-2xl p-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${category === cat.value
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                  : 'bg-white/50 text-gray-600 hover:bg-white/80'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Facebook Toggle */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <Facebook size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Post to Facebook</p>
                <p className="text-xs text-gray-500">Share to Marketplace</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPostToFb(!postToFb)}
              className={`relative w-14 h-8 rounded-full transition-colors ${postToFb ? 'bg-blue-500' : 'bg-gray-300'
                }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${postToFb ? 'left-7' : 'left-1'
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!imagePreview || !title || !price || isPosting}
          className="w-full btn-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl text-lg"
        >
          {isPosting ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Sparkles size={24} />
              Post Item
            </>
          )}
        </button>
      </form>
    </div>
  )
}
