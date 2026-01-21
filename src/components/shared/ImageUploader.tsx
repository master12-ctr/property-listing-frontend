'use client';

import { useState, useRef } from 'react';
import { XMarkIcon, PhotoIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  maxImages?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  onImagesChange: (files: File[]) => void;
  initialPreviews?: string[];
  folder?: string;
}

export default function ImageUploader({
  maxImages = 10,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  onImagesChange,
  initialPreviews = [],
  folder = 'property-listings',
}: ImageUploaderProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(initialPreviews);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      toast.error(`File type not supported: ${file.type}`);
      return false;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max ${maxSize}MB)`);
      return false;
    }

    // Check total images
    if (images.length + previews.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (files: FileList) => {
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (validateFile(file)) {
        validFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    if (validFiles.length > 0) {
      const newImages = [...images, ...validFiles];
      const allPreviews = [...previews, ...newPreviews];
      
      setImages(newImages);
      setPreviews(allPreviews);
      onImagesChange(newImages);
      
      toast.success(`${validFiles.length} image(s) added`);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...previews];
    
    // If it's a preview from URL, just remove from previews
    if (index < newPreviews.length) {
      if (index < newImages.length) {
        // It's a newly uploaded file
        newImages.splice(index, 1);
        URL.revokeObjectURL(newPreviews[index]);
      }
      newPreviews.splice(index, 1);
    }
    
    setImages(newImages);
    setPreviews(newPreviews);
    onImagesChange(newImages);
  };

  const removeAll = () => {
    images.forEach((_, index) => {
      URL.revokeObjectURL(previews[index]);
    });
    setImages([]);
    setPreviews([]);
    onImagesChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-3">
          <div className="mx-auto h-12 w-12 text-gray-400">
            {isDragging ? (
              <CloudArrowUpIcon className="h-12 w-12 text-blue-500" />
            ) : (
              <PhotoIcon className="h-12 w-12" />
            )}
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium">
              {isDragging ? 'Drop images here' : 'Drag & drop images or click to browse'}
            </p>
            <p className="mt-1">
              Supports {acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} • Max {maxSize}MB each
            </p>
            <p className="mt-1 text-xs">
              {previews.length} of {maxImages} images selected
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            Browse Files
          </button>
        </div>
      </div>

      {/* Selected Images */}
      {previews.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              Selected Images ({previews.length}/{maxImages})
            </h3>
            <button
              type="button"
              onClick={removeAll}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove All
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full object-cover group-hover:opacity-75"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                  {index === 0 ? 'Cover' : `Image ${index + 1}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Tips for best results:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use high-quality, well-lit photos</li>
          <li>• Include different angles and rooms</li>
          <li>• First image will be used as the cover photo</li>
          <li>• Landscape orientation works best</li>
        </ul>
      </div>
    </div>
  );
}