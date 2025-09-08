// app/editor/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditorView from '../../components/EditorView';

export default function EditorPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    const storedImageUrl = sessionStorage.getItem('uploadedImage');

    if (storedImageUrl) {
      setImageUrl(storedImageUrl);
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
        // This is a simple approach; in more complex apps, you might manage this differently.
    }
  }, [router]);

  const handleStartNew = () => {
    sessionStorage.removeItem('uploadedImage');
    router.push('/');
  };

  return (
    <main className="bg-slate-900 min-h-screen w-full flex items-center justify-center p-4 font-sans">
      {imageUrl && isScriptLoaded ? (
        <EditorView imageUrl={imageUrl} onStartNew={handleStartNew} />
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-300 font-medium text-lg">Loading Editor...</p>
        </div>
      )}
    </main>
  );
}