'use client'

interface MenuItem {
  id: number
  icon: string
  label: string
  badge: boolean | string
}

export default function MenuGrid() {
  const menuItems: MenuItem[] = [
    { id: 1, icon: 'home', label: 'Smart Home', badge: false },
    { id: 2, icon: 'apartment', label: 'Facility & Booking', badge: false },
    { id: 3, icon: 'person_add', label: 'Guest Registration', badge: false },
    { id: 4, icon: 'newspaper', label: 'News', badge: '39' },
    { id: 5, icon: 'shopping_cart', label: 'Web Shop', badge: false },
    { id: 6, icon: 'phone', label: 'Linkus', badge: false },
    { id: 7, icon: 'rate_review', label: 'Reviewing', badge: false },
  ]

  return (
    <div className="bg-white">
      <div className="grid grid-cols-4 divide-x divide-y divide-gray-100">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className="flex flex-col items-center justify-center p-4 relative hover:bg-gray-50"
          >
            <span className="material-icons text-gray-700 text-2xl mb-2">{item.icon}</span>
            <span className="text-xs text-gray-600 text-center">{item.label}</span>
            {item.badge && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
