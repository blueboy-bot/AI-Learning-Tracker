# AI Learning Tracker

[English](#english) | [简体中文](#简体中文)

## English

AI Learning Tracker is a privacy-friendly, local-first tracker for people studying AI, programming, and software development.

### Live Demo

[Open the Live Demo](https://ai-learning-tracker-lime.vercel.app)

![AI Learning Tracker: learning logs, focus timer, and course progress](public/readme-hero.png)

### Highlights

- Daily learning logs, goals, and streaks
- Live focus timer with start, break, resume, and automatic session logging
- Full monthly activity calendar with day-level learning details and navigation up to six months ahead
- Dated learning goals for milestones such as finishing a first software project or a foundation course
- Chinese / English interface
- Built-in AI for Beginners checklist with progress tracking and language-aware lesson links
- No account, backend, or cloud data collection required

### Run locally

Node.js 22.13 or later is required.

```bash
pnpm install
pnpm exec vinext dev
```

Visit `http://localhost:3000`.

### Privacy

Learning logs, goal status, and active timers are stored in your browser's Local Storage. Clearing browser site data removes them. Cross-device sync is not available yet.

### Course source

The included path is based on [blueboy-bot/AI-For-Beginners](https://github.com/blueboy-bot/AI-For-Beginners), which is available under the MIT License. Course content and trademarks belong to that project's contributors.

### Contributing

Issues and pull requests are welcome. Please open an issue to discuss larger changes before starting implementation.

### License

[MIT License](LICENSE) © 2026 AI Learning Tracker Contributors

---

## 简体中文

AI Learning Tracker 是一个面向 AI、编程和软件开发学习者的本地优先学习追踪工具。

### 在线体验

[打开 Live Demo](https://ai-learning-tracker-lime.vercel.app)

![AI Learning Tracker：学习记录、专注计时与课程进度](public/readme-hero.png)

### 功能

- 每日学习记录、学习目标和连续打卡
- 实时专注计时器：开始、休息、继续与结束自动记入当天时长
- 完整自然月学习热力图；可查看未来六个月并点击日期查看学习详情
- 可为特定日期手动设定目标，例如完成第一个软件或完成基础课程学习
- 中文 / English 界面切换
- 内置 **AI for Beginners** 学习计划，支持逐课完成、折叠展示与中英文课程跳转
- 所有数据保存在浏览器本地，无需账号、后端或云端数据收集

### 本地运行

需要 Node.js 22.13 或更高版本。

```bash
pnpm install
pnpm exec vinext dev
```

打开 `http://localhost:3000`。

### 数据与隐私

学习记录、目标状态和进行中的计时都保存在浏览器的 Local Storage。清除浏览器网站数据会删除它们；目前尚未提供跨设备同步。

### 课程来源

内置计划整理自 [blueboy-bot/AI-For-Beginners](https://github.com/blueboy-bot/AI-For-Beginners)，该课程采用 MIT 许可证。课程内容及其商标归原项目贡献者所有。

### 贡献

欢迎提交 Issue 和 Pull Request。提交较大的功能前，建议先建立 Issue 讨论设计。

### 许可证

本项目采用 [MIT License](LICENSE)。
