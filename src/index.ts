/**
 * WarehouseMap - 仓库地图可视化组件
 * npm 包主入口文件
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
} from './components/WarehouseMap/types'

// 导出主组件
export { default as WarehouseMap } from './components/WarehouseMap/index.vue'

// 导出 hooks（可选，供高级用户使用）
export { useCanvas } from './components/WarehouseMap/useCanvas'
export { useRenderer } from './components/WarehouseMap/useRenderer'
export { useInteraction } from './components/WarehouseMap/useInteraction'
export { useContextMenu } from './components/WarehouseMap/useContextMenu'
export { useBusiness } from './components/WarehouseMap/useBusiness'
export { useViewport } from './components/WarehouseMap/useViewport'
export { usePerformance, defaultPerformanceConfig } from './components/WarehouseMap/usePerformance'
export { useSelection } from './components/WarehouseMap/useSelection'

// 导出工具函数
export { debounce, throttle, rafThrottle } from './components/WarehouseMap/usePerformance'

