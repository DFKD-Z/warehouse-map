import type { Ref } from 'vue'
import type { Position, CanvasState, CanvasCoordinate } from './types'

/**
 * 渲染逻辑 Hook
 * 负责所有的绘制操作
 */
export function useRenderer(
  ctx: Ref<CanvasRenderingContext2D | null>,
  canvasWidth: Ref<number>,
  canvasHeight: Ref<number>,
  state: CanvasState,
  props: any,
  worldToCanvas: (pt: any, defaultW: number, defaultH: number) => CanvasCoordinate,
  clear: () => void,
  selectedIds?: Ref<Set<string | number>>
) {
  /**
   * 绘制网格
   */
  function drawGrid() {
    if (!ctx.value || !props.showGrid) return
    
    const stepX = props.gridStep * state.scaleX
    const stepY = props.gridStep * state.scaleY
    
    ctx.value.save()
    ctx.value.beginPath()
    ctx.value.lineWidth = 0.5
    ctx.value.strokeStyle = '#f0f0f0'
    
    // 绘制垂直线
    for (let x = 0; x <= canvasWidth.value; x += stepX) {
      ctx.value.moveTo(x + 0.5, 0)
      ctx.value.lineTo(x + 0.5, canvasHeight.value)
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvasHeight.value; y += stepY) {
      ctx.value.moveTo(0, y + 0.5)
      ctx.value.lineTo(canvasWidth.value, y + 0.5)
    }
    
    ctx.value.stroke()
    ctx.value.restore()
  }

  /**
   * 绘制所有库位
   */
  function drawPositions(positions: Position[]) {
    if (!ctx.value) return
    
    // 性能优化：批量绘制前保存上下文状态
    ctx.value.save()
    
    for (const pos of positions) {
      drawPosition(pos)
    }
    
    // 恢复上下文状态
    ctx.value.restore()
  }

  /**
   * 绘制单个库位
   */
  function drawPosition(pos: Position) {
    const c = worldToCanvas(pos, props.defaultW, props.defaultH)
    const z = pos.z || 0
    const offset = z * props.layerZOffset
    const x = c.x + offset
    const y = c.y - offset
    const w = c.w
    const h = c.h
    
    // 颜色优先级：pos.color > statusColors[pos.status] > defaultPositionColor
    const color = pos.color || (pos.status ? props.statusColors[pos.status] : undefined) || props.defaultPositionColor
    
    // 边框颜色优先级：pos.borderColor > (hover ? borderHoverColor : borderColor)
    const borderColor = pos.borderColor || 
      ((state.hoverId === pos.id) ? props.borderHoverColor : props.borderColor)
    
    // 文字颜色优先级：pos.textColor > props.textColor
    const textColor = pos.textColor || props.textColor

    ctx.value!.save()
    
    // 3D 阴影效果（用于层级）
    if (z) {
      ctx.value!.fillStyle = 'rgba(0,0,0,0.06)'
      ctx.value!.fillRect(x + 3, y + 3, w, h)
    }
    
    // 填充背景色
    ctx.value!.fillStyle = color
    ctx.value!.fillRect(x, y, w, h)
    
    // 检查是否被选中（框选）
    const isSelected = selectedIds?.value.has(pos.id)
    
    // 绘制边框
    ctx.value!.lineWidth = isSelected ? 3 : ((state.selectedId === pos.id) ? 2.5 : (pos.borderColor ? 2 : 1))
    ctx.value!.strokeStyle = isSelected ? '#2196F3' : borderColor
    ctx.value!.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)
    
    // 如果被选中，绘制额外的高亮效果
    if (isSelected) {
      ctx.value!.save()
      ctx.value!.strokeStyle = 'rgba(33, 150, 243, 0.3)'
      ctx.value!.lineWidth = 6
      ctx.value!.strokeRect(x - 2, y - 2, w + 4, h + 4)
      ctx.value!.restore()
    }
    
    // 绘制文本标签（支持多行文本，使用 \n 分隔）
    ctx.value!.fillStyle = textColor
    ctx.value!.font = Math.max(10, Math.min(14, h / 6)) + 'px sans-serif'
    ctx.value!.textBaseline = 'middle'
    ctx.value!.textAlign = 'center'
    
    const labelText = pos.label || pos.id
    const lines = String(labelText).split('\n')
    const lineHeight = Math.max(12, Math.min(16, h / 5))
    const totalHeight = lines.length * lineHeight
    const startY = y + h / 2 - totalHeight / 2 + lineHeight / 2
    
    lines.forEach((line, i) => {
      ctx.value!.fillText(line, x + w / 2, startY + i * lineHeight)
    })
    
    ctx.value!.restore()
  }

  /**
   * 重绘整个画布
   */
  function redraw(positions: Position[], drawExtras?: (ctx: CanvasRenderingContext2D) => void) {
    if (!ctx.value) return
    clear()
    drawGrid()
    drawPositions(positions)
    
    // 绘制额外的内容（如选区）
    if (drawExtras) {
      drawExtras(ctx.value)
    }
  }

  return {
    drawGrid,
    drawPositions,
    drawPosition,
    redraw,
  }
}

