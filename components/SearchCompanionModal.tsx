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

    // 检查是否有待审核的随行人员
    const hasPendingCompanion = companions.some(companion => companion.status === 'pending');
    // 检查是否有已通过审核的随行人员
    const hasApprovedCompanion = companions.some(companion => companion.status === 'approved');
    
    if (hasPendingCompanion) {
      if(!hasApprovedCompanion){
        // 如果有待审核的随行人员，显示待审核提示
        setShowPendingPrompt(true);
        return;
      }
     
    } else if (!hasApprovedCompanion && !showVerification) {
      // 如果没有已通过审核的随行人员且不在验证过程中，显示未验证提示
      setShowVerificationPrompt(true);
      return;
    }

    console.log('Starting search with approved companion');
    setIsLoading(true);
    try {
      // 模拟搜索请求
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
    // 不关闭搜索界面
  };

  const handleAddCompanion = (data: any) => {
    console.log('Adding companion with data:', data);
    // 将真人登记数据转换为随行联系人格式
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

    // 添加到随行联系人列表
    onAddCompanion(newCompanion);
    setShowVerification(false);

    // 如果不需要人工审核，则继续搜索
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

      // 创建新的好友请求数据
      const newRequest = {
        id: `request-${Date.now()}`,
        avatar: '/avatars/default.jpg',
        name: searchResult?.name || '',
        description: `${searchResult?.idType}: ${searchResult?.idNumber.replace(/[0-9]/g, '*')}`,
        status: 'pending' as const,
        timestamp: '刚刚',
        createdAt: Date.now()
      };

      // 发送消息到父组件，添加新的好友请求
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
          <h1 className="text-lg font-medium ml-2">添加好友</h1>
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
              placeholder="请输入好友的邮箱进行搜索"
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
              {isLoading ? '搜索中...' : '搜索'}
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
                    <span>发送中...</span>
                  </>
                ) : showSuccess ? (
                  <span>已发送</span>
                ) : (
                  '发送'
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
            <p className="text-gray-900">发送中...</p>
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
            <p className="text-gray-900">发送成功</p>
          </div>
        </div>
      )}

      {/* 待审核状态提示 */}
      {showPendingPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[320px] mx-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium mb-2">等待审核中</h3>
              <p className="text-gray-600 text-[15px]">
                您的身份信息正在审核中，请稍后再尝试添加好友
              </p>
              
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowPendingPrompt(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded-full min-w-[120px]"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 未验证状态提示 */}
      {showVerificationPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[320px] mx-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium mb-2">需要完成真人登记</h3>
              <p className="text-gray-600 text-[15px]">
                为了保证安全，需要先完成真人登记才能搜索和添加好友
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowVerificationPrompt(false)}
                className="flex-1 px-6 py-2 border border-gray-200 rounded-full text-gray-900"
              >
                取消
              </button>
              <button
                onClick={handleVerification}
                className="flex-1 px-6 py-2 bg-gray-900 text-white rounded-full"
              >
                立即验证
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 搜索框为空提示 */}
      {showEmptySearchPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[320px] mx-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium mb-2">提示</h3>
              <p className="text-gray-600 text-[15px]">
                请输入好友的邮箱进行搜索
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowEmptySearchPrompt(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded-full min-w-[120px]"
              >
                确定
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
