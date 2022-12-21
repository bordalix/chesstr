const nostr = {
  sendGame({ move, fen }) {
    const content = JSON.stringify({ move, fen })
    const created_at = Math.floor(Date.now() / 1000)
    const event = [0, pubKey, created_at, 1, [], content]
    const message = JSON.stringify(event)
    const hash = bitcoinjs.crypto.sha256(message).toString('hex')
    nobleSecp256k1.schnorr.sign(hash, privKey).then((sig) => {
      nobleSecp256k1.schnorr
        .verify(sig, hash, pubKey)
        .then((isValidSig) => {
          if (isValidSig) {
            const fullevent = {
              id: hash,
              pubkey: pubKey,
              created_at,
              kind: 1,
              tags: [],
              content,
              sig,
            }
            ws.send(JSON.stringify(['EVENT', fullevent]))
          }
        })
    })
  },
  computeRawPrivkey(node) {
    return bitcoinjs.ECPair.fromPrivateKey(node.privateKey, {
      network: bitcoinjs.networks.mainnet,
    })
  },
  getPrivkeyHex() {
    const seed = buffer.Buffer.from(window.location.toString())
    const node = bip32.fromSeed(seed)
    const path = "m/44'/1237'/0'/0/0"
    return nostr.computeRawPrivkey(node.derivePath(path))
  },
  getKeys() {
    const privKey = nostr.getPrivkeyHex().__D.toString('hex')
    const pubKey = nobleSecp256k1.getPublicKey(privKey, true)
    //be aware that not all valid bitcoin pubkeys are valid nostr pubkeys. Valid bitcoin pubkeys include uncompressed pubkeys (that start with 04), compressed pubkeys whose y coordinate is positive (that start with 02), and compressed pubkeys whose y coordinate is negative (that start with 03).
    //Only the ones that start with 02 are valid for nostr, which then allows us to chop off the 02 when storing the pubkey.
    //So if you change this code to generate random pubkeys, be sure to only use ones that have an 02 at the beginning.
    //The pubkeyMinus2 variable is the pubkey created a moment ago but without the 02 at the beginning.
    const pubKeyMinus2 = pubKey.substring(2)
    return [privKey, pubKeyMinus2]
  }
}

// get keys
const [privKey, pubKey] = nostr.getKeys()

// open web socket
const relay = 'wss://nostr.v0l.io'
const ws = new WebSocket(relay)

// subscribe
ws.onopen = () => {
  $('#nostr').html(`Connected to ${relay}`)
  const filter = { authors: [pubKey] }
  ws.send(
    JSON.stringify([
      'REQ',
      'my-sub',
      filter,
    ]),
  )
  // Send a ping event every 10 seconds
  setInterval(() => ws.send(JSON.stringify({ event: "ping" })), 10000);
}

// Listen for messages
// On a board update, verify sig and update board
ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  if (data?.[2]?.content) {
    const { content, id, sig } = data[2]
    nobleSecp256k1.schnorr
      .verify(sig, id, pubKey)
      .then((validSig) => {
        if (validSig) {
          eventListeners.onNostr(JSON.parse(content))
        }
      })
  }
}

