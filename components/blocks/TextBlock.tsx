import React from "react";

interface TextBlockProps {
  content: {
    text: string;
  };
  onUpdate?: (newContent: any) => void;
}

export default function TextBlock({ content, onUpdate }: TextBlockProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate?.({ ...content, text: e.target.value });
  };

  return (
    <div className="w-full h-full p-4">
      <textarea
        className="w-full h-full bg-transparent resize-none outline-none border-none text-sm text-gray-700 placeholder-gray-400 font-sans"
        value={content.text}
        onChange={handleChange}
        placeholder="Type something..."
        onPointerDown={(e) => e.stopPropagation()} // Optional: Prevent drag start when interacting with text
      />
    </div>
  );
}
