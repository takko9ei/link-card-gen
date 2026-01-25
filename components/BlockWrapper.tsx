"use client";

import React, { useState, useEffect, useRef } from "react";

interface BlockWrapperProps {
  title: string;
  height: number;
  isOverflow: boolean;

  onResize: (height: number) => void;
  onDelete?: () => void;
  onTitleChange?: (newTitle: string) => void;
  type?: string;
  onAddImage?: () => void;
  dragHandleProps?: any;
  children: React.ReactNode;
  blockOpacity?: number;
}

import { X, Plus } from "lucide-react";
import InlineText from "./InlineText";

import { createPortal } from "react-dom";

export default function BlockWrapper({
  title,
  height,
  isOverflow,
  onResize,
  onDelete,
  onTitleChange,
  type,
  onAddImage,
  dragHandleProps,
  children,
  blockOpacity = 1,
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
    <>
      <div
        className={`
        relative rounded-xl shadow-md flex flex-col overflow-hidden transition-shadow duration-200
        ${isOverflow ? "border-2 border-red-500" : "hover:shadow-lg"}
      `}
        style={{
          height: `${height}px`,
          backgroundColor: `rgba(255, 255, 255, ${blockOpacity})`,
        }}
      >
        <div
          className="flex-shrink-0 px-4 py-2 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center cursor-move"
          {...dragHandleProps}
        >
          <div className="font-bold text-xs uppercase tracking-wider text-gray-500 select-none flex-1">
            <InlineText
              value={title}
              onChange={(newVal) => onTitleChange?.(newVal)}
              className="hover:bg-gray-200/50 -ml-1 pl-1 pr-1 rounded"
              tagName="span"
            />
          </div>
          <div className="flex items-center gap-1">
            {type === "gallery" && onAddImage && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddImage();
                }}
                className="text-gray-400 hover:text-blue-500 transition-colors p-1 rounded-md hover:bg-gray-100/50"
                title="Add Image"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Plus size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-gray-100/50"
                title="Remove Block"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <X size={14} />
              </button>
            )}
          </div>
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
      {/* Global Resize Tooltip */}
      {isResizing &&
        createPortal(
          <div className="fixed top-12 left-[calc(50vw+200px)] -translate-x-1/2 z-[9999] bg-black/80 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg pointer-events-none backdrop-blur-sm">
            Height: {Math.round(height)}px
          </div>,
          document.body,
        )}
    </>
  );
}
