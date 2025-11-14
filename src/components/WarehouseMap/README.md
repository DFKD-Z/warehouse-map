# WarehouseMap 组件架构说明

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
└── README.md             # 本文档
```

## 🏗️ 架构设计

### 1️⃣ **types.ts** - 类型定义层
定义了所有的 TypeScript 类型接口，包括：
- `Position` - 库位位置数据结构
- `WarehouseMapProps` - 组件 Props 类型
- `ContextMenuItem` - 右键菜单项类型
- `CanvasState` - 画布状态类型
- `ContextMenuState` - 右键菜单状态类型
- `CanvasCoordinate` - 画布坐标类型

### 2️⃣ **useCanvas.ts** - 画布管理逻辑
负责画布的底层管理：
- ✅ 画布初始化和大小调整
- ✅ 设备像素比（DPR）处理
- ✅ 世界坐标 → 画布坐标转换
- ✅ 画布清空操作

**核心方法：**
- `resizeCanvasToDisplaySize()` - 调整画布大小
- `worldToCanvas()` - 坐标转换
- `clear()` - 清空画布

### 3️⃣ **useRenderer.ts** - 渲染逻辑
负责所有的绘制操作：
- ✅ 网格绘制
- ✅ 库位块绘制（支持 3D 层级效果）
- ✅ 文本标签绘制（支持多行）
- ✅ 颜色和边框处理

**核心方法：**
- `drawGrid()` - 绘制网格
- `drawPosition()` - 绘制单个库位
- `drawPositions()` - 绘制所有库位
- `redraw()` - 重绘整个画布

### 4️⃣ **useInteraction.ts** - 交互操作逻辑
负责用户交互事件处理：
- ✅ 鼠标移动、悬停检测
- ✅ 点击、双击事件处理
- ✅ 画布拖拽平移功能
- ✅ 鼠标样式管理

**核心方法：**
- `getPosUnderPointer()` - 获取鼠标下的库位
- `onPointerMove()` - 处理鼠标移动
- `onPointerDown()` - 处理鼠标按下
- `onPointerUp()` - 处理鼠标释放
- `bindEvents()` / `unbindEvents()` - 事件绑定/解绑

### 5️⃣ **useContextMenu.ts** - 右键菜单逻辑
负责右键菜单的管理：
- ✅ 菜单显示位置计算（避免超出容器）
- ✅ 菜单项点击处理
- ✅ 菜单显示/隐藏控制

**核心方法：**
- `showContextMenu()` - 显示菜单
- `hideContextMenu()` - 隐藏菜单
- `handleMenuItemClick()` - 处理菜单项点击
- `bindContextMenuEvents()` - 绑定右键菜单事件

### 6️⃣ **useBusiness.ts** - 业务逻辑
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

### 7️⃣ **useViewport.ts** - 视口控制逻辑
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

### 8️⃣ **usePerformance.ts** - 性能优化逻辑
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

### 9️⃣ **index.vue** - 主组件
组装所有模块，提供统一的对外接口：
- ✅ 组件 Props 和 Emits 定义
- ✅ 生命周期管理
- ✅ 数据监听
- ✅ 方法暴露（defineExpose）
- ✅ 性能优化集成

## 🎯 设计原则

### 单一职责原则（SRP）
每个模块只负责一个明确的功能领域：
- **Canvas** - 画布管理
- **Renderer** - 渲染
- **Interaction** - 交互
- **ContextMenu** - 右键菜单
- **Business** - 业务逻辑
- **Viewport** - 视口控制

### 低耦合高内聚
- 各模块通过明确的接口通信
- 减少模块间的直接依赖
- 便于单独测试和维护

### 可扩展性
- 新功能可以作为新的 Hook 模块添加
- 不影响现有模块
- 易于集成和组合

## 🔧 使用示例

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

<script setup>
import { ref } from 'vue'
import WarehouseMap from './components/WarehouseMap/index.vue'

const positions = ref([
  { id: 1, x: 100, y: 100, w: 100, h: 100, status: 'free', label: 'A-01' },
  { id: 2, x: 220, y: 100, w: 100, h: 100, status: 'occupied', label: 'A-02' }
])

function handleClick(position) {
  console.log('点击库位:', position)
}

function handleMenuClick({ menuItem, position }) {
  console.log('菜单操作:', menuItem.key, position)
}
</script>
```

## 🚀 扩展建议

如果需要添加新功能，建议遵循以下步骤：

1. **评估功能归属** - 确定新功能应该属于哪个模块
2. **创建新 Hook** - 如果是全新的功能领域，创建新的 `useXxx.ts`
3. **更新类型定义** - 在 `types.ts` 中添加相关类型
4. **集成到主组件** - 在 `index.vue` 中引入和使用
5. **暴露必要接口** - 通过 `defineExpose` 暴露给外部

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
1. 查看 [PERFORMANCE.md](./PERFORMANCE.md) 了解详细指南
2. 根据实际数据量调整 `performanceConfig`
3. 使用性能统计面板监控实时性能
4. 参考 `examples/PerformanceExample.vue` 示例

## ⚡ 性能优化（已实现）

组件已内置多种性能优化策略：

### 已实现的优化
- ✅ **虚拟渲染**：只渲染视口内可见的库位，支持 5000+ 库位
- ✅ **帧率优化**：使用 RAF 确保每帧最多渲染一次
- ✅ **防抖节流**：对高频事件进行防抖和节流处理
- ✅ **批量渲染**：减少 Canvas 状态切换开销
- ✅ **性能监控**：实时 FPS、渲染时间等统计

### 使用示例

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

详细文档请参考：[PERFORMANCE.md](./PERFORMANCE.md)

## 📊 模块依赖关系

```
index.vue (主组件)
├── useCanvas.ts (画布管理)
├── useRenderer.ts (依赖 useCanvas)
├── useInteraction.ts (依赖 useCanvas, useRenderer)
├── useContextMenu.ts (依赖 useInteraction)
├── useBusiness.ts (依赖 useRenderer)
└── useViewport.ts (依赖 useRenderer)
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

---

**版本**: 2.0  
**最后更新**: 2025-11-14  
**维护者**: Development Team

