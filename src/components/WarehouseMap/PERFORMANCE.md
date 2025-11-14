# ⚡ 性能优化指南

## 📋 概述

WarehouseMap 组件内置了多种性能优化策略，可以处理大规模库位数据，确保流畅的用户体验。

## 🚀 优化策略

### 1. **虚拟渲染（Virtual Rendering）**

只渲染视口内可见的库位，大幅减少绘制开销。

**工作原理：**
- 计算当前视口范围
- 过滤出可见区域内的库位
- 仅渲染这些库位
- 添加边界缓冲区避免闪烁

**适用场景：**
- 库位数量 > 100 个（可配置阈值）
- 用户频繁拖动视口

**性能提升：**
- 渲染时间从 O(n) 降低到 O(visible_n)
- 大规模数据集（1000+ 库位）性能提升 5-10 倍

### 2. **帧率优化（RAF Throttling）**

使用 `requestAnimationFrame` 确保每帧最多渲染一次。

**工作原理：**
- 将多个渲染请求合并到一帧内
- 使用最新的参数执行渲染
- 避免重复渲染

**适用场景：**
- 快速拖动画布
- 连续调整数据
- 高频交互操作

**性能提升：**
- 防止帧率掉落
- 保持 60 FPS 流畅体验

### 3. **防抖（Debounce）**

延迟执行频繁触发的操作，只执行最后一次。

**工作原理：**
- 设置延迟时间（默认 150ms）
- 重置定时器
- 只执行最后一次操作

**应用位置：**
- 窗口 resize 事件
- 数据更新 watch

**性能提升：**
- 减少不必要的渲染
- 降低 CPU 占用

### 4. **节流（Throttle）**

限制函数执行频率，固定时间间隔内最多执行一次。

**工作原理：**
- 记录上次执行时间
- 检查时间间隔
- 达到间隔才执行

**应用位置：**
- 鼠标移动事件
- 滚动事件

**性能提升：**
- 控制执行频率
- 平衡响应性和性能

### 5. **批量渲染优化**

在绘制多个库位时减少状态切换。

**工作原理：**
- 保存 Canvas 上下文状态
- 批量绘制所有库位
- 恢复上下文状态

**性能提升：**
- 减少状态切换开销
- 提升批量绘制效率

## 🔧 配置选项

### 默认配置

```typescript
const defaultConfig: PerformanceConfig = {
  enableDebounce: true,          // 启用防抖
  debounceDelay: 150,            // 防抖延迟（毫秒）
  enableThrottle: true,          // 启用节流
  throttleDelay: 16,             // 节流延迟（~60fps）
  enableVirtualRender: true,     // 启用虚拟渲染
  enableRafOptimization: true,   // 启用帧率优化
  virtualRenderThreshold: 100,   // 虚拟渲染阈值
}
```

### 自定义配置

```vue
<template>
  <WarehouseMap
    :positions="positions"
    :performance-config="{
      enableVirtualRender: true,
      virtualRenderThreshold: 50,
      debounceDelay: 200,
      enableRafOptimization: true
    }"
  />
</template>
```

## 📊 性能监控

### 启用性能统计

```vue
<template>
  <WarehouseMap
    :positions="positions"
    :show-performance-stats="true"
  />
</template>
```

### 统计指标

性能统计面板显示以下指标：

| 指标 | 说明 | 正常范围 |
|------|------|----------|
| **FPS** | 帧率（每秒帧数） | 60 fps（绿色）<br>30-60 fps（白色）<br>< 30 fps（橙色警告） |
| **渲染次数** | 累计渲染次数 | - |
| **可见库位** | 当前渲染的库位数 / 总库位数 | - |
| **渲染时间** | 单次渲染耗时（毫秒） | < 16ms（60fps）<br>< 33ms（30fps） |

### 编程访问

```vue
<script setup>
import { ref } from 'vue'

const mapRef = ref()

// 获取性能统计
function getStats() {
  const stats = mapRef.value?.getPerformanceStats()
  console.log('FPS:', stats.fps)
  console.log('渲染时间:', stats.lastRenderTime)
  console.log('可见库位:', stats.visiblePositions)
}

// 启动/停止 FPS 监控
mapRef.value?.startFPSMonitoring()
mapRef.value?.stopFPSMonitoring()
</script>
```

## 🎯 性能优化场景

### 场景 1: 小规模数据（< 100 个库位）

**推荐配置：**
```typescript
{
  enableVirtualRender: false,    // 不需要虚拟渲染
  enableRafOptimization: true,   // 保持帧率优化
  enableDebounce: true,
  debounceDelay: 100,
}
```

**性能特点：**
- 渲染时间 < 5ms
- 60 FPS 稳定
- 内存占用低

### 场景 2: 中等规模数据（100-500 个库位）

**推荐配置：**
```typescript
{
  enableVirtualRender: true,
  virtualRenderThreshold: 100,
  enableRafOptimization: true,
  enableDebounce: true,
  debounceDelay: 150,
}
```

**性能特点：**
- 虚拟渲染生效
- 渲染时间 5-15ms
- 可见库位约 50-200 个
- 60 FPS 大部分情况稳定

### 场景 3: 大规模数据（500-2000 个库位）

**推荐配置：**
```typescript
{
  enableVirtualRender: true,
  virtualRenderThreshold: 50,    // 降低阈值
  enableRafOptimization: true,
  enableDebounce: true,
  debounceDelay: 200,            // 增加防抖延迟
  throttleDelay: 32,             // 降低到 30fps
}
```

**性能特点：**
- 虚拟渲染显著提升性能
- 渲染时间保持在 15-30ms
- 可见库位约 100-300 个
- 30-60 FPS

### 场景 4: 超大规模数据（> 2000 个库位）

**推荐配置：**
```typescript
{
  enableVirtualRender: true,
  virtualRenderThreshold: 30,    // 更低阈值
  enableRafOptimization: true,
  enableDebounce: true,
  debounceDelay: 300,            // 更长防抖
  throttleDelay: 48,             // 降低到 20fps
}
```

**性能特点：**
- 虚拟渲染必须启用
- 渲染时间 20-50ms
- 可见库位约 200-500 个
- 20-30 FPS

## 💡 性能优化建议

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
    metadata: {...},
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
mapRef.value?.setStatus(3, 'occupied')
// ... 会触发多次重绘
```

### 3. 事件处理

```typescript
// ✅ 好的做法：在外部使用防抖/节流
import { debounce } from './components/WarehouseMap/exports'

const handleSearch = debounce((keyword) => {
  // 搜索逻辑
}, 300)

// ❌ 避免：频繁触发重绘
watch(searchKeyword, () => {
  // 直接触发，无防抖
  filterPositions()
})
```

### 4. 条件渲染

```typescript
// ✅ 好的做法：根据数据量动态调整配置
const performanceConfig = computed(() => ({
  enableVirtualRender: positions.value.length > 100,
  virtualRenderThreshold: Math.max(50, positions.value.length * 0.1)
}))
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

### 问题 3: 内存占用高

**可能原因：**
- 数据量过大
- 历史记录未清理
- 事件监听未解绑

**解决方案：**
1. 精简数据结构
2. 定期清理不需要的数据
3. 确保组件销毁时清理资源

## 📈 性能测试结果

### 测试环境
- CPU: M1 Pro
- 浏览器: Chrome 120
- 分辨率: 1920x1080

### 测试结果

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

## 🛠️ 工具函数

组件导出了常用的性能优化工具函数：

```typescript
import { debounce, throttle, rafThrottle } from './components/WarehouseMap/exports'

// 防抖
const debouncedFn = debounce(() => {
  console.log('执行')
}, 300)

// 节流
const throttledFn = throttle(() => {
  console.log('执行')
}, 100)

// RAF 节流
const rafThrottledFn = rafThrottle(() => {
  console.log('执行')
})
```

## 📚 最佳实践

1. **合理配置阈值**：根据实际数据量调整虚拟渲染阈值
2. **监控性能**：开发时开启性能统计面板
3. **批量操作**：优先使用批量更新方法
4. **延迟加载**：大量数据分批加载
5. **定期清理**：及时清理不需要的数据和监听器

---

**文档版本**: 1.0  
**最后更新**: 2025-11-14  
**维护者**: Development Team

