"use client"

import { useEffect, useRef } from "react"
import { incrementScanCount } from "./actions"

export function ScanTracker({ slug }: { slug: string }) {
  const tracked = useRef(false)

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true
      incrementScanCount(slug)
    }
  }, [slug])

  return null
}
