import { useState } from 'react'
import { Search, PlusCircle, Heart, User, Sparkles } from 'lucide-react'
import SearchPage from './pages/SearchPage'
import PostPage from './pages/PostPage'
import MyStuffPage from './pages/MyStuffPage'
import ProfilePage from './pages/ProfilePage'
import ItemDetail from './components/ItemDetail'
import MessagingPanel from './components/MessagingPanel'
import SplashScreen from './components/SplashScreen'
import { StuffsProvider } from './context/StuffsContext'

function App() {
  const [activeTab, setActiveTab] = useState('search')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showMessaging, setShowMessaging] = useState(false)
  const [messagingItem, setMessagingItem] = useState(null)
  const [showSplash, setShowSplash] = useState(() => {
    return !localStorage.getItem('stufff-onboarded')
  })

  const openItemDetail = (item) => {
    setSelectedItem(item)
  }

  const closeItemDetail = () => {
    setSelectedItem(null)
  }

  const openMessaging = (item) => {
    setMessagingItem(item)
    setShowMessaging(true)
  }

  const closeMessaging = () => {
    setShowMessaging(false)
    setMessagingItem(null)
  }

  const tabs = [
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'post', icon: PlusCircle, label: 'Post' },
    { id: 'mystuff', icon: Heart, label: 'My Stufff' },
    { id: 'profile', icon: User, label: 'Profile' }
  ]

  return (
    <StuffsProvider>
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      <div className="min-h-screen flex flex-col">
        {/* Header with glassmorphism */}
        <header className="glass sticky top-0 z-40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg animate-pulse-glow">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Stufff
              </h1>
              <p className="text-purple-400 text-xs font-medium tracking-wide">
                Sell your extra stuff, easily
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24">
          {activeTab === 'search' && (
            <SearchPage
              onSelectItem={openItemDetail}
              onMessage={openMessaging}
            />
          )}
          {activeTab === 'post' && <PostPage onSuccess={() => setActiveTab('search')} />}
          {activeTab === 'mystuff' && (
            <MyStuffPage
              onSelectItem={openItemDetail}
              onMessage={openMessaging}
            />
          )}
          {activeTab === 'profile' && <ProfilePage />}
        </main>

        {/* Bottom Navigation with glassmorphism */}
        <nav className="glass fixed bottom-0 left-0 right-0 z-40 rounded-t-3xl">
          <div className="flex justify-around items-center py-2 px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center px-6 py-3 rounded-2xl transition-all duration-300 ${isActive
                    ? 'text-purple-600'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
                  )}

                  <div className={`p-2 rounded-xl transition-all duration-300 ${isActive
                    ? 'bg-gradient-to-br from-purple-100 to-indigo-100'
                    : ''
                    }`}>
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-xs mt-1 font-semibold transition-all ${isActive ? 'opacity-100' : 'opacity-70'
                    }`}>
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-2">
            <div className="w-32 h-1 bg-gray-300 rounded-full" />
          </div>
        </nav>

        {/* Item Detail Modal */}
        {selectedItem && (
          <ItemDetail
            item={selectedItem}
            onClose={closeItemDetail}
            onMessage={openMessaging}
          />
        )}

        {/* Messaging Panel */}
        {showMessaging && messagingItem && (
          <MessagingPanel
            item={messagingItem}
            onClose={closeMessaging}
          />
        )}
      </div>
    </StuffsProvider>
  )
}

export default App
