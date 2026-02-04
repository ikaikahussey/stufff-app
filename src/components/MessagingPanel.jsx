import { useState, useRef, useEffect } from 'react'
import { X, Send, Calendar, Phone, ChevronDown, Loader2 } from 'lucide-react'
import { useStuffs } from '../context/StuffsContext'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { sendSMS } from '../services/integrations'

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function MessagingPanel({ item, onClose }) {
  const { sendMessage, getMessages, scheduleMeetup, getMeetupStatus } = useStuffs()
  const { user } = useAuth()
  const [newMessage, setNewMessage] = useState('')
  const [showScheduler, setShowScheduler] = useState(false)
  const [meetupDate, setMeetupDate] = useState('')
  const [meetupTime, setMeetupTime] = useState('')
  const [meetupLocation, setMeetupLocation] = useState(item.location || '')
  const [sendingSMS, setSendingSMS] = useState(false)
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)
  const isConfigured = isSupabaseConfigured()

  // Load initial messages
  useEffect(() => {
    const msgs = getMessages(item.id)
    setMessages(msgs)
  }, [item.id, getMessages])

  // Real-time subscription for new messages
  useEffect(() => {
    if (!isConfigured || !user) return

    const channel = supabase
      .channel(`messages:${item.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `item_id=eq.${item.id}`
        },
        (payload) => {
          const newMsg = payload.new
          setMessages(prev => [...prev, {
            id: newMsg.id,
            text: newMsg.content,
            sender: newMsg.sender_id === user.id ? 'buyer' : 'seller',
            timestamp: new Date(newMsg.created_at).getTime(),
            isMeetup: newMsg.is_meetup_proposal,
            meetupDetails: newMsg.is_meetup_proposal ? {
              date: newMsg.meetup_date,
              time: newMsg.meetup_time,
              location: newMsg.meetup_location,
              status: newMsg.meetup_status
            } : null
          }])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [item.id, user, isConfigured])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const meetupStatus = getMeetupStatus(item.id)

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const messageText = newMessage.trim()
    setNewMessage('')

    // Add optimistic message for local mode
    if (!isConfigured) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: messageText,
        sender: 'buyer',
        timestamp: Date.now()
      }])
    }

    // Send to Supabase or local storage
    await sendMessage(item.id, messageText, item.seller?.id)

    // Send SMS notification
    setSendingSMS(true)
    try {
      await sendSMS(
        item.seller?.phone || '+15551234567',
        `New message about "${item.title}": ${messageText.substring(0, 100)}${messageText.length > 100 ? '...' : ''}`
      )
    } catch (error) {
      console.error('Failed to send SMS:', error)
    }
    setSendingSMS(false)
  }

  const handleScheduleMeetup = async () => {
    if (!meetupDate || !meetupTime) return

    const meetupDetails = {
      date: meetupDate,
      time: meetupTime,
      location: meetupLocation
    }

    await scheduleMeetup(item.id, meetupDetails, item.seller?.id)

    try {
      await sendSMS(
        item.seller?.phone || '+15551234567',
        `Meetup request for "${item.title}": ${formatDate(meetupDate)} at ${meetupTime}${meetupLocation ? `, Location: ${meetupLocation}` : ''}`
      )
    } catch (error) {
      console.error('Failed to send SMS:', error)
    }

    setShowScheduler(false)
  }

  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp)
    if (!groups[date]) groups[date] = []
    groups[date].push(message)
    return groups
  }, {})

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-white w-full max-w-lg h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-100 glass rounded-t-3xl">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-indigo-50">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 truncate">{item.title}</h3>
            <p className="text-sm text-gray-500">with {item.seller?.name || 'Seller'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scheduled Meetup Banner */}
        {meetupStatus && (
          <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <div className="flex items-center gap-2 text-green-700">
              <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                <Calendar size={16} className="text-white" />
              </div>
              <div>
                <span className="font-bold">Meetup {meetupStatus === 'pending' ? 'Proposed' : 'Confirmed'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Send size={28} className="text-purple-500" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Start a conversation</h4>
              <p className="text-sm text-gray-500">Messages are sent via SMS</p>
            </div>
          )}

          {Object.entries(groupedMessages).map(([date, dayMessages]) => (
            <div key={date}>
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500 font-medium">
                  {date}
                </span>
              </div>
              {dayMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-3 ${message.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${message.isMeetup
                        ? 'glass bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                        : message.sender === 'buyer'
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {message.isMeetup && (
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={14} className="text-green-600" />
                        <span className="text-xs font-semibold text-green-600">Meetup Proposal</span>
                      </div>
                    )}
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.sender === 'buyer' ? 'text-white/70' : 'text-gray-400'
                      }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Schedule Meetup Section */}
        {showScheduler && (
          <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <Calendar size={18} className="text-purple-500" />
                Schedule Meetup
              </h4>
              <button onClick={() => setShowScheduler(false)} className="text-gray-400 hover:text-gray-600">
                <ChevronDown size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="date"
                value={meetupDate}
                onChange={(e) => setMeetupDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="time"
                value={meetupTime}
                onChange={(e) => setMeetupTime(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <input
              type="text"
              value={meetupLocation}
              onChange={(e) => setMeetupLocation(e.target.value)}
              placeholder="Meeting location"
              className="w-full px-3 py-2 mb-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleScheduleMeetup}
              disabled={!meetupDate || !meetupTime}
              className="w-full py-3 btn-primary text-white rounded-xl font-bold disabled:opacity-50"
            >
              Propose Meetup
            </button>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t border-gray-100 glass">
          {!showScheduler && (
            <button
              onClick={() => setShowScheduler(true)}
              className="w-full py-3 mb-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl text-purple-600 font-semibold flex items-center justify-center gap-2 hover:from-purple-100 hover:to-indigo-100 transition-all"
            >
              <Calendar size={18} />
              Schedule Meetup
            </button>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sendingSMS}
              className="w-12 h-12 btn-primary text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-all"
            >
              {sendingSMS ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
            <Phone size={12} />
            Messages are also sent via SMS
          </p>
        </div>
      </div>
    </div>
  )
}
