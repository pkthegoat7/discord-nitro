import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Callback from "./pages/Callback";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/nitro" element={<Landing />} />
      <Route path="/claim" element={<Landing />} />
      <Route path="/callback" element={<Callback />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
