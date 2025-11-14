import { ref } from 'vue'
import type { Position } from './types'

/**
 * 性能优化 Hook
 * 提供防抖、节流、虚拟滚动等性能优化功能
 */

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = window.setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/**
 * RequestAnimationFrame 节流
 * 确保函数在每个动画帧最多执行一次
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null
  let latestArgs: Parameters<T> | null = null

  return function (this: any, ...args: Parameters<T>) {
    latestArgs = args
    
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (latestArgs) {
          fn.apply(this, latestArgs)
          latestArgs = null
        }
        rafId = null
      })
    }
  }
}

/**
 * 性能优化配置接口
 */
export interface PerformanceConfig {
  // 是否启用防抖
  enableDebounce: boolean
  // 防抖延迟时间（毫秒）
  debounceDelay: number
  // 是否启用节流
  enableThrottle: boolean
  // 节流延迟时间（毫秒）
  throttleDelay: number
  // 是否启用虚拟渲染（只渲染可见区域）
  enableVirtualRender: boolean
  // 是否启用帧率优化
  enableRafOptimization: boolean
  // 批量渲染的阈值（超过此数量才启用虚拟渲染）
  virtualRenderThreshold: number
}

/**
 * 性能优化 Hook
 */
export function usePerformance(config: PerformanceConfig) {
  // 性能统计
  const stats = ref({
    fps: 0,
    renderCount: 0,
    visiblePositions: 0,
    totalPositions: 0,
    lastRenderTime: 0,
  })

  let frameCount = 0
  let lastTime = performance.now()
  let fpsUpdateTimer: number | undefined

  /**
   * 计算 FPS
   */
  function updateFPS() {
    const currentTime = performance.now()
    const delta = currentTime - lastTime
    
    if (delta >= 1000) {
      stats.value.fps = Math.round((frameCount * 1000) / delta)
      frameCount = 0
      lastTime = currentTime
    }
    
    frameCount++
  }

  /**
   * 启动 FPS 监控
   */
  function startFPSMonitoring() {
    if (fpsUpdateTimer) return
    
    const update = () => {
      updateFPS()
      fpsUpdateTimer = requestAnimationFrame(update)
    }
    
    fpsUpdateTimer = requestAnimationFrame(update)
  }

  /**
   * 停止 FPS 监控
   */
  function stopFPSMonitoring() {
    if (fpsUpdateTimer) {
      cancelAnimationFrame(fpsUpdateTimer)
      fpsUpdateTimer = undefined
    }
  }

  /**
   * 虚拟渲染：过滤出可见区域内的库位
   * @param positions 所有库位
   * @param viewportX 视口 X 偏移
   * @param viewportY 视口 Y 偏移
   * @param canvasWidth 画布宽度
   * @param canvasHeight 画布高度
   * @param scaleX X 缩放比例
   * @param scaleY Y 缩放比例
   */
  function filterVisiblePositions(
    positions: Position[],
    viewportX: number,
    viewportY: number,
    canvasWidth: number,
    canvasHeight: number,
    scaleX: number,
    scaleY: number,
    defaultW: number,
    defaultH: number,
    layerZOffset: number
  ): Position[] {
    // 如果库位数量小于阈值，不启用虚拟渲染
    if (!config.enableVirtualRender || positions.length < config.virtualRenderThreshold) {
      stats.value.visiblePositions = positions.length
      stats.value.totalPositions = positions.length
      return positions
    }

    // 计算视口范围（世界坐标）
    const viewportLeft = -viewportX / scaleX
    const viewportTop = -viewportY / scaleY
    const viewportRight = (canvasWidth - viewportX) / scaleX
    const viewportBottom = (canvasHeight - viewportY) / scaleY

    // 添加边界缓冲区（避免边缘闪烁）
    const bufferX = 200 / scaleX
    const bufferY = 200 / scaleY

    // 过滤可见库位
    const visiblePositions = positions.filter(pos => {
      const w = pos.w || defaultW
      const h = pos.h || defaultH
      const z = pos.z || 0
      const offset = z * layerZOffset
      
      // 考虑 z 轴偏移的位置
      const left = pos.x + offset / scaleX
      const top = pos.y - offset / scaleY
      const right = left + w
      const bottom = top + h

      // 检查是否在可见区域内（包含缓冲区）
      return !(
        right < viewportLeft - bufferX ||
        left > viewportRight + bufferX ||
        bottom < viewportTop - bufferY ||
        top > viewportBottom + bufferY
      )
    })

    stats.value.visiblePositions = visiblePositions.length
    stats.value.totalPositions = positions.length

    return visiblePositions
  }

  /**
   * 记录渲染时间
   */
  function recordRenderTime(startTime: number) {
    stats.value.lastRenderTime = performance.now() - startTime
    stats.value.renderCount++
  }

  /**
   * 批处理操作
   * 将多个操作合并到一个渲染周期
   */
  class BatchProcessor {
    private pending: Set<() => void> = new Set()
    private rafId: number | null = null

    add(fn: () => void) {
      this.pending.add(fn)
      this.schedule()
    }

    private schedule() {
      if (this.rafId !== null) return

      this.rafId = requestAnimationFrame(() => {
        const operations = Array.from(this.pending)
        this.pending.clear()
        this.rafId = null

        // 执行所有待处理的操作
        operations.forEach(fn => fn())
      })
    }

    clear() {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId)
        this.rafId = null
      }
      this.pending.clear()
    }
  }

  const batchProcessor = new BatchProcessor()

  /**
   * 内存缓存
   */
  class CacheManager<K, V> {
    private cache = new Map<K, V>()
    private maxSize: number

    constructor(maxSize = 100) {
      this.maxSize = maxSize
    }

    get(key: K): V | undefined {
      return this.cache.get(key)
    }

    set(key: K, value: V) {
      // 如果缓存已满，删除最旧的项
      if (this.cache.size >= this.maxSize) {
        const firstKey = this.cache.keys().next().value
        if (firstKey) {
          this.cache.delete(firstKey)
        }
      }
      this.cache.set(key, value)
    }

    has(key: K): boolean {
      return this.cache.has(key)
    }

    clear() {
      this.cache.clear()
    }

    get size(): number {
      return this.cache.size
    }
  }

  return {
    stats,
    debounce,
    throttle,
    rafThrottle,
    filterVisiblePositions,
    recordRenderTime,
    startFPSMonitoring,
    stopFPSMonitoring,
    batchProcessor,
    CacheManager,
  }
}

/**
 * 默认性能配置
 */
export const defaultPerformanceConfig: PerformanceConfig = {
  enableDebounce: true,
  debounceDelay: 150,
  enableThrottle: true,
  throttleDelay: 16, // ~60fps
  enableVirtualRender: true,
  enableRafOptimization: true,
  virtualRenderThreshold: 100, // 超过100个库位才启用虚拟渲染
}

