# 📦 框选与批量操作功能指南

## 🎯 功能概述

组件现在支持强大的框选和批量操作功能：
- ✅ 按住 **Ctrl/Cmd + 拖动鼠标**进行框选
- ✅ 选中后自动显示批量操作工具栏
- ✅ 批量删除库位
- ✅ 批量修改颜色
- ✅ 批量修改状态
- ✅ 批量修改边框颜色
- ✅ 实时更新配置数据

## 🚀 快速开始

### 基础使用

```vue
<template>
  <WarehouseMap
    :positions="positions"
    :enable-batch-operations="true"
    :enable-selection="true"
    @selection-change="handleSelectionChange"
    @batch-delete="handleBatchDelete"
    @batch-color-change="handleBatchColorChange"
    @batch-status-change="handleBatchStatusChange"
    @positions-updated="handlePositionsUpdated"
  />
</template>

<script setup>
import { ref } from 'vue'
import WarehouseMap from './components/WarehouseMap/index.vue'

const positions = ref([...])

// 选择变化
function handleSelectionChange(selectedIds) {
  console.log('已选中:', selectedIds)
}

// 批量删除
function handleBatchDelete(selectedIds) {
  console.log('删除:', selectedIds)
}

// 批量改变颜色
function handleBatchColorChange({ selectedIds, color }) {
  console.log('改变颜色:', selectedIds, color)
}

// 批量改变状态
function handleBatchStatusChange({ selectedIds, status }) {
  console.log('改变状态:', selectedIds, status)
}

// 监听数据更新
function handlePositionsUpdated(newPositions) {
  positions.value = newPositions
  console.log('数据已更新')
}
</script>
```

## 🎨 使用说明

### 1. 框选操作

**开始框选：**
1. 按住键盘上的 `Ctrl` (Windows) 或 `Cmd` (Mac) 键
2. 鼠标会变成十字光标 ✚
3. 按住鼠标左键并拖动
4. 框选区域会以半透明蓝色高亮显示
5. 松开鼠标完成选择

**选中效果：**
- 选中的库位会有**蓝色边框**高亮
- 边框粗细增加，更明显
- 外围会有淡蓝色光晕效果

### 2. 批量操作工具栏

选中库位后，顶部会自动显示操作工具栏：

```
┌─────────────────────────────────────────────────────┐
│ 已选中 5 个库位  [状态▼] [颜色] [边框] [删除] [取消选择] │
└─────────────────────────────────────────────────────┘
```

**工具栏功能：**

#### 📊 修改状态
- 下拉选择：空闲 / 占用 / 预留 / 损坏
- 立即应用到所有选中的库位
- 自动更新数据源

#### 🎨 修改颜色
- 点击颜色选择器
- 选择任意颜色
- 所有选中库位的填充色立即改变

#### 🖼️ 修改边框
- 点击边框颜色选择器
- 选择边框颜色
- 所有选中库位的边框立即改变

#### 🗑️ 批量删除
- 点击删除按钮
- 弹出确认对话框
- 确认后删除所有选中的库位
- 自动更新数据源

#### ✖️ 取消选择
- 清空所有选择
- 工具栏自动隐藏

### 3. 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + 拖动` | 框选库位 |
| `Esc` | 取消选择 (未来支持) |

## 🔧 配置选项

### Props

```typescript
{
  // 是否启用批量操作
  enableBatchOperations?: boolean  // 默认: true
  
  // 是否启用框选
  enableSelection?: boolean        // 默认: true
}
```

### Events

```typescript
// 选择变化事件
@selection-change="(selectedIds: (string | number)[]) => void"

// 批量删除事件
@batch-delete="(selectedIds: (string | number)[]) => void"

// 批量改变颜色事件
@batch-color-change="(data: { 
  selectedIds: (string | number)[], 
  color: string 
}) => void"

// 批量改变状态事件
@batch-status-change="(data: { 
  selectedIds: (string | number)[], 
  status: string 
}) => void"

// 数据更新事件（重要！）
@positions-updated="(newPositions: Position[]) => void"
```

## 💡 最佳实践

### 1. 监听 positions-updated 事件

**必须监听此事件来同步数据：**

```vue
<script setup>
const positions = ref([...])

// 正确做法：监听并更新
function handlePositionsUpdated(newPositions) {
  positions.value = newPositions
}
</script>

<template>
  <WarehouseMap
    :positions="positions"
    @positions-updated="handlePositionsUpdated"
  />
</template>
```

### 2. 自定义批量操作

除了使用内置工具栏，你还可以通过 ref 调用方法：

```vue
<script setup>
const mapRef = ref()

// 选择全部
function selectAll() {
  mapRef.value?.selectAll()
}

// 清空选择
function clearSelection() {
  mapRef.value?.clearSelection()
}

// 获取选中的库位
function getSelected() {
  const selected = mapRef.value?.getSelectedPositions()
  console.log(selected)
}

// 批量修改颜色
function changeColor() {
  mapRef.value?.changeSelectedColor('#ff0000')
}

// 批量修改状态
function changeStatus() {
  mapRef.value?.changeSelectedStatus('occupied')
}

// 批量删除
function deleteSelected() {
  mapRef.value?.deleteSelected()
}
</script>
```

### 3. 禁用批量操作

如果你只想要框选而不显示工具栏：

```vue
<WarehouseMap
  :enable-selection="true"
  :enable-batch-operations="false"
  @selection-change="handleSelectionChange"
/>
```

### 4. 完全禁用框选

```vue
<WarehouseMap
  :enable-selection="false"
/>
```

## 📝 API 参考

### 暴露的方法

通过 `ref` 可以访问以下方法：

```typescript
// 选区相关
clearSelection(): void                              // 清空选择
getSelectedPositions(): Position[]                  // 获取选中的库位
selectAll(): void                                   // 选择全部

// 批量操作
deleteSelected(): void                              // 删除选中的库位
changeSelectedColor(color: string): void            // 修改选中库位的颜色
changeSelectedStatus(status: string): void          // 修改选中库位的状态
changeSelectedBorderColor(borderColor: string): void // 修改选中库位的边框颜色
```

### 使用示例

```vue
<template>
  <div>
    <button @click="() => mapRef?.selectAll()">全选</button>
    <button @click="() => mapRef?.clearSelection()">取消</button>
    <button @click="customBatchOperation">自定义操作</button>
    
    <WarehouseMap ref="mapRef" :positions="positions" />
  </div>
</template>

<script setup>
const mapRef = ref()

function customBatchOperation() {
  const selected = mapRef.value?.getSelectedPositions()
  if (selected.length > 0) {
    // 执行自定义操作
    console.log('选中的库位:', selected)
    
    // 修改颜色
    mapRef.value?.changeSelectedColor('#00ff00')
    
    // 修改状态
    mapRef.value?.changeSelectedStatus('reserved')
  }
}
</script>
```

## 🎨 样式自定义

工具栏样式可以通过 CSS 变量自定义：

```css
.batch-toolbar {
  /* 修改工具栏位置 */
  top: 20px !important;
  
  /* 修改工具栏背景 */
  background: #f0f0f0 !important;
  
  /* 修改工具栏圆角 */
  border-radius: 12px !important;
}

.toolbar-btn {
  /* 修改按钮样式 */
  padding: 8px 16px !important;
  font-weight: bold !important;
}
```

## ⚠️ 注意事项

1. **数据同步**
   - 必须监听 `@positions-updated` 事件
   - 及时更新 `positions` 数据源
   - 否则界面和数据会不一致

2. **性能优化**
   - 框选时使用了虚拟渲染
   - 大量库位选择也很流畅
   - 建议单次选择不超过 1000 个

3. **标题行保护**
   - 设置了 `isHeader: true` 的库位无法被选中
   - 这是为了保护标题行不被误操作

4. **兼容性**
   - 完全兼容现有功能
   - 可以与拖拽、右键菜单同时使用
   - 不会影响单个库位的点击和操作

## 🔍 故障排查

### 问题1: 无法框选

**原因：**
- `enableSelection` 设置为 `false`
- 没有按住 Ctrl/Cmd 键

**解决：**
```vue
<WarehouseMap :enable-selection="true" />
```

### 问题2: 工具栏不显示

**原因：**
- `enableBatchOperations` 设置为 `false`
- 没有选中任何库位

**解决：**
```vue
<WarehouseMap :enable-batch-operations="true" />
```

### 问题3: 删除后数据没更新

**原因：**
- 没有监听 `@positions-updated` 事件

**解决：**
```vue
<WarehouseMap
  :positions="positions"
  @positions-updated="positions = $event"
/>
```

### 问题4: 选中效果不明显

**原因：**
- 可能被自定义样式覆盖

**解决：**
检查是否有自定义 `borderColor` 或 `borderHoverColor`

## 📚 完整示例

查看完整的工作示例：
- `src/App.vue` - 基础示例
- `src/components/WarehouseMap/examples/SelectionExample.vue` - 高级示例

---

**文档版本**: 1.0  
**最后更新**: 2025-11-14  
**维护者**: Development Team

