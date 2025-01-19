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
      timestamp: '刚刚',
      createdAt: Date.now()
    },{
      id: '5',
      avatar: '/avatars/4.jpg',
      name: 'Zhang Wei',
      description: 'Mainland China ID: *****789',
      status: 'requested' as const,
      timestamp: '1分钟前',
      createdAt: Date.now()
    },
    {
      id: '1',
      avatar: '/avatars/1.jpg',
      name: 'John Smith',
      description: 'Passport: *****567',
      status: 'pending' as const,
      timestamp: '2小时前',
      createdAt: Date.now() - 2 * 60 * 60 * 1000
    },
    {
      id: '4',
      avatar: '/avatars/3.jpg',
      name: 'Chen anjie',
      description: 'Hong Kong ID: *****56(7)',
      status: 'expired' as const,
      timestamp: '一天前',
      createdAt: Date.now() - 24 * 60 * 60 * 1000
    },
    {
      id: '2',
      avatar: '/avatars/2.jpg',
      name: 'V_cgliu',
      description: 'Mainland China ID: *****234',
      status: 'expired' as const,
      timestamp: '一天前',
      createdAt: Date.now() - 25 * 60 * 60 * 1000
    },
    {
      id: '3',
      avatar: '/avatars/3.jpg',
      name: 'Chen Xiaoming1',
      description: 'Hong Kong ID: *****56(7)',
      status: 'expired' as const,
      timestamp: '三天前',
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
    }
  ].sort((a, b) => b.createdAt - a.createdAt));

  // 当外部请求变化时更新列表
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

  // 添加调试日志
  useEffect(() => {
    console.log('Current requests:', requests);
  }, [requests]);

  // 添加格式化时间的函数
  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60 * 1000) { // 小于1分钟
      return '刚刚发送';
    } else if (diff < 60 * 60 * 1000) { // 小于1小时
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes}分钟前`;
    } else if (diff < 24 * 60 * 60 * 1000) { // 小于24小时
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours}小时前`;
    } else {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days}天前`;
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ADD_FRIEND_REQUEST') {
        const newRequest = {
          ...event.data.request,
          timestamp: '刚刚发送'  // 设置初始时间戳
        };
        setRequests(prevRequests => [newRequest, ...prevRequests]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 添加定时更新时间的效果
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
    // 只更新状态，不删除
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
        <h2 className="text-[17px] font-medium">新的朋友</h2>
        {pendingCount > 0 && (
          <span className="text-[13px] text-red-500">{pendingCount}个新的朋友</span>
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
                {request.status === 'pending' && '等待验证'}
                {request.status === 'expired' && '已过期'}
                {request.status === 'added' && '已添加'}
                {request.status === 'rejected' && '已拒绝'}
                {request.status === 'requested' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReject(request.id)}
                      className="px-6 py-1.5 border border-gray-200 rounded-full text-gray-900"
                    >
                      拒绝
                    </button>
                    <button
                      onClick={() => handleAccept(request.id)}
                      className="px-6 py-1.5 bg-gray-900 text-white rounded-full"
                    >
                      同意
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
