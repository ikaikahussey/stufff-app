// Integration Services for Stufff App
// Real API implementations for Twilio SMS and AI Vision

/**
 * Generate AI description for an item based on its image
 * Uses OpenAI Vision API or Google Cloud Vision + Gemini
 */
export async function generateDescription(imageBase64) {
  const apiKey = import.meta.env.VITE_AI_API_KEY
  const apiProvider = import.meta.env.VITE_AI_PROVIDER || 'openai' // 'openai' or 'google'

  // If no API key, use mock response
  if (!apiKey) {
    console.log('No AI API key configured, using mock response')
    return getMockDescription()
  }

  try {
    if (apiProvider === 'openai') {
      return await generateWithOpenAI(imageBase64, apiKey)
    } else if (apiProvider === 'google') {
      return await generateWithGemini(imageBase64, apiKey)
    }
  } catch (error) {
    console.error('AI API error:', error)
    return getMockDescription()
  }
}

async function generateWithOpenAI(imageBase64, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image of an item for sale. Provide a JSON response with:
              - title: A catchy, concise title (max 50 chars)
              - description: A compelling description highlighting condition and features (100-200 chars)
              - category: One of: electronics, furniture, clothing, sports, music, kitchen, books, toys, other
              - suggestedPrice: A fair price in USD as a number
              
              Respond ONLY with valid JSON, no markdown.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    })
  })

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error.message)
  }

  const content = data.choices[0].message.content
  return JSON.parse(content)
}

async function generateWithGemini(imageBase64, apiKey) {
  // Extract base64 data without the data URL prefix
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            text: `Analyze this image of an item for sale. Provide a JSON response with:
            - title: A catchy, concise title (max 50 chars)
            - description: A compelling description highlighting condition and features (100-200 chars)
            - category: One of: electronics, furniture, clothing, sports, music, kitchen, books, toys, other
            - suggestedPrice: A fair price in USD as a number
            
            Respond ONLY with valid JSON, no markdown code blocks.`
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          }
        ]
      }]
    })
  })

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error.message)
  }

  const content = data.candidates[0].content.parts[0].text
  // Clean up potential markdown formatting
  const cleanJson = content.replace(/```json\n?|\n?```/g, '').trim()
  return JSON.parse(cleanJson)
}

function getMockDescription() {
  const mockResponses = [
    {
      title: 'Vintage Collectible Item',
      description: 'This appears to be a well-maintained vintage item in excellent condition. The craftsmanship shows attention to detail with quality materials.',
      category: 'other',
      suggestedPrice: 75
    },
    {
      title: 'Electronics Device',
      description: 'Modern electronics device in great working condition. Clean exterior with minimal signs of use. All functions tested and working.',
      category: 'electronics',
      suggestedPrice: 150
    },
    {
      title: 'Home Furniture Piece',
      description: 'Stylish furniture piece that would complement any modern home. Solid construction with contemporary design.',
      category: 'furniture',
      suggestedPrice: 200
    }
  ]
  return mockResponses[Math.floor(Math.random() * mockResponses.length)]
}

/**
 * Post item to Facebook Marketplace
 * Uses Facebook Graph API with OAuth
 */
export async function postToFacebook(item) {
  const accessToken = import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN

  if (!accessToken) {
    console.log('Facebook posting (mock):', { title: item.title, price: item.price })
    return {
      success: true,
      postId: `fb_mock_${Date.now()}`,
      url: `https://facebook.com/marketplace/item/${Date.now()}`
    }
  }

  try {
    // Note: Facebook Marketplace API has limited access
    // This is a simplified example - real implementation requires app review
    const response = await fetch(`https://graph.facebook.com/v18.0/me/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: accessToken,
        message: `🏷️ FOR SALE: ${item.title}\n💰 $${item.price}\n\n${item.description}\n\n📍 ${item.location}\n\n#Stufff #ForSale`,
      })
    })

    const data = await response.json()

    return {
      success: !data.error,
      postId: data.id || null,
      url: data.id ? `https://facebook.com/${data.id}` : null,
      error: data.error?.message
    }
  } catch (error) {
    console.error('Facebook API error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send SMS notification using Twilio
 * Requires Twilio account credentials
 */
export async function sendSMS(phoneNumber, message) {
  const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID
  const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN
  const twilioPhone = import.meta.env.VITE_TWILIO_PHONE_NUMBER

  // If no Twilio credentials, use mock
  if (!accountSid || !authToken || !twilioPhone) {
    console.log('SMS (mock):', { to: phoneNumber, message: message.substring(0, 50) + '...' })
    return {
      success: true,
      messageId: `sms_mock_${Date.now()}`,
      mock: true
    }
  }

  try {
    // Twilio API requires server-side call due to CORS
    // In production, this should go through your backend
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`

    const formData = new URLSearchParams()
    formData.append('To', phoneNumber)
    formData.append('From', twilioPhone)
    formData.append('Body', message)

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    })

    const data = await response.json()

    if (data.error_code) {
      throw new Error(data.message)
    }

    return {
      success: true,
      messageId: data.sid,
      status: data.status
    }
  } catch (error) {
    console.error('Twilio API error:', error)
    // Fall back to mock on error
    return {
      success: false,
      error: error.message,
      mock: true
    }
  }
}

/**
 * Configuration for production integrations
 * Set these in your .env file
 */
export const integrationConfig = {
  // AI Vision API
  ai: {
    provider: import.meta.env.VITE_AI_PROVIDER || 'openai', // 'openai' or 'google'
    apiKey: import.meta.env.VITE_AI_API_KEY || '',
    configured: !!import.meta.env.VITE_AI_API_KEY
  },

  // Twilio SMS
  twilio: {
    accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID || '',
    authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN || '',
    phoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER || '',
    configured: !!(import.meta.env.VITE_TWILIO_ACCOUNT_SID && import.meta.env.VITE_TWILIO_AUTH_TOKEN)
  },

  // Facebook Graph API  
  facebook: {
    accessToken: import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN || '',
    configured: !!import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN
  }
}

/**
 * Check which integrations are configured
 */
export function getIntegrationStatus() {
  return {
    ai: integrationConfig.ai.configured,
    twilio: integrationConfig.twilio.configured,
    facebook: integrationConfig.facebook.configured
  }
}
