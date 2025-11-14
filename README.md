# Warehouse Map

一个基于 Vue 3 + TypeScript + Canvas 的高性能仓库地图可视化组件，支持大规模库位展示、交互操作和批量管理。

## ✨ 特性

- 🎨 **丰富的可视化能力**
  - Canvas 高性能渲染
  - 支持自定义颜色、边框、文本样式
  - 3D 层级效果展示
  - 网格背景支持
  - 多行文本标签

- 🖱️ **强大的交互功能**
  - 鼠标悬停高亮
  - 点击和双击事件
  - 画布拖拽平移
  - 右键菜单自定义操作
  - 框选多选功能（Ctrl/Cmd + 拖拽）

- 📦 **批量操作支持**
  - 批量选择库位
  - 批量状态更新
  - 批量颜色修改
  - 批量删除操作

- ⚡ **性能优化**
  - 虚拟渲染（只渲染可见区域）
  - 支持 5000+ 库位流畅展示
  - RAF 帧率优化
  - 防抖节流处理
  - 实时性能监控（FPS、渲染时间）

- 🎯 **灵活的配置**
  - 丰富的 Props 配置选项
  - 自定义右键菜单
  - 视口控制（缩放、平移、居中）
  - 性能配置调优

## 📦 安装

```bash
# 使用 pnpm
pnpm install

# 使用 npm
npm install

# 使用 yarn
yarn install
```

## 🚀 快速开始

### 基础用法

```vue
<template>
  <WarehouseMap
    :positions="positions"
    :width="2000"
    :height="1000"
    @position-click="handleClick"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WarehouseMap from './components/WarehouseMap/index.vue'
import type { Position } from './components/WarehouseMap/types'

const positions = ref<Position[]>([
  {
    id: 1,
    x: 100,
    y: 100,
    w: 100,
    h: 100,
    label: 'A-01',
    status: 'free',
    color: '#e0e0e0'
  },
  {
    id: 2,
    x: 220,
    y: 100,
    w: 100,
    h: 100,
    label: 'A-02',
    status: 'occupied',
    color: '#ffcccc'
  }
])

function handleClick(position: Position) {
  console.log('点击库位:', position)
}
</script>
```

### 完整示例

```vue
<template>
  <WarehouseMap
    :positions="positions"
    :width="1430"
    :height="800"
    :showGrid="false"
    backgroundColor="#f5f5f5"
    defaultPositionColor="#e0e0e0"
    borderColor="#999999"
    borderHoverColor="#333333"
    textColor="#333333"
    :enableContextMenu="true"
    :contextMenuItems="customMenuItems"
    :enableBatchOperations="true"
    :enableSelection="true"
    @position-click="handlePositionClick"
    @position-dblclick="handlePositionDblClick"
    @menu-item-click="handleMenuItemClick"
    @selection-change="handleSelectionChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WarehouseMap from './components/WarehouseMap/index.vue'
import type { Position, ContextMenuItem } from './components/WarehouseMap/types'

const positions = ref<Position[]>([
  // 你的库位数据
])

const customMenuItems: ContextMenuItem[] = [
  { key: 'view', label: '查看详情' },
  { key: 'edit', label: '编辑库位' },
  { key: 'delete', label: '删除库位' }
]

function handlePositionClick(position: Position) {
  console.log('点击:', position)
}

function handlePositionDblClick(position: Position) {
  console.log('双击:', position)
}

function handleMenuItemClick(data: { menuItem: ContextMenuItem; position: Position }) {
  console.log('菜单操作:', data.menuItem.key, data.position)
}

function handleSelectionChange(selectedIds: (string | number)[]) {
  console.log('选择变化:', selectedIds)
}
</script>
```

## 📖 API 文档

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `positions` | `Position[]` | `[]` | 库位数据数组（必填） |
| `width` | `number` | `1000` | 画布宽度（必填） |
| `height` | `number` | `1000` | 画布高度（必填） |
| `backgroundColor` | `string` | `'#ffffff'` | 画布背景色 |
| `defaultPositionColor` | `string` | `'#e0e0e0'` | 默认库位颜色 |
| `borderColor` | `string` | `'#cccccc'` | 边框颜色 |
| `borderHoverColor` | `string` | `'#333333'` | 悬停边框颜色 |
| `textColor` | `string` | `'#333333'` | 文本颜色 |
| `showGrid` | `boolean` | `true` | 是否显示网格 |
| `gridStep` | `number` | `20` | 网格步长 |
| `enablePan` | `boolean` | `true` | 是否启用拖拽平移 |
| `enableContextMenu` | `boolean` | `false` | 是否启用右键菜单 |
| `contextMenuItems` | `ContextMenuItem[]` | `[]` | 自定义右键菜单项 |
| `enableSelection` | `boolean` | `false` | 是否启用框选功能 |
| `enableBatchOperations` | `boolean` | `false` | 是否启用批量操作 |
| `showPerformanceStats` | `boolean` | `false` | 是否显示性能统计 |
| `performanceConfig` | `PerformanceConfig` | - | 性能配置选项 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `position-click` | `position: Position` | 点击库位时触发 |
| `position-dblclick` | `position: Position` | 双击库位时触发 |
| `context-menu` | `{ position: Position, x: number, y: number }` | 右键菜单显示时触发 |
| `menu-item-click` | `{ menuItem: ContextMenuItem, position: Position }` | 点击菜单项时触发 |
| `selection-change` | `selectedIds: (string \| number)[]` | 选择变化时触发 |
| `batch-delete` | `selectedIds: (string \| number)[]` | 批量删除时触发 |
| `batch-color-change` | `{ selectedIds: (string \| number)[], color: string }` | 批量改变颜色时触发 |
| `batch-status-change` | `{ selectedIds: (string \| number)[], status: string }` | 批量改变状态时触发 |
| `positions-updated` | `positions: Position[]` | 库位数据更新时触发 |

### Methods

通过 `ref` 可以访问组件实例方法：

```vue
<template>
  <WarehouseMap ref="mapRef" ... />
</template>

<script setup>
import { ref } from 'vue'

const mapRef = ref()

// 重置视图
mapRef.value?.resetView()

// 更新库位
mapRef.value?.updatePositions(newPositions)

// 设置库位状态
mapRef.value?.setStatus(positionId, 'occupied')

// 选择库位
mapRef.value?.selectPosition(positionId)

// 居中显示区域
mapRef.value?.centerOnArea({ x: 100, y: 100, w: 200, h: 200 })
</script>
```

### Types

```typescript
interface Position {
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

interface ContextMenuItem {
  key: string
  label: string
}

interface PerformanceConfig {
  enableDebounce?: boolean
  debounceDelay?: number
  enableThrottle?: boolean
  throttleDelay?: number
  enableVirtualRender?: boolean
  enableRafOptimization?: boolean
  virtualRenderThreshold?: number
}
```

## 🎨 使用场景

- 📦 仓库管理系统
- 🏭 物流仓储可视化
- 📊 库位状态监控
- 🗺️ 空间布局展示
- 📈 数据分析可视化

## ⚡ 性能优化

组件内置了多种性能优化策略，可以流畅处理大规模数据：

- **虚拟渲染**：只渲染视口内可见的库位
- **帧率优化**：使用 RAF 确保每帧最多渲染一次
- **防抖节流**：对高频事件进行优化处理
- **批量渲染**：减少 Canvas 状态切换开销

```vue
<WarehouseMap
  :positions="positions"
  :show-performance-stats="true"
  :performance-config="{
    enableVirtualRender: true,
    virtualRenderThreshold: 100,
    enableRafOptimization: true
  }"
/>
```

详细性能优化文档请参考：[PERFORMANCE.md](./src/components/WarehouseMap/PERFORMANCE.md)

## 🏗️ 架构设计

组件采用模块化设计，按功能拆分：

- `useCanvas.ts` - 画布管理
- `useRenderer.ts` - 渲染逻辑
- `useInteraction.ts` - 交互处理
- `useContextMenu.ts` - 右键菜单
- `useBusiness.ts` - 业务逻辑
- `useViewport.ts` - 视口控制
- `useSelection.ts` - 选择功能
- `usePerformance.ts` - 性能优化

详细架构文档请参考：[组件 README](./src/components/WarehouseMap/README.md)

## 🛠️ 开发

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 📝 开发指南

### 添加新的库位属性

1. 更新 `types.ts` 中的 `Position` 接口
2. 在 `useRenderer.ts` 中更新绘制逻辑

### 添加新的交互事件

1. 在 `useInteraction.ts` 中添加事件处理函数
2. 在 `index.vue` 中添加对应的 emit 定义

### 性能优化调优

1. 查看 [PERFORMANCE.md](./src/components/WarehouseMap/PERFORMANCE.md)
2. 根据实际数据量调整 `performanceConfig`
3. 使用性能统计面板监控实时性能

## 📚 相关文档

- [组件架构文档](./src/components/WarehouseMap/README.md)
- [性能优化文档](./src/components/WarehouseMap/PERFORMANCE.md)
- [选择功能文档](./src/components/WarehouseMap/SELECTION.md)
- [重构文档](./src/components/WarehouseMap/REFACTORING.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

**版本**: 2.0  
**最后更新**: 2025-01-21
