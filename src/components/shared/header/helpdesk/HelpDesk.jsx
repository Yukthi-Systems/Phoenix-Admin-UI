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

import { useHelpDesk } from "@/hooks/useHelpDesk";
import {
  X,
  HelpCircle,
  ExternalLink,
  PlayCircle,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const VideoEmbed = ({ video }) => {
  if (video.type === "youtube") {
    return (
      <div className="aspect-video w-full rounded-md overflow-hidden border border-border">
        <iframe
          src={`https://www.youtube.com/embed/${video.embedId}`}
          title={video.title || "Video tutorial"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  // External video link
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
    >
      <PlayCircle className="w-4 h-4 flex-shrink-0" />
      <span>{video.title || "Watch Tutorial Video"}</span>
      <ExternalLink className="w-3 h-3 flex-shrink-0" />
    </a>
  );
};

const FieldHelp = ({ field }) => (
  <div className="space-y-3 text-left">
    <div>
      <h4 className="font-medium text-card-foreground flex items-center gap-2">
        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
        <span>{field.title}</span>
      </h4>
      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
        {field.description}
      </p>
    </div>

    {/* Tips */}
    {field.tips && field.tips.length > 0 && (
      <div className="ml-4">
        <ul className="space-y-1">
          {field.tips.map((tip, idx) => (
            <li
              key={idx}
              className="text-sm text-muted-foreground flex items-start gap-2"
            >
              <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    )}

    {/* Videos */}
    {field.videos && field.videos.length > 0 && (
      <div className="ml-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <PlayCircle className="w-3 h-3 inline mr-1" />
          Video Tutorials
        </p>
        <div className="space-y-3">
          {field.videos.map((video, idx) => (
            <div key={idx}>
              {video.title && video.type !== "youtube" && (
                <p className="text-xs text-muted-foreground mb-2">
                  {video.title}
                </p>
              )}
              <VideoEmbed video={video} />
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Images */}
    {field.images && field.images.length > 0 && (
      <div className="ml-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <ImageIcon className="w-3 h-3 inline mr-1" />
          Examples
        </p>
        <div className="space-y-3">
          {field.images.map((image, idx) => (
            <div key={idx}>
              {image.caption && (
                <p className="text-xs text-muted-foreground mb-2">
                  {image.caption}
                </p>
              )}
              <img
                src={image.url}
                alt={image.alt || `${field.title} example ${idx + 1}`}
                className="rounded-md border border-border max-w-full h-auto"
              />
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const HelpDesk = () => {
  const { isOpen, closeHelpDesk, getCurrentPageData, hasHelpForCurrentPage } =
    useHelpDesk();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchParams] = useSearchParams();

  // Get current step from URL query parameter
  const currentStep = useMemo(() => {
    const stepParam = searchParams.get('step');
    const step = stepParam ? parseInt(stepParam, 10) : null;
    return step;
  }, [searchParams]);

  if (!isOpen || !hasHelpForCurrentPage()) {
    return null;
  }

  const pageData = getCurrentPageData();
  const hasSteps = pageData?.steps && pageData.steps.length > 0;

  // Filter to show only current step if steps exist and currentStep is in URL
  let displayFields = [];
  let currentStepData = null;

  if (hasSteps && currentStep !== null && currentStep > 0) {
    currentStepData = pageData.steps.find(step => step.stepNumber === currentStep);
    displayFields = currentStepData?.fields || [];
  } else if (hasSteps) {
    // Show all steps if no currentStep in URL
    displayFields = pageData.steps.flatMap(step => step.fields);
  } else {
    displayFields = pageData?.fields || [];
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/20 backdrop-blur-sm"
        onClick={closeHelpDesk}
      />
      <div
        className={`bg-card text-left shadow-2xl border-l border-border h-full overflow-hidden flex flex-col transition-all duration-300 ease-in-out
          ${isExpanded ? "w-[60vw] max-w-4xl" : "w-96"}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-card-foreground">
                Help & Guide
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-md hover:bg-muted transition-colors"
                title={isExpanded ? "Minimize help" : "Expand help"}
              >
                {isExpanded ? (
                  <Minimize2 className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <button
                onClick={closeHelpDesk}
                className="p-1 rounded-md hover:bg-muted transition-colors"
                title="Close help"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
          {pageData && (
            <div className="mt-2">
              <h3 className="font-medium text-card-foreground">
                {pageData.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {pageData.description}
              </p>
              {/* Show current step info if applicable */}
              {currentStepData && (
                <div className="mt-3 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                      {currentStepData.stepNumber}
                    </span>
                    <span className="text-sm font-medium text-card-foreground">
                      {currentStepData.stepTitle}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {displayFields.length > 0 ? (
            <div className="p-4 space-y-6">
              {/* Always render just the displayFields (current step or all) */}
              {displayFields.map((field, idx) => (
                <div key={idx}>
                  <FieldHelp field={field} />
                  {idx < displayFields.length - 1 && (
                    <div className="my-4 border-b border-border/50"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No help content available for this {currentStep ? 'step' : 'page'} yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpDesk;