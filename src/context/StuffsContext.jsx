import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from './AuthContext'

const StuffsContext = createContext()

// Sample items for demo/local mode
const sampleItems = [
  {
    id: '1',
    title: 'Vintage Leather Sofa',
    description: 'Beautiful vintage brown leather sofa in excellent condition. Perfect for a living room or office. Minor wear consistent with age, but no tears or major damage.',
    price: 350,
    category: 'furniture',
    location: 'Downtown',
    seller: { id: 'demo-seller', name: 'John D.', memberSince: '2024' },
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    title: 'Road Bike - Carbon Frame',
    description: 'High-performance carbon fiber road bike. Shimano 105 groupset, excellent for racing or long rides. Recently serviced.',
    price: 800,
    category: 'sports',
    location: 'Westside',
    seller: { id: 'demo-seller-2', name: 'Sarah M.', memberSince: '2023' },
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    title: 'MacBook Pro 14"',
    description: 'M2 Pro chip, 16GB RAM, 512GB SSD. Like new condition, includes original charger and box.',
    price: 1500,
    category: 'electronics',
    location: 'Midtown',
    seller: { id: 'demo-seller-3', name: 'Mike R.', memberSince: '2024' },
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    title: 'Acoustic Guitar - Taylor',
    description: 'Taylor 214ce acoustic-electric guitar. Beautiful sound, no scratches. Includes hardshell case.',
    price: 650,
    category: 'music',
    location: 'Eastside',
    seller: { id: 'demo-seller-4', name: 'Lisa K.', memberSince: '2023' },
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    title: 'Standing Desk - Electric',
    description: 'Electric height-adjustable standing desk. 60" wide, memory presets. Minor scratches on surface.',
    price: 275,
    category: 'furniture',
    location: 'Downtown',
    seller: { id: 'demo-seller', name: 'John D.', memberSince: '2024' },
    image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '6',
    title: 'Vintage Record Player',
    description: 'Fully restored 1970s turntable. New needle, built-in speakers. Perfect for vinyl enthusiasts.',
    price: 180,
    category: 'music',
    location: 'Northside',
    seller: { id: 'demo-seller-5', name: 'Tom H.', memberSince: '2024' },
    image: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=800',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export function StuffsProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [myStuff, setMyStuff] = useState([])
  const [messages, setMessages] = useState({})
  const [scheduledMeetups, setScheduledMeetups] = useState({})
  const [loading, setLoading] = useState(true)
  const isConfigured = isSupabaseConfigured()

  // Load items
  useEffect(() => {
    if (isConfigured) {
      loadItems()
    } else {
      // Local mode - use sample items
      const saved = localStorage.getItem('stufff-items')
      setItems(saved ? JSON.parse(saved) : sampleItems)
      setLoading(false)
    }
  }, [isConfigured])

  // Load user's interests when logged in
  useEffect(() => {
    if (isConfigured && user) {
      loadMyStuff()
      loadMessages()
    } else if (!isConfigured) {
      // Local mode
      const savedMyStuff = localStorage.getItem('stufff-mystuff')
      const savedMessages = localStorage.getItem('stufff-messages')
      const savedMeetups = localStorage.getItem('stufff-meetups')
      setMyStuff(savedMyStuff ? JSON.parse(savedMyStuff) : [])
      setMessages(savedMessages ? JSON.parse(savedMessages) : {})
      setScheduledMeetups(savedMeetups ? JSON.parse(savedMeetups) : {})
    }
  }, [isConfigured, user])

  // Persist to localStorage in local mode
  useEffect(() => {
    if (!isConfigured) {
      localStorage.setItem('stufff-items', JSON.stringify(items))
    }
  }, [items, isConfigured])

  useEffect(() => {
    if (!isConfigured) {
      localStorage.setItem('stufff-mystuff', JSON.stringify(myStuff))
    }
  }, [myStuff, isConfigured])

  useEffect(() => {
    if (!isConfigured) {
      localStorage.setItem('stufff-messages', JSON.stringify(messages))
    }
  }, [messages, isConfigured])

  useEffect(() => {
    if (!isConfigured) {
      localStorage.setItem('stufff-meetups', JSON.stringify(scheduledMeetups))
    }
  }, [scheduledMeetups, isConfigured])

  // Supabase data loaders
  const loadItems = async () => {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        seller:profiles!seller_id(id, name, created_at)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading items:', error)
      setItems(sampleItems) // Fallback to sample items
    } else {
      const formattedItems = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: parseFloat(item.price),
        category: item.category,
        location: item.location,
        image: item.image_url,
        seller: {
          id: item.seller?.id,
          name: item.seller?.name || 'Anonymous',
          memberSince: item.seller?.created_at ? new Date(item.seller.created_at).getFullYear().toString() : '2024'
        },
        createdAt: item.created_at
      }))
      setItems(formattedItems.length > 0 ? formattedItems : sampleItems)
    }
    setLoading(false)
  }

  const loadMyStuff = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('interests')
      .select(`
        *,
        item:items(
          *,
          seller:profiles!seller_id(id, name)
        )
      `)
      .eq('buyer_id', user.id)

    if (error) {
      console.error('Error loading interests:', error)
      return
    }

    const interestedItems = data.map(interest => ({
      id: interest.item.id,
      title: interest.item.title,
      description: interest.item.description,
      price: parseFloat(interest.item.price),
      category: interest.item.category,
      location: interest.item.location,
      image: interest.item.image_url,
      seller: {
        id: interest.item.seller?.id,
        name: interest.item.seller?.name || 'Anonymous'
      },
      createdAt: interest.item.created_at
    }))

    setMyStuff(interestedItems)
  }

  const loadMessages = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading messages:', error)
      return
    }

    // Group messages by item_id
    const grouped = {}
    data.forEach(msg => {
      if (!grouped[msg.item_id]) {
        grouped[msg.item_id] = []
      }
      grouped[msg.item_id].push({
        id: msg.id,
        text: msg.content,
        sender: msg.sender_id === user.id ? 'buyer' : 'seller',
        timestamp: new Date(msg.created_at).getTime(),
        isMeetup: msg.is_meetup_proposal,
        meetupDetails: msg.is_meetup_proposal ? {
          date: msg.meetup_date,
          time: msg.meetup_time,
          location: msg.meetup_location,
          status: msg.meetup_status || 'pending'
        } : null
      })
    })
    setMessages(grouped)
  }

  // Actions
  const addItem = async (item) => {
    if (isConfigured && user) {
      const { data, error } = await supabase
        .from('items')
        .insert({
          seller_id: user.id,
          title: item.title,
          description: item.description,
          price: item.price,
          category: item.category,
          location: item.location,
          image_url: item.image
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding item:', error)
        return null
      }

      await loadItems()
      return data
    } else {
      // Local mode
      const newItem = {
        ...item,
        id: Date.now().toString(),
        seller: { id: 'local-user', name: 'You', memberSince: '2024' },
        createdAt: new Date().toISOString()
      }
      setItems(prev => [newItem, ...prev])
      return newItem
    }
  }

  const expressInterest = async (item) => {
    if (isConfigured && user) {
      const { error } = await supabase
        .from('interests')
        .insert({
          item_id: item.id,
          buyer_id: user.id
        })

      if (error && error.code !== '23505') { // Ignore duplicate key error
        console.error('Error expressing interest:', error)
        return
      }

      await loadMyStuff()
    } else {
      // Local mode
      if (!myStuff.find(i => i.id === item.id)) {
        setMyStuff(prev => [...prev, item])
      }
    }
  }

  const removeInterest = async (itemId) => {
    if (isConfigured && user) {
      const { error } = await supabase
        .from('interests')
        .delete()
        .eq('item_id', itemId)
        .eq('buyer_id', user.id)

      if (error) {
        console.error('Error removing interest:', error)
        return
      }

      await loadMyStuff()
    } else {
      // Local mode
      setMyStuff(prev => prev.filter(i => i.id !== itemId))
    }
  }

  const isInterested = useCallback((itemId) => {
    return myStuff.some(item => item.id === itemId)
  }, [myStuff])

  const sendMessage = async (itemId, text, sellerId) => {
    if (isConfigured && user) {
      const { error } = await supabase
        .from('messages')
        .insert({
          item_id: itemId,
          sender_id: user.id,
          receiver_id: sellerId,
          content: text
        })

      if (error) {
        console.error('Error sending message:', error)
        return
      }

      await loadMessages()
    } else {
      // Local mode
      const message = {
        id: Date.now().toString(),
        text,
        sender: 'buyer',
        timestamp: Date.now()
      }
      setMessages(prev => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), message]
      }))
    }
  }

  const scheduleMeetup = async (itemId, details, sellerId) => {
    if (isConfigured && user) {
      const { error } = await supabase
        .from('messages')
        .insert({
          item_id: itemId,
          sender_id: user.id,
          receiver_id: sellerId,
          content: `Meetup proposal: ${details.date} at ${details.time} - ${details.location}`,
          is_meetup_proposal: true,
          meetup_date: details.date,
          meetup_time: details.time,
          meetup_location: details.location,
          meetup_status: 'pending'
        })

      if (error) {
        console.error('Error scheduling meetup:', error)
        return
      }

      await loadMessages()
    } else {
      // Local mode
      setScheduledMeetups(prev => ({
        ...prev,
        [itemId]: { ...details, status: 'pending' }
      }))

      const meetupMessage = {
        id: Date.now().toString(),
        text: `Meetup proposed: ${details.date} at ${details.time} - ${details.location}`,
        sender: 'buyer',
        timestamp: Date.now(),
        isMeetup: true,
        meetupDetails: details
      }
      setMessages(prev => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), meetupMessage]
      }))
    }
  }

  const getMessages = useCallback((itemId) => {
    return messages[itemId] || []
  }, [messages])

  const getUnreadCount = useCallback((itemId) => {
    return (messages[itemId] || []).length
  }, [messages])

  const getMeetupStatus = useCallback((itemId) => {
    if (isConfigured) {
      const itemMessages = messages[itemId] || []
      const meetupMsg = itemMessages.find(m => m.isMeetup)
      return meetupMsg?.meetupDetails?.status || null
    }
    return scheduledMeetups[itemId]?.status || null
  }, [messages, scheduledMeetups, isConfigured])

  const searchItems = useCallback((query) => {
    if (!query || !query.trim()) return items
    const lowerQuery = query.toLowerCase()
    return items.filter(item =>
      item.title?.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.category?.toLowerCase().includes(lowerQuery) ||
      item.location?.toLowerCase().includes(lowerQuery)
    )
  }, [items])

  const value = {
    items,
    myStuff,
    loading,
    addItem,
    expressInterest,
    removeInterest,
    isInterested,
    sendMessage,
    scheduleMeetup,
    getMessages,
    getUnreadCount,
    getMeetupStatus,
    searchItems,
    refreshItems: loadItems,
    refreshMyStuff: loadMyStuff
  }

  return (
    <StuffsContext.Provider value={value}>
      {children}
    </StuffsContext.Provider>
  )
}

export function useStuffs() {
  const context = useContext(StuffsContext)
  if (!context) {
    throw new Error('useStuffs must be used within a StuffsProvider')
  }
  return context
}
