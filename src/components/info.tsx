import { relays } from '../lib/nostr'
import { showToast } from '../lib/toast'
import { FlexCol, FlexBetween } from './flex'

const pluralize = (count: number) => (count === 1 ? 'relay' : 'relays')

export default function Info() {
  return (
    <FlexCol>
      <FlexBetween>
        <p>{window.location.toString()}</p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.toString())
            showToast('URL copied to clipboard.')
          }}>
          Copy
        </button>
      </FlexBetween>
      <p>
        Connected to {relays.length} {pluralize(relays.length)}
      </p>
    </FlexCol>
  )
}
