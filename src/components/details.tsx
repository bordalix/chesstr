export default function Details() {
  const link = {
    repo: 'https://github.com/bordalix/chesstr',
    x: 'https://x.com/bordalix/status/1605913469370261505',
  }

  return (
    <details>
      <summary>Know more</summary>
      <p>Just create a random url and share it with your friend.</p>
      <p>
        The full url is used as the seed for the private key, so the same url means the same key, and the same key means
        the same board.
      </p>
      <p>
        Using Nostr, each client subscribe to itself, and sends an event to itself when the board changes, putting them
        in sync.
      </p>
      <p>
        Repo at <a href={link.repo}>{link.repo}</a>
      </p>
      <p>
        X <a href={link.x}>thread</a> for discussion
      </p>
    </details>
  )
}
