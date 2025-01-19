'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const CompanionList = dynamic(() => import('./CompanionList'), { ssr: false })

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const [isProfileExpanded, setIsProfileExpanded] = useState(false)
  const [showCompanionList, setShowCompanionList] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'bg-opacity-50 z-40' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Side Menu */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-[#333333] transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center px-6 py-4 border-b border-gray-600">
          <div className="relative h-8 w-24">
            <Image
              src="/logo.svg"
              alt="YosLock"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-4">
          {/* Profile Section */}
          <div>
            <button 
              className="flex items-center justify-between w-full px-6 py-3 text-gray-200 hover:bg-gray-700/50 transition-colors"
              onClick={() => setIsProfileExpanded(!isProfileExpanded)}
            >
              <div className="flex items-center">
                <span className="material-icons mr-3 text-xl">person_outline</span>
                <span className="text-sm">用户资料</span>
              </div>
              <span className={`material-icons text-lg transition-transform duration-200 ${
                isProfileExpanded ? 'rotate-180' : ''
              }`}>
                expand_more
              </span>
            </button>

            {/* Profile Submenu */}
            <div className={`overflow-hidden transition-all duration-200 ${
              isProfileExpanded ? 'max-h-40' : 'max-h-0'
            }`}>
              <button 
                onClick={() => setShowCompanionList(true)}
                className="flex items-center w-full px-6 py-3 pl-12 text-gray-300 hover:bg-gray-700/50 transition-colors"
              >
                <span className="material-icons mr-3 text-lg">group</span>
                <span className="text-sm">随行联系人管理</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Companion List Modal */}
      {showCompanionList && (
        <div className="fixed inset-0 z-[60]">
          <CompanionList onClose={() => setShowCompanionList(false)} />
        </div>
      )}
    </>
  )
}
