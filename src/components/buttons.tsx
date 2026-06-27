import { useRef } from 'react'
import { FlexBetween, FlexEnd } from './flex'

export default function Buttons({
  onReset,
  onFlip,
  onApply,
}: {
  onReset: () => void
  onFlip: () => void
  onApply: (fen: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <FlexBetween>
      <FlexEnd>
        <button onClick={onReset}>Reset</button>
        <button onClick={onFlip}>Flip board</button>
      </FlexEnd>
      <FlexEnd>
        <input ref={inputRef} type='text' placeholder='FEN' size={10} />
        <button onClick={() => onApply(inputRef.current?.value || '')}>Apply</button>
      </FlexEnd>
    </FlexBetween>
  )
}
