---
title: "블로그 고민하다가 Next.js 만나면서"
pubDate: Oct 29 2024
description: "결국 Astro 프레임워크를 택했다 :)"
tags: [""]
---

# 블로그 고민하다가 Next.js를 만나면서
결국 Astro 프레임워크를 택했다 :)

<div style="color: gray; font-size: 0.9em;">2024.10.29</div>

---

## 개발자는 한 번 쯤, 블로그 개설을 고민한다

나도 역시 그랬다. 블로그 프레임워크를 고민하면서 Next.js에 대해 처음 알게 되었는데, 말로만 듣던 기술 스택을 조금씩 이해하게 될 때 짜릿했다. 결과적으로는 Astro를 선택했지만, Next.js를 살펴보는 과정에서 프레임워크가 해결하고자 하는 문제에 대해 깊이 생각해볼 수 있었다. 특히 SSR(Server Side Rendering)과 SSG(Static Site Generation)가 왜 필요하고 어떻게 구현하는지 배울 수 있었다.

블로그 프레임워크를 찾아보니 정적 콘텐츠가 많은 블로그 특성상 Next.js를 선택하는 경우가 많았다. React 생태계에서는 Gatsby.js도 대안으로 자주 언급되고, Vue.js 진영에서는 Nuxt.js가 비슷한 역할을 하고 있었다. 최근에는 Astro도 블로그 제작에 좋은 선택지로 떠오르고 있었는데, Astro와 Next.js는 해결하고자 하는 문제나 접근 방식은 달랐지만 블로그 제작이라는 관점에서 둘 다 매력적인 옵션이었다. 이 선택의 과정에서 배우고 고민했던 내용들을 정리해보려 한다.

<br>

## Next.js는 어디로 가자는 걸까?

<img src="https://i.imgur.com/zeUqOYY.png" alt="nextjs-intro" />

Next.js는 "다음", "js"를 결합한 이름이다. "다음 자바스크립트", 혹은 자바스크립트를 통한 "웹 어플리케이션 개발의 다음 단계"를 지향한다 정도의 의미로 해석했다. 그렇다면 이전 단계는 어땠고, 무엇을 어떻게 해결하려고 했을까? Next.js는 어디로 가자고 하는 걸까?

2016년 Vercel이 Next.js(당시 이름은 ZEIT였다고 함)를 개발할 당시, React로 SSR을 구현하는 것은 상당히 복잡했다. 예를 들어 React로 SSR을 직접 구현하려면 다음과 같은 설정들이 필요했다:

```js
// React SSR 직접 구현 시 필요한 설정 예시
import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from './App';

const app = express();

app.get('*', (req, res) => {
  const html = ReactDOMServer.renderToString(<App />);
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>React SSR</title></head>
      <body>
        <div id="root">${html}</div>
        <script src="/client.js"></script>
      </body>
    </html>
  `);
});
```

Express로 서버를 직접 구현하고 HTML을 렌더링하는 것은 상당히 복잡했다고 한다. 반면 Next.js에서는 이런 복잡한 설정을 추상화하여 제공한다.

```js
// pages/index.js
export default function Home() {
  return <h1>Hello, SSR!</h1>
}
```

이렇게 간단하게 SSR을 구현할 수 있다. 프레임워크가 복잡한 설정을 대신 처리해주는 것이다. 그럼 SSR은 우리가 달성해야 하는 목표였을까? 웹 어플리케이션에는 SSR이 필요했을까?

## SSR은 정말 필요했나? - 과거 CSR의 등장과 한계 체크 👀 

웹 개발의 패러다임은 끊임없이 변화해왔다. 전통적인 서버 렌더링에서 Single Page Application(SPA)으로의 전환은 사용자 경험을 크게 개선했다. React와 다른 라이브러리, 프레임워크의 등장으로 클라이언트 사이드 렌더링(CSR)이 주류가 되면서 웹 애플리케이션은 더욱 동적이고 인터랙티브해졌다. 하지만 CSR만으로는 해결하기 어려운 문제들이 있었다:

**1) 초기 로딩 시간 : 사용자에게 오래 보여지는 빈 화면**

```js
// 일반적인 React CSR 앱의 초기 HTML
<div id="root"></div>
<script src="bundle.js"></script> // 수 메가바이트의 JS 번들
```
사용자는 JavaScript 번들이 완전히 다운로드되고 실행될 때까지 빈 화면을 보게 된다. 만약 방문한 웹사이트가 로드될 때 까지 3초 이상 걸린다? 이탈할 가능성이 높다. 모바일이라면 더욱 그렇고, 서비스 신뢰도의 문제로 이어지기도 한다.

**2) 검색 엔진이 잘 못찾음(SEO)**<br/>
구글 크롤러는 JavaScript 실행을 기다리지만 다른 검색 엔진들은 그렇지 않다. 즉, CSR만 사용하면 콘텐츠가 검색 결과에 제대로 노출되지 않을 수 있다.

### SSR의 부활, 그러나...

이러한 문제를 해결하기 위해 SSR이 다시 주목받기 시작했다. 하지만 SSR은 트레이드오프가 분명했다. 빠른 초기 페이지 로드, SEO 측면에 장점이 있었다. 또 클라이언트 자원 사용을 낮출 수 있다.
하지만 역으로 서버 자원이 필요하다. 구현 복잡도와 함께, 상태 관리의 어려움이 있었다.

### Next.js: "모든 것을 가질 순 없을까?"

Next.js는 이런 트레이드오프를 최소화하려 했다. [Next.js 공식 문서](https://nextjs.org/docs/basic-features/pages)에 따르면, 페이지별로 다른 렌더링 전략을 선택할 수 있다. 즉, 원할 때 클라이언트에게, 서버에세 렌더링을 맡기는거다.

```js
// 정적 콘텐츠: SSG
export async function getStaticProps() {
  // 빌드 시 한 번만 실행
}

// 동적 콘텐츠: SSR
export async function getServerSideProps() {
  // 요청마다 실행
}

// 인터랙티브 요소: CSR
function ClientComponent() {
  const [state, setState] = useState()
  // 클라이언트에서만 실행
}
```

### 그래서 SSR은 필요한가?

하지만 또 나은 선택지가 나올 수 있을 것 같다. SSR 자체가 목표가 아니었으니까. 진짜 달성해야 할 목표는 뛰어난 사용자 경험, 그것을 달성하는 과정에서의 효율적인 개발 프로세스와 유지보수 가능한 코드베이스일 것이다. 그 측면에서 현재 까지 Next.js가 SSR 구현의 단순화 뿐 아니라, 개발자가 이러한 본질적인 목표에 집중할 수 있게 해주는 것도 큰 가치일 거다.

# 결론 : Astro로 충분한 이유

SSR, SSG, CSR의 장단점을 유연하게 선택할 수 있는 Next.js도 분명 매력적이다. 하지만 내 블로그의 현재 요구사항으로는, Astro로 충분했다. 지금 내가 필요한 건, 정적 콘텐츠를 로드하는 것만이 중요했다. 특히 마크다운 기반의 글이 대부분이라, 사용자 인터랙션이 필요한 동적 기능은 계획에 없었다. 또 Astro도 빠른 초기 로딩 측면에 이점이 있다. "Zero JavaScript by default"라는 멋진 메시지를 풍기며, 정적 콘텐츠에 최적화되어 있음을 보여준다. **무엇 보다 마음에 드는 템플릿을 만났다.** 블로그는 어떻게 만들든, 일단 시작하는게 중요한 것 같다. 블로그 시작에 필요한 기능들이 이미 잘 갖춰져 있는 템플릿을 활용해서 꾸준히 기록해보려고 한다.

#블로그 #astro #nextjs #react #javascript
