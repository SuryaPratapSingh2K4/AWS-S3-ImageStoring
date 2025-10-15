import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Homepage from "./pages/Homepage"
import NewPost from "./pages/NewPost"
import PostCollection from "./pages/PostCollection"

function App() {

  return (
    <div data-theme="forest">
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/newpost" element={<NewPost />} />
          <Route path="/postcollection" element={<PostCollection />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
