import type { CanvasState } from './types'

/**
 * 视口控制 Hook
 * 负责视图的缩放、平移等视口相关操作
 */
export function useViewport(
  state: CanvasState,
  redraw: () => void
) {
  /**
   * 重置视图到初始位置
   */
  function resetView() {
    state.offsetX = 0
    state.offsetY = 0
    redraw()
  }

  /**
   * 设置视图偏移量
   */
  function setOffset(x: number, y: number) {
    state.offsetX = x
    state.offsetY = y
    redraw()
  }

  /**
   * 获取当前视图偏移量
   */
  function getOffset() {
    return { 
      x: state.offsetX, 
      y: state.offsetY 
    }
  }

  /**
   * 平移视图（相对移动）
   */
  function panView(deltaX: number, deltaY: number) {
    state.offsetX += deltaX
    state.offsetY += deltaY
    redraw()
  }

  /**
   * 居中显示指定区域
   */
  function centerOnArea(x: number, y: number, width: number, height: number, canvasWidth: number, canvasHeight: number) {
    const centerX = x + width / 2
    const centerY = y + height / 2
    
    state.offsetX = canvasWidth / 2 - centerX * state.scaleX
    state.offsetY = canvasHeight / 2 - centerY * state.scaleY
    redraw()
  }

  /**
   * 获取当前缩放比例
   */
  function getScale() {
    return {
      x: state.scaleX,
      y: state.scaleY
    }
  }

  return {
    resetView,
    setOffset,
    getOffset,
    panView,
    centerOnArea,
    getScale,
  }
}

