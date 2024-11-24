'use client';

import Image from 'next/image';
import { useState } from 'react';

function Home() {
  const [uploadedPosterUrl, setUploadedPosterUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedPosterUrl(data.url);
      } else {
        alert('Failed to process the image');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while uploading');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPoster = () => {
    // Reset the state to allow a new poster upload
    setUploadedPosterUrl(null);
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Your Photo for the Poster</h1>

      {/* File upload input and reset button */}
      {!uploadedPosterUrl ? (
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="mb-4"
        />
      ) : (
        <button
          onClick={handleCreateNewPoster}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mb-4"
        >
          Create New Poster
        </button>
      )}

      {/* Loading indicator */}
      {loading && <p>Processing...</p>}

      {/* Display the poster preview and download button */}
      {uploadedPosterUrl && (
        <div className="text-center">
          <Image
            src={uploadedPosterUrl}
            alt="Updated Poster"
            width={600}
            height={800}
            className="border shadow-md rounded-md mb-4 max-w-xs"
          />
          <a href={uploadedPosterUrl} download="updated_poster.jpeg">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Download Poster
            </button>
          </a>
        </div>
      )}
    </main>
  );
}

export default Home;
