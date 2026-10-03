import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import NotFound from './pages/NotFound.jsx'
import ElementaGame from './games/elementa/ElementaGame.jsx'
import JukeboxPage from './games/elementa/JukeboxPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/games/elementa" element={<ElementaGame />} />
      <Route path="/games/elementa/jukebox" element={<JukeboxPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
