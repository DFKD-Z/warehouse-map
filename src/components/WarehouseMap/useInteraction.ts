import type { Ref } from 'vue'
import type { Position, CanvasState, CanvasCoordinate } from './types'

/**
 * 交互操作 Hook
 * 负责处理鼠标事件、拖拽、点击等操作
 */
export function useInteraction(
  canvas: Ref<HTMLCanvasElement | null>,
  state: CanvasState,
  props: any,
  positions: Ref<Position[]>,
  worldToCanvas: (pt: any, defaultW: number, defaultH: number) => CanvasCoordinate,
  redraw: () => void,
  emit: any,
  selectionHandlers?: {
    startSelection: (x: number, y: number) => void
    updateSelectionArea: (x: number, y: number) => void
    endSelection: () => void
  }
) {
  let clickTimer: { id: string | number; timer: number } | null = null

  /**
   * 获取鼠标指针下的库位
   */
  function getPosUnderPointer(clientX: number, clientY: number): Position | null {
    if (!canvas.value) return null
    
    const rect = canvas.value.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    
    // 从顶层到底层遍历，捕获最上层的（z 值最大的）
    const list = [...positions.value].sort((a, b) => (b.z || 0) - (a.z || 0))
    
    for (const pos of list) {
      const c = worldToCanvas(pos, props.defaultW, props.defaultH)
      const z = pos.z || 0
      const offset = z * props.layerZOffset
      const px = c.x + offset
      const py = c.y - offset
      
      if (x >= px && x <= px + c.w && y >= py && y <= py + c.h) {
        return pos
      }
    }
    
    return null
  }

  /**
   * 鼠标移动事件处理
   */
  function onPointerMove(e: PointerEvent) {
    if (!canvas.value) return
    
    // 处理框选
    if (selectionHandlers && e.buttons === 1 && (e.ctrlKey || e.metaKey) && props.enableSelection) {
      selectionHandlers.updateSelectionArea(e.clientX, e.clientY)
      return
    }
    
    // 处理拖动
    if (state.isDragging) {
      const rect = canvas.value.getBoundingClientRect()
      const currentX = e.clientX - rect.left
      const currentY = e.clientY - rect.top
      const deltaX = currentX - state.dragStartX
      const deltaY = currentY - state.dragStartY
      state.offsetX = state.dragStartOffsetX + deltaX
      state.offsetY = state.dragStartOffsetY + deltaY
      redraw()
      return
    }

    // 处理悬停
    const pos = getPosUnderPointer(e.clientX, e.clientY)
    const id = pos ? pos.id : null
    
    if (state.hoverId !== id) {
      state.hoverId = id
      emit('position-hover', pos)
      redraw()
    }
    
    // 更新鼠标样式
    const isSelectionMode = (e.ctrlKey || e.metaKey) && props.enableSelection
    if (isSelectionMode) {
      canvas.value.style.cursor = 'crosshair'
    } else if (props.enablePan && !pos) {
      canvas.value.style.cursor = 'grab'
    } else if (pos) {
      canvas.value.style.cursor = 'pointer'
    } else {
      canvas.value.style.cursor = 'default'
    }
  }

  /**
   * 鼠标按下事件处理
   */
  function onPointerDown(e: PointerEvent) {
    if (!canvas.value) return
    
    const rect = canvas.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const pos = getPosUnderPointer(e.clientX, e.clientY)
    
    // 检查是否按住 Ctrl/Cmd 键（用于框选）
    const isSelectionMode = (e.ctrlKey || e.metaKey) && props.enableSelection
    
    // 如果是框选模式
    if (isSelectionMode && !pos && selectionHandlers) {
      selectionHandlers.startSelection(e.clientX, e.clientY)
      canvas.value.style.cursor = 'crosshair'
      return
    }
    
    // 如果点击的是库位块
    if (pos) {
      // 跳过标题行（isHeader 为 true 的块）
      if (pos.isHeader) {
        return
      }

      // 检测双击
      if (clickTimer && clickTimer.id === pos.id) {
        clearTimeout(clickTimer.timer)
        clickTimer = null
        emit('position-dblclick', pos)
        console.log('双击库位块:', pos)
      } else {
        if (clickTimer) {
          clearTimeout(clickTimer.timer)
          clickTimer = null
        }
        
        const timer = window.setTimeout(() => {
          // 单击操作
          state.selectedId = pos.id
          emit('position-click', pos)
          console.log('点击库位块:', pos)
          redraw()
          clickTimer = null
        }, 250)
        
        clickTimer = { id: pos.id, timer }
      }
    } else {
      // 如果点击的是空白区域，开始拖动（需要启用拖动功能）
      if (props.enablePan) {
        state.isDragging = true
        state.dragStartX = x
        state.dragStartY = y
        state.dragStartOffsetX = state.offsetX
        state.dragStartOffsetY = state.offsetY
        canvas.value.style.cursor = 'grabbing'
      }
    }
  }

  /**
   * 鼠标释放事件处理
   */
  function onPointerUp(e: PointerEvent) {
    if (!canvas.value) return
    
    // 结束框选
    if (selectionHandlers && (e.ctrlKey || e.metaKey) && props.enableSelection) {
      selectionHandlers.endSelection()
    }
    
    if (state.isDragging) {
      state.isDragging = false
      canvas.value.style.cursor = 'default'
    }
  }

  /**
   * 鼠标离开事件处理
   */
  function onPointerLeave() {
    if (!canvas.value) return
    
    state.hoverId = null
    if (state.isDragging) {
      state.isDragging = false
      canvas.value.style.cursor = 'default'
    }
    redraw()
  }

  /**
   * 阻止默认的 pointerdown 行为
   */
  function preventDefaultPointerDown(e: PointerEvent) {
    e.preventDefault()
  }

  /**
   * 绑定所有交互事件
   */
  function bindEvents() {
    if (!canvas.value) return
    
    canvas.value.addEventListener('pointerdown', preventDefaultPointerDown)
    canvas.value.addEventListener('pointermove', onPointerMove)
    canvas.value.addEventListener('pointerdown', onPointerDown)
    canvas.value.addEventListener('pointerup', onPointerUp)
    canvas.value.addEventListener('pointercancel', onPointerUp)
    canvas.value.addEventListener('pointerleave', onPointerLeave)
  }

  /**
   * 解绑所有交互事件
   */
  function unbindEvents() {
    if (!canvas.value) return
    
    canvas.value.removeEventListener('pointerdown', preventDefaultPointerDown)
    canvas.value.removeEventListener('pointermove', onPointerMove)
    canvas.value.removeEventListener('pointerdown', onPointerDown)
    canvas.value.removeEventListener('pointerup', onPointerUp)
    canvas.value.removeEventListener('pointercancel', onPointerUp)
    canvas.value.removeEventListener('pointerleave', onPointerLeave)
  }

  return {
    getPosUnderPointer,
    onPointerMove,
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    bindEvents,
    unbindEvents,
  }
}

