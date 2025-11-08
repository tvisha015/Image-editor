// src/app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UploadView from "@/components/Upload/UploadView";
import axios from "axios";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Next.js's navigation hook

  const handleImageUpload = async (file: File) => {
    setIsLoading(true);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!baseUrl) {
      console.error("API base URL is not defined. Check your .env file.");
      alert("Configuration error: The API base URL is missing.");
      setIsLoading(false);
      return;
    }

    // Define your dynamic endpoint here
    const endpoint = "remove-bg-single/";
    const apiUrl = `${baseUrl}${endpoint}`; // Combine them to get the full URL

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Use the combined apiUrl in your API call
      const response = await axios.post(apiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // timeout: 50000,
      });

      // Check if the API call was successful and get the URL from the JSON data
      if (
        response.data &&
        response.data.status === "success" &&
        response.data.url
      ) {
        const imageUrl = response.data.url;

        // Save both the original and the edited URL
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const originalDataUrl = event.target?.result as string;
            sessionStorage.setItem("originalImage", originalDataUrl); // The untouched original
            sessionStorage.setItem("uploadedImage", imageUrl); // The background-removed version
            sessionStorage.setItem("bgRemoved", "true");
            router.push("/editor");
        };
        reader.readAsDataURL(file); // Convert original file to Data URL

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
          // On fallback, original and uploaded are the same
          sessionStorage.setItem("originalImage", imageUrl);
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
    <main className="bg-slate-100 min-h-screen w-full flex items-center justify-center p-4 font-sans">
      <UploadView onImageUpload={handleImageUpload} isLoading={isLoading} />
    </main>
  );
}