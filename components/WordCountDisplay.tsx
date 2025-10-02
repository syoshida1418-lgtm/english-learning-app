"use client"

type WordCountDisplayProps = {
  count: number
}

export function WordCountDisplay({ count }: WordCountDisplayProps) {
  return <span className="text-sm text-muted-foreground">{String(count)} words</span>
}
