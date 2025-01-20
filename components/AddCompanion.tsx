'use client'

import { useState, useRef, useEffect } from 'react'
import { isIOS, isAndroid, isBrowser } from '../utils/deviceDetect'

interface DocumentType {
  id: string
  name: string
  nameZh: string
  icon: string
}

const documentTypes: DocumentType[] = [
  {
    id: 'mainland',
    name: 'Mainland ID Card',
    nameZh: '中国居民身份证',
    icon: 'credit_card'
  },
  {
    id: 'hongkong',
    name: 'Hong Kong ID Card',
    nameZh: '香港身份證',
    icon: 'credit_card'
  },
  {
    id: 'macau',
    name: 'Macau ID Card',
    nameZh: '澳門居民身份證',
    icon: 'credit_card'
  },
  {
    id: 'passport',
    name: 'Passport',
    nameZh: '护照/護照',
    icon: 'book'
  },
  {
    id: 'permit',
    name: 'HK/Macau Permit',
    nameZh: '港澳通行证',
    icon: 'bookmark'
  }
]

interface AddCompanionProps {
  onClose: () => void
  onSubmit?: (data: any) => void
  fromSearch?: boolean
}

export default function AddCompanion({ onClose, onSubmit, fromSearch }: AddCompanionProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null)
  const [mounted, setMounted] = useState(false)
  const [scannedInfo, setScannedInfo] = useState({
    name: 'John Doe',
    idNumber: 'P123456789',
    expiryDate: '2025-12-31',
    birthDate: '1990-01-01'
  })
  const [currentAction, setCurrentAction] = useState(1)
  const verificationActions = [
    { id: 1, icon: 'visibility', text: 'Please blink your eyes' },
    { id: 2, icon: 'face', text: 'Please turn your head left' },
    { id: 3, icon: 'face', text: 'Please turn your head right' },
    { id: 4, icon: 'sentiment_satisfied', text: 'Please smile' },
  ]
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationImage, setVerificationImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null)
  const verificationInputRef = useRef<HTMLInputElement>(null)
  const totalSteps = 3
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState({ title: '', message: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [needManualReview, setNeedManualReview] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (capturedImage && !selectedType) {
      setShowTypeSelector(true)
    }
  }, [capturedImage, selectedType])

  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCapturedImage(reader.result as string)
        setSelectedType(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const openCamera = () => {
    if (!mounted) return
    
    if (fileInputRef.current) {
      if (isIOS()) {
        fileInputRef.current.setAttribute('capture', 'environment')
      }
      fileInputRef.current.click()
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setSelectedType(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const selectDocumentType = (type: DocumentType) => {
    setSelectedType(type)
    setShowTypeSelector(false)
  }

  //下一步
  const handleNext = () => {
    if (currentStep === 1 && capturedImage) {
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setCurrentStep(3)
    } 
  }

  //上一步
  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    } else if (currentStep === 3) {
      setCurrentStep(2)
    } 
  }

  const handleVerificationStart = () => {
    setIsVerifying(true);
    if (verificationInputRef.current) {
      verificationInputRef.current.click();
    }
  };

  const handleVerificationCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setVerificationImage(imageUrl);
    }
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleManualReview =async (fromStep: number) => {
    //console.log("number:"+fromStep);
    
    if (fromStep === 3) {
      if (currentStep === 3) {
        setIsLoading(true)
        try {
          // 模拟提交数据
          await new Promise(resolve => setTimeout(resolve, 1000))
          setIsLoading(false)
          setShowSuccess(true)
          
          // 根据是否需要人工审核显示不同的提示信息
          setTimeout(() => {
            setShowSuccess(false)
            if (onSubmit) {
              onSubmit({
                name: scannedInfo.name,
                documentType: selectedType?.id,
                idNumber: scannedInfo.idNumber,
                expiryDate: scannedInfo.expiryDate,
                birthDate: scannedInfo.birthDate,
                needManualReview: true,  // 设置是否需要人工审核
                fromSearch,
                verificationImage  
              });
            }
            // 只有在不是从搜索界面来的时候才关闭
            if (!fromSearch) {
              onClose();
            }
          }, 1500)
        } catch (error) {
          setIsLoading(false)
          // 处理错误...
        }
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handleSubmit = async () => {
    if (currentStep === 3) {
      setIsLoading(true)
      try {
        // 模拟提交数据
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsLoading(false)
        setShowSuccess(true)
        
        // 根据是否需要人工审核显示不同的提示信息
        setTimeout(() => {
          setShowSuccess(false)
          if (onSubmit) {
            onSubmit({
              name: scannedInfo.name,
              documentType: selectedType?.id,
              idNumber: scannedInfo.idNumber,
              expiryDate: scannedInfo.expiryDate,
              birthDate: scannedInfo.birthDate,
              needManualReview: false,  // 设置是否需要人工审核
              fromSearch,
              verificationImage  
            });
          }
          // 只有在不是从搜索界面来的时候才关闭
          if (!fromSearch) {
            onClose();
          }
        }, 1500)
      } catch (error) {
        setIsLoading(false)
        // 处理错误...
      }
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  // const renderStep3 = () => {
  //   return (
  //     <div className="flex flex-col h-[calc(100vh-180px)] overflow-y-auto bg-gray-50">
  //       <div className="p-4">
  //         <div className="bg-white rounded-[10px] p-4 space-y-4">
  //           {/* Info Alert */}
  //           <div className="bg-[#F9FAFB] rounded-[10px] p-3 flex items-start gap-3">
  //             <span className="material-icons text-gray-600">info</span>
  //             <div>
  //               <div className="text-[15px] font-medium text-gray-900">Please Verify Information</div>
  //               <div className="text-[12px] text-[#6B7280]">
  //                 If any information is incorrect, please submit for manual review.
  //               </div>
  //             </div>
  //           </div>

  //           {/* ID Type */}
  //           <div>
  //             <div className="text-[15px] text-[#6B7280] mb-1.5">ID Type</div>
  //             <div className="bg-[#F9FAFB] rounded-[10px] p-3">
  //               <div className="text-[15px] text-gray-900">
  //                 {selectedType?.name} {selectedType?.nameZh}
  //               </div>
  //             </div>
  //           </div>

  //           {/* Name */}
  //           <div>
  //             <div className="text-[15px] text-[#6B7280] mb-1.5">Name</div>
  //             <div className="bg-[#F9FAFB] rounded-[10px] p-3">
  //               <div className="text-[15px] text-gray-900">{scannedInfo.name}</div>
  //             </div>
  //           </div>

  //           {/* ID Number */}
  //           <div>
  //             <div className="text-[15px] text-[#6B7280] mb-1.5">ID Number</div>
  //             <div className="bg-[#F9FAFB] rounded-[10px] p-3">
  //               <div className="text-[15px] text-gray-900">{scannedInfo.idNumber}</div>
  //             </div>
  //           </div>

  //           {/* Verification Question */}
  //           <div className="pt-2">
  //             <div className="text-[15px] text-gray-900 mb-2">
  //               Is the scanned information correct?
  //             </div>
  //             <button 
  //               onClick={() => handleManualReview(2)}
  //               className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-[10px] text-[15px] text-gray-900"
  //             >
  //               <span className="material-icons text-[20px] text-gray-600">support_agent</span>
  //               <span>No, Submit for Manual Review</span>
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  const renderStep2 = () => {
    return (
      <div className="flex flex-col h-[calc(100vh-180px)] overflow-y-auto bg-gray-50">
        <div className="p-4">
          <div className="bg-white rounded-[10px] p-4">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-[15px] font-medium text-gray-900">Live Face Verification</h2>
              <p className="text-[12px] text-[#6B7280] mt-1">Please follow the instructions</p>
            </div>

            {/* Action Icon and Text */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-12 h-12 bg-[#F9FAFB] rounded-full flex items-center justify-center mb-4">
                <span className="material-icons text-[24px] text-gray-600">visibility</span>
              </div>
              <p className="text-[15px] text-gray-900">Please blink your eyes</p>
            </div>

            {/* Circle Indicator / Preview */}
            <div 
              className="relative w-[200px] h-[200px] mx-auto mb-4"
              onClick={!verificationImage ? handleVerificationStart : undefined}
            >
              {verificationImage ? (
                <img 
                  src={verificationImage} 
                  alt="Verification" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-[#F9FAFB] rounded-full cursor-pointer"></div>
                  <svg className="absolute inset-0 w-full h-full rotate-180" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <circle cx="5" cy="50" r="3" fill="#111827" />
                    <circle cx="95" cy="50" r="3" fill="#111827" />
                  </svg>
                </>
              )}
            </div>

            {/* Retry Button */}
            {verificationImage && (
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setVerificationImage('');
                    handleVerificationStart();
                  }}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <span className="material-icons">refresh</span>
                </button>
              </div>
            )}

            {/* Start Button */}
            {!isVerifying && !verificationImage && (
              <button 
                onClick={handleVerificationStart}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#111827] text-white rounded-[10px] text-[15px] font-medium hover:bg-black"
              >
                <span className="material-icons text-[20px]">play_arrow</span>
                Start Verification
              </button>
            )}
          </div>
        </div>

        {/* Hidden file input for verification */}
        <input
          ref={verificationInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={handleVerificationCapture}
        />
      </div>
    );
  };

  const renderStep4 = () => {
    const maskedIdNumber = scannedInfo.idNumber.replace(/^.{6}/, '******');

    return (
      <div className="flex flex-col h-[calc(100vh-180px)] overflow-y-auto bg-gray-50">
        <div className="p-4">
          <div className="bg-white rounded-[10px] p-4">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-[15px] font-medium text-gray-900">Document Verification</h2>
              <p className="text-[12px] text-[#6B7280] mt-1">Please confirm your document information</p>
            </div>

            {/* Document Photos */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                {/* ID Document */}
                <div>
                  <div className="text-[15px] text-[#6B7280] mb-2">ID Document</div>
                  <div className="bg-[#F9FAFB] rounded-[10px] overflow-hidden">
                    {capturedImage && (
                      <img 
                        src={capturedImage} 
                        alt="ID Document" 
                        className="w-full h-[120px] object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Face Photo */}
                <div>
                  <div className="text-[15px] text-[#6B7280] mb-2">Face Photo</div>
                  <div className="bg-[#F9FAFB] rounded-[10px] overflow-hidden">
                    {verificationImage && (
                      <img 
                        src={verificationImage} 
                        alt="Face Photo" 
                        className="w-full h-[120px] object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="space-y-4">
              {/* ID Type */}
              <div>
                <div className="text-[15px] text-[#6B7280] mb-2">ID Type</div>
                <div className="bg-[#F9FAFB] rounded-[10px] p-3">
                  <div className="text-[15px] text-gray-900">
                    {selectedType?.name} {selectedType?.nameZh}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <div className="text-[15px] text-[#6B7280] mb-2">Name</div>
                <div className="bg-[#F9FAFB] rounded-[10px] p-3">
                  <div className="text-[15px] text-gray-900">{scannedInfo.name}</div>
                </div>
              </div>

              {/* ID Number */}
              <div>
                <div className="text-[15px] text-[#6B7280] mb-2">ID Number</div>
                <div className="bg-[#F9FAFB] rounded-[10px] p-3">
                  <div className="text-[15px] text-gray-900">{maskedIdNumber}</div>
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <div className="text-[15px] text-[#6B7280] mb-2">Expiry Date</div>
                <div className="bg-[#F9FAFB] rounded-[10px] p-3">
                  <div className="text-[15px] text-gray-900">{scannedInfo.expiryDate}</div>
                </div>
              </div>

              {/* Birth Date */}
              <div>
                <div className="text-[15px] text-[#6B7280] mb-2">Birth Date</div>
                <div className="bg-[#F9FAFB] rounded-[10px] p-3">
                  <div className="text-[15px] text-gray-900">{scannedInfo.birthDate}</div>
                </div>
              </div>

              {/* Verification Question */}
            <div className="pt-2">
              <div className="text-[15px] text-gray-900 mb-2">
                Is the scanned information correct?
              </div>
              <button 
                onClick={() => handleManualReview(3)}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-[10px] text-[15px] text-gray-900"
              >
                <span className="material-icons text-[20px] text-gray-600">support_agent</span>
                <span>No, Submit for Manual Review</span>
              </button>
            </div>
            </div>
            
          </div>
          
        </div>
      </div>
    );
  };

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-[70]">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center border-b border-gray-200">
        <button 
          className="p-2 -ml-2"
          onClick={onClose}
        >
          <span className="material-icons">arrow_back</span>
        </button>
        <h1 className="text-[15px] font-medium ml-2">Add Companion</h1>
      </div>

      {/* Steps Indicator */}
      <div className="px-2 py-3 flex justify-between bg-white border-b border-gray-100">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index}
            className={`px-5 py-2.5 rounded-[10px] text-[12px] ${
              index + 1 === currentStep 
                ? 'bg-white text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                : 'text-[#9CA3AF]'
            }`}
          >
            <span className={index + 1 === currentStep ? 'font-medium' : ''}>STEP </span>
            <span className={index + 1 === currentStep ? 'font-medium' : ''}>
              {index + 1}
            </span>
          </div>
        ))}
      </div>

      {/* Main Content */}
      {currentStep === 1 ? (
        <div className="flex flex-col h-[calc(100vh-180px)] overflow-y-auto">
          {/* Document Photo Section */}
          <div className="p-4 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-medium text-gray-900">Document Photo</h2>
              {capturedImage && (
                <button
                  onClick={retakePhoto}
                  className="w-8 h-8 flex items-center justify-center"
                >
                  <span className="material-icons text-gray-600">refresh</span>
                </button>
              )}
            </div>
            {capturedImage ? (
              <div className="relative bg-white rounded-[10px] overflow-hidden h-[200px] border-2 border-dashed border-gray-300">
                <img
                  src={capturedImage}
                  alt="Captured ID"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <button 
                onClick={openCamera}
                className="w-full bg-white rounded-[10px] p-6 flex items-center gap-4 border-2 border-dashed border-gray-300"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-icons text-gray-400 text-2xl">document_scanner</span>
                </div>
                <div className="text-left">
                  <h2 className="text-[15px] font-medium text-gray-900">Scan ID Document</h2>
                  <p className="text-[12px] text-gray-500">
                    Please scan your ID document first
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* Document Type Section */}
          {selectedType && (
            <div className="mt-3 p-4 bg-white">
              <div>
                <h3 className="text-[15px] font-medium text-[#6B7280] mb-3">Document Type</h3>
                <div className="bg-[#F9FAFB] rounded-[10px] py-4 px-5">
                  <div className="text-[12px] text-gray-900">
                    {selectedType.name} {selectedType.nameZh}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : currentStep === 2 ? (
        renderStep2()
      ) : currentStep === 3 ? (
        //renderStep3()
        renderStep4()
      ) : currentStep === 4 ? (
        renderStep4()
      ) : null}

      {/* Hidden file input for camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCapture}
        {...(mounted && isAndroid() ? { capture: 'environment' } : {})}
      />

      {/* Document Type Selector Modal */}
      {showTypeSelector && (
        <div className="fixed inset-0 bg-black/50 z-[80] flex items-end">
          <div className="bg-white w-full rounded-t-[10px]">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
              <h3 className="text-[15px] font-medium text-gray-900">Select Document Type</h3>
              <button 
                onClick={() => setShowTypeSelector(false)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <span className="material-icons text-gray-600">close</span>
              </button>
            </div>
            <div className="p-2">
              {documentTypes.map(type => (
                <button
                  key={type.id}
                  className="w-full flex items-center px-5 py-4 hover:bg-[#F9FAFB] transition-colors rounded-[10px]"
                  onClick={() => selectDocumentType(type)}
                >
                  <span className="material-icons text-gray-600 mr-4">{type.icon}</span>
                  <div className="text-left">
                    <div className="text-[12px] text-gray-900">{type.name}</div>
                    <div className="text-[12px] text-[#6B7280]">{type.nameZh}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90]">
          <div className="bg-white rounded-lg p-6 w-[280px] text-center">
            <div className="flex justify-center mb-4">
              <svg className="animate-spin h-8 w-8 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-900">Submitting...</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90]">
          <div className="bg-white rounded-lg p-6 w-[280px] text-center">
            <div className="flex justify-center mb-4">
              <span className="material-icons text-green-500 text-4xl">check_circle</span>
            </div>
            <p className="text-gray-900">{needManualReview ? 'Application Submitted' : 'Submission Successful'}</p>
            <p className="text-gray-500 text-sm mt-1">
              {needManualReview ? 'Our staff will process it as soon as possible' : 'Your information has been successfully submitted'}
            </p>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90]">
          <div className="bg-white rounded-lg p-6 w-[320px] mx-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium mb-2">{modalContent.title}</h3>
              <p className="text-gray-600 text-[15px]">{modalContent.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        {currentStep === 2 ? (
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex-1 py-3 bg-black text-white rounded-full text-[15px]"
            >
              Yes, Continue
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 py-3 bg-white border border-gray-200 rounded-full text-[15px]"
              >
                Back
              </button>
            )}
            <button
              onClick={handleSubmit}
              className={`flex-1 py-3 rounded-full text-[15px] flex items-center justify-center gap-2 ${
                (currentStep === 1 && !capturedImage) || isLoading || showSuccess
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-black text-white'
              }`}
              disabled={currentStep === 1 && !capturedImage || isLoading || showSuccess}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : showSuccess ? (
                <span>Completed</span>
              ) : currentStep === 3 ? (
                'Submit'
              ) : (
                'Continue'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
