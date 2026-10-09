import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import NotFound from './pages/NotFound.jsx'
import ElementaGame from './games/elementa/ElementaGame.jsx'
import JukeboxPage from './games/elementa/JukeboxPage.jsx'

// The Visual Lab (VISUALS.md V1) is a lazy route, so none of it is in the first load.
const VisualsLabPage = lazy(() => import('./games/elementa/components/visuals/VisualsLabPage.jsx'))
const ItemGalleryPage = lazy(() => import('./games/elementa/components/visuals/ItemGalleryPage.jsx'))

function App() {
  return (
    <Routes>
      <Route path="/games/elementa" element={<ElementaGame />} />
      <Route path="/games/elementa/jukebox" element={<JukeboxPage />} />
      <Route
        path="/games/elementa/visuals/items"
        element={
          <Suspense fallback={null}>
            <ItemGalleryPage />
          </Suspense>
        }
      />
      <Route
        path="/games/elementa/visuals"
        element={
          <Suspense fallback={null}>
            <VisualsLabPage />
          </Suspense>
        }
      />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
