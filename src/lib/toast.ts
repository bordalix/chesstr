export const showToast = (message: string, duration = 2100) => {
  const container = document.getElementById('toast-container')!
  const toast = document.createElement('div')
  toast.classList.add('toast')
  toast.textContent = message
  container.appendChild(toast)

  // force a reflow/repaint to trigger the CSS transition
  requestAnimationFrame(() => {
    toast.classList.add('show')
  })

  // automatically remove toast after duration expires
  setTimeout(() => {
    toast.classList.remove('show')
    toast.addEventListener('transitionend', () => toast.remove())
  }, duration)
}
