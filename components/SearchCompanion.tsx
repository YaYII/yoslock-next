'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  name: string;
  idType: string;
  idNumber: string;
  phone?: string;
}

export default function SearchCompanion() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    // TODO: 调用API搜索用户
    // 这里使用模拟数据
    setSearchResult({
      name: 'Chen Xiaoming',
      idType: 'Mainland China ID',
      idNumber: '*****463',
      phone: '+86 135 8888 8888'
    });
  };

  const handleSend = async () => {
    setIsLoading(true);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    // 显示成功消息并返回
    router.push('/companions');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center px-4 h-[44px] bg-white border-b border-gray-100">
        <Link href="/companions" className="material-icons text-[24px] text-gray-900">
          arrow_back
        </Link>
        <div className="text-[17px] font-medium ml-4">Search</div>
      </div>

      {/* Search Input */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter friend's account email."
            className="w-full h-[44px] pl-4 pr-[100px] rounded-full bg-white border border-gray-200 text-[15px]"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-1.5 bg-gray-900 text-white rounded-full text-[15px]"
          >
            Search
          </button>
        </div>
      </div>

      {/* Search Result */}
      {searchResult && (
        <div className="mx-4 p-4 bg-white rounded-[10px]">
          <div className="mb-4">
            <div className="text-[17px] text-gray-900">{searchResult.name}</div>
            <div className="text-[15px] text-[#6B7280] mt-1">
              {searchResult.idType}: {searchResult.idNumber}
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="w-full py-3 bg-gray-900 text-white rounded-[10px] text-[15px] font-medium relative"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2">发送中...</span>
              </div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      )}

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
    </div>
  );
}
