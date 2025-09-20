
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, CameraIcon } from './icons';
import { UploadedImage } from '../types';

interface ImageUploaderProps {
  onImageUpload: (image: UploadedImage) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        const base64 = previewUrl.split(',')[1];
        onImageUpload({ file, base64, previewUrl });
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [handleFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleTakePhotoClick = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        className={`relative w-full h-64 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all duration-300 ${
          isDragging ? 'border-brand-purple bg-brand-gray/50' : 'border-brand-gray-light'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <UploadIcon className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-lg font-semibold text-gray-300">
          Drag & Drop your image here
        </p>
        <p className="text-sm text-gray-500 my-2">or</p>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={handleBrowseClick}
            className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-brand-gray-light hover:bg-gray-600 transition-colors"
          >
            Browse Files
          </button>
          <button
            type="button"
            onClick={handleTakePhotoClick}
            className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-brand-gray-light hover:bg-gray-600 transition-colors"
          >
            <CameraIcon className="w-5 h-5 mr-2" />
            Take Photo
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        id="file-upload"
        name="file-upload"
        type="file"
        className="sr-only"
        accept="image/png, image/jpeg, image/webp"
        onChange={onFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={onFileChange}
      />
    </div>
  );
};

export default ImageUploader;