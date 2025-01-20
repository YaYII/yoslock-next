'use client'

import { useState, useEffect } from 'react'

interface FriendRequest {
  id: string
  avatar: string
  name: string
  description: string
  status: 'pending' | 'expired' | 'added' | 'requested' | 'rejected'
  timestamp: string
  createdAt: number
}

interface NewFriendsProps {
  requests?: FriendRequest[];
}

export default function NewFriends({ requests: externalRequests = [] }: NewFriendsProps) {
  const [requests, setRequests] = useState<FriendRequest[]>([
    {
      id: '6',
      avatar: '/avatars/4.jpg',
      name: 'Zhang xiao',
      description: 'Mainland China ID: *****381',
      status: 'requested' as const,
      timestamp: 'Just now',
      createdAt: Date.now()
    },{
      id: '5',
      avatar: '/avatars/4.jpg',
      name: 'Zhang Wei',
      description: 'Mainland China ID: *****789',
      status: 'requested' as const,
      timestamp: '1 minute ago',
      createdAt: Date.now()
    },
    {
      id: '1',
      avatar: '/avatars/1.jpg',
      name: 'John Smith',
      description: 'Passport: *****567',
      status: 'pending' as const,
      timestamp: '2 hours ago',
      createdAt: Date.now() - 2 * 60 * 60 * 1000
    },
    {
      id: '4',
      avatar: '/avatars/3.jpg',
      name: 'Chen anjie',
      description: 'Hong Kong ID: *****56(7)',
      status: 'expired' as const,
      timestamp: '1 day ago',
      createdAt: Date.now() - 24 * 60 * 60 * 1000
    },
    {
      id: '2',
      avatar: '/avatars/2.jpg',
      name: 'V_cgliu',
      description: 'Mainland China ID: *****234',
      status: 'expired' as const,
      timestamp: '1 day ago',
      createdAt: Date.now() - 25 * 60 * 60 * 1000
    },
    {
      id: '3',
      avatar: '/avatars/3.jpg',
      name: 'Chen Xiaoming1',
      description: 'Hong Kong ID: *****56(7)',
      status: 'expired' as const,
      timestamp: '3 days ago',
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
    }
  ].sort((a, b) => b.createdAt - a.createdAt));

  // Update list when external requests change
  useEffect(() => {
    if (externalRequests && externalRequests.length > 0) {
      setRequests(prevRequests => {
        // 合并新的请求，去重并按时间排序
        const allRequests = [...externalRequests, ...prevRequests];
        const uniqueRequests = allRequests.filter((request, index, self) =>
          index === self.findIndex(r => r.id === request.id)
        );
        // 按时间排序，最新的在前面
        return uniqueRequests.sort((a, b) => b.createdAt - a.createdAt);
      });
    }
  }, [externalRequests]);

  // Add debug logs
  useEffect(() => {
    console.log('Current requests:', requests);
  }, [requests]);

  // Add timestamp formatting function
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60 * 1000) { // less than 1 minute
      return 'Just now';
    } else if (diff < 60 * 60 * 1000) { // less than 1 hour
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minutes ago`;
    } else if (diff < 24 * 60 * 60 * 1000) { // less than 24 hours
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} days ago`;
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ADD_FRIEND_REQUEST') {
        const newRequest = {
          ...event.data.request,
          timestamp: 'Just now'  // Set initial timestamp
        };
        setRequests(prevRequests => [newRequest, ...prevRequests]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Add timer effect to update timestamps
  useEffect(() => {
    const timer = setInterval(() => {
      setRequests(prevRequests => 
        prevRequests.map(request => ({
          ...request,
          timestamp: formatTimestamp(request.createdAt)
        }))
      );
    }, 60000); // 每分钟更新一次

    return () => clearInterval(timer);
  }, []);

  const pendingCount = requests.filter(req => req.status === 'requested').length;

  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  const handleAccept = (id: string) => {
    const requestToAdd = requests.find(request => request.id === id);
    
    if (requestToAdd) {
      const [idType, idNumber] = requestToAdd.description.split(': ');
      
      const newCompanion = {
        id: `companion-${Date.now()}-${requestToAdd.id}`,
        name: requestToAdd.name,
        idType: idType,
        idNumber: idNumber.replace(/\*/g, ''),
        status: 'approved',
        createdAt: new Date(requestToAdd.createdAt).toISOString()
      };

      window.parent.postMessage({
        type: 'ADD_COMPANION',
        companion: newCompanion
      }, '*');

      setItemToRemove(id);
      
      setTimeout(() => {
        setRequests(requests.filter(request => request.id !== id));
        setItemToRemove(null);
      }, 900);
    }
  };

  const handleReject = (id: string) => {
    // Only update status, don't delete
    setRequests(prevRequests => 
      prevRequests.map(request => 
        request.id === id 
          ? { ...request, status: 'rejected' as const } 
          : request
      )
    );
  };

  return (
    <div className="bg-white rounded-xl">
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <h2 className="text-[17px] font-medium">New Friends</h2>
        {pendingCount > 0 && (
          <span className="text-[13px] text-red-500">{pendingCount} new friend{pendingCount > 1 ? 's' : ''}</span>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {requests.map(request => (
          <div 
            key={request.id} 
            className={`p-4 transition-all duration-1000 ease-in-out overflow-hidden ${
              itemToRemove === request.id 
                ? 'opacity-0 transform translate-x-full max-h-0' 
                : 'opacity-100 max-h-[200px]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-[17px] text-gray-900">{request.name}</div>
                  <div className="text-[13px] text-gray-400">{request.timestamp}</div>
                </div>
                <div className="text-[15px] text-gray-500 mt-1">
                  {request.description}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="text-[15px] text-gray-500">
                {request.status === 'pending' && 'Pending Verification'}
                {request.status === 'expired' && 'Expired'}
                {request.status === 'added' && 'Added'}
                {request.status === 'rejected' && 'Rejected'}
                {request.status === 'requested' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReject(request.id)}
                      className="px-6 py-1.5 border border-gray-200 rounded-full text-gray-900"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAccept(request.id)}
                      className="px-6 py-1.5 bg-gray-900 text-white rounded-full"
                    >
                      Accept
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
