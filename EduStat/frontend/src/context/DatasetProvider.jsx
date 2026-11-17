import { useCallback, useMemo, useState } from "react";
import { DatasetContext } from "./dataset-context";
import { createRow } from "../utils/dataset";

const initialRows = () => Array.from({ length: 3 }, () => createRow());

export default function DatasetProvider({ children }) {
  const [file, setFile] = useState(null);
  const [manualRows, setManualRows] = useState(initialRows);
  const [validation, setValidationState] = useState(null); // respons validasi backend
  const [analysis, setAnalysis] = useState(null);          // respons analisis backend

  // Dataset baru -> hasil analisis lama tidak berlaku lagi
  const setValidation = useCallback((value) => {
    setValidationState(value);
    setAnalysis(null);
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setManualRows(initialRows());
    setValidationState(null);
    setAnalysis(null);
  }, []);

  const value = useMemo(
    () => ({
      file, setFile, manualRows, setManualRows,
      validation, setValidation, analysis, setAnalysis, reset,
    }),
    [file, manualRows, validation, setValidation, analysis, reset]
  );

  return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>;
}
