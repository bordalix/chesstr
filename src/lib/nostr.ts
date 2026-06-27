import type { Move } from './move'
import { sha256 } from '@noble/hashes/sha2.js'
import { finalizeEvent, getPublicKey, SimplePool } from 'nostr-tools'

const pool = new SimplePool()

export const relays = ['wss://nos.lol']

export interface Payload {
  fen?: string
  move?: Move
}

// Generates a secret key based on the current URL.
// This ensures that each game has a unique key, allowing for separate games to be played on different URLs without interference.
const getSecretKey = (): Uint8Array => {
  const path = window.location.toString()
  const seed = new TextEncoder().encode(path)
  return sha256(seed)
}

export const nostr = {
  send: (payload: Payload) => {
    const sk = getSecretKey()
    const event = finalizeEvent(
      {
        kind: 1,
        tags: [],
        content: JSON.stringify(payload),
        created_at: Math.floor(Date.now() / 1000),
      },
      sk,
    )
    pool.publish(relays, event)
  },
  sendFEN: (fen: string) => {
    nostr.send({ fen })
  },
  sendMove: (move: Move) => {
    nostr.send({ move })
  },
  subscribeToMoves: (onMove: (payload: Payload) => void) => {
    const sk = getSecretKey()
    const pk = getPublicKey(sk)
    pool.subscribe(
      relays,
      { kinds: [1], authors: [pk] },
      {
        onevent(event) {
          onMove(JSON.parse(event.content))
        },
      },
    )
  },
}
