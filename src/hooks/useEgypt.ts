import { useEffect, useState } from 'react'

function fromTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone === 'Africa/Cairo'
  } catch {
    return false
  }
}

export function useEgypt() {
  const [egypt, setEgypt] = useState(fromTimezone)

  useEffect(() => {
    const ctrl = new AbortController()
    fetch('https://ipwho.is/?fields=country_code,success', { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => {
        if (d?.success !== false && typeof d.country_code === 'string') {
          setEgypt(d.country_code === 'EG')
        }
      })
      .catch(() => {})
    return () => ctrl.abort()
  }, [])

  return egypt
}
