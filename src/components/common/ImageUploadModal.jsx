/*
 * Copyright (C) 2026 Yukthi Systems Private Limited
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * version 3 along with this program. If not, see
 * <https://www.gnu.org/licenses/>.
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  Upload,
  Crop,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Check,
  FlipHorizontal,
  FlipVertical,
  Palette,
  Settings,
  Grid,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ImageUploadModal = ({
  isOpen,
  onClose,
  onUpload,
  title = "Upload Image",
  aspectRatio = 1,
  maxFileSize = 5 * 1024 * 1024,
  allowedTypes = ["image/png", "image/jpeg", "image/jpg"],
  outputFormat = "jpeg",
  outputQuality = 0.9,
  cropShape = "rect",
  minWidth = 100,
  minHeight = 100,
  isUploading = false,
  showRotation = true,
  showFlip = true,
  showZoom = true,
  showBrightness = true,
  showContrast = true,
  showSaturation = false,
  showFilters = false,
  enableFreeformCrop = false,
  cropPresets = [],
  maxOutputWidth = null,
  maxOutputHeight = null,
}) => {
  // UI States
  const [step, setStep] = useState("upload");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imgRef, setImgRef] = useState(null);

  // Crop States
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [currentAspectRatio, setCurrentAspectRatio] = useState(aspectRatio);

  // Enhancement States
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [selectedFilter, setSelectedFilter] = useState("none");

  // Final Result States
  const [finalBlob, setFinalBlob] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Filter definitions
  const filters = {
    none: "",
    grayscale: "grayscale(100%)",
    sepia: "sepia(100%)",
    vintage: "sepia(50%) contrast(120%) brightness(90%)",
    dramatic: "contrast(150%) saturate(120%)",
    cool: "hue-rotate(180deg) saturate(110%)",
    warm: "hue-rotate(-20deg) saturate(110%) brightness(105%)",
    noir: "grayscale(100%) contrast(130%) brightness(90%)",
    soft: "blur(0.5px) brightness(105%) contrast(95%)",
  };

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setStep("upload");
      setSelectedFile(null);
      setImageUrl(null);
      setImgRef(null);
      setCrop(null);
      setCompletedCrop(null);
      setCurrentAspectRatio(aspectRatio);
      resetEnhancements();
      setFinalBlob(null);
      setPreviewImageUrl(null);
    }
  }, [isOpen, aspectRatio]);

  // Cleanup URLs
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith("blob:"))
        URL.revokeObjectURL(imageUrl);
      if (previewImageUrl && previewImageUrl.startsWith("blob:"))
        URL.revokeObjectURL(previewImageUrl);
    };
  }, [imageUrl, previewImageUrl]);

  // Reset all enhancements
  const resetEnhancements = () => {
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSelectedFilter("none");
  };

  // File validation
  const validateFile = (file) => {
    if (!file) return { valid: false, error: "No file selected" };

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Please select a valid image file (${allowedTypes.map((type) => type.split("/")[1].toUpperCase()).join(", ")})`,
      };
    }

    if (file.size > maxFileSize) {
      const sizeMB = Math.round(maxFileSize / (1024 * 1024));
      return { valid: false, error: `File size must be less than ${sizeMB}MB` };
    }

    return { valid: true };
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    const validation = validateFile(file);

    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setStep("crop");
  };

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Generate final cropped and processed image
  const generateFinalImage = useCallback(async () => {
    if (!imgRef || !completedCrop || !canvasRef.current) {
      return null;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Calculate scaling factors
    const scaleX = imgRef.naturalWidth / imgRef.width;
    const scaleY = imgRef.naturalHeight / imgRef.height;

    // Calculate final dimensions
    let canvasWidth = completedCrop.width * scaleX;
    let canvasHeight = completedCrop.height * scaleY;

    // Apply max output constraints
    if (maxOutputWidth && canvasWidth > maxOutputWidth) {
      const ratio = maxOutputWidth / canvasWidth;
      canvasWidth = maxOutputWidth;
      canvasHeight = canvasHeight * ratio;
    }
    if (maxOutputHeight && canvasHeight > maxOutputHeight) {
      const ratio = maxOutputHeight / canvasHeight;
      canvasHeight = maxOutputHeight;
      canvasWidth = canvasWidth * ratio;
    }

    // Handle rotation dimension swap
    const needsDimensionSwap = rotation === 90 || rotation === 270;
    if (needsDimensionSwap) {
      [canvasWidth, canvasHeight] = [canvasHeight, canvasWidth];
    }

    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Configure canvas
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Apply filters
    const filterStr = [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturation}%)`,
      filters[selectedFilter],
    ]
      .filter((f) => f)
      .join(" ");

    if (filterStr.trim()) {
      ctx.filter = filterStr;
    }

    // Save context and apply transformations
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);

    // Apply rotation
    if (rotation !== 0) {
      ctx.rotate((rotation * Math.PI) / 180);
    }

    // Apply flip and zoom
    const scaleXFactor = (flipHorizontal ? -1 : 1) * zoom;
    const scaleYFactor = (flipVertical ? -1 : 1) * zoom;
    ctx.scale(scaleXFactor, scaleYFactor);

    // Calculate source coordinates
    const sourceX = completedCrop.x * scaleX;
    const sourceY = completedCrop.y * scaleY;
    const sourceWidth = completedCrop.width * scaleX;
    const sourceHeight = completedCrop.height * scaleY;

    // Calculate draw dimensions
    const drawWidth = needsDimensionSwap ? canvasHeight : canvasWidth;
    const drawHeight = needsDimensionSwap ? canvasWidth : canvasHeight;

    // Draw the image
    ctx.drawImage(
      imgRef,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight,
    );

    ctx.restore();

    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        `image/${outputFormat}`,
        outputQuality,
      );
    });
  }, [
    imgRef,
    completedCrop,
    rotation,
    flipHorizontal,
    flipVertical,
    zoom,
    brightness,
    contrast,
    saturation,
    selectedFilter,
    maxOutputWidth,
    maxOutputHeight,
    outputFormat,
    outputQuality,
  ]);

  // Handle crop completion
  const onCropComplete = useCallback((crop) => {
    setCompletedCrop(crop);
    // Clear cached result when crop changes
    setFinalBlob(null);
    setPreviewImageUrl(null);
  }, []);

  // Handle image load
  const onImageLoad = useCallback(
    (e) => {
      const img = e.currentTarget;
      setImgRef(img);

      const { width, height } = img;
      const cropSize = Math.min(width, height) * 0.8;

      const initialCrop = {
        unit: "px",
        width: cropSize,
        height: currentAspectRatio ? cropSize / currentAspectRatio : cropSize,
        x: (width - cropSize) / 2,
        y:
          (height -
            (currentAspectRatio ? cropSize / currentAspectRatio : cropSize)) /
          2,
      };

      setCrop(initialCrop);
      setCompletedCrop(initialCrop);
    },
    [currentAspectRatio],
  );

  // Handle aspect ratio change
  const handleAspectRatioChange = (newRatio) => {
    setCurrentAspectRatio(newRatio);
    setFinalBlob(null);
    setPreviewImageUrl(null);

    if (imgRef && crop) {
      const { width, height } = imgRef;
      const cropSize = Math.min(width, height) * 0.8;

      const newCrop = {
        unit: "px",
        width: cropSize,
        height: newRatio ? cropSize / newRatio : cropSize,
        x: (width - cropSize) / 2,
        y: (height - (newRatio ? cropSize / newRatio : cropSize)) / 2,
      };

      setCrop(newCrop);
      setCompletedCrop(newCrop);
    }
  };

  // Clear cache when transformations change
  const clearCache = useCallback(() => {
    setFinalBlob(null);
    setPreviewImageUrl(null);
  }, []);

  // Effect to clear cache when any transformation changes
  useEffect(() => {
    clearCache();
  }, [
    rotation,
    flipHorizontal,
    flipVertical,
    zoom,
    brightness,
    contrast,
    saturation,
    selectedFilter,
    clearCache,
  ]);

  // Handle preview generation
  const handlePreview = async () => {
    try {
      const blob = await generateFinalImage();
      if (blob) {
        setFinalBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewImageUrl(url);
        setStep("preview");
      } else {
        alert("Failed to generate preview. Please try again.");
      }
    } catch (error) {
      console.error("Preview generation error:", error);
      alert("Failed to generate preview. Please try again.");
    }
  };

  // Handle final upload
  const handleFinalUpload = async () => {
    try {
      let blob = finalBlob;

      // Generate if not cached
      if (!blob) {
        blob = await generateFinalImage();
      }

      if (blob && onUpload) {
        const fileName = selectedFile.name.replace(
          /\.[^/.]+$/,
          `.${outputFormat}`,
        );
        const file = new File([blob], fileName, {
          type: `image/${outputFormat}`,
        });
        onUpload(file);
      } else {
        alert("Failed to process image. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to process image. Please try again.");
    }
  };

  // Generate image style for preview
  const getImageStyle = () => {
    const filterStr = [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturation}%)`,
      filters[selectedFilter],
    ]
      .filter((f) => f)
      .join(" ");

    return {
      transform: `rotate(${rotation}deg) scale(${zoom}) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`,
      transformOrigin: "center",
      filter: filterStr.trim() || "none",
    };
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed z-[9999] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-lg shadow-2xl transition-all duration-200 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <div className="flex items-center gap-2">
            {step === "crop" && (
              <button
                type="button"
                onClick={resetEnhancements}
                className="flex items-center gap-1 px-3 py-1 text-sm text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
                title="Reset all enhancements"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="p-1 hover:bg-accent rounded-md transition-colors disabled:cursor-not-allowed"
              title="Close"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {step === "upload" && (
            <div className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 text-center transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Drop your image here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports:{" "}
                  {allowedTypes
                    .map((type) => type.split("/")[1].toUpperCase())
                    .join(", ")}{" "}
                  • Max {Math.round(maxFileSize / (1024 * 1024))}MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={allowedTypes.join(",")}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>
          )}

          {step === "crop" && imageUrl && (
            <div className="space-y-4">
              {/* Action Bar */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Drag to move, resize corners to crop
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep("upload")}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePreview}
                    disabled={!completedCrop || completedCrop.width <= 0}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Crop className="w-4 h-4" />
                    Preview Crop
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Controls Panel */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Aspect Ratio Presets */}
                  {(enableFreeformCrop || cropPresets.length > 0) && (
                    <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Grid className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          Aspect Ratio
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {enableFreeformCrop && (
                          <button
                            type="button"
                            onClick={() => handleAspectRatioChange(undefined)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              currentAspectRatio === undefined
                                ? "bg-primary text-primary-foreground"
                                : "bg-background hover:bg-accent"
                            }`}
                          >
                            Free
                          </button>
                        )}
                        {cropPresets.map((preset) => (
                          <button
                            type="button"
                            key={preset.name}
                            onClick={() =>
                              handleAspectRatioChange(preset.ratio)
                            }
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              currentAspectRatio === preset.ratio
                                ? "bg-primary text-primary-foreground"
                                : "bg-background hover:bg-accent"
                            }`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transform Controls */}
                  {(showRotation || showFlip) && (
                    <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <RotateCw className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          Transform
                        </span>
                      </div>
                      <div className="space-y-2">
                        {showRotation && (
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setRotation((prev) => (prev - 90) % 360)
                              }
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-background hover:bg-accent rounded transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                              -90°
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setRotation((prev) => (prev + 90) % 360)
                              }
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-background hover:bg-accent rounded transition-colors"
                            >
                              <RotateCw className="w-3 h-3" />
                              +90°
                            </button>
                            <span className="px-2 py-1 text-xs text-muted-foreground">
                              {rotation}°
                            </span>
                          </div>
                        )}
                        {showFlip && (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setFlipHorizontal((prev) => !prev)}
                              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                                flipHorizontal
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-background hover:bg-accent"
                              }`}
                            >
                              <FlipHorizontal className="w-3 h-3" />
                              Flip H
                            </button>
                            <button
                              type="button"
                              onClick={() => setFlipVertical((prev) => !prev)}
                              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                                flipVertical
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-background hover:bg-accent"
                              }`}
                            >
                              <FlipVertical className="w-3 h-3" />
                              Flip V
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Zoom Control */}
                  {showZoom && (
                    <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ZoomIn className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          Zoom
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(zoom * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setZoom((prev) => Math.max(0.1, prev - 0.1))
                          }
                          className="p-1 hover:bg-accent rounded transition-colors"
                        >
                          <ZoomOut className="w-3 h-3" />
                        </button>
                        <input
                          type="range"
                          min="0.1"
                          max="3"
                          step="0.1"
                          value={zoom}
                          onChange={(e) => setZoom(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-background rounded-lg appearance-none cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setZoom((prev) => Math.min(3, prev + 0.1))
                          }
                          className="p-1 hover:bg-accent rounded transition-colors"
                        >
                          <ZoomIn className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Adjustment Controls */}
                  {(showBrightness || showContrast || showSaturation) && (
                    <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          Adjustments
                        </span>
                      </div>
                      <div className="space-y-3">
                        {showBrightness && (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">
                                Brightness
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {brightness}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="150"
                              value={brightness}
                              onChange={(e) =>
                                setBrightness(parseInt(e.target.value))
                              }
                              className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        )}
                        {showContrast && (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">
                                Contrast
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {contrast}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="150"
                              value={contrast}
                              onChange={(e) =>
                                setContrast(parseInt(e.target.value))
                              }
                              className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        )}
                        {showSaturation && (
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">
                                Saturation
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {saturation}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="200"
                              value={saturation}
                              onChange={(e) =>
                                setSaturation(parseInt(e.target.value))
                              }
                              className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Filters */}
                  {showFilters && (
                    <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          Filters
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {Object.keys(filters).map((filterKey) => (
                          <button
                            type="button"
                            key={filterKey}
                            onClick={() => setSelectedFilter(filterKey)}
                            className={`px-2 py-1 text-xs rounded transition-colors capitalize ${
                              selectedFilter === filterKey
                                ? "bg-primary text-primary-foreground"
                                : "bg-background hover:bg-accent"
                            }`}
                          >
                            {filterKey === "none" ? "Original" : filterKey}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Crop Area */}
                <div className="lg:col-span-3">
                  <div className="border border-border rounded-lg overflow-hidden">
                    <ReactCrop
                      crop={crop}
                      onChange={setCrop}
                      onComplete={onCropComplete}
                      aspect={currentAspectRatio}
                      minWidth={minWidth}
                      minHeight={minHeight}
                      circularCrop={cropShape === "round"}
                      keepSelection
                    >
                      <img
                        src={imageUrl}
                        alt="Crop preview"
                        className="max-w-full max-h-[500px] object-contain"
                        style={getImageStyle()}
                        onLoad={onImageLoad}
                      />
                    </ReactCrop>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "preview" && previewImageUrl && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-lg font-medium text-foreground mb-4">
                  Preview
                </h4>
                <div className="inline-block border border-border rounded-lg overflow-hidden">
                  <img
                    src={previewImageUrl}
                    alt="Cropped preview"
                    className={`max-w-full max-h-[400px] ${cropShape === "round" ? "rounded-full" : ""}`}
                  />
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep("crop")}
                  disabled={isUploading}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:cursor-not-allowed"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  onClick={handleFinalUpload}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-medium bg-success text-success-foreground hover:bg-success/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Upload Image
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </>
  );
};

export default ImageUploadModal;
