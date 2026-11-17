import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import InputPage from "./pages/InputPage";
import ValidatePage from "./pages/ValidatePage";
import ResultsPage from "./pages/ResultsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/input" element={<InputPage />} />
      <Route path="/validate" element={<ValidatePage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
