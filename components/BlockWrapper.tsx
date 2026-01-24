"use client";

import React, { useState, useEffect, useRef } from "react";

interface BlockWrapperProps {
  title: string;
  height: number;
  isOverflow: boolean;
  onResize: (height: number) => void;
  children: React.ReactNode;
}

export default function BlockWrapper({
  title,
  height,
  isOverflow,
  onResize,
  children,
}: BlockWrapperProps) {
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaY = e.clientY - startYRef.current;
      const newHeight = Math.max(100, startHeightRef.current + deltaY); // Minimum height 100px
      onResize(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, onResize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    document.body.style.cursor = "ns-resize";
  };

  return (
    <div
      className={`
        relative bg-white rounded-xl shadow-md flex flex-col overflow-hidden transition-shadow duration-200
        ${isOverflow ? "border-2 border-red-500" : "hover:shadow-lg"}
      `}
      style={{ height: `${height}px` }}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 select-none">
          {title}
        </h3>
      </div>

      {/* Content Content Slot */}
      <div className="flex-1 overflow-hidden">{children}</div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize flex items-center justify-center group z-10 hover:bg-gray-50"
        onMouseDown={handleMouseDown}
      >
        <div className="w-8 h-1 bg-gray-200 rounded-full group-hover:bg-blue-400 transition-colors" />
      </div>

      {/* Overflow Badge (Optional, mostly the border does the job) */}
      {isOverflow && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none">
          OVERFLOW
        </div>
      )}
    </div>
  );
}
