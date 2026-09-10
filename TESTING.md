测试说明
====

自动化验收测试（Playwright headless）
--------------------------------

对话模块语音交互（TTS + STT + 发送确认，任务 t_d92fbecf）的 5 条验收标准
由 scripts/voice-interaction.test.mjs 自动验证，运行方式：

    npm install
    npm test

npm test 会：
1. 用 Node http server 在本地随机端口起一个静态服务器，直接托管本仓库
   （不改动任何业务代码，AITutor 用的是仓库自带的本地规则引擎，无需联网/密钥）。
2. 用 Playwright 启动 headless Chromium，在页面脚本执行前
   （page.addInitScript）注入对 window.SpeechRecognition /
   window.speechSynthesis 的确定性 mock —— 只 mock 浏览器原生语音接口，
   不 mock js/speech.js、js/conversation.js 等业务代码，跑的是真实业务逻辑。
3. 依次驱动：进入自由对话 -> 校验 AI 开场白自动朗读 -> 校验 44x44pt
   点击热区 -> 按住麦克风模拟一段识别结果 -> 校验录音波形/计时器可见反馈
   -> 校验识别结果填入输入框但不自动发送 -> 点击发送后消息才真正发出
   -> 校验 AI 消息旁的重播按钮可再次触发朗读。
4. 全部 15 条断言（覆盖 5 条验收标准）打印 PASS/FAIL，任一失败以
   非零退出码结束，可接入 CI。

已知局限（不作为本次验收门槛，见任务卡「不做什么」及验收标准范围）：
- 未在真机 Safari / iOS 上验证触控与 Web Speech 兼容性 —— 浏览器原生
  API 支持程度因设备而异，需要真机人工验证。
- Web Speech API 的真实语音识别准确度未测试（mock 只验证「识别结果
  如何被业务逻辑处理」，不验证语音转文字本身的准确性）。
