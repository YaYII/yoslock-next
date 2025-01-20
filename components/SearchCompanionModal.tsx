'use client'

import { useState } from 'react';
import dynamic from 'next/dynamic';

const AddCompanion = dynamic(() => import('./AddCompanion'));

interface SearchResult {
  name: string;
  idType: string;
  idNumber: string;
  phone?: string;
}

interface Companion {
  id: string;
  name: string;
  idType: string;
  idNumber: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface SearchCompanionModalProps {
  onClose: () => void;
  companions: Companion[];
  onAddCompanion: (companion: Companion) => void;
}

export default function SearchCompanionModal({ 
  onClose,
  companions,
  onAddCompanion 
}: SearchCompanionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showPendingPrompt, setShowPendingPrompt] = useState(false);
  const [showEmptySearchPrompt, setShowEmptySearchPrompt] = useState(false);

  const handleSearch = async () => {
    console.log('Search button clicked');
    console.log('Current search term:', searchTerm);

    if (!searchTerm.trim()) {
      console.log('Search term is empty, showing prompt');
      setShowEmptySearchPrompt(true);
      return;
    }

    // Check if there are any pending companions
    const hasPendingCompanion = companions.some(companion => companion.status === 'pending');
    // Check if there are any approved companions
    const hasApprovedCompanion = companions.some(companion => companion.status === 'approved');
    
    if (hasPendingCompanion) {
      if(!hasApprovedCompanion){
        // If there are pending companions, show the pending prompt
        setShowPendingPrompt(true);
        return;
      }
     
    } else if (!hasApprovedCompanion && !showVerification) {
      // If there are no approved companions and not in verification process, show verification prompt
      setShowVerificationPrompt(true);
      return;
    }

    console.log('Starting search with approved companion');
    setIsLoading(true);
    try {
      // Simulate search request
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = {
        name: 'Chen Xiaoming',
        idType: 'Mainland China ID',
        idNumber: '*****463',
        phone: '+86 135 8888 8888'
      };
      console.log('Search result:', result);
      setSearchResult(result);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = () => {
    console.log('Starting verification process');
    setShowVerificationPrompt(false);
    setTimeout(() => {
      setShowVerification(true);
    }, 100);
    
  };

  const handleCloseVerification = () => {
    console.log('Closing verification modal');
    setShowVerification(false);
    // Don't close the search interface
  };

  const handleAddCompanion = (data: any) => {
    console.log('Adding companion with data:', data);
    // Convert identity verification data to companion format
    const newCompanion: Companion = {
      id: Date.now().toString(),
      name: data.name,
      idType: data.documentType === 'mainland' ? 'Mainland China ID' : 
             data.documentType === 'hongkong' ? 'Hong Kong ID' :
             data.documentType === 'macau' ? 'Macau ID' :
             data.documentType === 'passport' ? 'Passport' : 'HK/Macau Permit',
      idNumber: data.idNumber,
      status: data.needManualReview ? 'pending' : 'approved'
    };

    // Add to companions list
    onAddCompanion(newCompanion);
    setShowVerification(false);

    // If manual review is not needed, continue searching
    if (!data.needManualReview) {
      console.log('Companion approved, continuing search');
      handleSearch();
    }
  };

  const handleSend = async () => {
    console.log('Send button clicked');
    console.log('Setting loading state to true');
    setIsLoading(true);

    try {
      console.log('Starting send request');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Send request completed');
      setShowSuccess(true);
      console.log('Success modal shown');

      // Create new friend request data
      const newRequest = {
        id: `request-${Date.now()}`,
        avatar: '/avatars/default.jpg',
        name: searchResult?.name || '',
        description: `${searchResult?.idType}: ${searchResult?.idNumber.replace(/[0-9]/g, '*')}`,
        status: 'pending' as const,
        timestamp: 'Just now',
        createdAt: Date.now()
      };

      // Send message to parent component to add new friend request
      window.parent.postMessage({
        type: 'ADD_FRIEND_REQUEST',
        request: newRequest
      }, '*');

      console.log('Starting close timer');
      setTimeout(() => {
        console.log('Closing modal');
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Send failed:', error);
    } finally {
      console.log('Setting loading state to false');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center">
          <button 
            className="p-2 -ml-2"
            onClick={onClose}
          >
            <span className="material-icons">arrow_back</span>
          </button>
          <h1 className="text-lg font-medium ml-2">Add Friend</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Search Input */}
        <div className="bg-white rounded-[10px] p-4 mb-4">
          <div className="relative flex items-center bg-[#F9FAFB] rounded-full border border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                console.log('Search term changed:', e.target.value);
                setSearchTerm(e.target.value);
              }}
              placeholder="Enter friend's email to search"
              className="flex-1 h-[44px] pl-4 pr-[100px] bg-transparent text-[15px] placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={() => {
                console.log('Search button clicked in JSX');
                handleSearch();
              }}
              disabled={isLoading}
              className={`absolute right-2 px-6 py-1.5 bg-black text-white rounded-full text-[15px] ${isLoading ? 'opacity-50' : ''}`}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className="bg-white rounded-[10px] p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[17px] text-gray-900">{searchResult.name}</div>
              <button
                onClick={() => {
                  console.log('Send button clicked in JSX');
                  handleSend();
                }}
                disabled={isLoading || showSuccess}
                className="px-6 py-1.5 bg-black text-white rounded-full text-[15px] flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : showSuccess ? (
                  <span>Sent</span>
                ) : (
                  'Send'
                )}
              </button>
            </div>
            <div className="text-[15px] text-[#6B7280]">
              {searchResult.idType}: {searchResult.idNumber}
            </div>
          </div>
        )}
      </div>

      {/* Loading Modal */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[280px] text-center">
            <div className="flex justify-center mb-4">
              <svg className="animate-spin h-8 w-8 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-900">Sending...</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[280px] text-center">
            <div className="flex justify-center mb-4">
              <span className="material-icons text-green-500 text-4xl">check_circle</span>
            </div>
            <p className="text-gray-900">Sent Successfully</p>
          </div>
        </div>
      )}

      {/* Pending Review Status Prompt */}
      {showPendingPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[320px] mx-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium mb-2">Under Review</h3>
              <p className="text-gray-600 text-[15px]">
                Your identity is under review. Please try adding friends later.
              </p>
              
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowPendingPrompt(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded-full min-w-[120px]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unverified Status Prompt */}
      {showVerificationPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[320px] mx-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium mb-2">Identity Verification Required</h3>
              <p className="text-gray-600 text-[15px]">
                For security reasons, you need to complete identity verification before searching and adding friends.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowVerificationPrompt(false)}
                className="flex-1 px-6 py-2 border border-gray-200 rounded-full text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleVerification}
                className="flex-1 px-6 py-2 bg-gray-900 text-white rounded-full"
              >
                Verify Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty Search Prompt */}
      {showEmptySearchPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[320px] mx-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium mb-2">Notice</h3>
              <p className="text-gray-600 text-[15px]">
                Please enter your friend's email to search
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowEmptySearchPrompt(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded-full min-w-[120px]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 z-[60]">
          <AddCompanion
            onClose={handleCloseVerification}
            onSubmit={handleAddCompanion}
            fromSearch={true}  
          />
        </div>
      )}
    </div>
  );
}
