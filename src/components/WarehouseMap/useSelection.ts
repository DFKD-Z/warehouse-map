import { reactive, type Ref } from 'vue'
import type { Position } from './types'

/**
 * 框选功能 Hook
 * 支持按住鼠标左键框选多个库位
 */

export interface SelectionState {
  isSelecting: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  selectedIds: Set<string | number>
}

export interface SelectionRect {
  x: number
  y: number
  width: number
  height: number
}

export function useSelection(
  canvas: Ref<HTMLCanvasElement | null>,
  positions: Ref<Position[]>,
  _state: any, // CanvasState (未使用但保留接口一致性)
  worldToCanvas: (pt: any, defaultW: number, defaultH: number) => any,
  props: any,
  redraw: () => void,
  emit: any
) {
  // 选区状态
  const selectionState = reactive<SelectionState>({
    isSelecting: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    selectedIds: new Set(),
  })

  // 虚线动画偏移量（用于流动效果）
  let dashOffset = 0
  let animationFrameId: number | null = null

  /**
   * 启动虚线动画（流动效果）
   */
  function startDashAnimation() {
    if (animationFrameId) return
    
    let lastTime = performance.now()
    
    const animate = (currentTime: number) => {
      if (selectionState.isSelecting) {
        // 控制动画速度：每16ms（约60fps）更新一次
        if (currentTime - lastTime >= 16) {
          dashOffset += 1.5 // 每次移动1.5px，更平滑
          if (dashOffset >= 12) dashOffset = 0 // 重置（8+4=12）
          redraw()
          lastTime = currentTime
        }
        animationFrameId = requestAnimationFrame(animate)
      } else {
        animationFrameId = null
        dashOffset = 0
      }
    }
    
    animationFrameId = requestAnimationFrame(animate)
  }

  /**
   * 停止虚线动画
   */
  function stopDashAnimation() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    dashOffset = 0
  }

  /**
   * 获取选区矩形（画布坐标）
   */
  function getSelectionRect(): SelectionRect | null {
    if (!selectionState.isSelecting) return null

    const x = Math.min(selectionState.startX, selectionState.currentX)
    const y = Math.min(selectionState.startY, selectionState.currentY)
    const width = Math.abs(selectionState.currentX - selectionState.startX)
    const height = Math.abs(selectionState.currentY - selectionState.startY)

    return { x, y, width, height }
  }

  /**
   * 检查库位是否在选区内
   */
  function isPositionInSelection(pos: Position, rect: SelectionRect): boolean {
    const c = worldToCanvas(pos, props.defaultW, props.defaultH)
    const z = pos.z || 0
    const offset = z * props.layerZOffset
    const px = c.x + offset
    const py = c.y - offset

    // 检查库位矩形是否与选区矩形相交
    return !(
      px + c.w < rect.x ||
      px > rect.x + rect.width ||
      py + c.h < rect.y ||
      py > rect.y + rect.height
    )
  }

  /**
   * 更新选中的库位
   */
  function updateSelection() {
    const rect = getSelectionRect()
    if (!rect || rect.width < 5 || rect.height < 5) {
      // 选区太小，不算有效选区
      return
    }

    // 清空之前的选择
    selectionState.selectedIds.clear()

    // 查找在选区内的库位
    for (const pos of positions.value) {
      // 跳过标题行
      if (pos.isHeader) continue

      if (isPositionInSelection(pos, rect)) {
        selectionState.selectedIds.add(pos.id)
      }
    }

    // 触发选择变化事件
    emit('selection-change', Array.from(selectionState.selectedIds))
  }

  /**
   * 开始框选
   */
  function startSelection(clientX: number, clientY: number) {
    if (!canvas.value) return

    const rect = canvas.value.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    selectionState.isSelecting = true
    selectionState.startX = x
    selectionState.startY = y
    selectionState.currentX = x
    selectionState.currentY = y
    
    // 启动虚线动画
    startDashAnimation()
  }

  /**
   * 更新框选区域
   */
  function updateSelectionArea(clientX: number, clientY: number) {
    if (!canvas.value || !selectionState.isSelecting) return

    const rect = canvas.value.getBoundingClientRect()
    selectionState.currentX = clientX - rect.left
    selectionState.currentY = clientY - rect.top

    updateSelection()
    redraw()
  }

  /**
   * 结束框选
   */
  function endSelection() {
    if (!selectionState.isSelecting) return

    const rect = getSelectionRect()
    if (rect && (rect.width < 5 || rect.height < 5)) {
      // 选区太小，清空选择
      selectionState.selectedIds.clear()
      emit('selection-change', [])
    }

    selectionState.isSelecting = false
    
    // 停止虚线动画
    stopDashAnimation()
    
    redraw()
  }

  /**
   * 清空选择
   */
  function clearSelection() {
    selectionState.selectedIds.clear()
    selectionState.isSelecting = false
    
    // 停止虚线动画
    stopDashAnimation()
    
    emit('selection-change', [])
    redraw()
  }

  /**
   * 添加到选择
   */
  function addToSelection(id: string | number) {
    selectionState.selectedIds.add(id)
    emit('selection-change', Array.from(selectionState.selectedIds))
    redraw()
  }

  /**
   * 从选择中移除
   */
  function removeFromSelection(id: string | number) {
    selectionState.selectedIds.delete(id)
    emit('selection-change', Array.from(selectionState.selectedIds))
    redraw()
  }

  /**
   * 切换选择状态
   */
  function toggleSelection(id: string | number) {
    if (selectionState.selectedIds.has(id)) {
      removeFromSelection(id)
    } else {
      addToSelection(id)
    }
  }

  /**
   * 选择全部
   */
  function selectAll() {
    selectionState.selectedIds.clear()
    positions.value.forEach(pos => {
      if (!pos.isHeader) {
        selectionState.selectedIds.add(pos.id)
      }
    })
    emit('selection-change', Array.from(selectionState.selectedIds))
    redraw()
  }

  /**
   * 获取选中的库位数据
   */
  function getSelectedPositions(): Position[] {
    return positions.value.filter(pos => 
      selectionState.selectedIds.has(pos.id)
    )
  }

  /**
   * 批量删除选中的库位
   */
  function deleteSelected() {
    if (selectionState.selectedIds.size === 0) return

    const newPositions = positions.value.filter(
      pos => !selectionState.selectedIds.has(pos.id)
    )

    selectionState.selectedIds.clear()
    emit('positions-updated', newPositions)
    emit('selection-change', [])
    redraw()
  }

  /**
   * 批量修改选中库位的颜色
   */
  function changeSelectedColor(color: string) {
    if (selectionState.selectedIds.size === 0) return

    const newPositions = positions.value.map(pos => {
      if (selectionState.selectedIds.has(pos.id)) {
        return { ...pos, color }
      }
      return pos
    })

    emit('positions-updated', newPositions)
    redraw()
  }

  /**
   * 批量修改选中库位的状态
   */
  function changeSelectedStatus(status: string) {
    if (selectionState.selectedIds.size === 0) return

    const newPositions = positions.value.map(pos => {
      if (selectionState.selectedIds.has(pos.id)) {
        return { ...pos, status }
      }
      return pos
    })

    emit('positions-updated', newPositions)
    redraw()
  }

  /**
   * 批量修改选中库位的边框颜色
   */
  function changeSelectedBorderColor(borderColor: string) {
    if (selectionState.selectedIds.size === 0) return

    const newPositions = positions.value.map(pos => {
      if (selectionState.selectedIds.has(pos.id)) {
        return { ...pos, borderColor }
      }
      return pos
    })

    emit('positions-updated', newPositions)
    redraw()
  }

  /**
   * 绘制选区矩形（虚线框）
   */
  function drawSelectionRect(ctx: CanvasRenderingContext2D) {
    if (!selectionState.isSelecting) return

    const rect = getSelectionRect()
    if (!rect || rect.width < 1 || rect.height < 1) return

    ctx.save()
    
    // 绘制选区半透明背景
    ctx.fillStyle = 'rgba(33, 150, 243, 0.08)'
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
    
    // 绘制虚线边框 - 更粗更明显
    ctx.strokeStyle = '#2196F3'
    ctx.lineWidth = 1
    
    // 使用虚线模式：实线8px，间隔4px
    ctx.setLineDash([8, 4])
    ctx.lineDashOffset = dashOffset // 使用动画偏移量
    
    // 绘制外边框
    ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1)
    
    // 绘制内边框（更细的虚线，增强层次感）
    ctx.strokeStyle = 'rgba(33, 150, 243, 0.5)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.strokeRect(rect.x + 2, rect.y + 2, rect.width - 4, rect.height - 4)
    
    // 绘制四个角的标记（增强视觉反馈）
    const cornerSize = 6
    ctx.fillStyle = '#2196F3'
    ctx.setLineDash([]) // 清除虚线，绘制实心角
    
    // 左上角
    ctx.fillRect(rect.x, rect.y, cornerSize, 2)
    ctx.fillRect(rect.x, rect.y, 2, cornerSize)
    
    // 右上角
    ctx.fillRect(rect.x + rect.width - cornerSize, rect.y, cornerSize, 2)
    ctx.fillRect(rect.x + rect.width - 2, rect.y, 2, cornerSize)
    
    // 左下角
    ctx.fillRect(rect.x, rect.y + rect.height - 2, cornerSize, 2)
    ctx.fillRect(rect.x, rect.y + rect.height - cornerSize, 2, cornerSize)
    
    // 右下角
    ctx.fillRect(rect.x + rect.width - cornerSize, rect.y + rect.height - 2, cornerSize, 2)
    ctx.fillRect(rect.x + rect.width - 2, rect.y + rect.height - cornerSize, 2, cornerSize)
    
    ctx.restore()
  }

  /**
   * 绘制选中库位的高亮效果
   */
  function drawSelectedHighlight(ctx: CanvasRenderingContext2D, pos: Position) {
    if (!selectionState.selectedIds.has(pos.id)) return

    const c = worldToCanvas(pos, props.defaultW, props.defaultH)
    const z = pos.z || 0
    const offset = z * props.layerZOffset
    const x = c.x + offset
    const y = c.y - offset

    ctx.save()
    
    // 绘制选中高亮边框
    ctx.strokeStyle = '#2196F3'
    ctx.lineWidth = 3
    ctx.strokeRect(x - 1.5, y - 1.5, c.w + 3, c.h + 3)
    
    // 绘制角标记
    const cornerSize = 8
    ctx.fillStyle = '#2196F3'
    
    // 左上角
    ctx.fillRect(x - 2, y - 2, cornerSize, cornerSize)
    // 右上角
    ctx.fillRect(x + c.w - cornerSize + 2, y - 2, cornerSize, cornerSize)
    // 左下角
    ctx.fillRect(x - 2, y + c.h - cornerSize + 2, cornerSize, cornerSize)
    // 右下角
    ctx.fillRect(x + c.w - cornerSize + 2, y + c.h - cornerSize + 2, cornerSize, cornerSize)
    
    ctx.restore()
  }

  return {
    selectionState,
    getSelectionRect,
    isPositionInSelection,
    startSelection,
    updateSelectionArea,
    endSelection,
    clearSelection,
    addToSelection,
    removeFromSelection,
    toggleSelection,
    selectAll,
    getSelectedPositions,
    deleteSelected,
    changeSelectedColor,
    changeSelectedStatus,
    changeSelectedBorderColor,
    drawSelectionRect,
    drawSelectedHighlight,
  }
}

