import type { CanvasState, Position } from './types'

export interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export interface AlignConfig {
  positions: Position[]
  width: number
  height: number
  defaultW: number
  defaultH: number
  align: 'center' | 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom'
}

/**
 * 对齐控制 Hook
 * 负责计算库位边界框和对齐方式
 */
export function useAlign(
  state: CanvasState,
  canvasWidth: { value: number },
  canvasHeight: { value: number },
  config: AlignConfig
) {
  /**
   * 计算所有库位的边界框
   */
  function calculateBounds(): Bounds {
    if (config.positions.length === 0) {
      return { 
        minX: 0, 
        minY: 0, 
        maxX: config.width, 
        maxY: config.height 
      }
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const pos of config.positions) {
      const w = pos.w ?? config.defaultW
      const h = pos.h ?? config.defaultH
      const right = pos.x + w
      const bottom = pos.y + h

      minX = Math.min(minX, pos.x)
      minY = Math.min(minY, pos.y)
      maxX = Math.max(maxX, right)
      maxY = Math.max(maxY, bottom)
    }

    return { minX, minY, maxX, maxY }
  }

  /**
   * 根据对齐方式计算并应用初始偏移量
   */
  function applyAlign() {
    const bounds = calculateBounds()
    const boundsWidth = bounds.maxX - bounds.minX
    const boundsHeight = bounds.maxY - bounds.minY
    const boundsCenterX = bounds.minX + boundsWidth / 2
    const boundsCenterY = bounds.minY + boundsHeight / 2

    const cw = canvasWidth.value
    const ch = canvasHeight.value
    const scaleX = state.scaleX
    const scaleY = state.scaleY

    switch (config.align) {
      case 'center':
        // 居中显示
        state.offsetX = cw / 2 - boundsCenterX * scaleX
        state.offsetY = ch / 2 - boundsCenterY * scaleY
        break
      case 'left-top':
        // 左上对齐
        state.offsetX = 0 - bounds.minX * scaleX
        state.offsetY = 0 - bounds.minY * scaleY
        break
      case 'left-bottom':
        // 左下对齐
        state.offsetX = 0 - bounds.minX * scaleX
        state.offsetY = ch - bounds.maxY * scaleY
        break
      case 'right-top':
        // 右上对齐
        state.offsetX = cw - bounds.maxX * scaleX
        state.offsetY = 0 - bounds.minY * scaleY
        break
      case 'right-bottom':
        // 右下对齐
        state.offsetX = cw - bounds.maxX * scaleX
        state.offsetY = ch - bounds.maxY * scaleY
        break
    }
  }

  return {
    calculateBounds,
    applyAlign,
  }
}

