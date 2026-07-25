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

import { useToastify } from "@/hooks/useToastify";
import { countryOptions } from "@/utils/constants";
import { getReactSelectStyles } from "@/utils/selectTheme";
import { useState } from "react";
import { Edit2, Plus, Save, X } from "lucide-react";
import Select from "react-select";
import { MailboxInfiniteSelect } from "@/components/common/MailboxSelect";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ipv4Regex =
  /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

export const ListEditor = ({
  label,
  list,
  setList,
  placeholder = "",
  type = "text",
}) => {
  const toast = useToastify();
  const [newItem, setNewItem] = useState("");
  const [subnet, setSubnet] = useState("24"); // Default subnet
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editSubnet, setEditSubnet] = useState("24");

  // Generate subnet options from 0 to 32
  const subnetOptions = Array.from({ length: 33 }, (_, i) => i.toString());

  const validateSubnet = (ip, subnetValue) => {
    // If subnet is 0, allow any IP (no restrictions)
    if (parseInt(subnetValue) === 0) return true;

    const ipParts = ip.split(".").map((part) => parseInt(part));
    const subnetNum = parseInt(subnetValue);

    // Calculate the network address for the given subnet
    const mask = subnetNum > 0 ? (0xffffffff << (32 - subnetNum)) >>> 0 : 0;
    const maskParts = [
      (mask >>> 24) & 0xff,
      (mask >>> 16) & 0xff,
      (mask >>> 8) & 0xff,
      mask & 0xff,
    ];

    // Apply mask to IP to get network address
    const networkParts = ipParts.map((part, i) => part & maskParts[i]);

    // Check if any octet has values in the "host" part that would make it invalid
    // For the given subnet, the IP should be the network address (all host bits 0)
    for (let i = 0; i < 4; i++) {
      const hostBits = 8 - Math.max(0, Math.min(8, subnetNum - i * 8));
      if (hostBits > 0 && hostBits < 8) {
        const hostMask = (1 << hostBits) - 1;
        if ((ipParts[i] & hostMask) !== 0) {
          return false;
        }
      }
    }

    return true;
  };

  const addItem = () => {
    const trimmed = newItem.trim();

    if (type === "ip" && !ipv4Regex.test(trimmed)) {
      toast("error", "Enter valid IP address");
      return;
    }

    if (trimmed) {
      // For IP type, validate subnet constraints
      if (type === "ip") {
        if (!validateSubnet(trimmed, subnet)) {
          toast(
            "error",
            `IP address must be a network address for /${subnet} subnet (host bits must be 0)`,
          );
          return;
        }
      }

      // For IP type, combine IP and subnet
      const finalItem = type === "ip" ? `${trimmed}/${subnet}` : trimmed;

      if (!list.includes(finalItem)) {
        setList([...list, finalItem]);
        setNewItem("");
        setSubnet("24"); // Reset to default after adding
      }
    }
  };

  const deleteItem = (index) => {
    setList(list.filter((_, i) => i !== index));
    if (editIndex === index) {
      setEditIndex(null);
      setEditValue("");
      setEditSubnet("24");
    }
  };

  const startEdit = (index, item) => {
    if (type === "ip") {
      // Split IP and subnet for editing
      const [ip, subnetValue] = item.split("/");
      setEditValue(ip);
      setEditSubnet(subnetValue || "24");
    } else {
      setEditValue(item);
    }
    setEditIndex(index);
  };

  const saveEdit = (index) => {
    const trimmed = editValue.trim();

    if (type === "ip" && !ipv4Regex.test(trimmed)) {
      toast("error", "Enter valid IP address");
      return;
    }

    if (trimmed) {
      // For IP type, validate subnet constraints
      if (type === "ip") {
        if (!validateSubnet(trimmed, editSubnet)) {
          toast(
            "error",
            `IP address must be a network address for /${editSubnet} subnet (host bits must be 0)`,
          );
          return;
        }
      }

      // For IP type, combine IP and subnet
      const finalItem = type === "ip" ? `${trimmed}/${editSubnet}` : trimmed;

      const updated = [...list];
      updated[index] = finalItem;
      setList(updated);
      setEditIndex(null);
      setEditValue("");
      setEditSubnet("24");
    }
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditValue("");
    setEditSubnet("24");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  // Helper function to show valid examples based on selected subnet
  const getSubnetExample = (subnetValue) => {
    const subnetNum = parseInt(subnetValue);
    if (subnetNum >= 24) return "e.g., 192.168.1.0";
    if (subnetNum >= 16) return "e.g., 192.168.0.0";
    if (subnetNum >= 8) return "e.g., 192.0.0.0";
    return "e.g., 0.0.0.0";
  };

  return (
    <div>
      <div className=" w-full flex items-center gap-x-2">
        <label className="block text-left text-sm font-medium text-card-foreground">
          {label}
        </label>
        {type === "ip" && newItem && (
          <p className="text-xs text-muted-foreground mt-1">
            {validateSubnet(newItem, subnet)
              ? "✓ Valid network address for selected subnet"
              : "✗ Must be a network address (host bits should be 0)"}
          </p>
        )}
      </div>
      <div className="flex gap-3 mb-4">
        <div className="flex-1 flex gap-2">
          <div className="flex-1">
            <input
              type={type}
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                type === "ip" ? getSubnetExample(subnet) : placeholder
              }
              className="w-full rounded-md border border-border bg-card text-card-foreground p-2 
                       focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none
                       placeholder:text-muted-foreground transition-colors duration-200"
            />
          </div>
          {type === "ip" && (
            <select
              value={subnet}
              onChange={(e) => setSubnet(e.target.value)}
              className="w-20 rounded-md border border-border bg-card text-card-foreground p-2 
                       focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none
                       transition-colors duration-200"
            >
              {subnetOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          type="button"
          onClick={addItem}
          disabled={
            !newItem.trim() ||
            (type === "ip" && !validateSubnet(newItem, subnet))
          }
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                   flex items-center gap-2 font-medium"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div className="space-y-3 border rounded p-2">
        {list.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No entries added yet</p>
            <p className="text-xs mt-1">
              {type === "ip"
                ? "Add IP addresses with subnets using the input above"
                : "Add entries using the input above"}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-card-foreground">
                {list.length} {list.length === 1 ? "entry" : "entries"} added
              </span>
              <button
                type="button"
                onClick={() => setList([])}
                className="text-xs text-destructive hover:text-destructive/80 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-muted/30">
              <div className="flex flex-wrap gap-2">
                {list.map((item, idx) => (
                  <div key={idx} className="group relative">
                    {editIndex === idx ? (
                      <div className="flex items-center gap-2 bg-card border border-primary rounded-full px-3 py-1.5 shadow-sm">
                        <div className="flex gap-2 items-center">
                          <input
                            type={type}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="text-sm bg-transparent border-none outline-none focus:ring-0 min-w-0"
                            style={{
                              width: `${Math.max(editValue.length * 8 + 20, 120)}px`,
                            }}
                            autoFocus
                            onKeyPress={(e) => {
                              if (e.key === "Enter") saveEdit(idx);
                              if (e.key === "Escape") cancelEdit();
                            }}
                          />
                          {type === "ip" && (
                            <select
                              value={editSubnet}
                              onChange={(e) => setEditSubnet(e.target.value)}
                              className="text-sm bg-transparent border-none outline-none focus:ring-0"
                            >
                              {subnetOptions.map((option) => (
                                <option key={option} value={option}>
                                  /{option}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div className="flex gap-0.5 ml-1">
                          <button
                            type="button"
                            onClick={() => saveEdit(idx)}
                            disabled={
                              type === "ip" &&
                              !validateSubnet(editValue, editSubnet)
                            }
                            className="p-0.5 text-success hover:bg-success/20 rounded-full transition-colors duration-200 disabled:opacity-50"
                            title="Save"
                          >
                            <Save size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="p-0.5 text-muted-foreground hover:bg-muted rounded-full transition-colors duration-200"
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-1 bg-card border border-border/50 rounded-full px-3 py-1.5 
                                    hover:border-border hover:shadow-sm transition-all duration-200"
                      >
                        <span className="text-sm font-medium text-card-foreground whitespace-nowrap">
                          {item}
                        </span>

                        <div className="flex gap-0.5 ml-1 transition-opacity duration-200">
                          <button
                            type="button"
                            onClick={() => startEdit(idx, item)}
                            className="p-0.5 text-primary hover:bg-primary/20 rounded-full transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteItem(idx)}
                            className="p-0.5 text-destructive hover:bg-destructive/20 rounded-full transition-colors duration-200"
                            title="Delete"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const ListEditorEmail = ({
  label,
  list,
  setList,
  placeholder = "",
  type = "text",
  hasDropdown = false,
  domainName = "",
}) => {
  const toast = useToastify();
  const [newItem, setNewItem] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  const addItem = () => {
    const trimmed = newItem.trim();
    if (type == "email" && !emailRegex.test(trimmed)) {
      toast("error", "Enter valid email id");
      return;
    }
    if (type == "ip" && !ipv4Regex.test(trimmed)) {
      toast("error", "Enter valid ip address");
      return;
    }
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setNewItem("");
    }
  };

  const deleteItem = (index) => {
    setList(list.filter((_, i) => i !== index));
    if (editIndex === index) {
      setEditIndex(null);
      setEditValue("");
    }
  };

  const saveEdit = (index) => {
    const trimmed = editValue.trim();
    if (type == "email" && !emailRegex.test(trimmed)) {
      toast("error", "Enter valid email id");
      return;
    }
    if (type == "ip" && !ipv4Regex.test(trimmed)) {
      toast("error", "Enter valid ip address");
      return;
    }

    if (trimmed) {
      const updated = [...list];
      updated[index] = trimmed;
      setList(updated);
      setEditIndex(null);
      setEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditValue("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-card-foreground text-left">
        {label}
      </label>
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          {
            hasDropdown ? (
              <>
                <MailboxInfiniteSelect
                  name="department_id"
                  label="Mailbox"
                  url={`/mailbox/search/${domainName}`}
                  placeholder="Select mailbox..."
                  value={newItem}
                  onChange={(val) => setNewItem(val)}
                />
              </>
            ) :
              <>
                <input
                  type={type}
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  className="w-full rounded-md border border-border bg-card text-card-foreground p-2 
                     focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none
                     placeholder:text-muted-foreground transition-colors duration-200"
                />
              </>
          }
        </div>
        <button
          type="button"
          onClick={addItem}
          disabled={!newItem.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                   flex items-center gap-2 font-medium"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No entries added yet</p>
            <p className="text-xs mt-1">
              Add emails or domains using the input above
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-card-foreground">
                {list.length} {list.length === 1 ? "entry" : "entries"} added
              </span>
              <button
                type="button"
                onClick={() => setList([])}
                className="text-xs text-destructive hover:text-destructive/80 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-muted/30">
              <div className="flex flex-wrap gap-2">
                {list.map((item, idx) => (
                  <div key={idx} className="group relative">
                    {editIndex === idx ? (
                      <div className="flex items-center gap-1 bg-card border border-primary rounded-full px-3 py-1.5 shadow-sm">
                        <input
                          type={type}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="text-sm bg-transparent border-none outline-none focus:ring-0 min-w-0"
                          style={{
                            width: `${Math.max(editValue.length * 8 + 20, 120)}px`,
                          }}
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === "Enter") saveEdit(idx);
                            if (e.key === "Escape") cancelEdit();
                          }}
                        />
                        <div className="flex gap-0.5 ml-1">
                          <button
                            type="button"
                            onClick={() => saveEdit(idx)}
                            className="p-0.5 text-success hover:bg-success/20 rounded-full transition-colors duration-200"
                            title="Save"
                          >
                            <Save size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="p-0.5 text-muted-foreground hover:bg-muted rounded-full transition-colors duration-200"
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-1 bg-card border border-border/50 rounded-full px-3 py-1.5 
                                    hover:border-border hover:shadow-sm transition-all duration-200"
                      >
                        <span className="text-sm font-medium text-card-foreground whitespace-nowrap">
                          {item}
                        </span>

                        <div className="flex gap-0.5 ml-1  transition-opacity duration-200">
                          {
                            !hasDropdown && <button
                              type="button"
                              onClick={() => {
                                setEditIndex(idx);
                                setEditValue(item);
                              }}
                              className="p-0.5 text-primary hover:bg-primary/20 rounded-full transition-colors duration-200"
                              title="Edit"
                            >
                              <Edit2 size={12} />
                            </button>
                          }
                          <button
                            type="button"
                            onClick={() => deleteItem(idx)}
                            className="p-0.5 text-destructive hover:bg-destructive/20 rounded-full transition-colors duration-200"
                            title="Delete"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const ListSelect = ({
  label,
  list,
  setList,
  placeholder = "Select an option...",
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const addItem = () => {
    if (!selectedOption) return;
    const value = selectedOption.value.trim();

    if (!list.includes(value)) {
      setList([...list, value]);
      setSelectedOption(null);
    }
  };

  const deleteItem = (index) => {
    setList(list.filter((_, i) => i !== index));
    if (editIndex === index) {
      setEditIndex(null);
    }
  };

  return (
    <div>
      <label className="block text-left text-sm font-medium text-card-foreground">
        {label}
      </label>
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <Select
            options={countryOptions.filter((opt) => !list.includes(opt.value))}
            value={selectedOption || null}
            onChange={(opt) => setSelectedOption(opt)}
            placeholder={placeholder}
            className="w-full rounded-md"
            isClearable
            isSearchable
            menuPlacement="auto"
            styles={getReactSelectStyles()}
          />
        </div>
        <button
          type="button"
          onClick={addItem}
          disabled={!selectedOption}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                   flex items-center gap-2 font-medium"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div className="space-y-3 border rounded p-2">
        {list.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No entries added yet</p>
            <p className="text-xs mt-1">
              Select items using the dropdown above
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-card-foreground">
                {list.length} {list.length === 1 ? "entry" : "entries"} added
              </span>
              <button
                type="button"
                onClick={() => setList([])}
                className="text-xs text-destructive hover:text-destructive/80 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-3 bg-muted/30">
              <div className="flex flex-wrap gap-2">
                {list.map((item, idx) => (
                  <div key={idx} className="group relative">
                    <div
                      className="flex items-center gap-1 bg-card border border-border/50 rounded-full px-3 py-1.5 
                                    hover:border-border hover:shadow-sm transition-all duration-200"
                    >
                      <span className="text-sm font-medium text-card-foreground whitespace-nowrap">
                        {countryOptions.find((opt) => opt.value === item)
                          ?.label || item}{" "}
                        : {item}
                      </span>
                      <div className="flex gap-0.5 ml-1 transition-opacity duration-200">
                        <button
                          type="button"
                          onClick={() => deleteItem(idx)}
                          className="p-0.5 text-destructive hover:bg-destructive/20 rounded-full transition-colors duration-200"
                          title="Delete"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
