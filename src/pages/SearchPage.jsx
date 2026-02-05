import { useState } from 'react'
import { Search, MapPin, Clock, Sparkles } from 'lucide-react'
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

export default function SearchPage({ onSelectItem }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { searchItems } = useStuffs()

  const filteredItems = searchItems(searchQuery)

  return (
    <div className="p-4">
      {/* Search Bar with enhanced styling */}
      <div className={`relative mb-6 transition-all duration-300 ${isFocused ? 'transform scale-[1.02]' : ''}`}>
        <div className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur transition-opacity duration-300 ${isFocused ? 'opacity-20' : 'opacity-0'
          }`} />
        <div className="relative glass rounded-2xl overflow-hidden">
          <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-purple-500' : 'text-gray-400'
            }`} size={20} />
          <input
            type="text"
            placeholder="Search for stuff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pl-12 pr-4 py-4 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none font-medium"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-purple-500" />
        <p className="text-sm text-gray-600 font-medium">
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
          {searchQuery && <span className="text-purple-600"> for "{searchQuery}"</span>}
        </p>
      </div>

      {/* Items Grid with staggered animation */}
      <div className="grid grid-cols-2 gap-4 stagger-children">
        {filteredItems.map(item => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="glass rounded-2xl overflow-hidden card-hover cursor-pointer group"
          >
            <div className="aspect-square overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-50">
              <img
                src={item.image}
                alt={item.title}
                className="img-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-gray-800 truncate mb-1">{item.title}</h3>
              <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                ${item.price}
              </p>
              <div className="flex items-center text-xs text-gray-500 mt-2 gap-3">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-purple-400" />
                  <span className="truncate max-w-[60px]">{item.location}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-purple-400" />
                  <span>{formatTimeAgo(item.createdAt)}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="text-6xl mb-4 animate-float">🔍</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No items found</h3>
          <p className="text-gray-500">Try a different search term</p>
        </div>
      )}
    </div>
  )
}
