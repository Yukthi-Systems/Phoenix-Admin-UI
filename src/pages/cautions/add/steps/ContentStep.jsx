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

import HTMLPreview from "@/components/common/HtmlPreview";
import AIHtmlGenerator from "@/components/common/AIHTMLGenerator";

const ContentStep = ({
  register,
  errors,
  htmlContent,
  textContent,
  handleTextContentChange,
  handleHtmlGenerated,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-foreground text-lg font-semibold">Content</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Create text and HTML content for your caution message
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <AIHtmlGenerator
            textContent={textContent || ""}
            htmlContent={htmlContent || ""}
            onTextContentChange={handleTextContentChange}
            onHtmlGenerated={handleHtmlGenerated}
            textLabel="Text Content"
            htmlLabel="HTML Content"
            textPlaceholder="Enter your caution message text content here..."
            htmlPlaceholder="<p>Generated HTML will appear here</p>"
            textRows={8}
            htmlRows={8}
            textRequired={true}
            htmlRequired={true}
            textErrors={errors}
            htmlErrors={errors}
            textRegister={register}
            htmlRegister={register}
            textName="text_content"
            htmlName="html_content"
            generatePrompt="Generate an HTML email caution banner fragment using only inline CSS styles. Do NOT include html, head, body, script, or style tags — output only the inner HTML content (tables, divs, paragraphs, etc.) that can be injected directly into an email body. Text: '{text}'"
            className=""
          />
        </div>

        <HTMLPreview
          showPreviewText={false}
          height="265px"
          htmlContent={htmlContent}
        />
      </div>
    </div>
  );
};

export default ContentStep;
