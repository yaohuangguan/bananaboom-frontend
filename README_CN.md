# Orion System (猎户座系统)

![Orion Banner](public/logo.svg)

> **指引价值航向 (Navigate your Value)**

Orion 是一个现代化、高性能的**个人知识管理 (PKM)** 与**数字花园**系统。它结合了面向公众的作品集博客与一个精密的、加密的私人仪表盘（“舰长室”），用于全方位管理个人数据、健康与 AI 协作。

本项目基于 **React 19**, **Vite**, **Tailwind CSS** 构建，并由 **Google Gemini** 模型驱动核心智能。

## 🌟 核心功能

### 1. 公共扇区 (舰桥)
- **沉浸式首页:** 动态 3D 风格 CSS 动画与状态指示器。
- **传输日志 (Blog):** 支持 Markdown 的日志系统，包含标签、搜索、分页及嵌套评论功能。
- **档案室 (Portfolio):** 双模式展示（简历文档 / 项目卡片），支持中英双语切换。
- **AI 代理:**
  - **思考者 (Thinking Agent):** 利用 Gemini 3.0 Pro 进行深度推理任务。
  - **实时链路 (Live Agent):** 基于 WebRTC 与 GenAI 的实时语音/视频交互接口。

### 2. 舰长室 (私人空间)
受 JWT 认证与 RBAC（基于角色的访问控制）保护的加密区域。

#### 🧠 第二大脑 (AI Core)
- **上下文感知:** AI 可读取您的日志、运动记录与项目数据进行回答。
- **多模态输入:** 支持拖拽上传图片进行分析与对话。
- **会话管理:** 持久化聊天记录与侧边栏导航。

#### 🏃 运动空间 (Fitness)
- **全维度追踪:** 体重、BMI、睡眠、心情与饮水记录。
- **活动日志:** 记录多种运动类型（跑步、举铁、HIIT 等）及市场与笔记。
- **光影墙:** 基于月历视图的进度照片画廊。
- **数据分析:** 使用 Recharts 可视化体重趋势与活动统计。

#### 🧘 休闲与工具 (Leisure)
- **AI 智能厨房:** 
  - **幸运大转盘:** 随机决定餐食，支持“健康”与“多样化”过滤器。
  - **智能方案:** 基于健身目标（减脂/增肌）自动生成膳食建议。
  - **食谱搜索:** 集成外部 API 的食谱查询。
- **月相周期:** 生理期记录与预测系统。
- **雀魂专区:** 嵌入式 Mahjong Soul 游戏窗口。
- **四皇海战:** 原创逻辑解谜游戏 (Pirate Lords)。

#### 🗺️ 星图 (Footprint)
- **双视图模式:** 
  - **中国扇区:** 基于 ECharts 的省份点亮地图。
  - **全球坐标:** 基于 Leaflet 的世界地图，支持图钉与回忆记录。
- **旅行日志:** 记录抵达日期、心情与照片。

#### 📸 胶囊相册 (Gallery)
- **软木板 UI:** 可拖拽、旋转的照片卡片，模拟真实的照片墙体验。
- **云端集成:** 高效的 Cloudinary 图片管理。

### 3. 系统管理 (Admin)
- **权限控制:** 用户、角色与权限的颗粒度管理。
- **审计日志:** 追踪系统内所有操作（登录、删除、编辑）。
- **资源监控:** 实时监控 Cloudinary 资源使用情况（存储、带宽）。
- **审批流:** 处理用户的权限提升申请。

## 🛠 技术栈

- **前端框架:** React 19, TypeScript, Vite
- **样式方案:** Tailwind CSS, FontAwesome
- **路由:** React Router DOM v6
- **AI & ML:** @google/genai SDK (Gemini 3 Pro, Flash 2.5)
- **数据可视化:** Recharts, ECharts, Leaflet
- **富文本与内容:** Quill, Highlight.js, Marked
- **实时通讯:** Socket.io-client
- **PWA:** 支持离线访问的渐进式 Web 应用

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Google Gemini API Key
- Cloudinary 账号 (用于媒体存储)

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/orion.git
   cd orion
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   在根目录创建 `.env` 文件，并配置必要的 API 密钥（如 `API_KEY` 用于 GenAI）。

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 🎨 主题系统
系统内置动态的 **星际/自然 (Cosmic/Scenic)** 主题引擎：
- **日间模式:** "Milky" 暖色调，搭配纸张纹理与自然风景。
- **夜间模式:** 深空 "Cosmic" 主题，包含动态星场与星云动画。
- **节日模式:** 圣诞节（飘雪）与农历新年（灯笼与烟花）的专属特效覆盖。

## 📄 许可证
[MIT](LICENSE)