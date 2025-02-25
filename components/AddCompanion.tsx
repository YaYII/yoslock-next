'use client'

import { useState, useRef, useEffect } from 'react'
import { isIOS, isAndroid, isBrowser } from '../utils/deviceDetect'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

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
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  })
  const [showCrop, setShowCrop] = useState(false)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
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
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    setMounted(true)
    // 组件加载时主动请求摄像头权限
    const requestCameraPermission = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('您的浏览器不支持访问摄像头')
        }

        // 对于iOS设备，直接尝试获取摄像头权限
        if (typeof navigator.permissions?.query !== 'function') {
          await navigator.mediaDevices.getUserMedia({ 
            video: {
              facingMode: 'environment'
            }
          })
          .then(stream => {
            // 获取权限后立即停止视频流
            stream.getTracks().forEach(track => track.stop())
          })
          return
        }

        // 对于支持permissions API的设备
        const permissionResult = await navigator.permissions.query({ name: 'camera' as PermissionName })
        if (permissionResult.state === 'prompt' || permissionResult.state === 'denied') {
          await navigator.mediaDevices.getUserMedia({ 
            video: {
              facingMode: 'environment'
            }
          })
          .then(stream => {
            stream.getTracks().forEach(track => track.stop())
          })
        }
      } catch (err) {
        console.error('摄像头权限请求失败:', err)
        setModalContent({
          title: '摄像头权限请求失败',
          message: '请确保您已在iOS设置中允许浏览器访问摄像头，并确保使用HTTPS连接。'
        })
        setShowModal(true)
      }
    }

    requestCameraPermission()
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
        setShowCrop(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const getCroppedImg = () => {
    if (!imageRef.current || !crop.width || !crop.height) return

    const canvas = document.createElement('canvas')
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.drawImage(
      imageRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    const base64Image = canvas.toDataURL('image/jpeg')
    setCroppedImage(base64Image)
    setCapturedImage(base64Image)
    setShowCrop(false)
  }

  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const openCamera = async () => {
    if (!mounted) return;
    console.log("openCamera:1");
    
    try {
      // 先检查是否支持getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('您的浏览器不支持访问摄像头');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'environment',
          aspectRatio: 1920/1080
        }
      });
      
      setStream(stream);
      setIsVideoReady(false); // 重置视频就绪状态
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          setIsVideoReady(true);
        };
      }
      
      setShowCamera(true);
    } catch (err) {
      console.error('相机初始化失败:', err);
      setModalContent({
        title: '相机初始化失败',
        message: '请确保您已授予相机访问权限，并且设备摄像头可用。'
      });
      setShowModal(true);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadeddata = () => {
        setIsVideoReady(true);
      };
    }
  }, [videoRef.current]);

const initializeCamera = async (options: MediaTrackConstraints) => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('您的浏览器不支持访问摄像头');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: options
    });
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadeddata = () => {
        setIsVideoReady(true);
      };
    }
    setShowCamera(true);
    return stream;
  } catch (err) {
    console.error('摄像头初始化失败:', err);
    setModalContent({
      title: '摄像头初始化失败',
      message: '请确保您已授予相机访问权限，并且设备摄像头可用。'
    });
    setShowModal(true);
    throw err;
  }
};

const takePhoto = async () => {
  if (!mounted) return;
  try {
    // 先检查是否支持getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('您的浏览器不支持访问摄像头');
    }

    setIsVerifying(true);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });
    
    setStream(stream);
    setIsVideoReady(false); // 重置视频就绪状态
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadeddata = () => {
        setIsVideoReady(true);
      };
    }
    
    setShowCamera(true);
  } catch (err) {
    console.error('相机初始化失败:', err);
    setModalContent({
      title: '相机初始化失败',
      message: '请确保您已授予相机访问权限，并且设备摄像头可用。'
    });
    setShowModal(true);
    setIsVerifying(false);
  }
};

//拍照按钮。
const takeEndPhoto = async ()=>{
  if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // 设置canvas尺寸为视频的实际尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 在canvas上绘制当前视频帧
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 将canvas内容转换为图片URL
    const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCroppedImage(imageUrl);

    // 停止视频流
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
    setShowCamera(false);
    setIsVerifying(false);
}

  useEffect(() => {
    return () => {
      // 组件卸载时清理视频流
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);


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

  //步骤二中的摄像功能，
  const handleVerificationStart = async () => {
    setIsVerifying(true);
    try {
      await initializeCamera({
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      });
    } catch (err) {
      setIsVerifying(false);
    }
  };

  const handleVerificationCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // 设置canvas尺寸为视频的实际尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 在canvas上绘制当前视频帧
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 将canvas内容转换为图片URL
    const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
    setVerificationImage(imageUrl);

    // 停止视频流
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    video.srcObject = null;
    setShowCamera(false);
    setIsVerifying(false);
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

  const renderStep2 = () => {
    return (
      <div className="flex flex-col h-[calc(100vh-180px)] overflow-y-auto bg-gray-50">
        <div className="p-4">
          <div className="bg-white rounded-[10px] p-4">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-[15px] font-medium text-gray-900">Comparison between ID photo and real - time face verification</h2>
              <p className="text-[12px] text-[#6B7280] mt-1">Please follow the prompts to complete the face comparison.</p>
            </div>

            {/* Action Icon and Text */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-12 h-12 bg-[#F9FAFB] rounded-full flex items-center justify-center mb-4">
                <span className="material-icons text-[24px] text-gray-600">visibility</span>
              </div>
              <p className="text-[15px] text-gray-900">Please blink your eyes</p>
            </div>

            {/* Camera Preview / Captured Image */}
            <div className="relative w-[280px] h-[280px] mx-auto mb-4 rounded-full overflow-hidden">
              {showCamera ? (
                <div className="relative w-full h-full bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* 拍照按钮 */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <button
                      onClick={handleVerificationCapture}
                      className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <span className="material-icons text-gray-900 text-2xl">photo_camera</span>
                    </button>
                  </div>
                </div>
              ) : verificationImage ? (
                <img 
                  src={verificationImage} 
                  alt="Verification" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full bg-[#F9FAFB] flex items-center justify-center cursor-pointer"
                  onClick={handleVerificationStart}
                >
                  <span className="material-icons text-gray-400 text-4xl">face</span>
                </div>
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
            <div className="text-center mb-4">
              <h2 className="text-[15px] font-medium text-gray-900">Document Verification</h2>
              <p className="text-[12px] text-[#6B7280] mt-1">Please confirm your document information</p>
            </div>

            {/* Verification Status */}
            <div className="mb-6 flex items-center justify-center">
              <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full flex items-center gap-2">
                <span className="material-icons text-[20px]">check_circle</span>
                <span className="text-[14px]">Document and photo verification passed</span>
              </div>
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
          <div className="divkongge">

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
      <div className="px-2 py-3 flex bg-white border-b border-gray-100">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index}
            className={`flex-1 text-center mx-1 py-2.5 rounded-[10px] text-[12px] ${
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
                  //onClick={handleVerificationStart}
                  className="w-8 h-8 flex items-center justify-center"
                >
                  <span className="material-icons text-gray-600">refresh</span>
                </button>
              )}
            </div>
            {showCrop && capturedImage ? (
              <div className="relative bg-white rounded-[10px] overflow-hidden h-[200px] border-2 border-dashed border-gray-300">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  aspect={320/280}
                  className="max-h-[200px]"
                >
                  <img
                    ref={imageRef}
                    src={capturedImage}
                    alt="Captured ID"
                    className="max-h-[200px] w-auto mx-auto"
                  />
                </ReactCrop>
                <button
                  onClick={getCroppedImg}
                  className="absolute bottom-2 right-2 bg-black text-white px-3 py-1 rounded-full text-sm"
                >
                  确认裁剪
                </button>
              </div>
            ) : capturedImage ? (
              <div className="relative bg-white rounded-[10px] overflow-hidden h-[200px] border-2 border-dashed border-gray-300">
                <img
                  src={capturedImage}
                  alt="Captured ID"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="relative w-full"
              onClick={takePhoto}
              >
                <div className="relative w-full bg-black rounded-[10px] overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-[280px] object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* 取景框和辅助线 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[320px] h-[280px] border-2 border-white border-opacity-50 rounded-lg flex items-center justify-center">
                      {/* 横向辅助线 */}
                      <div className="absolute top-1/3 left-0 right-0 border-t border-white border-opacity-30"></div>
                      <div className="absolute bottom-1/3 left-0 right-0 border-t border-white border-opacity-30"></div>
                      {/* 纵向辅助线 */}
                      <div className="absolute left-1/3 top-0 bottom-0 border-l border-white border-opacity-30"></div>
                      <div className="absolute right-1/3 top-0 bottom-0 border-l border-white border-opacity-30"></div>
                      {/* 拍摄提示 */}
                      <div className="absolute bottom-4 left-0 right-0 text-center text-white text-xs bg-black bg-opacity-50 py-1">
                        请将证件放入框内，并对齐辅助线
                      </div>
                    </div>
                  </div>
                  
                  {/* 拍照按钮 */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <button
                      onClick={takeEndPhoto}
                      className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <span className="material-icons text-gray-900 text-2xl">photo_camera</span>
                    </button>
                  </div>
                </div>
              </div>
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
            <div className="flex justify-center">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-black text-white rounded-full text-[15px]"
              >
                确认
              </button>
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
              disabled={!verificationImage}
              className={`flex-1 py-3 rounded-full text-[15px] ${!verificationImage ? 'bg-gray-100 text-gray-400' : 'bg-black text-white'}`}
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
