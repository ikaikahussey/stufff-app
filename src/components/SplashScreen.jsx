import { useState } from 'react'
import { Sparkles, Camera, MessageCircle, Calendar, Facebook, ChevronRight, X } from 'lucide-react'

const slides = [
    {
        icon: Sparkles,
        title: "Welcome to Stufff",
        subtitle: "The easiest way to sell your extra stuff",
        description: "Turn your unused items into cash with just a few taps. No complicated listings, no hassle.",
        color: "from-purple-500 to-indigo-600"
    },
    {
        icon: Camera,
        title: "Snap & Sell",
        subtitle: "AI-powered descriptions",
        description: "Take a photo and our AI instantly creates a compelling description for your item. It's that simple.",
        color: "from-pink-500 to-rose-600"
    },
    {
        icon: MessageCircle,
        title: "Connect Instantly",
        subtitle: "SMS-powered messaging",
        description: "Get notified instantly when buyers are interested. All messages are delivered via SMS so you never miss a sale.",
        color: "from-cyan-500 to-blue-600"
    },
    {
        icon: Calendar,
        title: "Meet Up Safely",
        subtitle: "Built-in scheduling",
        description: "Coordinate meetups right in the app. Propose times and locations with just a tap.",
        color: "from-amber-500 to-orange-600"
    },
    {
        icon: Facebook,
        title: "Reach More Buyers",
        subtitle: "Auto-post to Facebook",
        description: "Automatically share your listings to Facebook Marketplace for maximum exposure.",
        color: "from-blue-500 to-indigo-600"
    }
]

export default function SplashScreen({ onComplete }) {
    const [currentSlide, setCurrentSlide] = useState(0)

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1)
        } else {
            localStorage.setItem('stufff-onboarded', 'true')
            onComplete()
        }
    }

    const handleSkip = () => {
        localStorage.setItem('stufff-onboarded', 'true')
        onComplete()
    }

    const slide = slides[currentSlide]
    const Icon = slide.icon
    const isLastSlide = currentSlide === slides.length - 1

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 flex flex-col">
            {/* Skip button */}
            <div className="absolute top-6 right-6">
                <button
                    onClick={handleSkip}
                    className="text-white/60 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors"
                >
                    Skip
                    <X size={16} />
                </button>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 animate-fade-in" key={currentSlide}>
                {/* Icon */}
                <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center shadow-2xl mb-8 animate-float`}>
                    <Icon size={56} className="text-white" />
                </div>

                {/* Text content */}
                <div className="text-center max-w-md">
                    <h1 className="text-4xl font-extrabold text-white mb-2">{slide.title}</h1>
                    <p className={`text-lg font-semibold bg-gradient-to-r ${slide.color} bg-clip-text text-transparent mb-4`}>
                        {slide.subtitle}
                    </p>
                    <p className="text-white/70 text-lg leading-relaxed">
                        {slide.description}
                    </p>
                </div>
            </div>

            {/* Bottom section */}
            <div className="px-8 pb-12">
                {/* Dots indicator */}
                <div className="flex justify-center gap-2 mb-8">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                                    ? 'w-8 bg-white'
                                    : 'bg-white/30 hover:bg-white/50'
                                }`}
                        />
                    ))}
                </div>

                {/* Navigation button */}
                <button
                    onClick={handleNext}
                    className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl ${isLastSlide
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                            : 'bg-white text-gray-900 hover:bg-gray-100'
                        }`}
                >
                    {isLastSlide ? "Get Started" : "Next"}
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    )
}
