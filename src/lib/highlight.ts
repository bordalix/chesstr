export const highlight = (squares?: [string, string]): void => {
  const className = 'highlight'
  document.querySelectorAll(`.${className}`).forEach((el) => el.classList.remove(className))
  if (!squares) return
  for (const square of squares) {
    const squareElement = document.querySelector(`[data-square="${square}"]`)!
    squareElement.classList.add(className)
  }
}
