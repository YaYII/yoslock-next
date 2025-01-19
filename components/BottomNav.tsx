'use client'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-between items-center h-[64px] px-6">
        <a href="#" className="flex items-center justify-center min-w-[64px] h-full">
          <span className="material-icons text-primary text-2xl">home</span>
        </a>
        
        <a href="#" className="flex items-center justify-center min-w-[64px] h-full">
          <span className="material-icons text-gray-400 text-2xl">person</span>
        </a>
        
        <div className="relative flex items-center justify-center min-w-[64px] h-full">
          <div className="absolute -top-8">
            <button className="w-16 h-16 rounded-full bg-white border-4 border-gray-100 shadow-lg flex items-center justify-center">
              <span className="material-icons text-primary text-3xl">key</span>
            </button>
          </div>
        </div>
        
        <a href="#" className="flex items-center justify-center min-w-[64px] h-full">
          <span className="material-icons text-gray-400 text-2xl">calendar_today</span>
        </a>
        
        <a href="#" className="flex items-center justify-center min-w-[64px] h-full relative">
          <span className="material-icons text-gray-400 text-2xl">chat</span>
          <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full"></span>
        </a>
      </div>
    </nav>
  )
}
