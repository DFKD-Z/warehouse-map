// 库位位置类型
export interface Position {
  id: string | number
  x: number
  y: number
  z?: number
  w?: number
  h?: number
  status?: string
  label?: string
  color?: string
  borderColor?: string
  textColor?: string
  isHeader?: boolean
}

// 组件Props类型
export interface WarehouseMapProps {
  positions: Position[]
  width: number
  height: number
  statusColors: Record<string, string>
  defaultW: number
  defaultH: number
  backgroundColor: string
  defaultPositionColor: string
  borderColor: string
  borderHoverColor: string
  textColor: string
  showGrid: boolean
  gridStep: number
  showLegend: boolean
  layerZOffset: number
  enablePan: boolean
  enableContextMenu: boolean
  contextMenuItems: ContextMenuItem[]
  align: 'center' | 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom'
}

// 右键菜单项类型
export interface ContextMenuItem {
  key: string
  label: string
}

// 画布状态类型
export interface CanvasState {
  hoverId: string | number | null
  selectedId: string | number | null
  canvasWidth: number
  canvasHeight: number
  scaleX: number
  scaleY: number
  offsetX: number
  offsetY: number
  isDragging: boolean
  dragStartX: number
  dragStartY: number
  dragStartOffsetX: number
  dragStartOffsetY: number
}

// 右键菜单状态类型
export interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  position: Position | null
}

// 画布坐标类型
export interface CanvasCoordinate {
  x: number
  y: number
  w: number
  h: number
}

// 性能优化配置类型
export interface PerformanceConfig {
  enableDebounce: boolean
  debounceDelay: number
  enableThrottle: boolean
  throttleDelay: number
  enableVirtualRender: boolean
  enableRafOptimization: boolean
  virtualRenderThreshold: number
}

// 性能统计类型
export interface PerformanceStats {
  fps: number
  renderCount: number
  visiblePositions: number
  totalPositions: number
  lastRenderTime: number
}

// 选区状态类型
export interface SelectionState {
  isSelecting: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  selectedIds: Set<string | number>
}

// 选区矩形类型
export interface SelectionRect {
  x: number
  y: number
  width: number
  height: number
}

// 批量操作类型
export type BatchAction = 'delete' | 'changeColor' | 'changeStatus' | 'changeBorderColor'

