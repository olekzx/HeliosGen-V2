"use client";

import React, { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import type { CatalogModel, CatalogParameter } from "@/lib/models/types";

export interface DynamicParameterInspectorProps {
  model?: CatalogModel;
  params?: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onReset?: () => void;
  excludeKeys?: string[];
  disabled?: boolean;
  className?: string;
}

/**
 * Dynamic Parameter Inspector:
 * The collapsible node studio panel that dynamically renders form controls
 * for all scalar parameters declared in a model's OpenAPI schema.
 */
export default function DynamicParameterInspector({
  model,
  params = {},
  onChange,
  onReset,
  excludeKeys = ["prompt"],
  disabled = false,
  className = "",
}: DynamicParameterInspectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!model || !model.parameters || model.parameters.length === 0) {
    return null;
  }

  // Filter out excluded keys (such as prompt which is edited in the main textarea)
  const displayParams = model.parameters.filter(
    (p) => !excludeKeys.includes(p.key)
  );

  if (displayParams.length === 0) return null;

  const activeOverridesCount = displayParams.filter((p) => {
    const val = params[p.key];
    return val !== undefined && val !== null && val !== p.default;
  }).length;

  return (
    <div
      className={`border border-[#1E2840] bg-[#0c1220]/80 rounded-lg overflow-hidden transition-all text-xs ${className}`}
    >
      {/* Header bar */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-2 bg-[#121929]/90 hover:bg-[#182238] transition-colors text-left select-none group"
      >
        <div className="flex items-center gap-2 text-gray-300 font-medium">
          <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400 group-hover:rotate-45 transition-transform duration-200" />
          <span className="text-[11px] uppercase tracking-wider text-gray-300 font-semibold">
            Parameters
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1e293b] text-gray-400 font-mono">
            {displayParams.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeOverridesCount > 0 && (
            <span className="text-[10px] text-teal-400 bg-teal-950/60 border border-teal-800/40 px-1.5 py-0.2 rounded">
              {activeOverridesCount} modified
            </span>
          )}
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Controls Panel */}
      {isOpen && (
        <div className="p-3 space-y-3 bg-[#0d1424] border-t border-[#1E2840]/60 max-h-80 overflow-y-auto">
          {onReset && activeOverridesCount > 0 && (
            <div className="flex justify-end pb-1 border-b border-[#1E2840]/40">
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-teal-400 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset defaults
              </button>
            </div>
          )}

          {displayParams.map((param) => {
            const val = params[param.key] !== undefined ? params[param.key] : param.default;
            return (
              <div key={param.key} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <label
                    htmlFor={`param-${param.key}`}
                    className="font-medium text-gray-300 flex items-center gap-1"
                    title={param.description}
                  >
                    {param.title}
                    {param.required && <span className="text-amber-400">*</span>}
                  </label>
                  {param.control === "slider" && (
                    <span className="text-[10px] font-mono text-teal-400 bg-[#162032] px-1.5 py-0.5 rounded border border-[#23314d]">
                      {String(val ?? param.default ?? 0)}
                    </span>
                  )}
                </div>

                {renderParameterControl(param, val, (next) => onChange(param.key, next), disabled)}

                {param.description && (
                  <p className="text-[10px] text-gray-500 leading-tight">
                    {param.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function renderParameterControl(
  param: CatalogParameter,
  value: unknown,
  onChange: (val: unknown) => void,
  disabled: boolean
) {
  switch (param.control) {
    case "dropdown": {
      const options = param.enum ?? [];
      const currentVal = value !== undefined ? String(value) : String(param.default ?? "");

      return (
        <select
          id={`param-${param.key}`}
          disabled={disabled}
          value={currentVal}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#121927] border border-[#22304d] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-teal-500/80 transition-colors cursor-pointer"
        >
          {options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    case "toggle": {
      const isChecked = Boolean(value ?? param.default ?? false);

      return (
        <button
          type="button"
          role="switch"
          aria-checked={isChecked}
          disabled={disabled}
          onClick={() => onChange(!isChecked)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isChecked ? "bg-teal-500" : "bg-[#1f293d]"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              isChecked ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      );
    }

    case "slider": {
      const min = param.min ?? 0;
      const max = param.max ?? 100;
      const step = param.step ?? (param.type === "integer" ? 1 : 0.1);
      const numVal = typeof value === "number" ? value : Number(value) || (param.default as number) || min;

      return (
        <div className="flex items-center gap-2">
          <input
            type="range"
            id={`param-${param.key}`}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            value={numVal}
            onChange={(e) => {
              const parsed = param.type === "integer" ? parseInt(e.target.value, 10) : parseFloat(e.target.value);
              onChange(parsed);
            }}
            className="w-full h-1.5 bg-[#1e2a42] rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>
      );
    }

    case "number": {
      const numVal = value !== undefined ? String(value) : "";

      return (
        <input
          type="number"
          id={`param-${param.key}`}
          disabled={disabled}
          min={param.min}
          max={param.max}
          step={param.step ?? (param.type === "integer" ? 1 : 0.1)}
          value={numVal}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              onChange(undefined);
            } else {
              const parsed = param.type === "integer" ? parseInt(raw, 10) : parseFloat(raw);
              onChange(parsed);
            }
          }}
          className="w-full bg-[#121927] border border-[#22304d] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-teal-500/80 transition-colors"
        />
      );
    }

    case "textarea": {
      const strVal = typeof value === "string" ? value : String(value ?? "");

      return (
        <textarea
          id={`param-${param.key}`}
          disabled={disabled}
          rows={2}
          maxLength={param.maxLength}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#121927] border border-[#22304d] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-teal-500/80 transition-colors resize-y"
        />
      );
    }

    case "text":
    default: {
      const strVal = typeof value === "string" ? value : String(value ?? "");

      return (
        <input
          type="text"
          id={`param-${param.key}`}
          disabled={disabled}
          maxLength={param.maxLength}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#121927] border border-[#22304d] rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-teal-500/80 transition-colors"
        />
      );
    }
  }
}
