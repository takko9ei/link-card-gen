"use client";

import { useState } from "react";
import Canvas from "@/components/Canvas";

// Re-defining these here for state management.
// Ideally these should be in a separate types file but for now keeping it co-located as requested.
interface Block {
  id: string;
  type: string;
  title: string;
  content: any;
  height: number;
}

interface Column {
  id: string;
  blocks: Block[];
}

interface ProjectState {
  columns: Column[];
  columnGap: number;
  background: string;
  gridTemplateColumns: string;
}

export default function Home() {
  const [projectState, setProjectState] = useState<ProjectState>({
    columns: [
      {
        id: "col-1",
        blocks: [
          {
            id: "b1",
            type: "text",
            title: "HEADER",
            content: "Welcome to My Page",
            height: 150,
          },
          {
            id: "b2",
            type: "link",
            title: "LINK",
            content: "Visit my Website",
            height: 100,
          },
        ],
      },
      {
        id: "col-2",
        blocks: [
          {
            id: "b3",
            type: "image",
            title: "GALLERY",
            content: "Photo Placeholder",
            height: 300,
          },
        ],
      },
    ],
    columnGap: 24,
    background: "#f3f4f6",
    gridTemplateColumns: "2fr 1fr",
  });

  const updateColumns = (count: number) => {
    setProjectState((prev) => {
      let newColumns = [...prev.columns];
      let newTemplate = prev.gridTemplateColumns;

      if (count > prev.columns.length) {
        // Add columns
        for (let i = prev.columns.length; i < count; i++) {
          newColumns.push({ id: `col-${Date.now()}-${i}`, blocks: [] });
        }
      } else if (count < prev.columns.length) {
        // Remove columns (and their blocks!)
        newColumns = newColumns.slice(0, count);
      }

      // Set default generic templates based on count
      if (count === 1) newTemplate = "1fr";
      if (count === 2) newTemplate = "2fr 1fr";
      if (count === 3) newTemplate = "1fr 1fr 1fr";

      return {
        ...prev,
        columns: newColumns,
        gridTemplateColumns: newTemplate,
      };
    });
  };

  const handleBlockResize = (
    columnId: string,
    blockId: string,
    newHeight: number,
  ) => {
    setProjectState((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          blocks: col.blocks.map((block) => {
            if (block.id !== blockId) return block;
            return { ...block, height: newHeight };
          }),
        };
      }),
    }));
  };

  return (
    <div className="flex h-screen w-full bg-white text-gray-900">
      {/* Left Column: Settings & Editor */}
      <div className="w-[400px] flex-shrink-0 border-r border-gray-200 flex flex-col h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold tracking-tight">Page Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your layout</p>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {/* Columns Control */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Columns
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => updateColumns(num)}
                  className={`
                                py-3 px-4 rounded-lg font-medium text-sm transition-all border
                                ${
                                  projectState.columns.length === num
                                    ? "bg-gray-900 text-white border-gray-900 shadow-md"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }
                            `}
                >
                  {num} Column{num > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Gap Control */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Gap Spacing
              </label>
              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                {projectState.columnGap}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="4"
              value={projectState.columnGap}
              onChange={(e) =>
                setProjectState((prev) => ({
                  ...prev,
                  columnGap: parseInt(e.target.value),
                }))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
            />
          </div>

          {/* Background Control */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Canvas Background
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={
                  projectState.background.startsWith("#")
                    ? projectState.background
                    : "#ffffff"
                }
                onChange={(e) =>
                  setProjectState((prev) => ({
                    ...prev,
                    background: e.target.value,
                  }))
                }
                className="w-10 h-10 rounded cursor-pointer border-0 p-0 overflow-hidden"
              />
              <input
                type="text"
                placeholder="Or enter Image URL"
                value={
                  projectState.background.startsWith("http")
                    ? projectState.background
                    : ""
                }
                onChange={(e) =>
                  setProjectState((prev) => ({
                    ...prev,
                    background: e.target.value,
                  }))
                }
                className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <strong>Tip:</strong> Drag the bottom edge of any block in the
            preview to resize it.
          </div>
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="flex-1 bg-gray-50 p-12 overflow-y-auto flex items-center justify-center">
        <Canvas state={projectState} onBlockResize={handleBlockResize} />
      </div>
    </div>
  );
}
