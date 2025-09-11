// app/page.tsx
"use client"; // This is crucial for pages with client-side interactivity

import { useState } from "react";
import { useRouter } from "next/navigation";
import UploadView from "@/components/UploadView";
import axios from "axios";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Next.js's navigation hook

  const handleImageUpload = async (file: File) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Make the API call, expecting a JSON response (removed responseType: 'blob')
      const response = await axios.post(
        "https://img-bg-remover.makeitlive.info/remove-bg-single/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      // Check if the API call was successful and get the URL from the JSON data
      if (
        response.data &&
        response.data.status === "success" &&
        response.data.url
      ) {
        const imageUrl = response.data.url;

        // Save the processed image URL from the API directly to sessionStorage
        sessionStorage.setItem("uploadedImage", imageUrl);
        sessionStorage.setItem("bgRemoved", "true");

        // Navigate to the editor page
        router.push("/editor");
      } else {
        // Handle cases where the API might not return a URL
        throw new Error(
          "API request was successful, but no image URL was returned."
        );
      }
    } catch (error) {
      console.error("Error removing background:", error);

      // Your original fallback logic is perfect for handling errors
      const fallbackReader = new FileReader();
      fallbackReader.onload = (event: ProgressEvent<FileReader>) => {
        const imageUrl = event.target?.result as string;
        if (imageUrl) {
          sessionStorage.setItem("uploadedImage", imageUrl);
          alert(
            "Background removal service is currently unavailable. Loading original image in editor."
          );
          router.push("/editor");
        } else {
          alert("Failed to process the image. Please try again.");
          setIsLoading(false);
        }
      };
      fallbackReader.readAsDataURL(file);
    }
  };

  return (
    // <main className="bg-slate-900 min-h-screen w-full flex items-center justify-center p-4 font-sans">
    //   <UploadView onImageUpload={handleImageUpload} isLoading={isLoading} />
    // </main>
    <main className="bg-slate-100 min-h-screen w-full flex items-center justify-center p-4 font-sans">
      <UploadView onImageUpload={handleImageUpload} isLoading={isLoading} />
    </main>
  );
}
