import { reactive, nextTick } from 'vue'
import type { Ref } from 'vue'
import type { Position, ContextMenuState, ContextMenuItem } from './types'

/**
 * 右键菜单 Hook
 * 负责右键菜单的显示、隐藏和交互
 */
export function useContextMenu(
  wrap: Ref<HTMLDivElement | null>,
  getPosUnderPointer: (clientX: number, clientY: number) => Position | null,
  emit: any
) {
  // 右键菜单状态
  const contextMenu = reactive<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    position: null,
  })

  /**
   * 隐藏右键菜单
   */
  function hideContextMenu() {
    contextMenu.visible = false
    contextMenu.position = null
  }

  /**
   * 显示右键菜单
   */
  function showContextMenu(e: MouseEvent, enableContextMenu: boolean) {
    e.preventDefault()
    
    // 如果未启用右键菜单，直接返回
    if (!enableContextMenu) {
      return
    }
    
    const pos = getPosUnderPointer(e.clientX, e.clientY)
    
    // 只在点击库位块时显示菜单（排除标题行）
    if (pos && !pos.isHeader && wrap.value) {
      const rect = wrap.value.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top
      
      // 先显示菜单以便获取其尺寸
      contextMenu.visible = true
      contextMenu.x = clickX
      contextMenu.y = clickY
      contextMenu.position = pos
      
      // 在下一帧调整菜单位置，避免超出容器
      nextTick(() => {
        const menuEl = document.querySelector('.context-menu') as HTMLElement
        if (menuEl && wrap.value) {
          const menuHeight = menuEl.offsetHeight
          const menuWidth = menuEl.offsetWidth
          const containerHeight = wrap.value.offsetHeight
          const containerWidth = wrap.value.offsetWidth
          
          // 检查是否超出底部，如果超出则向上展示
          if (clickY + menuHeight > containerHeight) {
            contextMenu.y = clickY - menuHeight
            // 确保不会超出顶部
            if (contextMenu.y < 0) {
              contextMenu.y = containerHeight - menuHeight - 10
            }
          }
          
          // 检查是否超出右侧
          if (clickX + menuWidth > containerWidth) {
            contextMenu.x = clickX - menuWidth
            // 确保不会超出左侧
            if (contextMenu.x < 0) {
              contextMenu.x = 10
            }
          }
        }
      })
      
      console.log('右键点击库位块:', pos)
      emit('context-menu', { position: pos, x: contextMenu.x, y: contextMenu.y })
    }
  }

  /**
   * 处理菜单项点击
   */
  function handleMenuItemClick(item: ContextMenuItem) {
    console.log('菜单项点击:', item.key, contextMenu.position)
    emit('menu-item-click', { 
      menuItem: item, 
      position: contextMenu.position 
    })
    hideContextMenu()
  }

  /**
   * 绑定右键菜单相关事件
   */
  function bindContextMenuEvents(canvas: Ref<HTMLCanvasElement | null>, enableContextMenu: boolean) {
    if (!canvas.value) return
    
    const onContextMenu = (e: MouseEvent) => showContextMenu(e, enableContextMenu)
    
    canvas.value.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('click', hideContextMenu)
    
    return () => {
      if (canvas.value) {
        canvas.value.removeEventListener('contextmenu', onContextMenu)
      }
      document.removeEventListener('click', hideContextMenu)
    }
  }

  return {
    contextMenu,
    hideContextMenu,
    showContextMenu,
    handleMenuItemClick,
    bindContextMenuEvents,
  }
}

