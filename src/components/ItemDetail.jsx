import { useState } from 'react'
import { X, MapPin, Clock, User, Heart, MessageCircle, Check, Sparkles } from 'lucide-react'
import { useStuffs } from '../context/StuffsContext'

function formatTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  return `${diffDays} days ago`
}

export default function ItemDetail({ item, onClose, onMessage }) {
  const { expressInterest, myStuff } = useStuffs()
  const [justExpressed, setJustExpressed] = useState(false)

  const isInterested = myStuff.some(i => i.id === item.id)

  const handleExpressInterest = () => {
    const success = expressInterest(item)
    if (success) {
      setJustExpressed(true)
      setTimeout(() => setJustExpressed(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl animate-slide-up shadow-2xl">
        {/* Header Image */}
        <div className="relative">
          <img
            src={item.image}
            alt={item.title}
            className="w-full aspect-square object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 glass-dark rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Price badge */}
          <div className="absolute bottom-4 left-4 glass rounded-2xl px-4 py-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              ${item.price}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">{item.title}</h2>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 mb-5">
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              <MapPin size={14} className="text-purple-500" />
              <span>{item.location || 'Location not specified'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              <Clock size={14} className="text-purple-500" />
              <span>{formatTimeAgo(item.postedAt)}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-500" />
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {item.description || 'No description provided.'}
            </p>
          </div>

          {/* Seller Info */}
          <div className="glass rounded-2xl p-4 mb-6">
            <h3 className="font-bold text-gray-700 mb-3">Seller</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <User size={28} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-lg">{item.seller.name}</p>
                <p className="text-sm text-gray-500">Member since 2024</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Express Interest Button */}
            <button
              onClick={handleExpressInterest}
              disabled={isInterested}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-lg ${isInterested
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : justExpressed
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl'
                    : 'btn-primary text-white shadow-xl'
                }`}
            >
              {isInterested ? (
                <>
                  <Check size={24} />
                  Added to My Stufff
                </>
              ) : justExpressed ? (
                <>
                  <Check size={24} />
                  Interested!
                </>
              ) : (
                <>
                  <Heart size={24} />
                  I'm Interested
                </>
              )}
            </button>

            {/* Message Button */}
            {isInterested && (
              <button
                onClick={() => {
                  onClose()
                  onMessage(item)
                }}
                className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 border-2 border-purple-500 text-purple-600 hover:bg-purple-50 transition-colors text-lg"
              >
                <MessageCircle size={24} />
                Message Seller
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
