export function FlexBetween({ children }: { children: React.ReactNode }) {
  const style: React.CSSProperties = {
    justifyContent: 'space-between',
    alignItems: 'center',
    display: 'flex',
    gap: '0.5rem',
  }
  return <div style={style}>{children}</div>
}

export function FlexCol({ children }: { children: React.ReactNode }) {
  const style: React.CSSProperties = {
    justifyContent: 'flex-start',
    flexDirection: 'column',
    display: 'flex',
    gap: '1rem',
  }
  return <div style={style}>{children}</div>
}

export function FlexEnd({ children }: { children: React.ReactNode }) {
  const style: React.CSSProperties = {
    justifyContent: 'flex-end',
    alignItems: 'center',
    display: 'flex',
    gap: '0.5rem',
  }
  return <div style={style}>{children}</div>
}
