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
        <Route path="/" element={<RedirectToNewDocument />} />  {/*this is the route to the new document*/}
        <Route path="/documents/:id" element={<TextEditor />} /> {/*this is the route to the text editor component*/}
      </Routes>
    </Router>
  );
}

function RedirectToNewDocument() {  //this function redirects to a new document
  return <Navigate to={`/documents/${uuidV4()}`} replace />; //replace the current url with the new url
}
export default App;
