'use client';

import Image from 'next/image';
import { useState } from 'react';

function Home() {
  const [uploadedPosterUrl, setUploadedPosterUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCreatePoster = async () => {
    // Validate input
    if (!name.trim()) {
      alert('Please enter a name before creating the poster.');
      return;
    }
    if (!selectedFile) {
      alert('Please upload an image before creating the poster.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', name);

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
      alert('An error occurred while creating the poster.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPoster = () => {
    // Reset state to allow creating a new poster
    setUploadedPosterUrl(null);
    setLoading(false);
    setName('');
    setSelectedFile(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Create Your Custom Poster</h1>

      {!uploadedPosterUrl ? (
        <div className="flex flex-col items-center">
          {/* Name input */}
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4 p-2 border rounded w-full max-w-sm text-black"
          />

          {/* File upload input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-4"
          />

          {/* Create Poster Button */}
          <button
            onClick={handleCreatePoster}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Poster
          </button>
        </div>
      ) : (
        <button
          onClick={handleCreateNewPoster}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mb-4"
        >
          Create New Poster
        </button>
      )}

      {/* Loading Indicator */}
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
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Download Poster
            </button>
          </a>
        </div>
      )}
    </main>
  );
}

export default Home;
