'use client'

import dynamic from 'next/dynamic'

const Header = dynamic(() => import('@/components/Header'), { ssr: false })
const WeatherSection = dynamic(() => import('@/components/WeatherSection'), { ssr: false })
const MenuGrid = dynamic(() => import('@/components/MenuGrid'), { ssr: false })
const BottomNav = dynamic(() => import('@/components/BottomNav'), { ssr: false })

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="pb-20"> {/* Add padding to account for bottom nav */}
        <WeatherSection />
        <div className="mt-4">
          <h2 className="px-4 text-lg font-medium text-gray-900">Quick Access</h2>
          <MenuGrid />
        </div>

        <div className="mt-6 px-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">What's News</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">System Update</span>
                  <span className="text-xs text-gray-500">2m ago</span>
                </div>
                <p className="text-sm text-gray-600">
                  New features have been added to improve your experience.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </main>
  )
}
