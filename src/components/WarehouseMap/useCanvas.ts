import { ref } from 'vue'
import type { Ref } from 'vue'
import type { CanvasState } from './types'

/**
 * 画布管理 Hook
 * 负责画布的初始化、大小调整和坐标转换
 */
export function useCanvas(
  canvas: Ref<HTMLCanvasElement | null>,
  wrap: Ref<HTMLDivElement | null>,
  state: CanvasState,
  props: { width: number; height: number }
) {
  const ctx = ref<CanvasRenderingContext2D | null>(null)
  const canvasWidth = ref(0)
  const canvasHeight = ref(0)
  const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1

  /**
   * 调整画布大小以匹配显示尺寸
   */
  function resizeCanvasToDisplaySize() {
    if (!wrap.value || !canvas.value) return
    
    const rect = wrap.value.getBoundingClientRect()
    // 使用容器的实际宽高，如果容器没有设置宽高则铺满屏幕
    canvasWidth.value = Math.floor(rect.width) || window.innerWidth
    canvasHeight.value = Math.floor(rect.height) || window.innerHeight
    
    canvas.value.width = Math.floor(canvasWidth.value * devicePixelRatio)
    canvas.value.height = Math.floor(canvasHeight.value * devicePixelRatio)
    canvas.value.style.width = canvasWidth.value + 'px'
    canvas.value.style.height = canvasHeight.value + 'px'
    
    ctx.value = canvas.value.getContext('2d')
    ctx.value?.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    
    // 重新计算缩放比例 - 使用统一的缩放比例保持宽高比
    const scaleX = canvasWidth.value / props.width
    const scaleY = canvasHeight.value / props.height
    const scale = Math.min(scaleX, scaleY) // 使用较小的缩放比例，保持宽高比
    state.scaleX = scale
    state.scaleY = scale
  }

  /**
   * 世界坐标转画布坐标
   */
  function worldToCanvas(pt: { x: number; y: number; w?: number; h?: number }, defaultW: number, defaultH: number) {
    return {
      x: pt.x * state.scaleX + state.offsetX,
      y: pt.y * state.scaleY + state.offsetY,
      w: (pt.w || defaultW) * state.scaleX,
      h: (pt.h || defaultH) * state.scaleY,
    }
  }

  /**
   * 清空画布
   */
  function clear() {
    if (!ctx.value) return
    ctx.value.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  }

  return {
    ctx,
    canvasWidth,
    canvasHeight,
    devicePixelRatio,
    resizeCanvasToDisplaySize,
    worldToCanvas,
    clear,
  }
}

