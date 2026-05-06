'use client'

import Image from 'next/image'
import { useState } from 'react'

interface Props {
  slug: string
  name: string
}

export default function CategoryImage({ slug, name }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-sky-600" />
  }

  return (
    <Image
      src={`/categories/${slug}.jpg`}
      alt={name}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className="object-cover group-hover:scale-105 transition-transform duration-300"
      onError={() => setFailed(true)}
    />
  )
}
