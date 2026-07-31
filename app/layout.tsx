/* Static styles are intentionally served from public for Vinext compatibility. */
/* eslint-disable @next/next/no-css-tags */
import type { Metadata } from "next";

export const metadata: Metadata = { title: "AI Learning Tracker", description: "记录 AI 编程与软件开发学习进度的本地优先工具。" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><head><link rel="stylesheet" href="/site.css" /><link rel="stylesheet" href="/timer.css" /><link rel="stylesheet" href="/confirmation.css" /><link rel="stylesheet" href="/course-plan.css" /><link rel="stylesheet" href="/lesson-upgrade.css" /><link rel="stylesheet" href="/course-title.css" /><link rel="stylesheet" href="/course-position.css" /><link rel="stylesheet" href="/folder-toggle.css" /><link rel="stylesheet" href="/day-detail.css" /></head><body>{children}</body></html>; }
