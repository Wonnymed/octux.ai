"use client";
import { useRef, useEffect, useState } from "react";
import { ArrowUp, Paperclip, Search, X, FileText, FileCode } from "lucide-react";
import { t } from "../lib/i18n";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 10;

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const PDF_TYPE = "application/pdf";
const TEXT_EXTENSIONS = [
  ".txt", ".md", ".csv", ".json", ".py", ".js", ".ts", ".html", ".css",
  ".xml", ".yaml", ".yml", ".sql", ".sh", ".bash", ".java", ".go",
  ".rs", ".rb", ".php", ".swift", ".kt", ".tsx", ".jsx",
];

const ACCEPT_STRING = "image/png,image/jpeg,image/gif,image/webp,application/pdf," +
  TEXT_EXTENSIONS.join(",");

const CODE_EXTENSIONS = [
  ".py", ".js", ".ts", ".tsx", ".jsx", ".html", ".css", ".json",
  ".java", ".go", ".rs", ".rb", ".php", ".swift", ".kt", ".sql",
  ".sh", ".bash", ".xml", ".yaml", ".yml",
];

export type FileAttachment = {
  file: File;
  type: "image" | "document";
  preview?: string;
  id: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function isCodeFile(name: string): boolean {
  return CODE_EXTENSIONS.some(ext => name.toLowerCase().endsWith(ext));
}

function isSupportedFile(file: File): boolean {
  if (IMAGE_TYPES.includes(file.type)) return true;
  if (file.type === PDF_TYPE) return true;
  return TEXT_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
}

type ChatInputProps = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  loading: boolean;
  placeholder?: string;
  searchActive?: boolean;
  onToggleSearch?: () => void;
  showDisclaimer?: boolean;
  attachments: FileAttachment[];
  onAttachmentsChange: (atts: FileAttachment[]) => void;
  onToast?: (msg: string, type: "success" | "error" | "info") => void;
};

export default function ChatInput({
  value, onChange, onSend, loading, placeholder,
  searchActive, onToggleSearch, showDisclaimer = true,
  attachments, onAttachmentsChange, onToast,
}: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const processFiles = async (files: File[]) => {
    const newAttachments: FileAttachment[] = [];
    for (const file of files) {
      if (!isSupportedFile(file)) {
        onToast?.(t("file.not_supported"), "error");
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        onToast?.(t("file.too_large"), "error");
        continue;
      }
      const isImage = IMAGE_TYPES.includes(file.type);
      let preview: string | undefined;
      if (isImage) {
        preview = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
      newAttachments.push({
        file,
        type: isImage ? "image" : "document",
        preview,
        id: Math.random().toString(36).slice(2),
      });
    }
    if (newAttachments.length > 0) {
      onAttachmentsChange([...attachments, ...newAttachments].slice(0, MAX_FILES));
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter(a => a.id !== id));
  };

  /* Drag & Drop */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    dragCounter.current = 0;
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  /* Paste */
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith("image/"));
    if (imageItems.length > 0) {
      e.preventDefault();
      const files: File[] = [];
      for (const item of imageItems) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
      await processFiles(files);
    }
  };

  const canSend = (value.trim() || attachments.length > 0) && !loading;

  return (
    <div
      style={{ width: "100%", maxWidth: 600, margin: "0 auto", position: "relative" }}
      data-tour="chat-input"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drop overlay */}
      {dragging && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          background: "var(--bg-primary)", borderRadius: "var(--radius-pill)",
          border: "2px dashed var(--accent)", display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "var(--accent)", fontSize: 14, fontWeight: 500,
          pointerEvents: "none",
        }}>
          {t("file.drop_here")}
        </div>
      )}

      {/* Pill container */}
      <div
        style={{
          border: "1px solid var(--border-primary)",
          borderRadius: attachments.length > 0 ? "var(--radius-lg)" : "var(--radius-pill)",
          background: "var(--bg-input)",
          overflow: "hidden",
          transition: "border-color 0.15s, border-radius 0.15s",
        }}
      >
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div style={{
            display: "flex", gap: 8, padding: "10px 14px 4px",
            overflowX: "auto", alignItems: "center",
          }}>
            {attachments.map(att => (
              <div key={att.id} style={{ position: "relative", flexShrink: 0 }}>
                {att.type === "image" && att.preview ? (
                  <div style={{ position: "relative" }}>
                    <img
                      src={att.preview}
                      alt={att.file.name}
                      style={{
                        width: 48, height: 48, borderRadius: "var(--radius-sm)",
                        objectFit: "cover", display: "block",
                      }}
                    />
                    <button
                      onClick={() => removeAttachment(att.id)}
                      style={{
                        position: "absolute", top: -6, right: -6,
                        width: 18, height: 18, borderRadius: "50%",
                        background: "var(--text-primary)", border: "none",
                        color: "var(--text-inverse)", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10,
                      }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 10px", background: "var(--bg-secondary)",
                    border: "1px solid var(--border-secondary)",
                    borderRadius: "var(--radius-sm)", height: 48,
                  }}>
                    {isCodeFile(att.file.name) ? <FileCode size={16} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} /> : <FileText size={16} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />}
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, fontWeight: 500, color: "var(--text-primary)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        maxWidth: 120,
                      }}>
                        {att.file.name}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
                        {formatFileSize(att.file.size)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--text-tertiary)", display: "flex", padding: 2,
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Textarea row */}
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          {/* Left toolbar icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, paddingLeft: 12, paddingBottom: 8, paddingTop: 8 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: 6, borderRadius: 6, display: "flex",
                color: "var(--text-tertiary)", transition: "color 0.15s",
              }}
              aria-label="Attach file"
            >
              <Paperclip size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPT_STRING}
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
            {onToggleSearch && (
              <button
                onClick={onToggleSearch}
                style={{
                  background: searchActive ? "var(--accent-bg)" : "none",
                  border: searchActive ? "1px solid var(--accent)" : "none",
                  cursor: "pointer",
                  padding: 6, borderRadius: 6, display: "flex",
                  color: searchActive ? "var(--accent)" : "var(--text-tertiary)",
                  transition: "all 0.15s",
                }}
                aria-label="Web search"
              >
                <Search size={16} />
              </button>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={ref}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKey}
            onPaste={handlePaste}
            placeholder={placeholder || t("chat.placeholder")}
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              padding: "12px 8px 12px 8px",
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              fontSize: 15,
              outline: "none",
              lineHeight: 1.5,
            }}
          />

          {/* Send button */}
          <div style={{ paddingRight: 8, paddingBottom: 8, paddingTop: 8 }}>
            <button
              onClick={onSend}
              disabled={!canSend}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: canSend ? "var(--text-primary)" : "var(--bg-tertiary)",
                border: "none",
                cursor: canSend ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
                color: canSend ? "var(--text-inverse)" : "var(--text-tertiary)",
              }}
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      {showDisclaimer && (
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "var(--text-tertiary)" }}>
          {t("common.disclaimer")}
        </div>
      )}
    </div>
  );
}
