export const isIOS = () => {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

export const isAndroid = () => {
  if (typeof window === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

export const isBrowser = () => {
  return typeof window !== 'undefined'
}
