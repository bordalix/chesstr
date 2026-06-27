import { FlexBetween, FlexEnd } from './flex'

function Icon({ src, alt }: { src: string; alt: string }) {
  const style = { height: '1rem' }
  return <img src={src} alt={alt} style={style} />
}

export default function Lead() {
  return (
    <>
      <h1>Chesstr</h1>
      <FlexBetween>
        <p>A chessboard powered by Nostr</p>
        <FlexEnd>
          <a href='https://github.com/bordalix/chesstr'>
            <Icon src='/img/github.png' alt='GitHub' />
          </a>
          <a href='https://twitter.com/bordalix/status/1605913469370261505'>
            <Icon src='/img/twitter.png' alt='Twitter' />
          </a>
          <a href='https://snort.social/p/npub1vt803quxxq32fuwkp42g2lyaw2t9qupvnl3z0vyc3s9kudkyhn8qt28cxv'>
            <Icon src='/img/nostr.png' alt='Nostr' />
          </a>
        </FlexEnd>
      </FlexBetween>
    </>
  )
}
