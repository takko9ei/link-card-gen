import React from "react";
import BlockWrapper from "./BlockWrapper";
import HeaderBlock from "./blocks/HeaderBlock";
import GalleryBlock from "./blocks/GalleryBlock";
import TextBlock from "./blocks/TextBlock";

// Define types locally or import if shared
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

interface CanvasProps {
  state: ProjectState;
  onBlockResize?: (
    columnId: string,
    blockId: string,
    newHeight: number,
  ) => void;
  onBlockUpdate?: (columnId: string, blockId: string, newContent: any) => void;
}

const PRESET_CANVAS_HEIGHT = 800; // Simulated preset height for overflow testing

export default function Canvas({
  state,
  onBlockResize,
  onBlockUpdate,
}: CanvasProps) {
  return (
    <div
      className="w-full min-h-[600px] p-8 transition-all duration-300 ease-in-out shadow-sm rounded-xl overflow-hidden relative"
      style={{
        backgroundColor: state.background.startsWith("#")
          ? state.background
          : undefined,
        backgroundImage: state.background.startsWith("http")
          ? `url(${state.background})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Height Marker for Visualization */}
      <div
        className="absolute top-0 right-0 w-2 border-r-2 border-red-300 pointer-events-none opacity-50"
        style={{ height: PRESET_CANVAS_HEIGHT }}
        title={`Max Height: ${PRESET_CANVAS_HEIGHT}px`}
      />

      <div
        className="w-full h-full grid items-start"
        style={{
          gridTemplateColumns: state.gridTemplateColumns,
          gap: `${state.columnGap}px`,
        }}
      >
        {state.columns.map((column, index) => {
          // Calculate accumulated height to check for overflow
          let currentColumnHeight = 0;

          return (
            <div key={column.id} className="flex flex-col gap-4 min-h-[200px]">
              {column.blocks.length > 0 ? (
                column.blocks.map((block) => {
                  const isOverflow =
                    currentColumnHeight + block.height > PRESET_CANVAS_HEIGHT;
                  currentColumnHeight += block.height + 16; // +16 for gap estimate

                  return (
                    <BlockWrapper
                      key={block.id}
                      title={block.title}
                      height={block.height}
                      isOverflow={isOverflow}
                      onResize={(newHeight) =>
                        onBlockResize?.(column.id, block.id, newHeight)
                      }
                    >
                      {/* Render Specific Blocks Logic */}
                      {block.type === "header" && (
                        <HeaderBlock
                          content={block.content}
                          onUpdate={(newContent) =>
                            onBlockUpdate?.(column.id, block.id, newContent)
                          }
                        />
                      )}
                      {block.type === "gallery" && (
                        <GalleryBlock content={block.content} />
                      )}
                      {block.type === "text" && (
                        <TextBlock content={block.content} />
                      )}

                      {/* Fallback for unknown types */}
                      {!["header", "gallery", "text"].includes(block.type) && (
                        <div className="p-4 text-center text-gray-400 text-sm">
                          Unknown Block Type: {block.type}
                        </div>
                      )}
                    </BlockWrapper>
                  );
                })
              ) : (
                // Empty state for column
                <div className="border-2 border-dashed border-gray-300/50 rounded-lg h-[200px] bg-white/30 backdrop-blur-sm flex items-center justify-center text-gray-400">
                  Column {index + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
