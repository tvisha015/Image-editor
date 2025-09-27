// src/components/Editor/BackgroundColorPanel.tsx
'use client'

import React, { FC, useState, useRef, useEffect, useCallback } from 'react'

// Loading spinner component
const LoadingSpinner = () => (
  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
)

// Image cache for preloading
const imageCache = new Map<string, HTMLImageElement>()

const staticBackgrounds = [
  '/background/bg1.jpg',
  '/background/bg2.jpg',
  '/background/bg3.jpg',
  '/background/bg4.jpg',
  '/background/bg5.jpg',
  '/background/bg6.jpg',
  '/background/bg7.jpg',
  '/background/bg8.jpg',
  '/background/bg9.jpg',
  '/background/bg10.jpg',
]

// An SVG icon for the transparent option
const TransparentIcon = () => (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path d='M0 0H24V24H0V0Z' fill='url(#pattern0)' />
    <defs>
      <pattern
        id='pattern0'
        patternContentUnits='objectBoundingBox'
        width='1'
        height='1'
      >
        <use href='#image0' transform='scale(0.0416667)' />
      </pattern>
      <image
        id='image0'
        width='24'
        height='24'
        href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAD9JREFUSEtjZGBgYJD//z8DEiALKDFge/YMYP/5/x/IAMp/gAyYyQDEwADy589AXAxEBdTAf8B6A7E1EA0A30sWFeT4sDMAAAAASUVORK5CYII='
      />
    </defs>
  </svg>
)

interface BackgroundColorPanelProps {
  onColorChange: (color: string) => void
  onImageUpload: (file: File) => void
  onStaticImageSelect: (imageUrl: string) => void
  onRemoveBackground: () => void
  onClose: () => void
}

const BackgroundColorPanel: FC<BackgroundColorPanelProps> = ({
  onColorChange,
  onImageUpload,
  onStaticImageSelect,
  onRemoveBackground,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedStaticImage, setSelectedStaticImage] = useState<string | null>(null)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Preload all static images for better performance
  useEffect(() => {
    const preloadImages = async () => {
      const loadPromises = staticBackgrounds.map((imageUrl) => {
        return new Promise<void>((resolve) => {
          // Check if already cached
          if (imageCache.has(imageUrl)) {
            setLoadedImages(prev => new Set([...prev, imageUrl]))
            resolve()
            return
          }

          const img = new Image()
          img.onload = () => {
            imageCache.set(imageUrl, img)
            setLoadedImages(prev => new Set([...prev, imageUrl]))
            resolve()
          }
          img.onerror = () => resolve() // Continue even if one image fails
          img.src = imageUrl
        })
      })

      await Promise.all(loadPromises)
    }

    preloadImages()
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current)
      }
    }
  }, [])

  const PRESET_COLORS = [
    '#FFFFFF',
    '#000000',
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#2196F3',
    '#00BCD4',
    '#4CAF50',
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true)
      setSelectedStaticImage(null) // Clear static selection
      onImageUpload(file)
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      // Reset loading state after a delay (image processing time)
      setTimeout(() => setIsUploading(false), 1000)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Debounced image selection to prevent lag
  const handleStaticImageClick = useCallback((imageUrl: string) => {
    setSelectedStaticImage(imageUrl)
    setIsUploading(false) // Clear upload loading state
    
    // Clear any existing timeout
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current)
    }
    
    // Debounce the actual selection to prevent rapid calls
    selectionTimeoutRef.current = setTimeout(() => {
      onStaticImageSelect(imageUrl)
    }, 50) // Small delay to prevent lag
  }, [onStaticImageSelect])

  const handleRemoveBackground = () => {
    setSelectedStaticImage(null)
    setIsUploading(false)
    onRemoveBackground()
  }

  const handleColorChange = (color: string) => {
    setSelectedStaticImage(null) // Clear static image selection
    setIsUploading(false) // Clear upload loading state
    onColorChange(color)
  }

  return (
    <div className='absolute top-16 right-4 h-auto w-80 bg-white shadow-2xl z-20 p-4 flex flex-col rounded-lg border border-slate-200 animate-slide-in'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='font-semibold text-slate-700'>Background</h3>
        <button
          onClick={onClose}
          className='text-slate-400 hover:text-slate-800 transition-colors'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6'
            fill='none'
            viewBox='0 0 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>

      {/* Upload Section */}
      {/* <div className='mb-4 space-y-2'>
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className={`w-full h-12 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
            isUploading 
              ? 'bg-purple-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700'
          } text-white`}
        >
          {isUploading ? (
            <LoadingSpinner />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
          <span>{isUploading ? 'Uploading...' : 'Upload Background Image'}</span>
        </button>
        
        <button
          onClick={handleRemoveBackground}
          className='w-full h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2'
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Remove Background</span>
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div> */}

      {/* Static Background Images */}
      <div className='mb-4'>
        <h4 className='text-sm font-medium text-slate-600 mb-2'>Quick Backgrounds</h4>
        <div className='grid grid-cols-2 gap-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent'>
          {staticBackgrounds.map((imageUrl) => (
            <button
              key={imageUrl}
              onClick={() => handleStaticImageClick(imageUrl)}
              className={`relative group transition-all duration-150 ${
                selectedStaticImage === imageUrl 
                  ? '' 
                  : ''
              }`}
              disabled={!loadedImages.has(imageUrl)}
            >
              <div className={`w-full h-16 rounded-md overflow-hidden border border-slate-200 ${
                !loadedImages.has(imageUrl) ? 'bg-slate-100 animate-pulse' : ''
              }`}>
                <img
                  src={imageUrl}
                  alt='Background option'
                  loading="lazy"
                  className={`w-full h-full object-cover transition-all duration-150 ${
                    selectedStaticImage === imageUrl 
                      ? 'opacity-100 scale-105' 
                      : 'hover:opacity-80 hover:scale-105'
                  }`}
                  style={{
                    willChange: 'transform, opacity',
                    transform: selectedStaticImage === imageUrl ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
              </div>
              
              {/* Loading indicator */}
              {!loadedImages.has(imageUrl) && (
                <div className='absolute inset-0 flex items-center justify-center bg-slate-100 rounded-md'>
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* Selected indicator */}
              {selectedStaticImage === imageUrl && (
                <div className='absolute top-1 right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center shadow-sm'>
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Color Section */}
      <div className='space-y-4'>
        <h4 className='text-sm font-medium text-slate-600'>Background Colors</h4>
        
        {/* Color Swatches */}
        <div className='grid grid-cols-5 gap-2'>
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className='w-12 h-12 rounded-full border-2 border-slate-200 hover:scale-110 transition-transform'
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Custom Color Picker and No BG */}
        <div className='grid grid-cols-2 gap-2'>
          <label
            htmlFor='color-picker'
            className='w-full h-10 flex items-center justify-center rounded-lg border-2 border-slate-200 cursor-pointer bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500'
            title='Custom Color'
          >
            <input
              id='color-picker'
              type='color'
              className='opacity-0 w-0 h-0'
              onChange={(e) => handleColorChange(e.target.value)}
            />
          </label>
          <button
            onClick={() => handleColorChange('transparent')}
            className='w-full h-10 flex items-center justify-center rounded-lg border-2 border-slate-200 hover:bg-slate-100'
            title='No Background'
          >
            <TransparentIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

export default BackgroundColorPanel
