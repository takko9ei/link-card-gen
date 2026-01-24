import React from "react";

interface TextBlockProps {
  content: {
    text: string;
  };
}

export default function TextBlock({ content }: TextBlockProps) {
  return (
    <div className="w-full h-full p-4 flex items-center justify-center">
      <p className="text-sm text-gray-700 whitespace-pre-wrap text-center">
        {content.text}
      </p>
    </div>
  );
}
