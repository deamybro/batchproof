import React from "react";
import { BatchStatus } from "../lib/types";
import { CheckCircleIcon, AlertTriangleIcon, AlertOctagonIcon } from "./Icons";

interface StatusBadgeProps {
  status: BatchStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs font-semibold rounded-full gap-1.5",
    md: "px-3.5 py-1 text-sm font-bold rounded-full gap-2",
    lg: "px-5 py-2 text-base font-extrabold rounded-xl gap-2.5 tracking-wide",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (status === "VALID") {
    return (
      <span
        className={`inline-flex items-center badge-valid ${sizeClasses[size]} shadow-sm`}
        role="status"
        aria-label="Batch Status: Valid"
      >
        {showIcon && <CheckCircleIcon className={`${iconSizes[size]} text-emerald-400`} />}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>VALID</span>
      </span>
    );
  }

  if (status === "EXPIRED") {
    return (
      <span
        className={`inline-flex items-center badge-expired ${sizeClasses[size]} shadow-sm`}
        role="status"
        aria-label="Batch Status: Expired"
      >
        {showIcon && <AlertTriangleIcon className={`${iconSizes[size]} text-amber-400`} />}
        <span className="inline-block h-2 w-2 rounded-full bg-amber-400"></span>
        <span>EXPIRED</span>
      </span>
    );
  }

  // RECALLED
  return (
    <span
      className={`inline-flex items-center badge-recalled ${sizeClasses[size]} shadow-sm`}
      role="status"
      aria-label="Batch Status: Recalled"
    >
      {showIcon && <AlertOctagonIcon className={`${iconSizes[size]} text-rose-400`} />}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
      </span>
      <span>RECALLED</span>
    </span>
  );
};
