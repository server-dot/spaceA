'use client'

import { useEffect } from 'react'

/**
 * 內文是 WordPress 來的 HTML，卡片圖片連的多半是品牌官網或外站 CDN，連結過期就會露出破圖加一行 alt 字。
 * 這裡在客戶端幫每張圖補上失敗處理：載入失敗就換成 spaceA 的淡色標記，版面不會塌。
 * 真正的圖還是要人回 WordPress 補，這只是別讓讀者看到破圖。
 */
const FALLBACK_SRC = '/logo-sa-mark.png'

function markBroken(img: HTMLImageElement) {
  if (img.dataset.broken) return
  img.dataset.broken = '1'
  img.src = FALLBACK_SRC
  img.srcset = ''
  img.alt = ''
  // 標記用原尺寸置中，不隨框縮放（用 padding 百分比會吃到寬度，框一高就整個被擠掉）
  img.style.objectFit = 'none'
  img.style.opacity = '0.25'
  img.style.background = '#f1eee8'
}

export default function BrokenImageFallback({ selector = '.prose img' }: { selector?: string }) {
  useEffect(() => {
    // error 事件不冒泡，掛在 document 用 capture 才抓得到；這樣 hydration 後才換進來的圖也一併處理
    const onError = (e: Event) => {
      const el = e.target
      if (el instanceof HTMLImageElement && el.matches(selector)) markBroken(el)
    }
    document.addEventListener('error', onError, true)
    // hydration 前就失敗的圖不會再觸發 error 事件，補檢查一次
    document.querySelectorAll<HTMLImageElement>(selector).forEach((img) => {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) markBroken(img)
    })
    return () => document.removeEventListener('error', onError, true)
  }, [selector])
  return null
}
