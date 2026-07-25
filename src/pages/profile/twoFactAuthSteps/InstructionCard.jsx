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

const InstructionCard = ({
  icon: Icon,
  title,
  message,
  variant = "info",
  className = "",
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "bg-success/5 border-success/20 border-l-success text-success";
      case "warning":
        return "bg-warning/5 border-warning/20 border-l-warning text-warning";
      case "error":
        return "bg-destructive/5 border-destructive/20 border-l-destructive text-destructive";
      case "info":
      default:
        return "bg-primary/5 border-primary/20 border-l-primary text-primary";
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div
      className={`p-3 rounded-lg border border-l-4 ${variantStyles} ${className}`}
    >
      <div className="flex gap-2">
        <div
          className={`p-1 bg-current/10 h-fit rounded flex-shrink-0`}
          style={{ color: "inherit" }}
        >
          <Icon className="w-3 h-3" />
        </div>
        <div className="space-y-0.5">
          <h4 className="font-medium text-card-foreground text-left text-sm">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground text-left leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstructionCard;
