import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard'
import { useEffect, useRef, useState } from 'react'
import { highlight } from '../lib/highlight'
import { showToast } from '../lib/toast'
import { nostr } from '../lib/nostr'
import { Chess } from 'chess.js'
import { FlexCol } from './flex'
import Buttons from './buttons'
import Status from './status'
import Fen from './fen'

export default function Board() {
  const chessGameRef = useRef(new Chess())
  const chessGame = chessGameRef.current

  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white')
  const [position, setPosition] = useState(chessGame.fen())
  const [status, setStatus] = useState('')

  useEffect(() => {
    const nextTurn = chessGame.turn() === 'w' ? 'White' : 'Black'
    const opponent = chessGame.turn() === 'w' ? 'Black' : 'White'

    // update the status message based on the game state
    if (chessGame.isCheckmate()) {
      setStatus(`Checkmate! ${opponent} wins.`)
    } else if (chessGame.isDraw()) {
      setStatus('Draw! Game over.')
    } else if (chessGame.isCheck()) {
      setStatus(`Check! ${nextTurn}'s turn`)
    } else if (chessGame.isStalemate()) {
      setStatus('Draw by stalemate! Game over.')
    } else if (chessGame.isDrawByFiftyMoves()) {
      setStatus('Draw by fifty-move rule! Game over.')
    } else if (chessGame.isInsufficientMaterial()) {
      setStatus('Draw by insufficient material! Game over.')
    } else {
      setStatus(`${nextTurn}'s turn`)
    }
  }, [chessGame, position])

  useEffect(() => {
    nostr.subscribeToMoves((payload) => {
      try {
        if (payload.move) {
          chessGame.move(payload.move)
          highlight([payload.move.from, payload.move.to])
        }
        if (payload.fen) {
          chessGame.load(payload.fen)
          highlight()
        }
        setPosition(chessGame.fen())
      } catch {}
    })
  }, [chessGame])

  // handle piece drop
  const onPieceDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
    // type narrow targetSquare potentially being null (e.g. if dropped off board)
    if (!targetSquare) return false

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    }

    try {
      chessGame.move(move)
      nostr.sendMove(move)
      setPosition(chessGame.fen())
      highlight([sourceSquare, targetSquare])
      return true
    } catch {
      return false
    }
  }

  // set the chessboard options
  const chessboardOptions = {
    boardOrientation,
    id: 'chesstr',
    onPieceDrop,
    position,
  }

  // render the chessboard
  return (
    <FlexCol>
      <Status status={status} />
      <Chessboard options={chessboardOptions} />
      <Buttons
        onReset={() => {
          chessGame.reset()
          setPosition(chessGame.fen())
          nostr.sendFEN(chessGame.fen())
          showToast('Game reset to starting position.')
        }}
        onFlip={() => {
          setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white')
        }}
        onApply={(fen) => {
          chessGame.load(fen)
          setPosition(chessGame.fen())
          nostr.sendFEN(chessGame.fen())
          showToast('FEN applied successfully.')
        }}
      />
      <Fen fen={position} />
    </FlexCol>
  )
}
