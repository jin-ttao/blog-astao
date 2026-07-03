---
title: "GitHub Issue에서 Claude Code 써봤는데 WOW"
pubDate: Dec 22 2024
description: "GitHub에서 직접 코드 수정하는 AI... 원리가 뭐지?"
tags: ["Claude Code", "GitHub", "AI 도구"]
---

# GitHub Issue에서 Claude Code 써봤는데 WOW

GitHub에서 직접 코드 수정하는 AI... 원리가 뭐지?

---

### 충격적인 첫 경험

며칠 전, GitHub Issue에서 `@claude` 멘션을 달았더니 정말로 AI가 답변을 달았다. 그런데 답변만 단 게 아니라 **실제로 내 레포지토리의 코드를 수정하고 커밋까지 생성**했다. 처음에는 눈을 의심했다. "어? 내가 커밋 안 했는데 누가 코드를 바꿨지?"

이게 대체 어떻게 가능한 거지? GitHub에서 소스코드를 그냥 수정한 건가? 궁금증이 폭발해서 Claude Code의 `/install-github-app` 명령어의 원리부터 파헤쳐봤다.

### 마법이 아닌 GitHub Actions의 정교한 활용

결론부터 말하면, **GitHub Actions 워크플로우를 통한 자동화**였다. 실시간으로 보이지만 사실은 백그라운드에서 다음과 같은 과정이 일어난다:

1. `@claude` 멘션 감지 (GitHub Webhook)
2. GitHub Actions 워크플로우 트리거
3. Claude Code Action이 레포지토리 체크아웃
4. AI가 코드 분석 및 수정
5. 변경사항 커밋 및 푸시

```yaml
# .github/workflows/claude.yml (자동 생성됨)
name: Claude Code Assistant
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  
jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: anthropics/claude-code-action@v1
```

**보통 "어떻게 가능한지 모르겠다"는 호기심은 그 기술의 깊은 원리를 이해할 수 있는 단서가 되기도 한다.** 이 경우도 마찬가지였다. 겉으로는 마법 같아 보이지만, 실제로는 이미 존재하는 GitHub 생태계의 정교한 조합이었다.

### Claude Code vs Cursor IDE, 뭐가 다를까?

Claude Code를 경험하고 나서 기존에 쓰던 Cursor IDE와 비교해보지 않을 수 없었다. 둘 다 AI 코딩 도구이지만 철학이 완전히 달랐다:

#### Claude Code의 차별점

**1. 터미널 네이티브 접근**
```bash
# 기존 워크플로우에 자연스럽게 통합
git status | claude -p "이 변경사항들을 요약해줘"
tail -f app.log | claude -p "에러 발생시 알려줘"
```

Cursor가 VS Code를 포크한 IDE라면, Claude Code는 **Unix 철학을 따르는 터미널 도구**다. 내가 이미 사용하고 있는 개발 환경을 바꾸지 않고도 AI의 도움을 받을 수 있다.

**2. 전체 프로젝트 컨텍스트**
Cursor는 현재 열린 파일 중심이라면, Claude Code는 프로젝트 전체를 이해한다. Git 히스토리, 의존성, 아키텍처 전반을 파악하고 작업한다.

**3. 액션 중심 설계**
```bash
# 즉시 실행 가능한 명령어들
claude "Docker 컨테이너 설정하고 Redis 연결해줘"
claude "API 엔드포인트 테스트하고 문제점 수정해줘"
```

단순히 코드를 제안하는 게 아니라, 실제로 실행까지 해준다. 이게 핵심 차이점이다.

### 실제 활용해본 소감

팀 프로젝트에서 Shopify cart attribute 이슈를 해결할 때 Claude Code를 써봤다. GitHub Issue에 문제 상황을 설명하고 `@claude`를 멘션했더니:

1. 관련 코드 파일들을 자동으로 찾아냄
2. 문제 원인 분석 및 해결 방안 제시
3. 실제 코드 수정 및 테스트 코드 작성
4. 문서까지 업데이트

혼자서 몇 시간 고민했을 문제를 15분 만에 해결했다. **이건 단순히 "AI가 똑똑해서"가 아니라, 도구가 내 워크플로우에 자연스럽게 녹아들었기 때문**이다.

### 개발 도구의 새로운 패러다임

Claude Code를 써보면서 느낀 건, 이게 단순한 코딩 어시스턴트를 넘어서는 도구라는 점이다. **"AI가 개발자의 터미널 파트너"**라는 철학이 정말 와닿았다.

기존의 AI 코딩 도구들이 "더 똑똑한 자동완성"에 머물렀다면, Claude Code는 "내 개발 환경의 연장선"이 되었다. 새로운 IDE를 배우거나 워크플로우를 바꿀 필요 없이, 그저 터미널에서 동료와 대화하듯 AI와 협업할 수 있다.

앞으로 MCP(Model Context Protocol) 생태계가 더 발전하면, Google Drive나 Figma 같은 외부 도구들과도 연결될 예정이라고 한다. **개발자의 모든 도구가 하나의 통합된 경험으로 연결되는 미래**를 엿볼 수 있었다.

### 결론: 도구가 사람에게 맞춰지는 시대

Claude Code 경험을 통해 깨달은 건, 좋은 도구는 **사람이 도구에 맞춰지는 게 아니라 도구가 사람에게 맞춰진다**는 점이다. 새로운 IDE를 배우거나, 특별한 설정을 하지 않아도 되었다. 그저 평소처럼 GitHub Issue에 멘션을 달았을 뿐인데, 마법 같은 일이 일어났다.

아직 초기 단계의 도구이지만, 개발자와 AI의 협업 방식에 대한 새로운 가능성을 보여준 경험이었다. 앞으로도 이런 도구들이 어떻게 발전할지 기대가 된다.

---

#Claude Code #GitHub #AI도구 #개발자도구 #터미널

<br>
