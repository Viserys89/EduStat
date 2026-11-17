import { createContext, useContext } from "react";

export const DatasetContext = createContext(null);

export function useDataset() {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error("useDataset harus dipakai di dalam DatasetProvider");
  return ctx;
}