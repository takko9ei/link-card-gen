import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  closestCorners,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import BlockWrapper from "./BlockWrapper";
import HeaderBlock from "./blocks/HeaderBlock";
import GalleryBlock from "./blocks/GalleryBlock";
import TextBlock from "./blocks/TextBlock";
import SortableBlock from "./SortableBlock";

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
  blockSpacing: number;
  background: string;
  gridTemplateColumns: string;
  meta?: {
    bgImage?: string;
    blockOpacity?: number;
  };
}

interface CanvasProps {
  state: ProjectState;
  onBlockResize?: (
    columnId: string,
    blockId: string,
    newHeight: number,
  ) => void;
  onBlockUpdate?: (columnId: string, blockId: string, newContent: any) => void;
  onBlockMove?: (
    activeId: string,
    overId: string,
    activeColumnId: string,
    overColumnId: string,
  ) => void;
  onBlockDelete?: (columnId: string, blockId: string) => void;
  onBlockTitleChange?: (
    columnId: string,
    blockId: string,
    newTitle: string,
  ) => void;
}

const PRESET_CANVAS_HEIGHT = 800; // Simulated preset height for overflow testing

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

export default function Canvas({
  state,
  onBlockResize,
  onBlockUpdate,

  onBlockMove,
  onBlockDelete,
  onBlockTitleChange,
}: CanvasProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const findColumn = (id: string) => {
    return state.columns.find(
      (col) => col.blocks.some((block) => block.id === id) || col.id === id,
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn) {
      return;
    }

    // Trigger move when over a different column
    if (onBlockMove) {
      onBlockMove(activeId, overId, activeColumn.id, overColumn.id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = active.id as string;
    const overId = over ? (over.id as string) : null;

    if (!overId) {
      setActiveId(null);
      return;
    }

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (activeColumn && overColumn) {
      if (onBlockMove) {
        onBlockMove(activeId, overId, activeColumn.id, overColumn.id);
      }
    }

    setActiveId(null);
  };

  // Helper to find the active block object for the Overlay
  const getActiveBlock = () => {
    for (const col of state.columns) {
      const block = col.blocks.find((b) => b.id === activeId);
      if (block) return block;
    }
    return null;
  };

  const activeBlock = getActiveBlock();
  const activeColumn = activeId ? findColumn(activeId) : null;

  return (
    <DndContext
      id="canvas-dnd-context"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className="w-full min-h-[600px] p-8 transition-all duration-300 ease-in-out shadow-sm rounded-xl overflow-hidden relative"
        style={{
          backgroundColor: state.background.startsWith("#")
            ? state.background
            : undefined,
          backgroundImage: state.meta?.bgImage
            ? `url(${state.meta.bgImage})`
            : state.background.startsWith("http")
              ? `url(${state.background})`
              : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Height Marker for Visualization */}
        {/* <div
          className="absolute top-0 right-0 w-2 border-r-2 border-red-300 pointer-events-none opacity-50"
          style={{ height: PRESET_CANVAS_HEIGHT }}
          title={`Max Height: ${PRESET_CANVAS_HEIGHT}px`}
        /> */}

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
              <SortableContext
                key={column.id}
                id={column.id}
                items={column.blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className="flex flex-col min-h-[200px]"
                  style={{ gap: `${state.blockSpacing}px` }}
                >
                  {column.blocks.map((block) => {
                    const isOverflow =
                      currentColumnHeight + block.height > PRESET_CANVAS_HEIGHT;
                    currentColumnHeight += block.height + 16; // +16 for gap estimate

                    return (
                      <SortableBlock key={block.id} id={block.id}>
                        <BlockWrapper
                          title={block.title}
                          height={block.height}
                          isOverflow={isOverflow}
                          type={block.type}
                          onResize={(newHeight) =>
                            onBlockResize?.(column.id, block.id, newHeight)
                          }
                          onDelete={() => onBlockDelete?.(column.id, block.id)}
                          onTitleChange={(newTitle) =>
                            onBlockTitleChange?.(column.id, block.id, newTitle)
                          }
                          onAddImage={
                            block.type === "gallery" &&
                            block.content.images.length < 4
                              ? () => {
                                  if (onBlockUpdate) {
                                    const newContent = {
                                      ...block.content,
                                      images: [
                                        ...block.content.images,
                                        "https://placehold.co/600x400?text=Image",
                                      ],
                                    };
                                    onBlockUpdate(
                                      column.id,
                                      block.id,
                                      newContent,
                                    );
                                  }
                                }
                              : undefined
                          }
                          blockOpacity={state.meta?.blockOpacity ?? 1}
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
                            <GalleryBlock
                              content={block.content}
                              onUpdate={(newContent) =>
                                onBlockUpdate?.(column.id, block.id, newContent)
                              }
                            />
                          )}
                          {block.type === "text" && (
                            <TextBlock
                              content={block.content}
                              onUpdate={(newContent) =>
                                onBlockUpdate?.(column.id, block.id, newContent)
                              }
                            />
                          )}

                          {/* Fallback for unknown types */}
                          {!["header", "gallery", "text"].includes(
                            block.type,
                          ) && (
                            <div className="p-4 text-center text-gray-400 text-sm">
                              Unknown Block Type: {block.type}
                            </div>
                          )}
                        </BlockWrapper>
                      </SortableBlock>
                    );
                  })}

                  {column.blocks.length === 0 && (
                    // Empty state for column needs to be droppable, SortableContext covers it if id matches
                    <div className="border-2 border-dashed border-gray-300/50 rounded-lg h-[200px] bg-white/30 backdrop-blur-sm flex items-center justify-center text-gray-400">
                      Column {index + 1}
                    </div>
                  )}
                </div>
              </SortableContext>
            );
          })}
        </div>

        {/* Footer Credit */}
        <div className="absolute bottom-2 right-4 text-[10px] text-gray-400 font-medium opacity-60 select-none pointer-events-none">
          Portfolio maker by Ameato9ei
        </div>
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeId && activeBlock ? (
          <div className="opacity-80">
            <BlockWrapper
              title={activeBlock.title}
              height={activeBlock.height}
              isOverflow={false}
              onResize={() => {}}
              blockOpacity={state.meta?.blockOpacity ?? 1}
            >
              {/* Render Specific Blocks Logic */}
              {activeBlock.type === "header" && (
                <HeaderBlock content={activeBlock.content} />
              )}
              {activeBlock.type === "gallery" && (
                <GalleryBlock
                  content={activeBlock.content}
                  onUpdate={(newContent) =>
                    onBlockUpdate?.(
                      activeColumn?.id || "",
                      activeBlock.id,
                      newContent,
                    )
                  }
                />
              )}
              {activeBlock.type === "text" && (
                <TextBlock content={activeBlock.content} />
              )}
            </BlockWrapper>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
