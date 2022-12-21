
let game = new Chess()
let lastmove

// board utils
const utils = {
  // update board status
  updateStatus() {
    let status = ''
    let moveColor = 'White'
    if (game.turn() === 'b') moveColor = 'Black'
    if (game.in_checkmate()) { // checkmate?
      status = `Game over, ${moveColor} is in checkmate.`
    } else if (game.in_draw()) { // draw?
      status = 'Game over, drawn position'
    } else { // game still on
      status = `${moveColor} to move`
      if (game.in_check()) status += `, ${moveColor} is in check`
    }
    // update status
    $('#status').html(status)
  },
  // highlight last move
  highlightMove() {
    // remove all previous highlights
    const squareClass = 'square-55d63'
    $('#board1').find(`.${squareClass}`).removeClass('highlight-white')
    $('#board1').find(`.${squareClass}`).removeClass('highlight-black')
    // highlight squares from and to
    if (lastmove && lastmove.color && lastmove.from && lastmove.to) {
      const highClass = `highlight-${lastmove.color === 'w' ? 'white' : 'black'}`
      $('#board1').find(`.square-${lastmove.from}`).addClass(highClass)
      $('#board1').find(`.square-${lastmove.to}`).addClass(highClass)
    }
  },
  // delete all missing pieces
  cleanMissingPieces() {
    $('#topPieces').html('')
    $('#bottomPieces').html('')
  },
  // add missing pieces
  addMissingPieces(pieces) {
    const divIds = {
      top: '#topPieces',
      bottom: '#bottomPieces'
    }
    utils.cleanMissingPieces()
    for (const piece of Object.keys(pieces)) {
      const divId = piece.match(/b/)
        ? board.orientation() === 'black'
          ? divIds.top
          : divIds.bottom
        : board.orientation() === 'white'
          ? divIds.top
          : divIds.bottom
      for (let i = 0; i < pieces[piece]; i += 1) {
        const img = document.createElement('img')
        img.src = `img/chesspieces/wikipedia/${piece}`
        $(divId).append(img)
      }
    }
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
      const diff = allPieces[piece].count - (position.match(regexp) || []).length
      if (diff > 0) pieces[allPieces[piece].img] = diff
    })
    utils.addMissingPieces(pieces)
  },
}

// react to events
const eventListeners = {
  // do not pick up pieces if the game is over
  // only pick up pieces for the side to move
  onDragStart(source, piece) {
    if (game.game_over() === true ||
      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false
    }
  },
  // see if the move is legal
  onDrop(source, target) {
    const move = game.move({
      from: source,
      to: target,
      promotion: 'q'
    })
    // illegal move
    if (move === null) return 'snapback'
    nostr.sendGame({ move, fen: game.fen() })
  },
  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  onSnapEnd() {
    board.position(game.fen())
  },
  // on nostr notification
  onNostr({ move, fen }) {
    if (fen === 'start') {
      board.start()
      game = new Chess()
      lastmove = undefined
      utils.cleanMissingPieces()
    } else {
      board.position(fen)
      game = new Chess(fen)
      lastmove = move
      utils.findMissingPieces(fen)
    }
    utils.highlightMove()
    utils.updateStatus()
  }
}

// board config
const cfg = {
  snapbackSpeed: 550,
  appearSpeed: 1500,
  draggable: true,
  position: 'start',
  onDragStart: eventListeners.onDragStart,
  onDrop: eventListeners.onDrop,
  onSnapEnd: eventListeners.onSnapEnd,
}

const board = new ChessBoard('board1', cfg)

utils.updateStatus()

$('#resetGame').on('click', () => nostr.sendGame({ fen: 'start' }))
$('#flipBoard').on('click', () => {
  board.flip()
  utils.highlightMove()
})
