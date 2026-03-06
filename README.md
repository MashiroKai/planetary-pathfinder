# 行星探路者宣传网站

> Planetary Pathfinder Laboratory - 面向火星车开发的科研项目宣传网站

---

## 📁 项目结构

```
website/
├── index.html      # 主页面
├── styles.css      # 样式文件
├── script.js       # 交互脚本
└── README.md       # 本文件
```

---

## 🚀 快速部署（GitHub Pages）

### 步骤 1：创建 GitHub 仓库

1. 访问 [GitHub](https://github.com)
2. 点击右上角 **+** → **New repository**
3. 仓库名：`planetary-pathfinder`（或其他你喜欢的名称）
4. 设为 **Public**（公开）
5. 点击 **Create repository**

### 步骤 2：上传网站文件

**方式 A：通过网页上传（推荐新手）**

1. 在新仓库页面，点击 **uploading an existing file**
2. 将 `index.html`、`styles.css`、`script.js` 拖拽到上传区域
3. 填写提交信息：`Initial commit - 行星探路者网站`
4. 点击 **Commit changes**

**方式 B：通过 Git 命令**

```bash
# 克隆仓库
git clone https://github.com/你的用户名/planetary-pathfinder.git
cd planetary-pathfinder

# 复制网站文件
cp /path/to/website/* .

# 提交并推送
git add .
git commit -m "Initial commit - 行星探路者网站"
git push origin main
```

### 步骤 3：启用 GitHub Pages

1. 进入仓库 **Settings** → **Pages**
2. **Source** 选择：`Deploy from a branch`
3. **Branch** 选择：`main` / `root`
4. 点击 **Save**
5. 等待 1-2 分钟，页面将发布

### 步骤 4：访问网站

部署成功后，你将获得类似以下的网址：
```
https://你的用户名.github.io/planetary-pathfinder/
```

---

## 🎨 自定义内容

### 修改导师信息

打开 `index.html`，找到 `<!-- 导师团队 -->` 部分，修改：

```html
<div class="team-card">
    <div class="team-avatar">👨‍🏫</div>
    <h3>导师姓名</h3>
    <p class="team-role">职称 / 职位</p>
    <p class="team-desc">研究方向：具体方向</p>
</div>
```

### 修改联系方式

打开 `index.html`，找到 `<!-- 联系我们 -->` 部分，修改邮箱和地址。

### 添加研究成果

打开 `index.html`，找到 `<!-- 研究成果 -->` 部分，添加具体内容。

### 更换配色方案

打开 `styles.css`，修改 `:root` 中的颜色变量：

```css
:root {
    --primary-color: #0B1E3B;    /* 主色调 */
    --secondary-color: #FF6B35;  /* 强调色 */
}
```

### 添加图片资源

1. 在 `website/` 目录下创建 `images/` 文件夹
2. 放入图片文件（如 `rover.jpg`）
3. 在 HTML 中引用：`<img src="images/rover.jpg" alt="火星车">`

---

## 📱 功能特性

- ✅ 响应式设计（手机/平板/电脑自适应）
- ✅ 单页滚动导航
- ✅ 平滑滚动动画
- ✅ 元素进入视口动画
- ✅ 统计数据动态增长
- ✅ 移动端汉堡菜单
- ✅ SEO 友好 meta 标签
- ✅ 邮件报名链接

---

## 🔧 本地预览

### 方式 1：直接打开

双击 `index.html` 即可在浏览器中预览。

### 方式 2：使用本地服务器（推荐）

```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js 的 http-server
npx http-server -p 8000

# 访问 http://localhost:8000
```

### 方式 3：使用 VS Code Live Server

1. 安装 **Live Server** 扩展
2. 右键 `index.html` → **Open with Live Server**

---

## 📊 后续优化建议

1. **添加真实图片** - 火星车照片、实验室环境、团队合影
2. **完善导师信息** - 照片、详细研究方向、联系方式
3. **添加报名表单** - 使用 Google Forms 或自建后端
4. **集成统计代码** - Google Analytics 或类似工具
5. **添加博客/新闻** - 项目动态、研究成果更新
6. **多语言支持** - 中英文切换

---

## 📝 技术栈

- HTML5
- CSS3（Flexbox + Grid）
- 原生 JavaScript（ES6+）
- 无第三方依赖

---

## 📞 技术支持

如有问题，请联系：
- 邮箱：kaiyu@mail.ustc.edu.cn
- 项目：行星探路者实验室

---

## 📄 许可证

本项目用于中国科学技术大学行星探路者实验室宣传用途。

---

*Made with 🚀 by PathFinder*
