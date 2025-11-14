/**
 * WarehouseMap 组件统一导出文件
 * 方便外部使用类型定义和工具函数
 */

// 导出所有类型定义
export type {
  Position,
  WarehouseMapProps,
  ContextMenuItem,
  CanvasState,
  ContextMenuState,
  CanvasCoordinate,
  PerformanceConfig,
  PerformanceStats,
  SelectionState,
  SelectionRect,
  BatchAction,
} from './types'

// 导出主组件
export { default as WarehouseMap } from './index.vue'

// 如果需要在外部使用这些 hooks（虽然不常见），也可以导出
export { useCanvas } from './useCanvas'
export { useRenderer } from './useRenderer'
export { useInteraction } from './useInteraction'
export { useContextMenu } from './useContextMenu'
export { useBusiness } from './useBusiness'
export { useViewport } from './useViewport'
export { usePerformance, defaultPerformanceConfig } from './usePerformance'
export { useSelection } from './useSelection'
export { useAlign } from './useAlign'
export type { Bounds, AlignConfig } from './useAlign'

// 导出工具函数
export { debounce, throttle, rafThrottle } from './usePerformance'

