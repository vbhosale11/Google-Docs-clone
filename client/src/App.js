import TextEditor from "./TextEditor";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { v4 as uuidV4 } from "uuid"; //generate a random id

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RedirectToNewDocument />} />
        <Route path="/documents/:id" element={<TextEditor />} />
      </Routes>
    </Router>
  );
}

function RedirectToNewDocument() {
  return <Navigate to={`/documents/${uuidV4()}`} replace />;
}
export default App;
