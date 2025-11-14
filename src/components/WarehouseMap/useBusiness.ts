import type { Ref } from 'vue'
import type { Position, CanvasState } from './types'

/**
 * 业务逻辑 Hook
 * 负责库位状态管理、选择等业务相关操作
 */
export function useBusiness(
  state: CanvasState,
  positions: Ref<Position[]>,
  redraw: () => void,
  emit: any
) {
  /**
   * 更新所有库位数据
   */
  function updatePositions(newPositions: Position[]) {
    // 触发事件，让父组件更新数据
    emit('positions-updated', newPositions)
  }

  /**
   * 设置指定库位的状态
   */
  function setStatus(id: string | number, status: string): boolean {
    const idx = positions.value.findIndex(p => p.id === id)
    if (idx === -1) return false
    
    // 创建副本并更新状态，然后触发事件
    const copy = positions.value.map(p => ({ ...p }))
    copy[idx]!.status = status
    emit('positions-updated', copy)
    return true
  }

  /**
   * 选择指定库位
   */
  function selectPosition(id: string | number | null) {
    state.selectedId = id
    redraw()
  }

  /**
   * 获取当前选中的库位
   */
  function getSelectedPosition(): Position | null {
    if (!state.selectedId) return null
    return positions.value.find(p => p.id === state.selectedId) || null
  }

  /**
   * 获取当前悬停的库位
   */
  function getHoveredPosition(): Position | null {
    if (!state.hoverId) return null
    return positions.value.find(p => p.id === state.hoverId) || null
  }

  /**
   * 根据状态筛选库位
   */
  function getPositionsByStatus(status: string): Position[] {
    return positions.value.filter(p => p.status === status)
  }

  /**
   * 根据 ID 获取库位
   */
  function getPositionById(id: string | number): Position | null {
    return positions.value.find(p => p.id === id) || null
  }

  /**
   * 批量更新库位状态
   */
  function batchUpdateStatus(ids: (string | number)[], status: string): boolean {
    const copy = positions.value.map(p => ({ ...p }))
    let updated = false
    
    ids.forEach(id => {
      const idx = copy.findIndex(p => p.id === id)
      if (idx !== -1) {
        copy[idx]!.status = status
        updated = true
      }
    })
    
    if (updated) {
      emit('positions-updated', copy)
    }
    
    return updated
  }

  return {
    updatePositions,
    setStatus,
    selectPosition,
    getSelectedPosition,
    getHoveredPosition,
    getPositionsByStatus,
    getPositionById,
    batchUpdateStatus,
  }
}

