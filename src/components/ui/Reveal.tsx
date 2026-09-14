'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

type Tag = 'div' | 'section' | 'li' | 'article' | 'span'

interface RevealProps {
  as?: Tag
  className?: string
  /** 進場延遲（毫秒），同一排卡片給遞增值就會有交錯感 */
  delay?: number
  children: ReactNode
  id?: string
}

/**
 * 捲進視窗才淡入上浮的容器。樣式在 globals.css 的 `.reveal`，
 * 只有 <html class="js"> 時才會先隱藏（見 layout.tsx），沒 JS 的環境與爬蟲看到的是原樣。
 * 使用者開「減少動態」時整套關掉。
 */
export default function Reveal({ as = 'div', className = '', delay = 0, children, id }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add('is-in')
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const style = { '--reveal-delay': `${delay}ms` } as CSSProperties
  // 標籤名用變數當 JSX 元件；型別統一當 div 處理，ref 的存取都在 effect 裡
  const Tag = as as 'div'
  return (
    <Tag ref={ref} id={id} className={`reveal ${className}`.trim()} style={style}>
      {children}
    </Tag>
  )
}
