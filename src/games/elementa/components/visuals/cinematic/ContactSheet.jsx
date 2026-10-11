import { SCENE_IDS, SCENES } from '../../../data/story.js'
import { SceneFrame } from './CinematicScene.jsx'
import { layoutScene, sampleFrames } from './sceneLayout.js'

// Three frames of every story scene on one page (VISUALS.md V5, Verify): the
// first page mid-typing, a middle page held, the last page held. Each one is
// a Remotion Thumbnail, so nothing plays and the page stays quiet.
export default function ContactSheet({ lang, onPick }) {
  return (
    <div className="flex flex-col gap-4">
      {SCENE_IDS.map((id) => {
        const scene = SCENES[id]
        const frames = sampleFrames(layoutScene(scene))
        return (
          <section key={id} className="el-panel el-panel--dark flex flex-col gap-2 p-3">
            <button type="button" className="el-label w-fit text-left" onClick={() => onPick(id)} style={{ color: scene.color }}>
              {id} · {scene.title[lang]}
            </button>
            <div className="flex flex-wrap gap-2">
              {frames.map((f) => (
                <div key={f} className="v-cinematic__screen">
                  <SceneFrame id={id} frame={f} width={300} />
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
