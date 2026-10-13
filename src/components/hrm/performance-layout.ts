import type { ReactNode } from "react";

export type PerformanceLayoutProps = {
  performanceControls?: ReactNode;
  performanceContent?: ReactNode;
  onDatesChange?: (dates: { start?: string; end?: string }) => void;
  onPerformanceRefresh?: () => void;
  departmentId?: string;
  employeeIds?: number[];
};
