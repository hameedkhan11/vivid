import React, { useCallback } from "react";
import { motion } from "framer-motion";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Title,
} from "@/components/editor/components/Headings";
import Paragraph from "@/components/editor/components/Paragraph";
import { CustomImage } from "@/components/editor/components/ImageComponent";
import { cn } from "@/lib/utils";
import { DropZone } from "./DropZone";
import { ColumnComponent } from "@/components/editor/components/ColumnComponent";
import { TableComponent } from "@/components/editor/components/TableComponent";
import { ContentItem } from "@/lib/types";
import { BlockQuote } from "@/components/editor/components/BlockQuote";
import { TableOfContents } from "@/components/editor/components/TableOfContent";
// import { CustomButton } from "@/components/editor/components/CustomComponent";
import { CodeBlock } from "@/components/editor/components/Codeblock";
import { CalloutBox } from "@/components/editor/components/CalloutBox";
import {
  BulletList,
  NumberedList,
  TodoList,
} from "@/components/editor/components/ListComponent";
import { Divider } from "@/components/editor/components/Divider";

interface MasterRecursiveComponentProps {
  content: ContentItem;
  onContentChange: (
    contentId: string,
    newContent: string | string[] | string[][]
  ) => void;
  isPreview?: boolean;
  isEditable?: boolean;
  slideId: string;
  index?: number;
  imageLoading: boolean;
}

const ContentRenderer: React.FC<MasterRecursiveComponentProps> = React.memo(
  ({
    content,
    onContentChange,
    isPreview = false,
    isEditable = true,
    slideId,
    imageLoading=false
  }) => {

    // FIX: Move useCallback hook call to the top level before any conditional returns
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // We can safely access content.id here because the check below
        // will ensure the component doesn't render if content or content.id is missing.
        onContentChange(content.id, e.target.value);
      },
      [content?.id, onContentChange] // Use optional chaining for safety in dependency array
    );

    // Now perform the defensive checks after the hook calls
    if (!content || !content.id) {
      console.error("ContentRenderer received invalid content", content);
      return null;
    }

    const commonProps = {
      placeholder: content.placeholder,
      value: content.content as string,
      onChange: handleChange,
      isPreview: isPreview,
    };

    const animationProps = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 },
    };

    switch (content.type) {
      case "heading1":
        return (
          <motion.div {...animationProps} className="w-full h-full">
            <Heading1 {...commonProps} />
          </motion.div>
        );
      case "heading2":
        return (
          <motion.div {...animationProps} className="w-full h-full">
            <Heading2 {...commonProps} />
          </motion.div>
        );
      case "heading3":
        return (
          <motion.div {...animationProps} className="w-full h-full">
            <Heading3 {...commonProps} />
          </motion.div>
        );
      case "heading4":
        return (
          <motion.div {...animationProps} className="w-full h-full">
            <Heading4 {...commonProps} />
          </motion.div>
        );
      case "title":
        return (
          <motion.div {...animationProps} className="w-full h-full">
            <Title {...commonProps} />
          </motion.div>
        );
      case "paragraph":
        return (
          <motion.div {...animationProps} className="w-full h-full">
            <Paragraph {...commonProps} />
          </motion.div>
        );
      case "table":
        return (
          <motion.div {...animationProps} className="w-full h-full">
            <TableComponent
              content={content.content as string[][]}
              onChange={(newContent) =>
                onContentChange(
                  content.id,
                  newContent !== null ? newContent : [] // Changed "" to [] based on string[][] type
                )
              }
              initialRowSize={content.initialColumns}
              initialColSize={content.initialRows}
              isPreview={isPreview}
              isEditable={isEditable}
            />
          </motion.div>
        );
      case "resizable-column":
        if (Array.isArray(content.content)) {
          return (
            <motion.div {...animationProps} className="w-full h-full">
              <ColumnComponent
                content={content.content as ContentItem[]}
                className={content.className}
                onContentChange={onContentChange}
                slideId={slideId}
                isPreview={isPreview}
                isEditable={isEditable}
                imageLoading={imageLoading}
              />
            </motion.div>
          );
        }
         console.error(`Resizable-column content is not an array for ID: ${content.id}`, content.content);
        return null;
      case "image":
        return (
          <motion.div {...animationProps} className="w-full h-full">
            <CustomImage
              src={content.content as string}
              alt={content.alt || "image"}
              className={content.className}
              isPreview={isPreview}
              contentId={content.id}
              onContentChange={onContentChange}
              isEditable={isEditable}
              imageLoading={imageLoading}
            />
          </motion.div>
        );
      case "blockquote":
        return (
          <motion.div {...animationProps} className="w-full h-full">
            <BlockQuote>
              <Paragraph {...commonProps} />
            </BlockQuote>
          </motion.div>
        );
      case "numberedList":
         if (Array.isArray(content.content)) {
            return (
              <motion.div {...animationProps} className="w-full h-full">
                <NumberedList
                  items={content.content as string[]}
                  onChange={(newItems: string[]) => onContentChange(content.id, newItems)}
                  className={content.className}
                  isEditable={isEditable}
                />
              </motion.div>
            );
         }
         console.error(`NumberedList content is not an array for ID: ${content.id}`, content.content);
         return null;
      case "bulletList":
          if (Array.isArray(content.content)) {
              return (
                <motion.div {...animationProps} className="w-full h-full">
                  <BulletList
                    items={content.content as string[]}
                    onChange={(newItems: string[]) => onContentChange(content.id, newItems)}
                    className={content.className}
                    isEditable={isEditable}
                  />
                </motion.div>
              );
           }
           console.error(`BulletList content is not an array for ID: ${content.id}`, content.content);
           return null;
      case "todoList":
         if (Array.isArray(content.content)) {
              return (
                <motion.div {...animationProps} className="w-full h-full">
                  <TodoList
                    items={content.content as string[]}
                    onChange={(newItems: string[]) => onContentChange(content.id, newItems)}
                    className={content.className}
                    isEditable={isEditable}
                  />
                </motion.div>
              );
           }
            console.error(`TodoList content is not an array for ID: ${content.id}`, content.content);
            return null;
      case "calloutBox":
        return (
          <motion.div {...animationProps} className="w-full h-full">
            <CalloutBox
              type={content.callOutType || "info"}
              className={content.className}
            >
              <Paragraph {...commonProps} />
            </CalloutBox>
          </motion.div>
        );
      case "codeBlock":
        return (
          <motion.div {...animationProps} className="w-full h-full">
            <CodeBlock
              code={content.code as string || ""}
              language={content.language as string || ""}
              onChange={(newCode: string) => onContentChange(content.id, newCode)}
              className={content.className}
              // isEditable={isEditable}
            />
          </motion.div>
        );
      case "tableOfContents":
         if (Array.isArray(content.content)) {
            return (
              <motion.div {...animationProps} className="w-full h-full">
                <TableOfContents
                  items={content.content as string[]}
                  onItemClick={(id) => {
                    console.log(`Navigate to section: ${id}`);
                  }}
                  className={content.className}
                />
              </motion.div>
            );
         }
         console.error(`TableOfContents content is not an array for ID: ${content.id}`, content.content);
         return null;
      case "divider":
        return (
          <motion.div {...animationProps} className="w-full h-full">
            <Divider className={content.className} />
          </motion.div>
        );
      case "column":
        if (Array.isArray(content.content)) {
          return (
            <motion.div
              {...animationProps}
              className={cn("w-full h-full flex flex-col", content.className)}
            >
              {content.content.length > 0 ? (
                (content.content as ContentItem[]).map(
                  (subItem: ContentItem, subIndex: number) => (
                    <React.Fragment key={subItem.id || `item-${subIndex}`}>
                      {!isPreview &&
                        !subItem.restrictToDrop &&
                        subIndex === 0 &&
                        isEditable && (
                          <DropZone
                            index={0}
                            parentId={content.id}
                            slideId={slideId}
                          />
                        )}
                      <MasterRecursiveComponent
                        content={subItem}
                        onContentChange={onContentChange}
                        isPreview={isPreview}
                        slideId={slideId}
                        index={subIndex}
                        isEditable={isEditable}
                        imageLoading={imageLoading}
                      />
                      {!isPreview && !subItem.restrictToDrop && isEditable && (
                        <DropZone
                          index={subIndex + 1}
                          parentId={content.id}
                          slideId={slideId}
                        />
                      )}
                    </React.Fragment>
                  )
                )
              ) : isEditable ? (
                <DropZone index={0} parentId={content.id} slideId={slideId} />
              ) : null}
            </motion.div>
          );
        }
        console.error(`Column content is not an array for ID: ${content.id}`, content.content);
        return null;
      default:
        console.warn(`Unknown content type: ${content.type} for ID: ${content.id}`);
        return null;
    }
  }
);

ContentRenderer.displayName = "ContentRenderer";

export const MasterRecursiveComponent: React.FC<MasterRecursiveComponentProps> = React.memo(
  ({
    content,
    onContentChange,
    isPreview = false,
    isEditable = true,
    slideId,
    index,
    imageLoading = false
  }) => {
    // Add defensive check
    if (!content) {
      console.error("MasterRecursiveComponent received undefined or null content");
      return null;
    }

    // Removed the conditional render based on isPreview here
    // and rely on ContentRenderer to handle internal preview logic.
    // The DropZone logic for top-level items should ideally be in the parent component
    // that maps over the top-level content items.

    return (
      <ContentRenderer
        content={content}
        onContentChange={onContentChange} 
        isPreview={isPreview}
        isEditable={isEditable}
        slideId={slideId}
        index={index}
        imageLoading={imageLoading}
      />
    );
  }
);

MasterRecursiveComponent.displayName = "MasterRecursiveComponent";