'use client'

import { useEffect } from 'react'

/**
 * 內文裡的 SVG 圖卡（n8n 的「判斷依據／一次解答」680×442 卡、旅遊文的行程時間軸）是照中文字寬排版的，
 * 譯成英日韓之後字串變長，標籤互相疊字、超出邊框。這裡在客戶端量實際字寬，把塞不下的文字
 * 折行或縮字級，位置不動、樣式不動。中文版量出來本來就塞得下，等於不動。
 *
 * 兩種處理：
 * - 680×442 卡片（認 viewBox）：標題膠囊隨字寬加寬；三欄標籤／副標可以折成兩行，副標跟著往下推；
 *   底部結論膠囊先把圖示＋文字重新置中，太長就縮字級，再不行折兩行並把膠囊加高
 * - 其他 SVG：每個 <text> 依同一列鄰居與邊框算可用寬度，超過就等比縮字級（最小 9px）
 */
const CARD_VIEWBOX = '0 0 680 442'
const LOGO_TEXTS = new Set(['S', 'paceA'])

function num(el: Element, attr: string, fallback = 0) {
  const v = parseFloat(el.getAttribute(attr) ?? '')
  return Number.isFinite(v) ? v : fallback
}

function textWidth(el: SVGTextElement) {
  try {
    return el.getComputedTextLength()
  } catch {
    return el.getBBox().width
  }
}

/** 沒有空白的字串（日文、中文）逐字折；有空白的照詞折 */
function tokenize(s: string) {
  return /\s/.test(s.trim()) ? s.trim().split(/\s+/) : Array.from(s.trim())
}

/**
 * 把 text 折成最多 maxLines 行、每行不超過 maxW。回傳實際行數；折不下（單一 token 就超寬或行數不夠）回傳 0 並還原。
 * 量寬度直接用元素本身，避免 canvas 跟 SVG 字型不一致。
 */
function wrapText(el: SVGTextElement, maxW: number, maxLines: number, lineHeight: number) {
  const original = el.textContent ?? ''
  const tokens = tokenize(original)
  const joiner = /\s/.test(original.trim()) ? ' ' : ''
  const lines: string[] = []
  let cur = ''
  for (const tok of tokens) {
    const candidate = cur ? cur + joiner + tok : tok
    el.textContent = candidate
    if (textWidth(el) <= maxW || !cur) {
      cur = candidate
    } else {
      lines.push(cur)
      cur = tok
    }
  }
  if (cur) lines.push(cur)
  // 任一行還是超寬（單一 token 太長）或行數不夠，交給縮字級處理
  let ok = lines.length <= maxLines
  if (ok) {
    for (const line of lines) {
      el.textContent = line
      if (textWidth(el) > maxW + 0.5) {
        ok = false
        break
      }
    }
  }
  if (!ok) {
    el.textContent = original
    return 0
  }
  el.textContent = ''
  const x = el.getAttribute('x') ?? '0'
  lines.forEach((line, i) => {
    const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
    tspan.setAttribute('x', x)
    if (i > 0) tspan.setAttribute('dy', String(lineHeight))
    tspan.textContent = line
    el.appendChild(tspan)
  })
  return lines.length
}

function shrinkToFit(el: SVGTextElement, maxW: number, minSize = 9) {
  const w = textWidth(el)
  if (w <= maxW) return
  const size = num(el, 'font-size', 14)
  const target = Math.floor((size * maxW) / w * 10) / 10
  el.setAttribute('font-size', String(Math.max(minSize, target)))
  // 縮到最小字級還是塞不下（圖例那種 9px 的小字），最後一步把字距壓緊，總比疊到旁邊的圖示好
  if (target < minSize) {
    el.setAttribute('textLength', String(maxW))
    el.setAttribute('lengthAdjust', 'spacingAndGlyphs')
  }
}

function fitCard(svg: SVGSVGElement) {
  const texts = Array.from(svg.querySelectorAll<SVGTextElement>('text')).filter(
    (t) => !LOGO_TEXTS.has(t.textContent?.trim() ?? '')
  )
  const rects = Array.from(svg.querySelectorAll<SVGRectElement>('rect'))

  // 標題膠囊：文字置中在 340，膠囊寬 220；字寬超過就把膠囊撐開
  const title = texts.find((t) => num(t, 'y') < 80 && t.getAttribute('text-anchor') === 'middle')
  if (title) {
    const pill = rects.find((r) => num(r, 'y') < 80 && num(r, 'width') > 100)
    const w = textWidth(title)
    if (pill && w + 40 > num(pill, 'width')) {
      const width = Math.min(640, w + 40)
      pill.setAttribute('width', String(width))
      pill.setAttribute('x', String(num(title, 'x') - width / 2))
    }
  }

  // 三欄：粗體標籤（y≈206）＋副標（y≈226），欄寬 680/3，左右各留 12
  const colW = 680 / 3 - 24
  const labels = texts.filter((t) => t.getAttribute('text-anchor') === 'middle' && num(t, 'font-weight') === 700 && Math.abs(num(t, 'y') - 206) < 4)
  for (const label of labels) {
    const x = num(label, 'x')
    const sub = texts.find((t) => t !== label && Math.abs(num(t, 'x') - x) < 1 && Math.abs(num(t, 'y') - 226) < 4)
    let labelLines = 1
    if (textWidth(label) > colW) {
      labelLines = wrapText(label, colW, 2, 19)
      if (!labelLines) {
        labelLines = 1
        shrinkToFit(label, colW, 10)
      }
    }
    if (sub) {
      if (labelLines > 1) sub.setAttribute('y', String(num(sub, 'y') + (labelLines - 1) * 19))
      if (textWidth(sub) > colW && !wrapText(sub, colW, 2, 15)) shrinkToFit(sub, colW, 9)
    }
  }

  // 底部結論膠囊：rect x=40 w=600 y≈304；圖示（circle/line，中心在文字 x−14）＋靠左起排的文字
  const pill = rects.find((r) => Math.abs(num(r, 'y') - 304) < 6 && num(r, 'width') > 400)
  const pillText = texts.find((t) => !t.getAttribute('text-anchor') && Math.abs(num(t, 'y') - 331) < 6)
  if (pill && pillText) {
    const iconX = num(pillText, 'x') - 14
    const iconParts = Array.from(svg.querySelectorAll<SVGElement>('circle, line')).filter(
      (el) => Math.abs(num(el, el.tagName === 'line' ? 'x1' : 'cx') - iconX) < 0.5 && num(el, el.tagName === 'line' ? 'y1' : 'cy') > 300 && num(el, el.tagName === 'line' ? 'y1' : 'cy') < 360
    )
    const pillX = num(pill, 'x')
    const pillW = num(pill, 'width')
    const maxTextW = pillW - 32 - 24 // 內距 16×2、圖示 20＋間距 4
    let w = textWidth(pillText)
    if (w > maxTextW) {
      // 先縮字級到 11，還是不夠才折兩行
      const size = num(pillText, 'font-size', 13)
      const needed = Math.max(11, Math.floor((size * maxTextW) / w * 10) / 10)
      pillText.setAttribute('font-size', String(needed))
      w = textWidth(pillText)
      if (w > maxTextW) {
        pillText.setAttribute('font-size', String(size))
        const lines = wrapText(pillText, maxTextW, 2, 17)
        if (lines > 1) {
          pill.setAttribute('height', String(num(pill, 'height') + 17))
          pillText.setAttribute('y', String(num(pillText, 'y') - 2))
          // 圖示往下移到兩行的中間
          iconParts.forEach((el) => {
            for (const a of el.tagName === 'line' ? ['y1', 'y2'] : ['cy']) el.setAttribute(a, String(num(el, a) + 8.5))
          })
          w = Math.max(...Array.from(pillText.querySelectorAll('tspan')).map((ts) => (ts as SVGTSpanElement).getComputedTextLength()))
        } else {
          pillText.setAttribute('font-size', String(needed))
          shrinkToFit(pillText, maxTextW, 9)
          w = textWidth(pillText)
        }
      }
    }
    // 圖示＋文字整組重新置中（原本是照中文字寬算的位置）
    const groupW = 24 + w
    const start = pillX + (pillW - groupW) / 2
    const dx = start + 24 - num(pillText, 'x')
    if (Math.abs(dx) > 0.5) {
      pillText.setAttribute('x', String(num(pillText, 'x') + dx))
      pillText.querySelectorAll('tspan').forEach((ts) => ts.setAttribute('x', pillText.getAttribute('x') ?? '0'))
      iconParts.forEach((el) => {
        for (const a of el.tagName === 'line' ? ['x1', 'x2'] : ['cx']) el.setAttribute(a, String(num(el, a) + dx))
      })
    }
  }
}

function fitGeneric(svg: SVGSVGElement) {
  const vb = (svg.getAttribute('viewBox') ?? '').split(/\s+/).map(Number)
  if (vb.length !== 4) return
  const [, , W] = vb
  const texts = Array.from(svg.querySelectorAll<SVGTextElement>('text')).filter(
    (t) => !LOGO_TEXTS.has(t.textContent?.trim() ?? '') && !t.querySelector('tspan')
  )
  const info = texts.map((t) => ({ t, x: num(t, 'x'), y: num(t, 'y'), anchor: t.getAttribute('text-anchor') ?? 'start', size: num(t, 'font-size', 14) }))
  // 圖例那種「圓圈＋字＋方框＋字」的列，字的右邊界也要看圖形，不然會壓到下一個圖示
  const shapes = Array.from(svg.querySelectorAll<SVGElement>('rect, circle'))
    .map((el) => {
      if (el.tagName === 'circle') {
        const r = num(el, 'r')
        return { left: num(el, 'cx') - r, cy: num(el, 'cy') }
      }
      return { left: num(el, 'x'), cy: num(el, 'y') + num(el, 'height') / 2 }
    })
    .filter((s) => Number.isFinite(s.left) && Number.isFinite(s.cy))
  for (const item of info) {
    const sameRow = info.filter((o) => o !== item && Math.abs(o.y - item.y) < 6)
    // 文字基線在 y，字身大約在 [y − size, y]；圖形中心落在這個帶狀範圍才算同一列
    const rowShapes = shapes.filter((s) => s.cy > item.y - item.size && s.cy < item.y && s.left > item.x)
    const gap = 10
    let maxW: number
    if (item.anchor === 'middle') {
      // 左右各以「到鄰居中心的距離一半」為界，兩邊都縮才不會互相搶
      let left = item.x - 8
      let right = W - 8 - item.x
      for (const o of sameRow) {
        if (o.x < item.x) left = Math.min(left, (item.x - o.x) / 2 - gap / 2)
        else if (o.x > item.x) right = Math.min(right, (o.x - item.x) / 2 - gap / 2)
      }
      maxW = 2 * Math.max(20, Math.min(left, right))
    } else if (item.anchor === 'end') {
      maxW = item.x - 8
    } else {
      let right = W - 12
      for (const o of sameRow) if (o.x > item.x) right = Math.min(right, o.x - gap)
      for (const s of rowShapes) right = Math.min(right, s.left - gap / 2)
      maxW = Math.max(20, right - item.x)
    }
    shrinkToFit(item.t, maxW)
  }
}

export default function SvgTextFit({ selector = '.prose svg[viewBox]' }: { selector?: string }) {
  useEffect(() => {
    document.querySelectorAll<SVGSVGElement>(selector).forEach((svg) => {
      if (svg.dataset.fitted) return
      svg.dataset.fitted = '1'
      try {
        if (svg.getAttribute('viewBox') === CARD_VIEWBOX) fitCard(svg)
        fitGeneric(svg)
      } catch {
        // 量不到（例如 display:none）就維持原樣
      }
    })
  }, [selector])
  return null
}
