import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaFileAlt } from "react-icons/fa";

interface MarkdownUploadProps {
  onMarkdownUpload: (file: File) => void;
  label?: string;
}

export default function MarkdownUpload({
  onMarkdownUpload,
  label = "Contenuto dell'Articolo",
}: MarkdownUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  const mdDropzone = useDropzone({
    accept: { "text/markdown": [".md"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFileName(file.name);
        onMarkdownUpload(file);
      }
    },
  });

  return (
    <div>
      <label className="block text-base font-semibold mb-2">
        {label}{" "}
        <span className="text-xs font-light">(Formato Markdown .md)</span>
      </label>

      <div
        {...mdDropzone.getRootProps()}
        className={`relative flex flex-col items-center justify-center w-full h-36 border rounded-lg cursor-pointer transition ${
          fileName
            ? "border-solid border-green-500 bg-green-50"
            : "border-dashed border-gray-300 hover:border-green-500"
        }`}
      >
        <input {...mdDropzone.getInputProps()} className="hidden" />

        {fileName ? (
          <p className="text-green-600 font-semibold">{fileName}</p>
        ) : (
          <div className="flex flex-col items-center">
            <FaFileAlt className="text-gray-400 text-4xl" />
            <p className="text-gray-500 text-sm mt-3">
              Premi qui per caricare il file .md, oppure trascinalo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
