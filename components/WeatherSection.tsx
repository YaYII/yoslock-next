'use client'

import { useState } from 'react'

export default function WeatherSection() {
  const [temperature] = useState(17)
  const [humidity] = useState(42)
  const [uvIndex] = useState('Low')
  const [date] = useState('01/16 Thu')

  return (
    <div className="relative h-[280px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-50" />
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(/city-bg.jpg)',
          filter: 'brightness(0.8)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6 text-white">
        <div>
          <div className="flex items-baseline mb-2">
            <span className="text-6xl font-light">{temperature}</span>
            <span className="text-2xl ml-1">°C</span>
          </div>
          <div className="space-y-1">
            <p>Hong Kong</p>
            <p>Observatory</p>
            <p>UV Index - {uvIndex}</p>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <span className="text-sm opacity-80">{date}</span>
          <div className="flex items-center">
            <div className="text-center mr-6">
              <span className="block text-lg">{humidity}%</span>
              <span className="text-sm opacity-80">Humidity</span>
            </div>
            <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center">
              <span className="text-sm">Fine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
