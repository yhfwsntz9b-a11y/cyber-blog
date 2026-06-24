# CyberNote - 赛博朋克风格个人知识博客

> 一个赛博朋克科技风的个人知识博客，记录AI、科技、社会学、心理学四大领域的知识洞察。

## 🎨 设计风格

赛博朋克科技风特色：
- **深色背景**：#0a0a0f（深邃黑）
- **霓虹色调**：青色 #00fff9、粉色 #ff00ff、绿色 #05ffa1
- **视觉特效**：CRT扫描线、霓虹发光、故障效果、网格背景
- **科技字体**：Orbitron（标题）、Rajdhani（正文）

## 📁 项目结构

```
cyber-blog/
├── index.html          # 首页（时间线作品集）
├── category.html       # 分类浏览页
├── post.html           # 文章详情页
├── chengdu.html        # 成都本地专栏
├── knowledge.html      # AI知识卡片
├── css/
│   ├── cyberpunk.css   # 赛博朋克特效
│   └── style.css       # 主样式
├── js/
│   └── main.js         # 主逻辑
├── posts/              # Markdown文章
│   ├── ai/
│   ├── tech/
│   ├── sociology/
│   └── psychology/
└── README.md
```

## 🚀 本地运行

### 方法1：Python HTTP服务器

```bash
cd cyber-blog
python -m http.server 8000
```

访问：http://localhost:8000

### 方法2：VS Code Live Server

安装 Live Server 扩展，右键 `index.html` 选择 "Open with Live Server"

## 📦 部署到 GitHub Pages

### 步骤1：创建GitHub仓库

```bash
# 初始化Git
cd cyber-blog
git init
git add .
git commit -m "Initial commit: CyberNote 赛博朋克博客"
```

### 步骤2：推送到GitHub

```bash
# 创建GitHub仓库后
git remote add origin https://github.com/你的用户名/cyber-blog.git
git push -u origin main
```

### 步骤3：启用GitHub Pages

1. 进入仓库 Settings → Pages
2. Source 选择 `Deploy from a branch`
3. Branch 选择 `main`，Folder 选择 `/ (root)`
4. 保存后等待部署

访问地址：`https://你的用户名.github.io/cyber-blog/`

## 📝 添加新文章

### 1. 创建Markdown文件

在对应分类目录下创建 `.md` 文件：

```bash
# AI领域
posts/ai/new-article.md

# 科技领域
posts/tech/new-article.md
```

### 2. 注册到文章索引

编辑 `js/main.js`，在 `articlesDB` 数组添加：

```javascript
{
  id: 'ai-003',
  title: '文章标题',
  category: 'ai',
  date: '2024-07-01',
  excerpt: '文章摘要...',
  file: 'posts/ai/new-article.md'
}
```

## ✨ 功能模块

### 1. 首页时间线
- 按时间倒序展示文章
- 分类筛选（AI/科技/社会学/心理学）
- 霓虹卡片悬浮效果

### 2. 分类浏览
- 四大领域独立页面
- 网格布局文章卡片

### 3. 文章详情
- Markdown渲染（marked.js）
- 代码高亮（Prism.js）
- 相关文章推荐

### 4. 成都本地专栏
- 成都AI企业观察
- 社区治理实践
- 消费习惯洞察
- 数据看板

### 5. AI知识卡片
- 技术术语通俗解读
- 翻转卡片动画
- 分类筛选

## 🎯 特色内容

- **8篇示例文章**：覆盖AI、科技、社会学、心理学四大领域
- **12张知识卡片**：LLM、Transformer、RAG等核心概念通俗解读
- **成都本地视角**：AI产业地图、消费文化、社区治理观察

## 🔧 技术栈

- **纯静态站**：HTML + CSS + JavaScript
- **Markdown渲染**：marked.js
- **代码高亮**：Prism.js
- **字体**：Google Fonts（Orbitron、Rajdhani、Fira Code）

## 📄 License

MIT License - 自由使用和修改

---

*CyberNote - 赛博朋克风格知识博客*