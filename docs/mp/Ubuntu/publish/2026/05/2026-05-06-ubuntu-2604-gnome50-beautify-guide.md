# Ubuntu 26.04 颜值翻倍！GNOME 50 必装 8 款扩展 + Tweaks 调教全攻略

> 升级了 Ubuntu 26.04，桌面还是默认那副"素颜"？别急，8 款精选扩展 + GNOME Tweaks 深度调教，10 分钟让你的 Linux 颜值直接拉满。
> ⏱ 阅读时长：约 6 分钟

---

## 为什么 GNOME 50 值得美化？

Ubuntu 26.04 LTS 搭载了最新的 GNOME 50 桌面环境，原生支持 Wayland、性能提升 10%-20%，但默认界面对很多用户来说还是太"素"了——

- 没有任务栏，只能靠顶栏切换窗口
- 没有模糊效果，面板和 Overview 一片扁平
- 主题不能换，图标不能改，字体不能调

好消息是，GNOME 50 的扩展生态已经全面适配，**美化门槛比以往任何时候都低**。下面这份攻略，从安装工具到逐个配置，手把手带你搞定。

---

## 第一步：安装美化基础工具

两件套缺一不可：

**1. GNOME Tweaks — 深度定制控制中心**

```bash
sudo apt install gnome-tweaks
```

安装后在应用菜单搜索「Tweaks」打开，它能调整的主题、字体、窗口按钮等，都是系统设置里找不到的选项。

**2. 浏览器扩展管理器**

```bash
sudo apt install chrome-gnome-shell
```

然后在 Firefox 访问 [extensions.gnome.org](https://extensions.gnome.org)，安装浏览器插件后，就能一键安装/管理 GNOME 扩展了。

> 💡 **提示**：如果访问 extensions.gnome.org 较慢，也可以直接用命令行安装扩展，本文每个扩展都附带了安装命令。

---

## 第二步：8 款必装扩展，逐一拆解

### 🔹 1. Dash to Dock — 让 Ubuntu 拥有 macOS 风格 Dock

| 项目 | 说明 |
|:---|:---|
| 功能 | 将左侧 Dash 变为常驻 Dock 栏 |
| 安装 | `sudo apt install gnome-shell-extension-dash-to-dock` |
| 适合 | 所有用户，尤其是从 macOS 转过来的新手 |

**调教要点**：
- 位置改到「底部」，图标大小调至 48px
- 开启「智能隐藏」，全屏时自动收起
- 关闭「显示 Ubuntu 按钮」避免重复

### 🔹 2. Blur My Shell — 一键模糊，桌面质感飞升

| 项目 | 说明 |
|:---|:---|
| 功能 | 为顶栏、Overview、Dock 添加高斯模糊 |
| 安装 | [extensions.gnome.org/3193](https://extensions.gnome.org/extension/3193/blur-my-shell/) |
| 适合 | 追求视觉质感的用户 |

**调教要点**：
- 模糊强度调至 3-5，过犹不及
- 开启「Overview 模糊」和「面板模糊」
- 搭配半透明主题效果更佳

### 🔹 3. User Themes — 解锁主题自由

| 项目 | 说明 |
|:---|:---|
| 功能 | 允许加载第三方 Shell 主题 |
| 安装 | `sudo apt install gnome-shell-extension-user-theme` |
| 适合 | 想换整套主题的用户 |

安装后在 Tweaks → 外观 → Shell 中切换主题。推荐搭配主题见下文。

### 🔹 4. Caffeine — 阻止屏幕自动锁屏

| 项目 | 说明 |
|:---|:---|
| 功能 | 一键禁用自动挂起/锁屏 |
| 安装 | [extensions.gnome.org/517](https://extensions.gnome.org/extension/517/caffeine/) |
| 适合 | 开会演示、看长文、跑任务的场景 |

顶栏出现咖啡杯图标，点击切换，绿色=保持唤醒。比去设置里改省事 100 倍。

### 🔹 5. Clipboard Indicator — 剪贴板历史管理

| 项目 | 说明 |
|:---|:---|
| 功能 | 记录剪贴板历史，一键粘贴 |
| 安装 | [extensions.gnome.org/779](https://extensions.gnome.org/extension/779/clipboard-indicator/) |
| 适合 | 频繁复制粘贴的开发者和写作者 |

**调教要点**：
- 历史条数设为 15-20 条
- 开启「清除私有复制」保护隐私

### 🔹 6. GSConnect — 手机电脑无缝联动

| 项目 | 说明 |
|:---|:---|
| 功能 | KDE Connect 的 GNOME 版，手机通知/文件/剪贴板互通 |
| 安装 | `sudo apt install gnome-shell-extension-gsconnect` |
| 适合 | 安卓手机用户 |

手机安装 KDE Connect 应用，同一 WiFi 下配对即可。通知同步、文件传输、远程控制 PPT 全都有。

### 🔹 7. Vitals — 系统监控一目了然

| 项目 | 说明 |
|:---|:---|
| 功能 | 顶栏显示 CPU/内存/温度/网速 |
| 安装 | [extensions.gnome.org/1460](https://extensions.gnome.org/extension/1460/vitals/) |
| 适合 | 技术爱好者和运维人员 |

**调教要点**：
- 只显示 CPU 温度和内存使用率，信息简洁不杂乱
- 温度单位改为摄氏度

### 🔹 8. Appindicator — 托盘图标支持

| 项目 | 说明 |
|:---|:---|
| 功能 | 支持传统系统托盘应用（输入法、网盘等） |
| 安装 | `sudo apt install gnome-shell-extension-appindicator` |
| 适合 | 所有用户（fcitx5 输入法用户必装） |

Ubuntu 26.04 默认已预装此扩展，但如果你发现输入法图标不显示，检查是否启用。

---

## 第三步：主题 × 图标 × 字体，三件套搭配

### 推荐主题组合

| 类型 | 推荐 | 安装方式 |
|:---|:---|:---|
| Shell 主题 | **Orchis-Dark** | `sudo apt install orchis-gtk-theme` 或从 [GitHub](https://github.com/vinceliuice/Orchis-theme) 下载 |
| 图标主题 | **Tela-icon-theme** | 从 [GitHub](https://github.com/vinceliuice/Tela-icon-theme) 安装 |
| 光标主题 | **Bibata-Modern-Classic** | `sudo apt install bibata-cursor-theme` |
| 字体 | **思源黑体 / Fira Code** | `sudo apt install fonts-firacode` |

### 主题切换操作

1. 将主题文件放到 `~/.themes/` 或 `~/.local/share/themes/`
2. 图标放到 `~/.icons/` 或 `~/.local/share/icons/`
3. 打开 GNOME Tweaks → 外观，逐一切换

> ⚡ **快捷方式**：如果你懒得一个个装，可以直接用 **OMF (Omakub)** 一键美化脚本，专为 Ubuntu 26.04 定制：
> ```bash
> bash <(curl -fsSL https://omakub.org/install)
> ```

---

## 第四步：Tweaks 隐藏选项调教

这些是 GNOME Tweaks 里容易被忽略但很实用的设置：

### 外观调整

| 设置项 | 推荐值 | 说明 |
|:---|:---|:---|
| 光标大小 | 32 | 默认 24 在高分屏偏小 |
| 图标主题 | Tela-dark | 深色图标配合暗色主题 |
| Shell 主题 | Orchis-Dark | 需先安装 User Themes 扩展 |

### 窗口调整

| 设置项 | 推荐值 | 说明 |
|:---|:---|:---|
| 标题栏按钮 | 开启「最小化」「最大化」 | Ubuntu 默认只留关闭按钮 |
| 窗口焦点 | 「懒惰」| 鼠标悬停即聚焦窗口 |

### 字体调整

| 设置项 | 推荐值 | 说明 |
|:---|:---|:---|
| 界面字体 | 思源黑体 11 | 中文显示最清晰 |
| 等宽字体 | Fira Code 12 | 编程专用，支持连字符 |
| 字体渲染 | 开启「微调」= 完整 | 让中文字体边缘更锐利 |

---

## 第五步：进阶美化（可选）

想再进一步？试试这些：

- **动态壁纸**：安装 [Komorebi](https://github.com/cheesecakeufo/komorebi) 支持视频壁纸
- **GRUB 美化**：安装 [grub-customizer](https://launchpad.net/grub-customizer)，开机画面也能换
- **终端美化**：Oh My Zsh + Powerlevel10k 主题，终端也能赏心悦目
- **Conky 系统面板**：桌面嵌入硬件信息，老鸟最爱

---

## 效果对比：美化前 vs 美化后

| 维度 | 默认 | 美化后 |
|:---|:---|:---|
| 任务栏 | 无，只能 Overview 切换 | Dock 常驻 + 分组 |
| 视觉质感 | 扁平纯色 | 模糊 + 半透明 |
| 主题 | 仅亮色/暗色 | 任意第三方主题 |
| 图标 | Adwaita 标准 | Tela 彩色图标 |
| 剪贴板 | 无历史 | 15 条历史快速调用 |
| 系统监控 | 需开终端 | 顶栏实时显示 |

---

## 常见问题

**Q：装了扩展后系统变卡？**
A：Blur My Shell 是性能大户，低端设备建议关闭 Overview 模糊或降低模糊强度。Vitals 的刷新间隔也可以从 2 秒改为 5 秒。

**Q：扩展装了不生效？**
A：用 `gnome-extensions list` 查看已安装扩展，用 `gnome-extensions enable 扩展名` 手动启用。Wayland 下需要注销重新登录。

**Q：GNOME 50 扩展兼容性如何？**
A：目前主流扩展（本文推荐的 8 款）已全部适配 GNOME 50。如果某个扩展显示不兼容，等几天作者一般会更新。

**Q：Omakub 安全吗？**
A：Omakub 是 DHH（Ruby on Rails 作者）的开源项目，代码在 [GitHub](https://github.com/omakub/omakub) 完全可审计。但建议先在虚拟机试跑。

---

## 一键安装速查

把 8 款扩展的安装命令汇总：

```bash
# 基础工具
sudo apt install gnome-tweaks chrome-gnome-shell

# APT 可装的扩展
sudo apt install gnome-shell-extension-dash-to-dock \
  gnome-shell-extension-user-theme \
  gnome-shell-extension-gsconnect \
  gnome-shell-extension-appindicator

# 需从 extensions.gnome.org 安装的
# Blur My Shell: https://extensions.gnome.org/extension/3193/
# Caffeine: https://extensions.gnome.org/extension/517/
# Clipboard Indicator: https://extensions.gnome.org/extension/779/
# Vitals: https://extensions.gnome.org/extension/1460/
```

---

## 总结

Ubuntu 26.04 + GNOME 50 的美化不需要折腾，8 款扩展 + Tweaks 调教，10 分钟就能让桌面从"能用"变成"好看好用"。核心思路就三步：

1. **装工具**：Tweaks + Shell Integration
2. **装扩展**：8 款精选按需安装
3. **换主题**：Orchis + Tela + Bibata 三件套

Linux 的自由，不光是代码的自由，也是桌面的自由。动手试试吧！

---

💡 **UbuntuNews** | 资讯·工具·教程·社区
🐧 关注我们，获取更多Ubuntu/Linux技术干货
💬 加入QQ群/频道，与全国爱好者交流成长
❤️ 觉得有用？点个"在看"分享给更多人！
