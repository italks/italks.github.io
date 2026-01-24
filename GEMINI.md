# GEMINI.md - Project Context

## Project Overview

**Project Name**: 运营平台 (Operations Platform) / italks.github.io
**Type**: Static Site / Documentation
**Framework**: [VitePress](https://vitepress.dev/) (Vue.js based)
**Description**: A self-media operations platform aggregating content related to WeChat Official Accounts, Mini Programs, Ubuntu News, and Xiaohongshu. It serves as a personal blog or content hub hosted on GitHub Pages.

## Tech Stack

*   **Core**: VitePress ^1.6.4
*   **Language**: TypeScript (`.mts` config), Markdown (content)
*   **Package Manager**: pnpm (inferred from `pnpm-lock.yaml`)

## Directory Structure

*   `docs/`: The root directory for the VitePress site content.
    *   `.vitepress/`: Configuration directory.
        *   `config.mts`: Main site configuration (nav, sidebar, theme).
        *   `theme/`: Custom theme files (styles, layout).
    *   `mp/`: Content related to WeChat Official Accounts and Mini Programs.
        *   `APP/`: Mobile App development articles.
        *   `Ubuntu/`: Ubuntu news and tutorials.
        *   `Me/`: Personal thoughts/articles.
    *   `xiaohongshu/`: Content related to Xiaohongshu posts.
    *   `public/`: Static assets (images, icons) served at the root path.
    *   `index.md`: The landing page definition.

## Building and Running

The project uses `npm` scripts defined in `package.json`. Use `pnpm` to execute them.

| Command | Description | Exact Script |
| :--- | :--- | :--- |
| **Start Dev Server** | Starts the local development server with hot-reload. | `pnpm docs:dev` |
| **Build for Production** | Builds the static site to `.vitepress/dist`. | `pnpm docs:build` |
| **Preview Build** | Serves the built static site locally for testing. | `pnpm docs:preview` |

## Development Conventions

*   **Content**: Articles are written in Markdown (`.md`).
*   **Frontmatter**: Use YAML frontmatter for page-specific configuration (e.g., `layout: home`, `title`).
*   **Images**:
    *   Place global images in `docs/public/imgs/`.
    *   Article-specific images seem to be organized in subdirectories like `docs/mp/APP/publish/imgs/`.
*   **Configuration**: Site-wide settings (navigation, sidebar) are managed in `docs/.vitepress/config.mts`.
*   **Deployment**: As a GitHub Pages project (`italks.github.io`), the `docs:build` output is likely deployed to the `gh-pages` branch or the root of the master branch depending on repository settings (typically `docs/.vitepress/dist` is the build target).
