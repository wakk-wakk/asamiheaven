'use client'

import { useEffect } from 'react'

export function AdSense() {
  useEffect(() => {
    try {
      // @ts-expect-error adsbygoogle is added by external script
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // ignore ad errors
    }
  }, [])

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-1702672979918686"
      data-ad-slot="6958170524"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
