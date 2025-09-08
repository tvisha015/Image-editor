// app/page.tsx
"use client"; // This is crucial for pages with client-side interactivity

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadView from '@/components/UploadView';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Next.js's navigation hook

  const handleImageUpload = (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      const imageUrl = event.target?.result as string;
      console.log('Image URL:', imageUrl);
      if (!imageUrl) {
        setIsLoading(false);
        return;
      }
      
      // Simulate API call or processing
      setTimeout(() => {
        // 1. Save the image data to sessionStorage
        sessionStorage.setItem('uploadedImage', imageUrl);
        
        // 2. Navigate to the editor page
        router.push('/editor');
      }, 2000);
    };

    reader.readAsDataURL(file);
  };

  return (
    <main className="bg-slate-900 min-h-screen w-full flex items-center justify-center p-4 font-sans">
      <UploadView onImageUpload={handleImageUpload} isLoading={isLoading} />
    </main>
  );
}