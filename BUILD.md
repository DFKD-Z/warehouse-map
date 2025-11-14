# 构建和发布指南

本指南说明如何将 `warehouse-map` 构建为 npm 包并发布。

## 📦 构建 npm 包

### 1. 安装依赖

```bash
pnpm install
# 或
npm install
```

### 2. 构建库

构建命令会同时生成 JavaScript 文件和 TypeScript 类型声明文件：

```bash
# 构建库文件（JavaScript + 类型声明）
pnpm build

# 或者分别构建
pnpm build:lib   # 只构建 JavaScript 文件
pnpm build:types # 只生成类型声明文件
```

构建完成后，会在 `dist` 目录下生成以下文件：

```
dist/
├── warehouse-map.es.js      # ES 模块格式
├── warehouse-map.cjs.js     # CommonJS 格式
├── warehouse-map.umd.js     # UMD 格式
├── warehouse-map.es.js.map  # ES 模块 sourcemap
├── warehouse-map.cjs.js.map # CommonJS sourcemap
├── warehouse-map.umd.js.map # UMD sourcemap
├── style.css                # 样式文件
├── index.d.ts              # 类型声明文件入口
└── ...                     # 其他类型声明文件
```

## 📋 构建配置说明

### Vite 配置 (`vite.config.ts`)

- **库模式构建**：使用 Vite 的 lib 模式
- **多格式支持**：同时生成 ES、CommonJS 和 UMD 格式
- **外部依赖**：Vue 作为外部依赖，不打包进库
- **Sourcemap**：生成 sourcemap 便于调试

### TypeScript 配置 (`tsconfig.build.json`)

- **声明文件生成**：自动生成 `.d.ts` 类型声明文件
- **源映射**：生成声明文件映射

### Package.json 配置

- **入口文件**：
  - `main`: CommonJS 格式 (`warehouse-map.cjs.js`)
  - `module`: ES 模块格式 (`warehouse-map.es.js`)
  - `types`: TypeScript 类型声明 (`index.d.ts`)

- **文件发布**：`files` 字段指定只发布 `dist` 和 `README.md`

## 🚀 发布到 npm

### 1. 准备发布

在发布前，确保：

- ✅ 版本号已更新（`package.json` 中的 `version`）
- ✅ 已填写 `author` 和 `repository` 信息（如需要）
- ✅ 已构建最新版本（`pnpm build`）
- ✅ 已测试构建产物

### 2. 登录 npm

```bash
npm login
```

### 3. 发布

```bash
# 发布到 npm
npm publish

# 如果是私有包或者首次发布，可以使用
npm publish --access public
```

### 4. 发布到其他注册表

```bash
# 发布到 GitHub Packages
npm publish --registry=https://npm.pkg.github.com

# 发布到私有 npm 注册表
npm publish --registry=https://your-registry.com
```

## 📥 本地测试

在发布前，可以使用 `npm link` 在本地测试：

```bash
# 在 warehouse-map 目录下
npm link

# 在测试项目目录下
npm link warehouse-map
```

或者使用 `pnpm link`：

```bash
# 在 warehouse-map 目录下
pnpm link --global

# 在测试项目目录下
pnpm link warehouse-map --global
```

## 📝 使用构建后的包

### 安装

```bash
npm install warehouse-map
# 或
pnpm add warehouse-map
```

### 在项目中使用

#### ES 模块方式

```javascript
import { WarehouseMap } from 'warehouse-map'
import 'warehouse-map/style.css'
```

#### CommonJS 方式

```javascript
const { WarehouseMap } = require('warehouse-map')
require('warehouse-map/style.css')
```

#### 完整示例

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
import { WarehouseMap } from 'warehouse-map'
import type { Position } from 'warehouse-map'
import 'warehouse-map/style.css'

const positions = ref<Position[]>([
  {
    id: 1,
    x: 100,
    y: 100,
    w: 100,
    h: 100,
    label: 'A-01'
  }
])

function handleClick(position: Position) {
  console.log('点击:', position)
}
</script>
```

## 🔧 常见问题

### 1. 构建失败：找不到模块

确保所有依赖已安装：
```bash
pnpm install
```

### 2. 类型声明文件生成失败

检查 TypeScript 配置是否正确，确保 `tsconfig.build.json` 存在且配置正确。

### 3. 构建后文件过大

- 检查是否正确外部化了 Vue
- 检查是否有未使用的依赖被打包
- 考虑使用代码分割

### 4. 发布时提示权限错误

- 检查是否已登录 npm（`npm whoami`）
- 检查包名是否已被占用
- 如果是首次发布，可能需要添加 `--access public`

## 📚 更多信息

- [npm 发布文档](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Vite 库模式文档](https://vitejs.dev/guide/build.html#library-mode)
- [TypeScript 声明文件](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)

