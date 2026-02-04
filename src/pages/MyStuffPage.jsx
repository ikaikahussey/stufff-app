import { useState } from 'react'
import { MessageCircle, Calendar, Trash2, ChevronRight, Heart, Sparkles } from 'lucide-react'
import { useStuffs } from '../context/StuffsContext'

function formatTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export default function MyStuffPage({ onSelectItem, onMessage }) {
  const { myStuff, removeFromMyStuff, getMessages, getMeetup } = useStuffs()
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleRemove = (itemId) => {
    removeFromMyStuff(itemId)
    setConfirmDelete(null)
  }

  if (myStuff.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center mb-6">
          <Heart size={40} className="text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No items yet</h3>
        <p className="text-gray-500 text-center max-w-xs">
          When you express interest in items, they'll appear here so you can track your conversations
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">My Stufff</h2>
          <p className="text-sm text-gray-500">
            {myStuff.length} item{myStuff.length !== 1 ? 's' : ''} you're interested in
          </p>
        </div>
      </div>

      <div className="space-y-4 stagger-children">
        {myStuff.map(item => {
          const messages = getMessages(item.id)
          const meetup = getMeetup(item.id)
          const hasUnread = messages.some(m => m.from !== 'buyer' && !m.read)

          return (
            <div
              key={item.id}
              className="glass rounded-2xl overflow-hidden card-hover"
            >
              {/* Item Info - Clickable */}
              <div
                onClick={() => onSelectItem(item)}
                className="flex gap-4 p-4 cursor-pointer hover:bg-white/50 transition-colors"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-50 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{item.title}</h3>
                  <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    ${item.price}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Seller: {item.seller.name}
                  </p>
                  {meetup && (
                    <div className="flex items-center text-xs text-green-600 mt-2 bg-green-100 px-3 py-1 rounded-full w-fit">
                      <Calendar size={12} className="mr-1" />
                      Meetup scheduled
                    </div>
                  )}
                </div>
                <ChevronRight className="text-gray-300 self-center" />
              </div>

              {/* Action Buttons */}
              <div className="flex border-t border-gray-100/50">
                <button
                  onClick={() => onMessage(item)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 text-purple-600 hover:bg-purple-50 transition-colors relative font-semibold"
                >
                  <MessageCircle size={18} />
                  <span>Message</span>
                  {messages.length > 0 && (
                    <span className="absolute top-2 right-1/4 w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                      {messages.length}
                    </span>
                  )}
                  {hasUnread && (
                    <span className="absolute top-2 right-1/4 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>
                <div className="w-px bg-gray-100/50" />
                <button
                  onClick={() => setConfirmDelete(item.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors font-semibold"
                >
                  <Trash2 size={18} />
                  <span>Remove</span>
                </button>
              </div>

              {/* Delete Confirmation */}
              {confirmDelete === item.id && (
                <div className="p-4 bg-red-50 border-t border-red-100 animate-fade-in">
                  <p className="text-sm text-red-700 mb-3 font-medium">
                    Remove this item and all messages?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="flex-1 py-2 px-4 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="flex-1 py-2 px-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl text-white font-semibold hover:from-red-600 hover:to-rose-600 transition-colors shadow-lg"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
