# Ubuntu桌面美化指南：从丑小鸭到白天鹅，30分钟打造炫酷桌面

> 阅读时长：6分钟
> 
> 默认的Ubuntu桌面太朴素？教你用GNOME扩展、主题、图标和壁纸，30分钟打造让朋友羡慕的炫酷桌面！

---

## 一、为什么需要美化桌面？

打开Ubuntu的第一眼，你可能觉得：

- 橙色的主题太单调
- 图标不够现代
- 缺少个性化元素
- 跟Windows/macOS相比差远了

但Linux最大的魅力就是**高度可定制**！今天带你从零开始，打造一个堪比macOS的炫酷桌面。

**美化前 vs 美化后对比**：

| 项目 | 默认状态 | 美化后 |
|:---:|:---|:---|
| 主题 | Adwaita（灰白） | Nordic/Flat-Remix（深色极简） |
| 图标 | Adwaita | Tela/Papirus（现代彩色） |
| 壁纸 | Ubuntu默认 | 动态壁纸/4K风景 |
| 顶部栏 | 单调显示信息 | 透明+扩展功能 |
| Dock | 无 | Dash to Dock（macOS风格） |

---

## 二、准备工作：安装GNOME优化工具

### 1. 安装GNOME Tweaks

```bash
sudo apt update
sudo apt install gnome-tweaks
```

### 2. 安装GNOME Shell扩展管理器

```bash
sudo apt install gnome-shell-extensions
```

### 3. 安装浏览器扩展（可选）

访问 https://extensions.gnome.org/，安装浏览器扩展，可一键安装GNOME扩展。

---

## 三、第一步：安装GNOME扩展

GNOME扩展是美化桌面的核心，相当于浏览器的插件。

### 必装扩展清单

#### 1. **Dash to Dock**：macOS风格Dock栏

```bash
# 方式1：通过apt安装
sudo apt install gnome-shell-extension-dashtodock

# 方式2：通过浏览器安装
# 访问 https://extensions.gnome.org/extension/307/dash-to-dock/
```

**配置要点**：
- 位置：底部
- 智能

隐藏：勾选
- 图标大小：48px
- 透明度：自定义（建议30-50%）

#### 2. **User Themes**：自定义主题

```bash
# 浏览器安装
# https://extensions.gnome.org/extension/19/user-themes/
```

**作用**：允许从用户目录加载Shell主题

#### 3. **Blur my Shell**：模糊效果

```bash
# 浏览器安装
# https://extensions.gnome.org/extension/3193/blur-my-shell/
```

**作用**：为顶部栏、Dash、概览界面添加模糊效果

#### 4. **Dash to Panel**：Windows风格任务栏（可选）

```bash
# 浏览器安装
# https://extensions.gnome.org/extension/1160/dash-to-panel/
```

**适合**：习惯Windows任务栏的用户

#### 5. **Clipboard Indicator**：剪贴板历史

```bash
# 浏览器安装
# https://extensions.gnome.org/extension/779/clipboard-indicator/
```

**作用**：记录剪贴板历史，随时调用

#### 6. **Caffeine**：禁止自动锁屏

```bash
# 浏览器安装
# https://extensions.gnome.org/extension/517/caffeine/
```

**作用**：一键禁止自动锁屏，适合看视频、演示时使用

#### 7. **OpenWeather**：天气显示

```bash
# 浏览器安装
# https://extensions.gnome.org/extension/750/openweather/
```

**作用**：顶部栏显示天气信息

---

## 四、第二步：安装主题

### 1. 创建主题目录

```bash
mkdir -p ~/.themes
mkdir -p ~/.icons
```

### 2. 推荐主题

#### 深色主题推荐

**Nordic**：北欧极简风

```bash
# 下载地址
https://github.com/EliverLara/Nordic/releases

# 解压到 ~/.themes/
unzip Nordic-gtk-theme-*.zip -d ~/.themes/

# 在Tweaks中选择
# 外观 → 应用程序 → Nordic
```

**Flat-Remix-GTK**：扁平化深色

```bash
# 下载地址
https://github.com/daniruiz/flat-remix-gtk/releases

# 解压到 ~/.themes/
unzip Flat-Remix-GTK-*.zip -d ~/.themes/

# 选择 Flat-Remix-GTK-Red-Dark
```

#### 浅色主题推荐

**WhiteSur-gtk-theme**：macOS Big Sur风格

```bash
# 下载地址
https://github.com/vinceliuice/WhiteSur-gtk-theme

# 安装脚本
./install.sh -c Light

# 选择 WhiteSur-Light
```

### 3. 在GNOME Tweaks中选择主题

1. 打开"优化"（Tweaks）
2. 外观 → 应用程序 → 选择已安装的主题
3. 外观 → Shell → 选择对应的Shell主题（需安装User Themes扩展）

---

## 五、第三步：安装图标主题

### 推荐图标主题

#### 1. **Tela Icon Theme**：现代多彩

```bash
# 下载地址
https://github.com/vinceliuice/Tela-icon-theme/releases

# 安装
./install.sh

# 在Tweaks中选择
# 外观 → 图标 → Tela-red（或其他颜色）
```

#### 2. **Papirus**：流行扁平化

```bash
# 添加PPA安装
sudo add-apt-repository ppa:papirus/papirus
sudo apt update
sudo apt install papirus-icon-theme

# 在Tweaks中选择
# 外观 → 图标 → Papirus-Dark
```

#### 3. **Flat-Remix**：渐变彩色

```bash
# 下载地址
https://github.com/daniruiz/flat-remix-gtk/releases

# 解压到 ~/.icons/
unzip Flat-Remix-*-Blue.tar.xz -C ~/.icons/

# 选择 Flat-Remix-Blue-Dark
```

---

## 六、第四步：更换壁纸

### 1. 推荐壁纸网站

- **Unsplash**：https://unsplash.com/wallpapers
- **Wallhaven**：https://wallhaven.cc/
- **Reddit r/wallpapers**：https://www.reddit.com/r/wallpapers/

### 2. 动态壁纸（进阶）

**Komorebi**：Windows风格动态壁纸

```bash
sudo apt install git valac libgtk-3-dev libsoup2.4-dev libjson-glib-dev libwebkit2gtk-4.0-dev libgee-0.8-dev
git clone https://github.com/cheesecakeufo/komorebi.git
cd komorebi
make
sudo make install

# 启动
komorebi
```

**HydraPaper**：多显示器壁纸管理

```bash
sudo apt install hydrapaper
```

---

## 七、第五步：顶部栏美化

### 1. 隐藏不必要元素

在GNOME Tweaks中：
- 顶部栏 → 在顶栏显示日期 → 关闭（或开启）
- 顶部栏 → 显示秒钟 → 按需选择

### 2. 添加系统监控

**Vitals**：CPU/内存/温度监控

```bash
# 浏览器安装
https://extensions.gnome.org/extension/1460/vitals/
```

**配置**：
- 显示CPU使用率
- 显示内存使用率
- 显示网络速度
- 显示温度（可选）

### 3. 透明顶部栏

**Blur my Shell**扩展自动实现，或手动修改主题CSS：

```css
/* ~/.themes/Nordic/gnome-shell/gnome-shell.css */
#panel {
    background-color: rgba(46, 52, 64, 0.5);
}
```

---

## 八、完整方案推荐

### 方案1：macOS风格

| 组件 | 推荐 |
|:---|:---|
| 主题 | WhiteSur-gtk-theme |
| 图标 | McMojave-circle |
| 扩展 | Dash to Dock（底部，智能隐藏） |
| 壁纸 | macOS Big Sur壁纸 |

### 方案2：极简深色

| 组件 | 推荐 |
|:---|:---|
| 主题 | Nordic |
| 图标 | Tela-blue-dark |
| 扩展 | Dash to Panel（顶部透明） |
| 壁纸 | 深色抽象 |

### 方案3：现代扁平

| 组件 | 推荐 |
|:---|:---|
| 主题 | Flat-Remix-GTK |
| 图标 | Flat-Remix-Blue |
| 扩展 | Blur my Shell + Vitals |
| 壁纸 | 渐变色背景 |

---

## 九、快速美化脚本

不想手动一步步操作？用这个一键脚本：

```bash
#!/bin/bash

# Ubuntu桌面美化一键脚本

# 1. 安装依赖
sudo apt update
sudo apt install -y gnome-tweaks gnome-shell-extensions git

# 2. 创建目录
mkdir -p ~/.themes ~/.icons

# 3. 安装Papirus图标
sudo add-apt-repository -y ppa:papirus/papirus
sudo apt update
sudo apt install -y papirus-icon-theme

# 4. 下载Nordic主题
cd /tmp
wget https://github.com/EliverLara/Nordic/releases/download/v2.0.0/Nordic-standard.tar.xz
tar -xf Nordic-standard.tar.xz
mv Nordic-standard ~/.themes/Nordic

# 5. 下载Tela图标主题
git clone https://github.com/vinceliuice/Tela-icon-theme.git
cd Tela-icon-theme
./install.sh

echo "美化完成！请打开GNOME Tweaks选择主题和图标。"
```

保存为 `ubuntu-beautify.sh`，执行：

```bash
chmod +x ubuntu-beautify.sh
./ubuntu-beautify.sh
```

---

## 十、常见问题

### 1. 扩展安装后不生效？

```bash
# 重启GNOME Shell
# 按 Alt+F2，输入 r，回车（Xorg会话）

# 或注销重新登录（Wayland会话）
```

### 2. 主题不显示在Tweaks中？

```bash
# 检查目录结构
ls ~/.themes/Nordic/
# 应该有 gtk-3.0/ gtk-4.0/ gnome-shell/ 等文件夹

# 检查User Themes扩展是否启用
gnome-extensions list
```

### 3. 图标主题部分应用不生效？

某些应用（如Firefox、LibreOffice）使用自己的图标，需要单独配置或等待主题更新。

### 4. 修改后系统变卡？

- Blur my Shell可能影响性能，可降低模糊强度或禁用
- 动态壁纸消耗资源，老电脑慎用

---

## 十一、进阶玩法

### 1. Conky：桌面系统监控

```bash
sudo apt install conky-all
conky-manager
```

在桌面显示CPU、内存、网络、天气等信息。

### 2. GNOME Shell主题深入定制

编辑 `~/.themes/Nordic/gnome-shell/gnome-shell.css`：

```css
/* 修改顶部栏背景 */
#panel {
    background-color: rgba(46, 52, 64, 0.8);
    height: 28px;
}

/* 修改活动按钮 */
#panel .panel-button {
    color: #D8DEE9;
}

/* 修改通知气泡 */
.notification-banner {
    background-color: #2E3440;
    border-radius: 12px;
}
```

修改后重启GNOME Shell生效。

---

## 十二、美化成果展示

**美化前**：
- 默认橙色主题
- 单调的图标
- 无Dock栏
- 纯色背景

**美化后**：
- 深色极简主题
- 现代彩色图标
- macOS风格Dock
- 模糊效果+透明
- 系统监控显示
- 个性化壁纸

---

## 总结：30分钟美化速查表

| 步骤 | 操作 | 时间 |
|:---:|:---|:---:|
| 1 | 安装GNOME Tweaks和扩展管理器 | 2分钟 |
| 2 | 安装必装扩展（Dash to Dock、Blur my Shell等） | 5分钟 |
| 3 | 下载并安装主题（Nordic/Flat-Remix） | 5分钟 |
| 4 | 安装图标主题（Tela/Papirus） | 5分钟 |
| 5 | 更换壁纸 | 2分钟 |
| 6 | 在Tweaks中配置主题、图标、扩展 | 5分钟 |
| 7 | 微调细节（透明度、图标大小等） | 6分钟 |

---

## 你现在可以做什么？

1. **立即动手**：按照本文步骤，花30分钟美化你的Ubuntu桌面
2. **分享成果**：在评论区晒出你的美化效果，互相学习
3. **探索更多**：尝试不同的主题组合，找到最适合你的风格

---

💡 **UbuntuNews** | 资讯·工具·教程·社区

🐧 关注我们，获取更多Ubuntu/Linux技术干货

💬 加入QQ群/频道，与全国爱好者交流成长

❤️ 觉得有用？点个"在看"分享给更多人！
