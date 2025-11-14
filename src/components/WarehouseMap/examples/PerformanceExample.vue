<template>
  <div class="performance-example">
    <div class="controls">
      <h2>性能优化示例</h2>
      
      <div class="control-group">
        <label>库位数量: {{ positionCount }}</label>
        <input 
          type="range" 
          v-model.number="positionCount" 
          min="10" 
          max="5000" 
          step="10"
        />
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" v-model="performanceConfig.enableVirtualRender" />
          启用虚拟渲染
        </label>
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" v-model="performanceConfig.enableRafOptimization" />
          启用帧率优化
        </label>
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" v-model="performanceConfig.enableDebounce" />
          启用防抖
        </label>
      </div>

      <div class="control-group">
        <label>虚拟渲染阈值: {{ performanceConfig.virtualRenderThreshold }}</label>
        <input 
          type="range" 
          v-model.number="performanceConfig.virtualRenderThreshold" 
          min="10" 
          max="500" 
          step="10"
        />
      </div>

      <div class="control-group">
        <button @click="generatePositions">生成库位</button>
        <button @click="toggleStats">{{ showStats ? '隐藏' : '显示' }}统计</button>
        <button @click="resetView">重置视图</button>
      </div>
    </div>

    <div class="map-container">
      <WarehouseMap
        ref="mapRef"
        :positions="positions"
        :width="10000"
        :height="10000"
        :show-performance-stats="showStats"
        :performance-config="performanceConfig"
        :enable-pan="true"
        :show-grid="true"
        background-color="#f5f5f5"
        @position-click="handlePositionClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import WarehouseMap from '../index.vue'
import type { Position, PerformanceConfig } from '../types'

const mapRef = ref()
const positions = ref<Position[]>([])
const positionCount = ref(100)
const showStats = ref(true)

// 性能配置
const performanceConfig = ref<Partial<PerformanceConfig>>({
  enableVirtualRender: true,
  enableRafOptimization: true,
  enableDebounce: true,
  virtualRenderThreshold: 100,
  debounceDelay: 150,
})

// 生成随机库位
function generatePositions() {
  const newPositions: Position[] = []
  const cols = Math.ceil(Math.sqrt(positionCount.value))
  
  for (let i = 0; i < positionCount.value; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    
    newPositions.push({
      id: `pos-${i}`,
      x: col * 120,
      y: row * 120,
      w: 100,
      h: 100,
      label: `${i + 1}`,
      status: ['free', 'occupied', 'reserved', 'damaged'][Math.floor(Math.random() * 4)]
    })
  }
  
  positions.value = newPositions
  console.log(`生成了 ${positionCount.value} 个库位`)
}

// 监听数量变化自动生成
watch(positionCount, () => {
  generatePositions()
})

// 处理点击
function handlePositionClick(position: Position) {
  console.log('点击库位:', position)
}

// 切换统计显示
function toggleStats() {
  showStats.value = !showStats.value
}

// 重置视图
function resetView() {
  mapRef.value?.resetView()
}

// 初始化
generatePositions()
</script>

<style scoped>
.performance-example {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: system-ui, -apple-system, sans-serif;
}

.controls {
  padding: 20px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.controls h2 {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
}

.control-group {
  margin-bottom: 15px;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.control-group input[type="range"] {
  width: 100%;
  max-width: 400px;
}

.control-group input[type="checkbox"] {
  margin-right: 8px;
}

.control-group button {
  padding: 8px 16px;
  margin-right: 10px;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.control-group button:hover {
  background: #357ae8;
}

.map-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style>

