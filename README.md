# Chesstr

### A chessboard powered by Nostr

Want to play chess with a friend anywhere in the world? Presenting chesstr, a virtual chessboard powered by nostr.

Just create a random url and share it with your friend.

The full url is used as the seed for the private key, so the same url means the same key.

Using nostr, each client subscribe to itself, and sends an event to itself when the board changes, putting them in sync.

Try it at https://chesstr.pages.dev?1234

Change 1234 to some random number.

Repo at https://github.com/bordalix/chesstr
