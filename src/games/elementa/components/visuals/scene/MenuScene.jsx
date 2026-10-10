import { sceneVars } from './materials.js'
import './scene.css'
import './menu.css'

/**
 * The materials for a menu screen (VISUALS.md V4.4): the same wood, leather, parchment and brass
 * as the shops, so a menu is a place made of the same things. `shop` picks the material set (the
 * default is the Market's warm one). Buttons inside become wooden plaques, sliders and switches
 * brass fittings, by the `.shop-scene` rules in scene.css and menu.css.
 */
export default function MenuScene({ shop = 'market', className = '', children, ...rest }) {
  return (
    <div className={`shop-scene menu-scene ${className}`} style={sceneVars(shop)} {...rest}>
      {children}
    </div>
  )
}
