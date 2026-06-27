export default function Status({ status }: { status: string }) {
  const style: React.CSSProperties = {
    fontWeight: 'bold',
    textAlign: 'center',
  }
  return <p style={style}>{status}</p>
}
