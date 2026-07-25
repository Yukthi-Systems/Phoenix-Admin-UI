import React, { useState, useEffect } from "react";
import { Copy, CircleX } from "lucide-react";
import { TableCancelButton, TableMoveButton } from "./Buttons";
import { DomainInfiniteSelect } from "./DomainSelect";
import { useToastify } from "@/hooks/useToastify";

const CopyItem = ({
  isOpen = false,
  onClose = () => {},
  item = null,
  onNext = (targetDomain) => {},
  title = "Copy Item",
  description = "Are you sure you want to copy this item?",
  organization_id = "",
  currentDomain = "",
  itemLabel = "Item",
  itemIcon = <Copy size={20} />,
  domainSelectLabel = "Target Domain",
  domainSelectUrl = "/domain/list/",
}) => {
  const [targetDomain, setTargetDomain] = useState({
    id: null,
    name: "None",
  });

  const toast = useToastify();
  const itemName = item?.label || item?.name || item?.title || "Item";

  useEffect(() => {
    if (isOpen) {
      setTargetDomain({
        id: null,
        name: "None",
      });
    }
  }, [isOpen]);

  const handleNextClick = () => {
    if (!targetDomain.id) {
      toast("error", "Please select a target domain");
      return;
    }

    // Logic to allow same domain is now implicit (check removed)

    if (!item?.id) {
      toast("error", "No item selected");
      return;
    }

    onNext(targetDomain.name);
  };

  const handleClose = () => {
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleTargetDomainSelect = (domainValue) => {
    setTargetDomain({
      id: domainValue,
      name: domainValue,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card text-left rounded-xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl border border-border/50">
        <div className="flex justify-between items-center p-6 border-b border-border/50 bg-gradient-to-r from-muted/20 to-muted/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Copy className="text-blue-500" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">
                {title}
              </h2>
              <p className="text-sm text-left text-muted-foreground">
                Copy {itemLabel.toLowerCase()} to target domain
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            type="button"
          >
            <CircleX size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <Copy className="text-blue-500" size={28} />
              </div>
              <p className="text-lg text-card-foreground mb-2">
                Copy <strong className="text-blue-500">{itemName}</strong>?
              </p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            <div className="bg-muted/30 rounded-lg border border-border/50 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                  {itemIcon}
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    {itemName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {itemLabel} to copy
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg border border-border/50 p-4">
              <label className="text-card-foreground mb-3 block text-left text-sm font-medium">
                {domainSelectLabel}
                <span className="text-red-500"> *</span>
              </label>
              <DomainInfiniteSelect
                value={targetDomain.name}
                onChange={handleTargetDomainSelect}
                label=""
                placeholder={`Select ${domainSelectLabel.toLowerCase()}`}
                url={`${domainSelectUrl}${organization_id}`}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Select the domain where you want to copy the{" "}
                {itemLabel.toLowerCase()}
              </p>
            </div>

            {currentDomain && targetDomain.name === currentDomain && (
              <div className="bg-blue-500/10 rounded-lg border border-blue-500/20 p-3">
                <p className="text-xs text-blue-600 text-center">
                  <span className="font-medium">Note:</span> You are creating a
                  duplicate in the same domain.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-border/50 bg-muted/10">
          <TableCancelButton handleClick={handleClose} label="Cancel" />
          <TableMoveButton
            handleClick={handleNextClick}
            label="Next"
            disabled={!targetDomain.id}
          />
        </div>
      </div>
    </div>
  );
};

export default CopyItem;
