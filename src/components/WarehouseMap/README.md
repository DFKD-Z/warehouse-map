# WarehouseMap 组件文档

一个基于 Vue 3 + TypeScript + Canvas 的高性能仓库地图可视化组件，支持大规模库位展示、交互操作和批量管理。

## 📁 文件结构

```
WarehouseMap/
├── index.vue              # 主组件（组装各个模块）
├── types.ts              # TypeScript 类型定义
├── useCanvas.ts          # 画布管理逻辑
├── useRenderer.ts        # 渲染逻辑
├── useInteraction.ts     # 交互操作逻辑
├── useContextMenu.ts     # 右键菜单逻辑
├── useBusiness.ts        # 业务逻辑
├── useViewport.ts        # 视口控制逻辑
├── useSelection.ts       # 框选功能逻辑
├── usePerformance.ts     # 性能优化逻辑
├── useAlign.ts           # 对齐逻辑
├── exports.ts            # 统一导出文件
├── examples/             # 示例代码
│   └── PerformanceExample.vue
└── README.md             # 本文档
```

## 🏗️ 架构设计

### 模块化架构

组件采用模块化设计，每个模块负责单一职责：

#### 1️⃣ **types.ts** - 类型定义层
定义了所有的 TypeScript 类型接口：
- `Position` - 库位位置数据结构
- `WarehouseMapProps` - 组件 Props 类型
- `ContextMenuItem` - 右键菜单项类型
- `PerformanceConfig` - 性能配置类型
- `SelectionState` - 选择状态类型
- `CanvasState` - 画布状态类型
- 等其他类型定义

#### 2️⃣ **useCanvas.ts** - 画布管理逻辑
负责画布的底层管理：
- ✅ 画布初始化和大小调整
- ✅ 设备像素比（DPR）处理
- ✅ 世界坐标 → 画布坐标转换
- ✅ 画布清空操作

**核心方法：**
- `resizeCanvasToDisplaySize()` - 调整画布大小
- `worldToCanvas()` - 坐标转换
- `clear()` - 清空画布

#### 3️⃣ **useRenderer.ts** - 渲染逻辑
负责所有的绘制操作：
- ✅ 网格绘制
- ✅ 库位块绘制（支持 3D 层级效果）
- ✅ 文本标签绘制（支持多行）
- ✅ 选中高亮渲染
- ✅ 框选矩形绘制
- ✅ 颜色和边框处理

**核心方法：**
- `drawGrid()` - 绘制网格
- `drawPosition()` - 绘制单个库位
- `drawPositions()` - 绘制所有库位
- `drawSelectionRect()` - 绘制选择矩形
- `redraw()` - 重绘整个画布

#### 4️⃣ **useInteraction.ts** - 交互操作逻辑
负责用户交互事件处理：
- ✅ 鼠标移动、悬停检测
- ✅ 点击、双击事件处理
- ✅ 画布拖拽平移功能
- ✅ 框选交互（Ctrl/Cmd + 拖拽）
- ✅ 鼠标样式管理

**核心方法：**
- `getPosUnderPointer()` - 获取鼠标下的库位
- `onPointerMove()` - 处理鼠标移动
- `onPointerDown()` - 处理鼠标按下
- `onPointerUp()` - 处理鼠标释放
- `bindEvents()` / `unbindEvents()` - 事件绑定/解绑

#### 5️⃣ **useContextMenu.ts** - 右键菜单逻辑
负责右键菜单的管理：
- ✅ 菜单显示位置计算（避免超出容器）
- ✅ 菜单项点击处理
- ✅ 菜单显示/隐藏控制

**核心方法：**
- `showContextMenu()` - 显示菜单
- `hideContextMenu()` - 隐藏菜单
- `handleMenuItemClick()` - 处理菜单项点击
- `bindContextMenuEvents()` - 绑定右键菜单事件

#### 6️⃣ **useBusiness.ts** - 业务逻辑
负责库位相关的业务操作：
- ✅ 库位数据更新
- ✅ 库位状态管理
- ✅ 库位选择功能
- ✅ 库位查询和筛选
- ✅ 批量操作

**核心方法：**
- `updatePositions()` - 更新所有库位
- `setStatus()` - 设置库位状态
- `selectPosition()` - 选择库位
- `getPositionById()` - 根据 ID 查询库位
- `getPositionsByStatus()` - 根据状态筛选库位
- `batchUpdateStatus()` - 批量更新状态

#### 7️⃣ **useViewport.ts** - 视口控制逻辑
负责视图的缩放和平移：
- ✅ 视图偏移控制
- ✅ 视图重置
- ✅ 区域居中显示
- ✅ 缩放比例管理

**核心方法：**
- `resetView()` - 重置视图
- `setOffset()` - 设置偏移量
- `getOffset()` - 获取当前偏移
- `panView()` - 平移视图
- `centerOnArea()` - 居中显示指定区域
- `getScale()` - 获取缩放比例

#### 8️⃣ **useSelection.ts** - 框选功能逻辑
负责框选和批量操作：
- ✅ 框选矩形计算
- ✅ 选中库位检测（矩形相交算法）
- ✅ 选择状态管理
- ✅ 批量操作处理
- ✅ 选择工具方法

**核心方法：**
- `startSelection()` - 开始框选
- `updateSelection()` - 更新框选矩形
- `endSelection()` - 结束框选
- `clearSelection()` - 清空选择
- `selectAll()` - 选择全部
- `getSelectedPositions()` - 获取选中的库位
- `changeSelectedColor()` - 修改选中库位颜色
- `changeSelectedStatus()` - 修改选中库位状态
- `deleteSelected()` - 删除选中的库位

#### 9️⃣ **usePerformance.ts** - 性能优化逻辑
负责性能优化和监控：
- ✅ 防抖、节流、RAF 优化
- ✅ 虚拟渲染（只渲染可见区域）
- ✅ FPS 监控
- ✅ 渲染时间统计
- ✅ 批处理和缓存

**核心方法：**
- `debounce()` - 防抖函数
- `throttle()` - 节流函数
- `rafThrottle()` - RAF 节流
- `filterVisiblePositions()` - 过滤可见库位
- `startFPSMonitoring()` - 启动 FPS 监控
- `stopFPSMonitoring()` - 停止 FPS 监控

#### 🔟 **useAlign.ts** - 对齐逻辑
负责初始视图对齐：
- ✅ 计算库位边界框
- ✅ 根据对齐方式计算初始偏移量
- ✅ 支持多种对齐方式（center、left-top、left-bottom、right-top、right-bottom）

**核心方法：**
- `calculateBounds()` - 计算所有库位的边界框
- `applyAlign()` - 根据配置的对齐方式应用初始偏移量

#### 1️⃣1️⃣ **index.vue** - 主组件
组装所有模块，提供统一的对外接口：
- ✅ 组件 Props 和 Emits 定义
- ✅ 生命周期管理
- ✅ 数据监听
- ✅ 方法暴露（defineExpose）
- ✅ 性能优化集成
- ✅ 批量操作工具栏

## 🎯 设计原则

### 单一职责原则（SRP）
每个模块只负责一个明确的功能领域，便于维护和测试。

### 低耦合高内聚
- 各模块通过明确的接口通信
- 减少模块间的直接依赖
- 便于单独测试和维护

### 可扩展性
- 新功能可以作为新的 Hook 模块添加
- 不影响现有模块
- 易于集成和组合

## 🖱️ 核心功能

### 1. 基础交互

- **鼠标悬停**：自动高亮库位边框
- **单击库位**：触发 `position-click` 事件
- **双击库位**：触发 `position-dblclick` 事件
- **拖拽平移**：鼠标拖动画布进行平移
- **右键菜单**：右键点击库位显示自定义菜单

### 2. 框选功能 ✨

**操作方式：**
- 按住 `Ctrl` (Windows) 或 `Cmd` (Mac) 键
- 鼠标变成十字光标 ✚
- 拖动鼠标框选多个库位
- 选中的库位显示蓝色高亮边框

**特性：**
- 半透明蓝色选择矩形
- 实时检测框选范围内的库位
- 支持选择状态持久化
- 与拖拽平移智能切换

### 3. 批量操作 ✨

**批量操作工具栏：**
当选中库位后，顶部自动显示操作工具栏：

- 📊 **修改状态** - 下拉选择（空闲/占用/预留/损坏）
- 🎨 **修改颜色** - 颜色选择器
- 🖼️ **修改边框** - 边框颜色选择器
- 🗑️ **批量删除** - 带确认对话框
- ✖️ **取消选择** - 清空选择

**编程式操作：**
```javascript
// 清空选择
mapRef.value?.clearSelection()

// 选择全部
mapRef.value?.selectAll()

// 获取选中的库位
const selected = mapRef.value?.getSelectedPositions()

// 批量修改颜色
mapRef.value?.changeSelectedColor('#ff6b6b')

// 批量修改状态
mapRef.value?.changeSelectedStatus('occupied')

// 批量删除
mapRef.value?.deleteSelected()
```

### 4. 性能优化 ⚡

#### 虚拟渲染
只渲染视口内可见的库位，大幅提升大规模数据渲染性能。

**特性：**
- 自动检测视口范围
- 添加边界缓冲区避免闪烁
- 可配置阈值（默认 100 个库位以上启用）

**性能提升：**
- 支持 5000+ 库位流畅展示
- 渲染时间从 O(n) 降低到 O(visible_n)
- 大规模数据集性能提升 5-10 倍

#### 帧率优化
使用 `requestAnimationFrame` 确保每帧最多渲染一次，保持 60 FPS 流畅体验。

#### 防抖节流
- **防抖**：窗口 resize、数据更新等操作延迟执行
- **节流**：鼠标移动、滚动等高频事件限制执行频率

#### 性能监控
实时显示性能统计面板：
- 📊 **FPS**（帧率）- 带颜色编码（绿色≥60/白色30-60/橙色<30）
- 🔄 **渲染次数** - 累计渲染次数
- 👁️ **可见库位** - 当前渲染的库位数 / 总库位数
- ⏱️ **渲染时间** - 单次渲染耗时（毫秒）

## 🔧 使用示例

### 基础使用

```vue
<template>
  <WarehouseMap
    :positions="positions"
    :width="2000"
    :height="2000"
    :enable-pan="true"
    :enable-context-menu="true"
    @position-click="handleClick"
    @menu-item-click="handleMenuClick"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WarehouseMap from './components/WarehouseMap/index.vue'
import type { Position, ContextMenuItem } from './components/WarehouseMap/types'

const positions = ref<Position[]>([
  { id: 1, x: 100, y: 100, w: 100, h: 100, status: 'free', label: 'A-01' },
  { id: 2, x: 220, y: 100, w: 100, h: 100, status: 'occupied', label: 'A-02' }
])

const menuItems: ContextMenuItem[] = [
  { key: 'view', label: '查看详情' },
  { key: 'edit', label: '编辑库位' }
]

function handleClick(position: Position) {
  console.log('点击库位:', position)
}

function handleMenuClick({ menuItem, position }: { menuItem: ContextMenuItem; position: Position }) {
  console.log('菜单操作:', menuItem.key, position)
}
</script>
```

### 框选与批量操作

```vue
<template>
  <div>
    <div class="tip">
      💡 提示：按住 <kbd>Ctrl</kbd> 或 <kbd>Cmd</kbd> + 鼠标拖动进行框选
    </div>
    
    <WarehouseMap
      ref="mapRef"
      :positions="positions"
      :width="2000"
      :height="1000"
      :enable-selection="true"
      :enable-batch-operations="true"
      @selection-change="handleSelectionChange"
      @batch-delete="handleBatchDelete"
      @batch-color-change="handleBatchColorChange"
      @batch-status-change="handleBatchStatusChange"
      @positions-updated="handlePositionsUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WarehouseMap from './components/WarehouseMap/index.vue'
import type { Position } from './components/WarehouseMap/types'

const mapRef = ref()
const positions = ref<Position[]>([/* 库位数据 */])

// 选择变化
function handleSelectionChange(selectedIds: (string | number)[]) {
  console.log('已选中:', selectedIds.length, '个库位')
}

// 批量删除
function handleBatchDelete(selectedIds: (string | number)[]) {
  console.log('删除:', selectedIds)
}

// 批量改变颜色
function handleBatchColorChange({ selectedIds, color }: { selectedIds: (string | number)[], color: string }) {
  console.log('改变颜色:', color)
}

// 批量改变状态
function handleBatchStatusChange({ selectedIds, status }: { selectedIds: (string | number)[], status: string }) {
  console.log('改变状态:', status)
}

// 数据更新（必须！）
function handlePositionsUpdated(newPositions: Position[]) {
  positions.value = newPositions
}
</script>
```

### 对齐方式配置

```vue
<template>
  <WarehouseMap
    :positions="positions"
    :width="2000"
    :height="1000"
    align="center"
  />
</template>
```

**对齐选项：**
- `center` - 居中显示（默认）
- `left-top` - 左上对齐
- `left-bottom` - 左下对齐
- `right-top` - 右上对齐
- `right-bottom` - 右下对齐

### 性能优化配置

```vue
<template>
  <WarehouseMap
    :positions="positions"
    :show-performance-stats="true"
    :performance-config="{
      enableVirtualRender: true,
      virtualRenderThreshold: 100,
      enableRafOptimization: true,
      enableDebounce: true,
      debounceDelay: 150
    }"
  />
</template>
```

### 性能配置选项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `enableDebounce` | boolean | true | 启用防抖 |
| `debounceDelay` | number | 150 | 防抖延迟（毫秒） |
| `enableThrottle` | boolean | true | 启用节流 |
| `throttleDelay` | number | 16 | 节流延迟（毫秒） |
| `enableVirtualRender` | boolean | true | 启用虚拟渲染 |
| `enableRafOptimization` | boolean | true | 启用帧率优化 |
| `virtualRenderThreshold` | number | 100 | 虚拟渲染阈值 |

### 不同规模数据的推荐配置

#### 小规模数据（< 100 个库位）
```typescript
{
  enableVirtualRender: false,
  enableRafOptimization: true,
  debounceDelay: 100
}
```

#### 中等规模数据（100-500 个库位）
```typescript
{
  enableVirtualRender: true,
  virtualRenderThreshold: 100,
  enableRafOptimization: true,
  debounceDelay: 150
}
```

#### 大规模数据（500-2000 个库位）
```typescript
{
  enableVirtualRender: true,
  virtualRenderThreshold: 50,
  enableRafOptimization: true,
  debounceDelay: 200,
  throttleDelay: 32
}
```

#### 超大规模数据（> 2000 个库位）
```typescript
{
  enableVirtualRender: true,
  virtualRenderThreshold: 30,
  enableRafOptimization: true,
  debounceDelay: 300,
  throttleDelay: 48
}
```

## 📊 性能测试结果

### 测试环境
- CPU: M1 Pro
- 浏览器: Chrome 120
- 分辨率: 1920x1080

### 测试数据

| 库位数量 | 虚拟渲染 | 渲染时间 | FPS | 可见库位 |
|---------|---------|---------|-----|---------|
| 50 | 关闭 | 2ms | 60 | 50 |
| 100 | 关闭 | 4ms | 60 | 100 |
| 100 | 开启 | 2ms | 60 | 30-50 |
| 500 | 开启 | 8ms | 60 | 50-100 |
| 1000 | 开启 | 12ms | 55 | 80-150 |
| 2000 | 开启 | 20ms | 45 | 100-200 |
| 5000 | 开启 | 35ms | 28 | 150-300 |

**结论：**
- 虚拟渲染对大规模数据集效果显著
- 合理配置可支持 5000+ 库位
- 保持良好用户体验

## 🔄 模块依赖关系

```
index.vue (主组件)
├── useCanvas.ts (画布管理)
├── useRenderer.ts (依赖 useCanvas)
├── useInteraction.ts (依赖 useCanvas, useRenderer)
├── useContextMenu.ts (依赖 useInteraction)
├── useBusiness.ts (依赖 useRenderer)
├── useViewport.ts (依赖 useRenderer)
├── useSelection.ts (依赖 useCanvas, useRenderer)
├── usePerformance.ts (独立工具模块)
└── useAlign.ts (依赖 useCanvas, state)
```

## 🔄 数据流

```
用户交互 → useInteraction → emit 事件 → 父组件
                ↓
            state 更新
                ↓
            useRenderer.redraw()
                ↓
            画布重绘
```

## 📝 维护指南

### 添加新的库位属性

1. 更新 `types.ts` 中的 `Position` 接口
2. 在 `useRenderer.ts` 中更新绘制逻辑

### 添加新的交互事件

1. 在 `useInteraction.ts` 中添加事件处理函数
2. 在 `index.vue` 中添加对应的 emit 定义

### 添加新的业务方法

1. 在 `useBusiness.ts` 中实现业务逻辑
2. 在 `index.vue` 的 `defineExpose` 中暴露方法

### 性能优化调优

1. 根据实际数据量调整 `performanceConfig`
2. 使用性能统计面板监控实时性能
3. 参考 `examples/PerformanceExample.vue` 示例

## 🚀 扩展建议

如果需要添加新功能，建议遵循以下步骤：

1. **评估功能归属** - 确定新功能应该属于哪个模块
2. **创建新 Hook** - 如果是全新的功能领域，创建新的 `useXxx.ts`
3. **更新类型定义** - 在 `types.ts` 中添加相关类型
4. **集成到主组件** - 在 `index.vue` 中引入和使用
5. **暴露必要接口** - 通过 `defineExpose` 暴露给外部

## 📚 相关文档

- [主项目 README](../../../README.md) - 项目整体说明
- [构建和发布指南](../../../BUILD.md) - npm 包构建指南

## 🎓 最佳实践

### 1. 数据优化
```typescript
// ✅ 好的做法：只传递必要的数据
const positions = [
  { id: 1, x: 100, y: 100, w: 100, h: 100, status: 'free' }
]

// ❌ 避免：传递过多不必要的数据
const positions = [
  { 
    id: 1, 
    x: 100, 
    y: 100, 
    w: 100, 
    h: 100, 
    status: 'free',
    // 避免存储大量额外数据
    history: [...],
    metadata: {...}
  }
]
```

### 2. 批量更新
```typescript
// ✅ 好的做法：批量更新
mapRef.value?.batchUpdateStatus([1, 2, 3, 4, 5], 'occupied')

// ❌ 避免：多次单独更新
mapRef.value?.setStatus(1, 'occupied')
mapRef.value?.setStatus(2, 'occupied')
// ... 会触发多次重绘
```

### 3. 事件处理
```typescript
// ✅ 好的做法：在外部使用防抖/节流
import { debounce } from './components/WarehouseMap/exports'

const handleSearch = debounce((keyword) => {
  // 搜索逻辑
}, 300)
```

## 🔍 性能问题排查

### 问题 1: FPS 低于 30

**可能原因：**
- 库位数量过多
- 虚拟渲染未启用
- 渲染时间过长

**解决方案：**
1. 启用虚拟渲染
2. 降低虚拟渲染阈值
3. 增加防抖/节流延迟
4. 简化库位样式

### 问题 2: 拖动不流畅

**可能原因：**
- RAF 优化未启用
- 防抖延迟过长
- 可见库位过多

**解决方案：**
1. 启用 RAF 优化
2. 调整防抖延迟
3. 降低虚拟渲染阈值

## 📈 版本历史

### v2.2 - 框选与批量操作
- ✅ 新增框选功能（Ctrl/Cmd + 拖拽）
- ✅ 新增批量操作工具栏
- ✅ 支持批量修改状态、颜色、边框
- ✅ 支持批量删除

### v2.1 - 性能优化
- ✅ 实现虚拟渲染（支持 5000+ 库位）
- ✅ 添加性能监控面板
- ✅ 优化事件处理（防抖、节流、RAF）
- ✅ 修复高度显示问题

### v2.0 - 重构
- ✅ 模块化架构重构
- ✅ 完整的 TypeScript 支持
- ✅ 增强的业务方法
- ✅ 统一的导出接口

---

**版本**: 2.2  
**最后更新**: 2025-11-14  
**维护者**: DF-61
