import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'

const Logo = ({ size = 'medium', className = '' }) => {
  const { currentTheme, isDark } = useTheme()

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  }

  const textSizes = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl'
  }

  const logoVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      variants={logoVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
    >
      {/* নতুন প্রিমিয়াম SVG লোগো */}
      <div className={sizeClasses[size]}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="stop-color-gradient-start" />
              <stop offset="100%" className="stop-color-gradient-end" />
            </linearGradient>
            <style>
              {`
                .stop-color-gradient-start { stop-color: ${isDark ? '#4f46e5' : '#6366f1'}; }
                .stop-color-gradient-end { stop-color: ${isDark ? '#a78bfa' : '#a855f7'}; }
                
                [data-theme="blue"] .stop-color-gradient-start { stop-color: ${isDark ? '#2563eb' : '#3b82f6'}; }
                [data-theme="blue"] .stop-color-gradient-end { stop-color: ${isDark ? '#60a5fa' : '#93c5fd'}; }
                
                [data-theme="purple"] .stop-color-gradient-start { stop-color: ${isDark ? '#7c3aed' : '#8b5cf6'}; }
                [data-theme="purple"] .stop-color-gradient-end { stop-color: ${isDark ? '#a78bfa' : '#c4b5fd'}; }

                [data-theme="gold"] .stop-color-gradient-start { stop-color: ${isDark ? '#d97706' : '#f59e0b'}; }
                [data-theme="gold"] .stop-color-gradient-end { stop-color: ${isDark ? '#fbbf24' : '#fcd34d'}; }

                [data-theme="emerald"] .stop-color-gradient-start { stop-color: ${isDark ? '#059669' : '#10b981'}; }
                [data-theme="emerald"] .stop-color-gradient-end { stop-color: ${isDark ? '#34d399' : '#6ee7b7'}; }

                [data-theme="rose"] .stop-color-gradient-start { stop-color: ${isDark ? '#e11d48' : '#f43f5e'}; }
                [data-theme="rose"] .stop-color-gradient-end { stop-color: ${isDark ? '#fb7185' : '#fda4af'}; }
              `}
            </style>
          </defs>
          
          {/* খোলা বইয়ের পাতা */}
          <path 
            d="M20 80 Q50 60 80 80 L80 90 Q50 70 20 90 Z" 
            fill="url(#logoGradient)" 
            opacity={isDark ? 0.6 : 0.7}
          />
          <path 
            d="M20 75 Q50 55 80 75 L80 85 Q50 65 20 85 Z" 
            fill="url(#logoGradient)" 
            opacity={isDark ? 0.8 : 0.9}
          />
          
          {/* গ্র্যাজুয়েশন ক্যাপের শৈল্পিক রূপ */}
          <path 
            d="M50 10 L10 35 L50 60 L90 35 Z" 
            fill="url(#logoGradient)"
          />
          
          {/* ক্যাপের উপরের অংশ, যা গভীরতা বোঝায় */}
          <path
            d="M50 10 L90 35 L90 45 L50 20 Z"
            fill="url(#logoGradient)"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* লোগোর টেক্সট */}
      <div className="flex items-baseline">
        <span 
          className={`font-bold ${textSizes[size]} ${isDark ? 'text-white' : 'text-gray-900'} tracking-tighter`}
        >
          EduVerse
        </span>
        <span 
          className={`font-bold ${textSizes[size]} ${currentTheme.text}`}
        >
          Pro
        </span>
      </div>
    </motion.div>
  )
}

export default Logo
