import PixelSprite from '../PixelSprite.jsx'

/** The shipping code-made sprite (data/sprites.js), exposed to the registry as a `code` visual. */
export default function CodeSprite({ scale = 3, native = 24, ...rest }) {
  return <PixelSprite size={native * scale} {...rest} />
}
