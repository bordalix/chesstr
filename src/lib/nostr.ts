import { sha256 } from '@noble/hashes/sha2.js'
import { finalizeEvent, getPublicKey, SimplePool } from 'nostr-tools'

const pool = new SimplePool()

export const relays = ['wss://nos.lol']

// Generates a secret key based on the current URL.
// This ensures that each game has a unique key, allowing for separate games to be played on different URLs without interference.
const getSecretKey = (): Uint8Array => {
  const path = window.location.toString()
  const seed = new TextEncoder().encode(path)
  return sha256(seed)
}

export const nostr = {
  sendFEN: (fen: string) => {
    const sk = getSecretKey()
    const event = finalizeEvent(
      {
        kind: 1,
        tags: [],
        content: fen,
        created_at: Math.floor(Date.now() / 1000),
      },
      sk,
    )
    pool.publish(relays, event)
  },
  subscribeToMoves: (onMove: (fen: string) => void) => {
    const sk = getSecretKey()
    const pk = getPublicKey(sk)
    pool.subscribe(
      relays,
      { kinds: [1], authors: [pk] },
      {
        onevent(event) {
          onMove(event.content)
        },
      },
    )
  },
}
