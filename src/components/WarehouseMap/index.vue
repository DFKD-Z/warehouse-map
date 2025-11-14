<template>
  <div class="warehouse-map" ref="wrap" :style="{ backgroundColor: backgroundColor }">
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" style="width:100%;height:100%;display:block;"/>
    
    <!-- 批量操作工具栏 -->
    <transition name="toolbar-fade">
      <div v-if="enableBatchOperations && selectionState.selectedIds.size > 0" class="batch-toolbar">
        <div class="toolbar-info">
          已选中 <strong>{{ selectionState.selectedIds.size }}</strong> 个库位
        </div>
        <div class="toolbar-actions">
          <div class="action-group">
            <label>状态：</label>
            <select @change="handleStatusChange" class="toolbar-select">
              <option value="">选择状态</option>
              <option value="free">空闲</option>
              <option value="occupied">占用</option>
              <option value="reserved">预留</option>
              <option value="damaged">损坏</option>
            </select>
          </div>
          
          <div class="action-group">
            <label>颜色：</label>
            <input 
              type="color" 
              @change="handleColorChange" 
              class="toolbar-color"
              title="选择颜色"
            />
          </div>
          
          <div class="action-group">
            <label>边框：</label>
            <input 
              type="color" 
              @change="handleBorderColorChange" 
              class="toolbar-color"
              title="选择边框颜色"
            />
          </div>
          
          <button @click="handleDelete" class="toolbar-btn toolbar-btn-danger">
            🗑️ 删除
          </button>
          
          <button @click="clearSelection" class="toolbar-btn">
            ✖️ 取消选择
          </button>
        </div>
      </div>
    </transition>
    
    <!-- 性能统计面板 -->
    <div v-if="showPerformanceStats" class="performance-stats">
      <div class="stats-title">性能统计</div>
      <div class="stats-item">
        <span class="stats-label">FPS:</span>
        <span class="stats-value" :class="{ 'stats-warning': performanceStats.fps < 30, 'stats-good': performanceStats.fps >= 60 }">
          {{ performanceStats.fps }}
        </span>
      </div>
      <div class="stats-item">
        <span class="stats-label">渲染次数:</span>
        <span class="stats-value">{{ performanceStats.renderCount }}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">可见库位:</span>
        <span class="stats-value">{{ performanceStats.visiblePositions }} / {{ performanceStats.totalPositions }}</span>
      </div>
      <div class="stats-item">
        <span class="stats-label">渲染时间:</span>
        <span class="stats-value">{{ performanceStats.lastRenderTime.toFixed(2) }}ms</span>
      </div>
    </div>
    
    <!-- 右键菜单 -->
    <transition name="context-menu-fade">
      <div 
        v-if="enableContextMenu && contextMenu.visible" 
        class="context-menu"
        :style="{
          left: contextMenu.x + 'px',
          top: contextMenu.y + 'px'
        }"
      >
        <div 
          v-for="item in contextMenuItems" 
          :key="item.key"
          class="context-menu-item"
          @click="handleMenuItemClick(item)"
        >
          {{ item.label }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, reactive, toRef, computed } from 'vue'
import type { Position, ContextMenuItem, CanvasState, PerformanceConfig } from './types'
import { useCanvas } from './useCanvas'
import { useRenderer } from './useRenderer'
import { useInteraction } from './useInteraction'
import { useContextMenu } from './useContextMenu'
import { useBusiness } from './useBusiness'
import { useViewport } from './useViewport'
import { usePerformance, defaultPerformanceConfig } from './usePerformance'
import { useSelection } from './useSelection'
import { useAlign } from './useAlign'

// ==================== Props 定义 ====================
const props = withDefaults(defineProps<{
  // 库位数组
  positions?: Position[]
  // 画布逻辑尺寸（单位）- 坐标将按比例缩放
  width?: number
  height?: number
  // 状态颜色映射
  statusColors?: Record<string, string>
  // 默认单元格尺寸（如果未指定 w/h）
  defaultW?: number
  defaultH?: number
  // 背景颜色
  backgroundColor?: string
  // 库位块默认颜色（当没有 status 和 color 属性时使用）
  defaultPositionColor?: string
  // 库位块边框颜色
  borderColor?: string
  // 库位块边框 hover 颜色
  borderHoverColor?: string
  // 库位块文字颜色
  textColor?: string
  // 是否显示网格
  showGrid?: boolean
  // 网格步长
  gridStep?: number
  // 是否显示图例
  showLegend?: boolean
  // 层级 z 偏移量
  layerZOffset?: number
  // 是否启用画布拖动
  enablePan?: boolean
  // 是否启用右键菜单
  enableContextMenu?: boolean
  // 右键菜单项配置
  contextMenuItems?: ContextMenuItem[]
  // 性能优化配置
  performanceConfig?: Partial<PerformanceConfig>
  // 是否显示性能统计
  showPerformanceStats?: boolean
  // 是否启用批量操作
  enableBatchOperations?: boolean
  // 是否启用框选（按住 Ctrl/Cmd + 拖动）
  enableSelection?: boolean
  // 初始对齐方式
  align?: 'center' | 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom'
}>(), {
  positions: () => [],
  width: 2000,
  height: 2000,
  statusColors: () => ({
    free: '#d9f7be',
    occupied: '#ffe7ba',
    reserved: '#ffd6e7',
    damaged: '#f8d7da'
  }),
  defaultW: 100,
  defaultH: 100,
  backgroundColor: '#000000',
  defaultPositionColor: '#ffffff',
  borderColor: '#666666',
  borderHoverColor: '#ffffff',
  textColor: '#000000',
  showGrid: true,
  gridStep: 100,
  showLegend: true,
  layerZOffset: 8,
  enablePan: true,
  enableContextMenu: true,
  contextMenuItems: () => [
    { key: 'view', label: '查看详情' },
    { key: 'edit', label: '编辑' },
    { key: 'delete', label: '删除' },
    { key: 'copy', label: '复制' }
  ],
  performanceConfig: () => ({}),
  showPerformanceStats: false,
  enableBatchOperations: true,
  enableSelection: true,
  align: 'center'
})

// ==================== 事件定义 ====================
const emit = defineEmits<{
  'position-click': [position: Position]
  'position-dblclick': [position: Position]
  'position-hover': [position: Position | null]
  'positions-updated': [positions: Position[]]
  'context-menu': [data: { position: Position; x: number; y: number }]
  'menu-item-click': [data: { menuItem: ContextMenuItem; position: Position | null }]
  'selection-change': [selectedIds: (string | number)[]]
  'batch-delete': [selectedIds: (string | number)[]]
  'batch-color-change': [data: { selectedIds: (string | number)[], color: string }]
  'batch-status-change': [data: { selectedIds: (string | number)[], status: string }]
}>()

// ==================== Refs ====================
const canvas = ref<HTMLCanvasElement | null>(null)
const wrap = ref<HTMLDivElement | null>(null)
const positionsRef = toRef(props, 'positions')

// 合并性能配置
const mergedPerformanceConfig = computed<PerformanceConfig>(() => ({
  ...defaultPerformanceConfig,
  ...props.performanceConfig
}))

// ==================== 状态管理 ====================
const state = reactive<CanvasState>({
  hoverId: null,
  selectedId: null,
  canvasWidth: 1920,
  canvasHeight: 1080,
  scaleX: 1,
  scaleY: 1,
  offsetX: 0,
  offsetY: 0,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  dragStartOffsetX: 0,
  dragStartOffsetY: 0,
})

// ==================== 性能优化 ====================
const {
  stats: performanceStats,
  filterVisiblePositions,
  recordRenderTime,
  startFPSMonitoring,
  stopFPSMonitoring,
  rafThrottle,
  debounce,
} = usePerformance(mergedPerformanceConfig.value)

// ==================== 画布管理 ====================
const {
  ctx,
  canvasWidth,
  canvasHeight,
  resizeCanvasToDisplaySize,
  worldToCanvas,
  clear,
} = useCanvas(canvas, wrap, state, props)

// ==================== 框选功能（先初始化，获取 drawSelectionRect）====================
// 临时创建一个 redraw 函数，稍后会被替换
let selectionRedrawFn: (() => void) | null = null

const selectionModule = useSelection(
  canvas,
  positionsRef,
  state,
  worldToCanvas,
  props,
  () => {
    // 这个函数会被 selectionRedrawFn 替换
    if (selectionRedrawFn) {
      selectionRedrawFn()
    }
  },
  emit
)

const {
  selectionState,
  startSelection,
  updateSelectionArea,
  endSelection,
  clearSelection,
  deleteSelected,
  changeSelectedColor,
  changeSelectedStatus,
  changeSelectedBorderColor,
  drawSelectionRect,
  getSelectedPositions,
} = selectionModule

// 获取 selectedIds 的 ref（用于渲染器）
const selectedIdsRef = toRef(selectionState, 'selectedIds')

// ==================== 渲染逻辑 ====================
const {
  redraw: baseRedraw,
} = useRenderer(
  ctx,
  canvasWidth,
  canvasHeight,
  state,
  props,
  worldToCanvas,
  clear,
  selectedIdsRef
)

// 框选时使用的 redraw（需要实时更新，不使用 RAF 节流）
selectionRedrawFn = () => {
  const startTime = performance.now()
  
  // 根据性能配置决定是否使用虚拟渲染
  const positionsToRender = filterVisiblePositions(
    props.positions,
    state.offsetX,
    state.offsetY,
    canvasWidth.value,
    canvasHeight.value,
    state.scaleX,
    state.scaleY,
    props.defaultW,
    props.defaultH,
    props.layerZOffset
  )
  
  // 绘制位置和选区
  baseRedraw(positionsToRender, (ctx) => {
    // 绘制框选矩形（虚线框）
    if (props.enableSelection && ctx && drawSelectionRect) {
      drawSelectionRect(ctx)
    }
  })
  
  // 记录渲染时间
  recordRenderTime(startTime)
}

// 封装 redraw 函数，使用虚拟渲染过滤可见库位
const redraw = () => {
  const startTime = performance.now()
  
  // 根据性能配置决定是否使用虚拟渲染
  const positionsToRender = filterVisiblePositions(
    props.positions,
    state.offsetX,
    state.offsetY,
    canvasWidth.value,
    canvasHeight.value,
    state.scaleX,
    state.scaleY,
    props.defaultW,
    props.defaultH,
    props.layerZOffset
  )
  
  // 绘制位置和选区
  baseRedraw(positionsToRender, (ctx) => {
    // 绘制框选矩形（如果正在框选）
    if (props.enableSelection && ctx && drawSelectionRect) {
      drawSelectionRect(ctx)
    }
  })
  
  // 记录渲染时间
  recordRenderTime(startTime)
}

// 使用 RAF 优化的 redraw（确保每帧最多渲染一次）
const optimizedRedraw = mergedPerformanceConfig.value.enableRafOptimization 
  ? rafThrottle(redraw) 
  : redraw

// ==================== 交互逻辑 ====================
const {
  getPosUnderPointer,
  bindEvents: bindInteractionEvents,
  unbindEvents: unbindInteractionEvents,
} = useInteraction(
  canvas,
  state,
  props,
  positionsRef,
  worldToCanvas,
  optimizedRedraw,
  emit,
  // 传递选区处理函数
  props.enableSelection ? {
    startSelection,
    updateSelectionArea,
    endSelection
  } : undefined
)

// ==================== 右键菜单 ====================
const {
  contextMenu,
  handleMenuItemClick,
  bindContextMenuEvents,
  hideContextMenu,
} = useContextMenu(wrap, getPosUnderPointer, emit)

// ==================== 业务逻辑 ====================
const {
  updatePositions,
  setStatus,
  selectPosition,
  getSelectedPosition,
  getHoveredPosition,
  getPositionsByStatus,
  getPositionById,
  batchUpdateStatus,
} = useBusiness(state, positionsRef, optimizedRedraw, emit)

// ==================== 视口控制 ====================
const {
  resetView,
  setOffset,
  getOffset,
  panView,
  centerOnArea,
  getScale,
} = useViewport(state, optimizedRedraw)

// ==================== 对齐逻辑 ====================
const {
  applyAlign,
} = useAlign(
  state,
  canvasWidth,
  canvasHeight,
  {
    positions: props.positions,
    width: props.width,
    height: props.height,
    defaultW: props.defaultW,
    defaultH: props.defaultH,
    align: props.align
  }
)

// ==================== 生命周期 ====================
let resizeObserver: ResizeObserver | null = null
let unbindContextMenu: (() => void) | undefined = undefined

onMounted(() => {
  nextTick(() => {
    // 初始化画布
    resizeCanvasToDisplaySize()
    
    // 根据对齐方式设置初始偏移量
    if (props.positions.length > 0) {
      applyAlign()
    }
    
    optimizedRedraw()
    
    // 使用防抖优化 resize 事件
    const debouncedResize = mergedPerformanceConfig.value.enableDebounce
      ? debounce(() => {
          resizeCanvasToDisplaySize()
          optimizedRedraw()
        }, mergedPerformanceConfig.value.debounceDelay)
      : () => {
          resizeCanvasToDisplaySize()
          optimizedRedraw()
        }
    
    // 监听容器大小变化
    resizeObserver = new ResizeObserver(debouncedResize)
    resizeObserver.observe(wrap.value!)
    
    // 绑定交互事件
    bindInteractionEvents()
    
    // 绑定右键菜单事件
    unbindContextMenu = bindContextMenuEvents(canvas, props.enableContextMenu)
    
    // 启动性能监控
    if (props.showPerformanceStats) {
      startFPSMonitoring()
    }
  })
})

onBeforeUnmount(() => {
  // 清理 ResizeObserver
  if (resizeObserver && wrap.value) {
    resizeObserver.unobserve(wrap.value)
  }
  
  // 清理交互事件
  unbindInteractionEvents()
  
  // 清理右键菜单事件
  if (unbindContextMenu) {
    unbindContextMenu()
  }
  
  // 停止性能监控
  stopFPSMonitoring()
})

// ==================== 监听数据变化 ====================
// 使用防抖优化数据变化的重绘
const debouncedRedraw = mergedPerformanceConfig.value.enableDebounce
  ? debounce(optimizedRedraw, mergedPerformanceConfig.value.debounceDelay)
  : optimizedRedraw

watch(() => props.positions, () => debouncedRedraw(), { deep: true })
watch([() => props.width, () => props.height], () => {
  resizeCanvasToDisplaySize()
  optimizedRedraw()
})

// ==================== 工具栏事件处理 ====================
function handleStatusChange(e: Event) {
  const select = e.target as HTMLSelectElement
  const status = select.value
  if (status) {
    changeSelectedStatus(status)
    emit('batch-status-change', { 
      selectedIds: Array.from(selectionState.selectedIds),
      status 
    })
    select.value = '' // 重置选择
  }
}

function handleColorChange(e: Event) {
  const input = e.target as HTMLInputElement
  const color = input.value
  changeSelectedColor(color)
  emit('batch-color-change', {
    selectedIds: Array.from(selectionState.selectedIds),
    color
  })
}

function handleBorderColorChange(e: Event) {
  const input = e.target as HTMLInputElement
  const borderColor = input.value
  changeSelectedBorderColor(borderColor)
}

function handleDelete() {
  if (confirm(`确定要删除选中的 ${selectionState.selectedIds.size} 个库位吗？`)) {
    emit('batch-delete', Array.from(selectionState.selectedIds))
    deleteSelected()
  }
}

// ==================== 暴露的方法 ====================
defineExpose({
  // 渲染相关
  redraw: optimizedRedraw,
  forceRedraw: redraw, // 强制立即重绘（不使用优化）
  
  // 业务逻辑相关
  updatePositions,
  setStatus,
  selectPosition,
  getSelectedPosition,
  getHoveredPosition,
  getPositionsByStatus,
  getPositionById,
  batchUpdateStatus,
  
  // 视口控制相关
  resetView,
  setOffset,
  getOffset,
  panView,
  centerOnArea,
  getScale,
  
  // 右键菜单相关
  hideContextMenu,
  
  // 性能相关
  getPerformanceStats: () => performanceStats.value,
  startFPSMonitoring,
  stopFPSMonitoring,
  
  // 选区相关
  clearSelection,
  getSelectedPositions,
  selectAll: selectionModule.selectAll,
  deleteSelected,
  changeSelectedColor,
  changeSelectedStatus,
  changeSelectedBorderColor,
})
</script>

<style scoped>
.warehouse-map { 
  position: relative;
  width: 100%; 
  height: 100%;
}

.legend { 
  box-shadow: 0 6px 18px rgba(0,0,0,0.08); 
}

.context-menu {
  position: absolute;
  background: #ffffff;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 150px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  pointer-events: auto;
  transform-origin: top left;
}

/* 右键菜单动画 */
.context-menu-fade-enter-active {
  animation: context-menu-in 0.2s ease-out;
}

.context-menu-fade-leave-active {
  animation: context-menu-out 0.15s ease-in;
}

@keyframes context-menu-in {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes context-menu-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.95);
  }
}

.context-menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.context-menu-item:hover {
  background-color: #f5f5f5;
}

.context-menu-item:active {
  background-color: #e8e8e8;
}

/* 性能统计面板 */
.performance-stats {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.85);
  color: #ffffff;
  padding: 12px 16px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  min-width: 200px;
  z-index: 999;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.stats-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  color: #4fc3f7;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  margin: 6px 0;
  line-height: 1.6;
}

.stats-label {
  color: #b0b0b0;
  margin-right: 8px;
}

.stats-value {
  font-weight: bold;
  color: #ffffff;
  text-align: right;
}

.stats-good {
  color: #4caf50;
}

.stats-warning {
  color: #ff9800;
}

/* 批量操作工具栏 */
.batch-toolbar {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 1000;
  font-size: 14px;
  max-width: 90%;
  flex-wrap: wrap;
}

.toolbar-info {
  color: #333;
  font-size: 14px;
  white-space: nowrap;
}

.toolbar-info strong {
  color: #2196F3;
  font-size: 16px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-group label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}

.toolbar-select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  background: #fff;
  transition: border-color 0.2s;
}

.toolbar-select:hover {
  border-color: #2196F3;
}

.toolbar-select:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.toolbar-color {
  width: 36px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.toolbar-color:hover {
  border-color: #2196F3;
}

.toolbar-btn {
  padding: 6px 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.toolbar-btn:hover {
  background: #f5f5f5;
  border-color: #999;
}

.toolbar-btn-danger {
  color: #f44336;
  border-color: #f44336;
}

.toolbar-btn-danger:hover {
  background: #f44336;
  color: #fff;
}

/* 工具栏动画 */
.toolbar-fade-enter-active {
  animation: toolbar-in 0.3s ease-out;
}

.toolbar-fade-leave-active {
  animation: toolbar-out 0.2s ease-in;
}

@keyframes toolbar-in {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes toolbar-out {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
}
</style>
