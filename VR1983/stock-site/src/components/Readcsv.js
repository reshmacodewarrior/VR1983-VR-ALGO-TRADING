import React, { useState } from "react";

const UploadLevels = () => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const BASE_URL = "http://192.168.1.58:8000";

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BASE_URL}/api/levels/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(
          `✅ Levels uploaded successfully for: ${result.symbols.join(", ")}`
        );
      } else {
        setMessage(`❌ Error: ${result.detail || "Upload failed"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("❌ Error connecting to server");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-md mb-6">
      <h3 className="text-white text-lg font-semibold mb-2">Upload Levels CSV</h3>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={uploading}
        className="block w-full text-sm text-gray-300
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-600 file:text-white
          hover:file:bg-blue-700
          disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {message && (
        <p
          className={`mt-2 text-sm ${
            message.startsWith("✅") ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default UploadLevels;
