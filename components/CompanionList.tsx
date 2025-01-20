'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import NewFriends from './NewFriends'
import Link from 'next/link'

const AddCompanion = dynamic(() => import('./AddCompanion'))
const SearchCompanionModal = dynamic(() => import('./SearchCompanionModal'))

interface Companion {
  id: string
  name: string
  idType: string
  idNumber: string
  status: 'pending' | 'approved' | 'rejected'
}

interface CompanionListProps {
  onClose: () => void
}

export default function CompanionList({ onClose }: CompanionListProps) {
  const [showAddCompanion, setShowAddCompanion] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [companionToDelete, setCompanionToDelete] = useState<Companion | null>(null)
  const [companions, setCompanions] = useState<Companion[]>([
    { 
      id: '1', 
      name: 'John Smith', 
      idType: 'Passport',
      idNumber: '*****567',
      status: 'approved'
    },
    { 
      id: '2', 
      name: 'Chen Xiaoming', 
      idType: 'Mainland China ID',
      idNumber: '*****234',
      status: 'pending'
    },
    { 
      id: '3', 
      name: 'Wong Mei Ling', 
      idType: 'Hong Kong ID',
      idNumber: '*****56(7)',
      status: 'rejected'
    },
    { 
      id: '4', 
      name: 'Zhang Wei', 
      idType: 'Mainland China ID',
      idNumber: '*****789',
      status: 'approved'
    },
    { 
      id: '5', 
      name: 'Sarah Johnson', 
      idType: 'Passport',
      idNumber: '*****321',
      status: 'pending'
    }
  ])

  // Handle ID number display, only show the last 3 digits
  const maskIdNumber = (idNumber: string) => {
    const length = idNumber.length;
    return '*'.repeat(length - 3) + idNumber.slice(-3);
  };

  const handleDeleteClick = (companion: Companion) => {
    setCompanionToDelete(companion);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (companionToDelete) {
      setCompanions(companions.filter(c => c.id !== companionToDelete.id));
    }
    setShowDeleteConfirm(false);
    setCompanionToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setCompanionToDelete(null);
  };

  // Add new friend request list state
  const [friendRequests, setFriendRequests] = useState<any[]>([]);

  const handleAddCompanion = (data: any) => {
    // All verified registration data will be added directly to companions list
    const newCompanion: Companion = {
      id: Date.now().toString(),
      name: data.name,
      idType: data.documentType === 'mainland' ? 'Mainland China ID' : 
             data.documentType === 'hongkong' ? 'Hong Kong ID' :
             data.documentType === 'macau' ? 'Macau ID' :
             data.documentType === 'passport' ? 'Passport' : 'HK/Macau Permit',
      idNumber: data.idNumber,
      status: data.needManualReview ? 'pending' : 'approved'  // 根据是否需要审核设置状态
    };
    setCompanions([newCompanion, ...companions]);
    
    // Decide whether to close the modal based on the source
    if (!data.fromSearch) {
      setShowAddCompanion(false);
    }
  };

  // Add message listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ADD_COMPANION') {
        const newCompanion = event.data.companion;
        setCompanions(prevCompanions => [...prevCompanions, newCompanion]);
      } else if (event.data.type === 'ADD_FRIEND_REQUEST' && event.data.request) {
        // Handle new friend request
        const newRequest = event.data.request;
        // Ensure request data is valid
        if (newRequest.id && newRequest.name) {
          setFriendRequests(prevRequests => {
            // Check if request with same ID already exists
            const exists = prevRequests.some(req => req.id === newRequest.id);
            if (!exists) {
              return [newRequest, ...prevRequests];
            }
            return prevRequests;
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center border-b border-gray-200">
        <button 
          className="p-2 -ml-2"
          onClick={onClose}
        >
          <span className="material-icons">arrow_back</span>
        </button>
        <h1 className="text-lg font-medium ml-2">Companion Management</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Companion Cards */}
          <div className="bg-white rounded-xl overflow-hidden">
            {companions.map((companion, index) => (
              <div 
                key={companion.id}
                className={`p-4 flex items-center justify-between ${
                  index !== companions.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div>
                  <h3 className="font-medium text-gray-900">{companion.name}</h3>
                  <p className="text-sm text-gray-500">
                    {companion.idType}: {maskIdNumber(companion.idNumber)}
                  </p>
                  <div className={`mt-2 text-sm px-2 py-1 rounded-full inline-block
                    ${companion.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 
                      companion.status === 'approved' ? 'bg-green-50 text-green-600' :
                      'bg-red-50 text-red-600'
                    }`}
                  >
                    {companion.status === 'pending' ? 'Pending' :
                     companion.status === 'approved' ? 'Approved' : 'Rejected'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    onClick={() => handleDeleteClick(companion)}
                  >
                    <span className="material-icons text-gray-600">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              className="w-full bg-white rounded-xl p-4 flex items-center text-left"
              onClick={() => setShowAddCompanion(true)}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                <span className="material-icons text-gray-600">person_add</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Add Companion</h3>
                <p className="text-sm text-gray-500">Register with ID Verification</p>
              </div>
            </button>

            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-4 w-full p-4 hover:bg-gray-50 bg-white rounded-xl"
            >
              <div className="w-12 h-12 rounded-lg bg-[#F9FAFB] flex items-center justify-center">
                <span className="material-icons text-[24px] text-gray-400">person_add</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-[17px] text-gray-900">Add Friend</div>
                <div className="text-[13px] text-[#6B7280]">Search to Add</div>
              </div>
            </button>

            <NewFriends requests={friendRequests} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddCompanion && (
        <div className="fixed inset-0 z-50">
          <AddCompanion 
            onClose={() => setShowAddCompanion(false)}
            onSubmit={handleAddCompanion}
            fromSearch={false}
          />
        </div>
      )}

      {showSearch && (
        <div className="fixed inset-0 z-50">
          <SearchCompanionModal 
            onClose={() => setShowSearch(false)}
            companions={companions}
            onAddCompanion={(newCompanion) => {
              setCompanions([newCompanion, ...companions]);
              // 不关闭搜索界面，让它继续搜索
            }}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && companionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl w-[320px] mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-center mb-2">Delete Companion</h3>
              <div className="text-center mb-6 text-gray-600">
                <p className="mb-1">Confirm to delete the following companion?</p>
                <p className="font-medium text-gray-900">{companionToDelete.name}</p>
                <p className="text-sm text-gray-500">
                  {companionToDelete.idType}: {maskIdNumber(companionToDelete.idNumber)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-6 py-2 border border-gray-200 rounded-full text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-6 py-2 bg-red-500 text-white rounded-full"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
