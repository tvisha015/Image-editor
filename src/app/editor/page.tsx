// app/editor/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditorView from '../../components/EditorView';

export default function EditorPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const storedImageUrl = sessionStorage.getItem('uploadedImage');
    const bgRemoved = sessionStorage.getItem('bgRemoved'); 

    if (storedImageUrl) {
      setImageUrl(storedImageUrl);
      if (bgRemoved === 'true') {
        setShowSuccessMessage(true);
        // Hide the success message after 5 seconds
        setTimeout(() => setShowSuccessMessage(false), 5000);
      }
    } else {
      router.push('/');
      return; 
    }

    const scriptSrc = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';
    
    // Check if the script is already on the page or being loaded
    if (document.querySelector(`script[src="${scriptSrc}"]`)) {
        // If it's already loaded and window.fabric exists, set state
        if (window.fabric) {
            setIsScriptLoaded(true);
        }
        // If not, the onload event from another instance will handle it.
        return;
    }

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;

    script.onload = () => {
      console.log("Fabric.js script has loaded successfully.");
      setIsScriptLoaded(true);
    };
    
    script.onerror = () => {
        console.error("Failed to load the Fabric.js script.");
    }

    document.body.appendChild(script);

    // This cleanup function is important for React Strict Mode
    return () => {
        const scriptTag = document.querySelector(`script[src="${scriptSrc}"]`);
        // Only remove the script if the component is truly unmounting for good
    }
  }, [router]);

  const handleStartNew = () => {
    sessionStorage.removeItem('uploadedImage');
    router.push('/');
  };

  return (
    <main className="bg-slate-900 min-h-screen w-full flex items-center justify-center p-4 font-sans relative">
      {showSuccessMessage && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center z-50 animate-fade-in-out">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Background successfully removed!
        </div>
      )}
      
      {imageUrl && isScriptLoaded ? (
        <EditorView imageUrl={imageUrl} onStartNew={handleStartNew} />
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-300 font-medium text-lg">Loading Editor...</p>
          <p className="text-slate-400 text-sm">Preparing your background-removed image</p>
        </div>
      )}
    </main>
  );
}