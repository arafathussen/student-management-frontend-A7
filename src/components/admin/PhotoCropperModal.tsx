"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  Image as ImageIcon,
  Crop,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PhotoCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (dataUrl: string) => void;
  initialImage?: string;
}

export default function PhotoCropperModal({
  isOpen,
  onClose,
  onCropComplete,
  initialImage,
}: PhotoCropperModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage || null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageObjRef.current = img;
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      renderCanvas();
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Re-render canvas whenever transform changes
  useEffect(() => {
    if (imageObjRef.current) {
      renderCanvas();
    }
  }, [zoom, rotation, offset]);

  // Render viewport to canvas and update preview
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 320; // Internal square size
    canvas.width = size;
    canvas.height = size;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Save state
    ctx.save();

    // Center pivot
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate aspect fit scale
    const baseScale = Math.max(size / img.width, size / img.height);
    const currentScale = baseScale * zoom;

    const drawW = img.width * currentScale;
    const drawH = img.height * currentScale;

    // Draw with offset
    ctx.drawImage(
      img,
      -drawW / 2 + offset.x,
      -drawH / 2 + offset.y,
      drawW,
      drawH
    );

    ctx.restore();

    // Update real-time preview
    try {
      setPreviewDataUrl(canvas.toDataURL("image/jpeg", 0.9));
    } catch {
      // Ignore security errors with foreign origins
    }
  };

  // Drag interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag interaction for mobile/tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  // Handle local file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Export cropped avatar
  const handleApplyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // High quality export
    const finalDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    onCropComplete(finalDataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Photo Cutter & Profile Avatar Cropper
              </h3>
              <p className="text-xs text-slate-400">
                Position, zoom, and crop the image for a sharp circular and square profile.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Viewport & Controls */}
        <div className="space-y-4">
          {imageSrc ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* Interactive Viewport Canvas */}
              <div className="relative group select-none">
                <div
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                  className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] bg-slate-950 rounded-2xl overflow-hidden relative cursor-grab active:cursor-grabbing border-2 border-dashed border-blue-500/50 shadow-inner flex items-center justify-center"
                >
                  <canvas ref={canvasRef} className="w-full h-full object-cover pointer-events-none" />

                  {/* Circular Overlay Mask Guideline */}
                  <div className="absolute inset-0 pointer-events-none rounded-full border-2 border-blue-400/60 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)]" />
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-1.5">
                  Drag with mouse to reposition face
                </p>
              </div>

              {/* Side Live Previews */}
              <div className="flex flex-col items-center gap-4 shrink-0 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Live Preview
                </span>

                {/* Circle Avatar Preview */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-800 ring-2 ring-blue-500 shadow-lg">
                    {previewDataUrl ? (
                      <img src={previewDataUrl} alt="Circle Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 border-2 border-slate-950 rounded-full" />
                </div>
                <span className="text-[10px] text-slate-500">Contact Card Avatar</span>

                {/* Change photo button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs gap-1.5 border-slate-700 hover:bg-slate-800 text-slate-300 w-full mt-2"
                >
                  <Upload className="w-3 h-3" />
                  <span>Choose Another</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Empty State: File Picker Dropzone */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="py-14 px-6 border-2 border-dashed border-slate-800 hover:border-blue-500/60 rounded-2xl bg-slate-950/50 hover:bg-slate-950/80 cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-3 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                  Click to Select Photo from Computer / Phone
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Supports JPG, PNG, WEBP. You will be able to crop and position immediately.
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Transformation Controls (Zoom & Rotate) */}
          {imageSrc && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              {/* Zoom Slider */}
              <div className="flex items-center gap-3">
                <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs font-mono text-slate-400 w-12 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Rotate and Reset Action Buttons */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate 90°</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setOffset({ x: 0, y: 0 });
                  }}
                  className="text-slate-400 hover:text-white underline transition-colors"
                >
                  Reset Zoom & Position
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!imageSrc}
            onClick={handleApplyCrop}
            variant="gradient"
            className="text-xs gap-1.5 shadow-md shadow-blue-600/30"
          >
            <Check className="w-4 h-4" />
            <span>Crop & Set Photo</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
