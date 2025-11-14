<script setup lang="ts">
// @ts-ignore
import WarehouseMap from './components/WarehouseMap/index.vue'
import { ref } from 'vue'

// 顶部库位区域名称
const topAreas = ['P02-C001', 'P02-C002', 'P02-C003', 'P02-C004', 'P01-C001', 'P01-C002', 'P01-C003', 'P01-C003', 'P01-C004', 'P01-C005', 'P01-C006', 'P01-C007']

const base_positions = [
  // =========================
  // 顶部标题行（列名称）
  // =========================
  ...topAreas.map((area, i) => ({
    id: `header-${i+1}`,
    x: i * 110,
    y: 0,
    w: 100,
    h: 30,
    label: area,
    color: '#ffffff',
    borderColor: '#cccccc',
    textColor: '#333333',
    isHeader: true
  })),

  // =========================
  // 顶部横排（12 个库位块）
  // =========================
  ...topAreas.map((_, i) => ({
    id: `top-${i+1}`,
    x: i * 110,
    y: 35,
    w: 100,
    h: 100,
    label: '001',
    color: '#e0e0e0'
  })),

  // ============================
  // 中部矩阵 A（4列 × 3行）
  // 坐标起点：y=185
  // ============================
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `matrixA-${i+1}`,
    x: (i % 4) * 110,
    y: 250 + Math.floor(i / 4) * 110,
    w: 100,
    h: 100,
    label: ['003', '004', '005'][Math.floor(i / 4)],
    color: '#e0e0e0'
  })),

  // ============================
  // 中部矩阵 B（3列 × 3行）
  // 坐标起点：x=550, y=185
  // ============================
  ...Array.from({ length: 9 }).map((_, i) => ({
    id: `matrixB-${i+1}`,
    x: 550 + (i % 3) * 110,
    y: 250 + Math.floor(i / 3) * 110,
    w: 100,
    h: 100,
    label: ['003', '004', '005'][Math.floor(i / 3)],
    color: '#e0e0e0'
  })),

  // ============================
  // 中部矩阵 C（3列 × 3行）
  // 坐标起点：x=990, y=185
  // ============================
  ...Array.from({ length: 9 }).map((_, i) => ({
    id: `matrixC-${i+1}`,
    x: 990 + (i % 3) * 110,
    y: 250 + Math.floor(i / 3) * 110,
    w: 100,
    h: 100,
    label: ['003', '004', '005'][Math.floor(i / 3)],
    color: '#e0e0e0'
  })),

  // ============================
  // 底部横排（12 个）
  // 坐标起点：y=535
  // 前三个是"紧急库位"
  // ============================
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `bottom-${i+1}`,
    x: i * 110,
    y: 685,
    w: 100,
    h: 100,
    label: i < 3 ? '紧急\n\n007' : '007',
    color: i < 3 ? '#ffcccc' : '#e0e0e0',
    borderColor: i < 3 ? '#ff0000' : undefined
  }))
];

const positions = ref(base_positions)

// 自定义右键菜单项
const customMenuItems = [
  { key: 'view', label: '查看详情' },
  { key: 'edit', label: '编辑库位' },
  { key: 'move', label: '移动' },
  { key: 'delete', label: '删除库位' },
  { key: 'copy', label: '复制' },
  { key: 'export', label: '导出信息' }
]

// 事件处理函数
const handlePositionClick = (position: any) => {
  console.log('App 接收到点击事件:', position)
}

const handlePositionDblClick = (position: any) => {
  console.log('App 接收到双击事件:', position)
}

const handleContextMenu = (data: any) => {
  console.log('App 接收到右键菜单事件:', data)
}

const handleMenuItemClick = (data: any) => {
  console.log('App 接收到菜单项点击:', data.menuItem, data.position)
  
  // 这里可以根据不同的菜单项执行不同的操作
  switch(data.menuItem.key) {
    case 'view':
      console.log('查看详情:', data.position)
      break
    case 'edit':
      console.log('编辑库位:', data.position)
      break
    case 'move':
      console.log('移动库位:', data.position)
      break
    case 'delete':
      console.log('删除库位:', data.position)
      break
    case 'copy':
      console.log('复制库位:', data.position)
      break
    case 'export':
      console.log('导出信息:', data.position)
      break
  }
}

// 批量操作事件处理
const handleSelectionChange = (selectedIds: (string | number)[]) => {
  console.log('选择变化:', selectedIds)
}

const handleBatchDelete = (selectedIds: (string | number)[]) => {
  console.log('批量删除:', selectedIds)
  // positions.value 会通过组件内部更新
}

const handleBatchColorChange = (data: { selectedIds: (string | number)[], color: string }) => {
  console.log('批量改变颜色:', data)
}

const handleBatchStatusChange = (data: { selectedIds: (string | number)[], status: string }) => {
  console.log('批量改变状态:', data)
}

// 监听 positions-updated 事件来更新数据
const handlePositionsUpdated = (newPositions: any[]) => {
  positions.value = newPositions
  console.log('库位数据已更新，当前数量:', newPositions.length)
}
</script>

<template>
  <div>
    <!-- 提示信息 -->
    <div style="position: fixed; top: 10px; left: 10px; background: rgba(0,0,0,0.8); color: white; padding: 10px 15px; border-radius: 6px; font-size: 12px; z-index: 2000;">
      💡 <strong>提示：</strong>按住 <kbd style="background: #555; padding: 2px 6px; border-radius: 3px;">Ctrl</kbd> 或 <kbd style="background: #555; padding: 2px 6px; border-radius: 3px;">Cmd</kbd> + 鼠标拖动进行框选
    </div>
    
    <WarehouseMap 
      :positions="positions" 
      :width="1920"
      :height="1080"
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
      @context-menu="handleContextMenu"
      @menu-item-click="handleMenuItemClick"
      @selection-change="handleSelectionChange"
      @batch-delete="handleBatchDelete"
      @batch-color-change="handleBatchColorChange"
      @batch-status-change="handleBatchStatusChange"
      @positions-updated="handlePositionsUpdated"
    />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
