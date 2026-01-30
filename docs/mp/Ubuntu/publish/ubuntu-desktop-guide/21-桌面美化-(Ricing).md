# 21. 桌面美化 (Ricing)

"Ricing" 是 Linux 社区的黑话，指像改装赛车一样深度定制桌面。
GNOME 默认相对克制，但通过扩展、主题和图标，你依然能把它调成顺手的工作台。

先讲个现实规则：**美化要可回滚**。每加一个扩展、换一个主题，都要知道“怎么撤回”，不然一次系统更新就可能把桌面搞到进不去。

## 1. 安装必备工具

```bash
sudo apt install gnome-tweaks gnome-shell-extensions
```
*   **GNOME Tweaks (优化)**: 一个图形化工具，用于修改主题、字体、启动项等。
*   **Extension Manager (扩展管理器)**: 建议在 App Center 搜索并安装 "Extension Manager"（蓝色图标），它可以让你直接浏览和安装扩展，而不需要去浏览器。

如果你装完扩展后桌面开始抽风（卡顿、UI 消失、崩溃），先别急着重装系统，优先把扩展全部禁用：

```bash
gnome-extensions disable --all
```

## 2. 必装扩展 (Extensions)

打开 Extension Manager，搜索并安装：

*   **Dash to Dock**: 把 Dock 栏从默认的"隐藏式"变成类似 macOS 的常驻底栏，支持透明度、自动隐藏、点击最小化等。
*   **User Themes**: 允许从用户目录加载 Shell 主题。
*   **Blur my Shell**: 给概览界面、Top Bar 添加磨砂玻璃特效，瞬间提升高级感。
*   **ArcMenu**: 把左上角的 "Activities" 变成一个传统的开始菜单（适合怀念 Windows 的用户）。
*   **Just Perfection**: 允许你隐藏任何你不想要的 UI 元素（比如搜索栏、活动按钮）。

扩展不建议一次装太多。越多越“像你想要的样子”，也越容易在 GNOME 大版本更新时一起出问题。建议先装 2–3 个，稳定用一周，再考虑加。

## 3. 更换主题 (Themes)

去 [Gnome-look.org](https://www.gnome-look.org/) 寻找你喜欢的主题。

### GTK 主题 (应用程序外观)
1.  下载主题文件（通常是压缩包）。
2.  解压到 `~/.themes` 文件夹（如果没有就新建）。
3.  打开 GNOME Tweaks -> Appearance -> Legacy Applications，选择你下载的主题。
*   *推荐主题*: WhiteSur (仿 macOS), Orchis, Nordic.

### Icon 主题 (图标)
1.  下载图标包。
2.  解压到 `~/.icons` 文件夹。
3.  打开 GNOME Tweaks -> Appearance -> Icons 选择。
*   *推荐图标*: Tela-circle, Papirus, WhiteSur.

## 4. 终端美化

如果你已经按照第 12 篇教程配置了 Zsh + Oh My Zsh，你的终端已经很漂亮了。
你可以进一步：
*   在终端首选项里修改配色方案 (Color Scheme)。
*   安装 Nerd Fonts (如 Hack Nerd Font) 以显示各种漂亮的图标。

美化是一个无底洞，请适度折腾，不要忘记我们是用电脑来工作的（大概）。
