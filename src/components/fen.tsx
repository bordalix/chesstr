import { showToast } from '../lib/toast'
import { FlexBetween } from './flex'

export default function Fen({ fen }: { fen: string }) {
  const style: React.CSSProperties = {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    maxWidth: '100%',
  }
  return (
    <FlexBetween>
      <p style={style}>{fen}</p>
      <button
        onClick={() => {
          navigator.clipboard.writeText(fen)
          showToast('FEN copied to clipboard.')
        }}>
        Copy
      </button>
    </FlexBetween>
  )
}
