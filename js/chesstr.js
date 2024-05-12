// case is main url redirect to random url
if (window.location.search === '') {
  const rand = Math.random().toString(36).substring(2, 10)
  const url = window.location.toString() + `?${rand}`
  window.location.assign(url)
}

// global vars
let board
let lastmove
let game = new Chess()
let restoringMoves = true

const previousEvents = []

const relays = ['wss://nos.lol']

const subId = 'my-sub'
let websockets = []

// storage utils
const storage = {
  orientation(color) {
    if (typeof color === 'undefined') return localStorage.getItem('orientation')
    localStorage.setItem('orientation', color)
  },
}

// board utils
const boardUtils = {
  // add missing pieces
  addMissingPieces(pieces) {
    boardUtils.cleanMissingPieces()
    for (const piece of Object.keys(pieces)) {
      const divId =
        (piece.match(/b/) && board.orientation() === 'black') ||
        (piece.match(/w/) && board.orientation() !== 'black')
          ? '#topPieces'
          : '#bottomPieces'
      for (let i = 0; i < pieces[piece]; i += 1) {
        const img = document.createElement('img')
        img.src = `img/chesspieces/wikipedia/${piece}`
        $(divId).append(img)
      }
    }
  },
  // delete all missing pieces
  cleanMissingPieces() {
    $('#topPieces').text('')
    $('#bottomPieces').text('')
  },
  employFen() {
    nostrUtils.sendGame({ fen: $('#gameFen').val() })
  },
  // from a fen, find out which pieces are missing
  findMissingPieces(fen) {
    const pieces = {}
    const position = fen.split(' ')[0]
    const allPieces = {
      p: { count: 8, img: 'bP.png' },
      r: { count: 2, img: 'bR.png' },
      n: { count: 2, img: 'bN.png' },
      b: { count: 2, img: 'bB.png' },
      q: { count: 1, img: 'bQ.png' },
      k: { count: 1, img: 'bP.png' },
      P: { count: 8, img: 'wP.png' },
      R: { count: 2, img: 'wR.png' },
      N: { count: 2, img: 'wN.png' },
      B: { count: 2, img: 'wB.png' },
      Q: { count: 1, img: 'wQ.png' },
      K: { count: 1, img: 'wK.png' },
    }
    Object.keys(allPieces).forEach((piece) => {
      const regexp = new RegExp(piece, 'g')
      const diff =
        allPieces[piece].count - (position.match(regexp) || []).length
      if (diff > 0) pieces[allPieces[piece].img] = diff
    })
    boardUtils.addMissingPieces(pieces)
  },
  // rotate board and highlight last move
  flipBoard() {
    board.flip()
    boardUtils.highlightMove()
    storage.orientation(board.orientation())
  },
  // highlight last move
  highlightMove() {
    // remove all previous highlights
    const squareClass = 'square-55d63'
    $('#board1').find(`.${squareClass}`).removeClass('highlight-white')
    $('#board1').find(`.${squareClass}`).removeClass('highlight-black')
    // highlight squares from and to
    if (lastmove && lastmove.color && lastmove.from && lastmove.to) {
      const highClass = `highlight-${
        lastmove.color === 'w' ? 'white' : 'black'
      }`
      $('#board1').find(`.square-${lastmove.from}`).addClass(highClass)
      $('#board1').find(`.square-${lastmove.to}`).addClass(highClass)
    }
  },
  // initialize board
  initializeBoard() {
    const cfg = {
      snapbackSpeed: 550,
      appearSpeed: 1500,
      draggable: true,
      position: 'start',
      onDragStart: eventListeners.onDragStart,
      onDrop: eventListeners.onDrop,
      onSnapEnd: eventListeners.onSnapEnd,
    }
    board = new ChessBoard('board1', cfg)
    boardUtils.updateStatus()
    // check local storage for previous board flip
    const savedOrientation = storage.orientation()
    if (savedOrientation) board.orientation(savedOrientation)
  },
  // reset board/game
  resetGame() {
    nostrUtils.sendGame({ fen: 'start' })
  },
  // update board status
  updateStatus() {
    let status = ''
    let moveColor = 'White'
    if (game.turn() === 'b') moveColor = 'Black'
    if (game.in_checkmate()) {
      status = `Game over, ${moveColor} is in checkmate.`
    } else if (game.in_draw()) {
      status = 'Game over, drawn position'
    } else {
      // game still on
      status = `${moveColor} to move`
      if (game.in_check()) status += `, ${moveColor} is in check`
    }
    // update status
    $('#status').text(status)
  },
}

// crypto utils for nostr
const nostrUtils = {
  computeRawPrivkey(node) {
    return bitcoinjs.ECPair.fromPrivateKey(node.privateKey, {
      network: bitcoinjs.networks.mainnet,
    })
  },
  getKeys() {
    const privKey = nostrUtils.getPrivkeyHex().__D.toString('hex')
    const pubKey = nobleSecp256k1.getPublicKey(privKey, true)
    //be aware that not all valid bitcoin pubkeys are valid nostr pubkeys. Valid bitcoin pubkeys include uncompressed pubkeys (that start with 04), compressed pubkeys whose y coordinate is positive (that start with 02), and compressed pubkeys whose y coordinate is negative (that start with 03).
    //Only the ones that start with 02 are valid for nostr, which then allows us to chop off the 02 when storing the pubkey.
    //So if you change this code to generate random pubkeys, be sure to only use ones that have an 02 at the beginning.
    //The pubkeyMinus2 variable is the pubkey created a moment ago but without the 02 at the beginning.
    const pubKeyMinus2 = pubKey.substring(2)
    return [privKey, pubKeyMinus2]
  },
  getPrivkeyHex() {
    const seed = buffer.Buffer.from(window.location.toString())
    const node = bip32.fromSeed(seed)
    const path = "m/44'/1237'/0'/0/0"
    return nostrUtils.computeRawPrivkey(node.derivePath(path))
  },
  openWebsockets() {
    const processedEventIds = {}
    for (const relay of relays) {
      const ws = new WebSocket(relay)
      websockets.push(ws)
      // on error remove this websocket from array of websockets
      ws.onerror = () =>
        (websockets = websockets.filter((w) => w.url !== ws.url))
      // update relay message and subscribe to events
      ws.onopen = () => {
        const status = `${websockets.length}/${relays.length}`
        $('#relay').text(`Connected to ${status} relays`)
        const filter = { authors: [pubKey] }
        ws.send(JSON.stringify(['REQ', subId, filter]))
        // Send a ping event every 10 seconds to avoid timeout
        setInterval(() => ws.send(JSON.stringify({ event: ['ping'] })), 10000)
      }
      // Listen for messages from nostr
      // On a board update, verify sig and update board
      ws.onmessage = async (event) => {
        const olderFirst = (a, b) => a.created_at - b.created_at
        const [msgType, subscriptionId, data] = JSON.parse(event.data)
        if (msgType === 'EOSE' && restoringMoves) {
          setTimeout(async () => {
            for (const eventData of previousEvents.sort(olderFirst)) {
              const { content, id, sig } = eventData
              if (processedEventIds[id]) continue
              if (await nobleSecp256k1.schnorr.verify(sig, id, pubKey)) {
                eventListeners.onNostr(JSON.parse(content))
                processedEventIds[id] = true
              }
            }
            restoringMoves = false
          }, 500)
        }
        if (msgType === 'EVENT' && subscriptionId === subId) {
          const { content, id, sig } = data
          if (processedEventIds[id]) return
          if (restoringMoves) previousEvents.push(data)
          else if (await nobleSecp256k1.schnorr.verify(sig, id, pubKey)) {
            eventListeners.onNostr(JSON.parse(content))
            processedEventIds[id] = true
          }
        }
      }
    }
  },
  sendGame({ move, fen }) {
    const content = JSON.stringify({ move, fen })
    const created_at = Math.floor(Date.now() / 1000)
    const kind = 30
    const tags = []
    const event = [0, pubKey, created_at, kind, tags, content]
    const message = JSON.stringify(event)
    const hash = bitcoinjs.crypto.sha256(message).toString('hex')
    nobleSecp256k1.schnorr.sign(hash, privKey).then((sig) => {
      nobleSecp256k1.schnorr.verify(sig, hash, pubKey).then((isValidSig) => {
        if (isValidSig) {
          const fullevent = {
            id: hash,
            pubkey: pubKey,
            created_at,
            kind,
            tags,
            content,
            sig,
          }
          for (const ws of websockets) {
            ws.send(JSON.stringify(['EVENT', fullevent]))
          }
        }
      })
    })
  },
}

// react to events
const eventListeners = {
  // do not pick up pieces if the game is over
  // only pick up pieces for the side to move
  onDragStart(source, piece) {
    if (
      game.game_over() === true ||
      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)
    ) {
      return false
    }
  },
  // see if the move is legal
  onDrop(source, target) {
    const move = game.move({
      from: source,
      to: target,
      promotion: 'q',
    })
    // illegal move
    if (move === null) return 'snapback'
    nostrUtils.sendGame({ move, fen: game.fen() })
  },
  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  onSnapEnd() {
    board.position(game.fen())
  },
  // on nostr notification
  onNostr({ move, fen }) {
    if (fen === 'start') {
      // restart board
      board.start()
      game = new Chess()
      lastmove = undefined
      boardUtils.cleanMissingPieces()
    } else {
      // update board to new position
      board.position(fen)
      game = new Chess(fen)
      lastmove = move
      boardUtils.findMissingPieces(fen)
    }
    boardUtils.highlightMove()
    boardUtils.updateStatus()
    $('#gameFen').val(game.fen()).change()
  },
  // on change on the fen input
  onFen() {
    const fen = $('#gameFen').val()
    const { valid, error } = game.validate_fen(fen)
    if (!valid) console.error('invalid fen:', error)
    $('#employFen').text(valid ? 'Apply' : 'Invalid')
    $('#employFen').prop('disabled', !valid || fen === game.fen())
  },
}

// initialize board
boardUtils.initializeBoard()

// buttons click handlers
$('#resetGame').on('click', () => boardUtils.resetGame())
$('#flipBoard').on('click', () => boardUtils.flipBoard())
$('#employFen').on('click', () => boardUtils.employFen())

// change on fen handler
$('#gameFen').on('change keyup', () => eventListeners.onFen())

// get keys (url will be the seed for the private key)
const [privKey, pubKey] = nostrUtils.getKeys()

// start websockets
nostrUtils.openWebsockets()

$(document).ready(() => $('#url').text(window.location.href))
