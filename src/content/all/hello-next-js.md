---
title: "블로그 고민하다가 Next.js 만나면서"
pubDate: Oct 29 2024
description: "결국 Astro 프레임워크를 택했다 :)"
tags: ["Next.js", "Astro"]
---

# 블로그 고민하다가 Next.js를 만나면서
결국 Astro 프레임워크를 택했다 :)

<div style="color: gray; font-size: 0.9em;">2024.10.29</div>

---

## 개발자는 한 번 쯤, 블로그 개설을 고민한다

나도 역시 그랬다. 블로그 프레임워크를 고민하면서 Next.js도 좋은 선택지 중 하나인 걸 알게 되었는데, 말로만 듣던 기술 스택을 드디어 조금 더 알 수 있겠다는 생각에 짜릿했다. 블로그 프레임워크를 찾아보니 정적 콘텐츠가 많은 블로그 특성상 Next.js를 선택하는 경우가 많았다. React 생태계에서는 Gatsby.js도 대안으로 자주 언급되고, Vue.js 진영에서는 Nuxt.js가 비슷한 역할을 하고 있었다. 최근에는 Astro도 블로그 제작에 좋은 선택지로 떠오르고 있었는데, Astro와 Next.js는 해결하고자 하는 문제나 접근 방식은 달랐지만 블로그 제작이라는 관점에서 둘 다 매력적인 옵션이었다. 결과적으로는 Astro를 선택했지만, 살펴보는 과정에서 Next.js 프레임워크가 해결하고자 하는 문제에 대해 생각해볼 수 있었다. Astro는 사용해보며 나중에 경험과 같이 작성해보기로 하고, 우선 많이 활용되는 Next.js 부터.

<br>

## Next.js는 어디로 가자는 걸까? 🪑 🏃‍♂️‍➡️

Next.js는 "다음" + "js"를 결합한 이름이다. "다음 자바스크립트", 혹은 자바스크립트를 통한 "웹 개발의 다음 단계"를 지향한다 정도의 의미로 해석했다. 그렇다면 이전 단계는 어땠고, 무엇을 어떻게 해결하려고 했을까? Next.js는 어디로 가자고 하는 걸까?

<img src="https://i.imgur.com/zeUqOYY.png" alt="nextjs-intro" />

2016년 Vercel이 Next.js(당시 이름은 ZEIT였다고 함)를 개발할 당시, React로 SSR을 구현하는 것은 상당히 복잡했다. 예를 들어 React로 SSR을 직접 구현하려면 여러 설정이 필요했다.

몇 가지 방법이 있었지만, React로 서버 사이드 렌더링(SSR)을 구현하는 방법 중 하나가 [react-dom/server API](https://ko.react.dev/reference/react-dom/server) 모듈을 사용하는 것이었다. 이 모듈은 React 컴포넌트를 서버에서 HTML 문자열로 렌더링할 수 있는 기능을 제공한다. 예를 들어, `ReactDOMServer.renderToString()` 메서드를 사용해서 컴포넌트를 HTML 문자열로 변환할 수 있게 되는 것. 이렇게 생성된 HTML이 클라이언트에 전송되어 초기 페이지 로드 시 사용자가 볼 수 있도록 하는 흐름이다.

```js
import express from "express"; // 👈 클라이언트 코드에 express?!
import React from "react";
import ReactDOMServer from "react-dom/server"; // 👈 요 모듈을 활용해야 함
import App from "./App";

const app = express();

app.get("*", (req, res) => {
  const html = ReactDOMServer.renderToString(<App />); // 👈 React 컴포넌트를 HTML 문자열로 변환
  
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

이때 Express를 함께 사용했다는 걸 볼 수 있다. 처음 이 예시를 보고, 클라이언트 코드에서 서버 구현할 때 사용하는 Express를 사용한다는 점이 어색하다고 느꼈다. 일반적으로는 서버 코드와 클라이언트 코드를 분리해서 관리하는데, 같은 디렉토리 안에서 함께 존재하는 경우도 당연히 가능하긴 했다. Express는 서버 사이드에서 HTTP 요청을 다룰 때 사용되는, Node.js 웹 프레임워크이다. Express는 Node.js 환경에 중심을 둔 프레임워크이고, React는 브라우저 환경에서 실행되는 것이 일반적이라 이 둘의 만남이 어색하다고 느꼈나보다. 어쨋든 서로 다른 환경에서 작동하지만, 이 둘을 함께 사용해서 Express로 서버 측에서 React 컴포넌트를 렌더링하고 클라이언트에 HTML을 전송하는 역할을 함으로써 서버 사이드 렌더링(SSR)을 구현해왔다고 한다.

- Express 코드는 어느 위치에 있어야 하는 것인지 궁금했는데 레퍼런스를 찾아보니, 보통 루트 디렉토리나 server.js 등 파일에 위치시켰던 모양이다. 해당 파일에서 Express 서버를 설정하고, 라우팅과 미들웨어를 정의하는 식.
- 이후 찾아볼 것 메모 : Express가 클라이언트 코드와 별개로 작동하는데, 어떻게 이게 가능한지 갑자기 낯설다. 원리 체크해보자.

**Next.js에서는 이런 복잡한 설정을 추상화하여 제공한다.**

```js
// pages/index.js
export default function Home() {
  return <h1>Hello, SSR!</h1>
}
```
- 이후 찾아볼 것 메모 : 소스 코드 확인

이렇게 간단하게 SSR을 구현할 수 있다. 프레임워크가 복잡한 설정을 대신 처리해주는 것이다. 그럼 SSR은 우리가 달성해야 하는 목표였을까? 웹 어플리케이션에는 SSR이 왜 중요했을까?

<br>

## SSR은 정말 필요했나? - 과거 CSR의 등장과 한계 체크 👀 

웹 개발의 패러다임은 끊임없이 변화해왔다. 전통적인 서버 렌더링에서 Single Page Application(SPA)으로의 전환은 사용자 경험을 크게 개선했다. React와 다른 라이브러리, 프레임워크의 등장으로 클라이언트 사이드 렌더링(CSR)이 주류가 되면서 웹 애플리케이션은 더욱 동적이고 인터랙티브해졌다. 하지만 CSR만으로는 해결하기 어려운 문제들이 있었다.

**1) 초기 로딩 시간 : 사용자에게 오래 보여지는 빈 화면**

```js
// 일반적인 React CSR 앱의 초기 HTML
<div id="root"></div>
<script src="bundle.js"></script> // 수 메가바이트의 JS 번들
```

사용자는 JavaScript 번들이 완전히 다운로드되고 실행될 때까지 빈 화면을 보게 된다. 만약 방문한 웹사이트가 로드될 때 까지 3초 이상 걸린다? 이탈할 가능성이 높다. 모바일이라면 더욱 그렇고, 서비스 신뢰도의 문제로 이어지기도 한다.

**2) 검색 엔진이 우리 서비스를 잘 못 찾는다 (SEO)**<br/>
구글 크롤러는 JavaScript 실행을 기다리지만 다른 검색 엔진들은 그렇지 않다고 한다. 즉, CSR만 사용하면 콘텐츠가 검색 결과에 제대로 노출되지 않을 수 있다는 의미이다. 구글이 우리 문서(웹사이트)를 어떻게 찾는지 다시 확인해보았다. 구글 웹 크롤러가 페이지를 방문할 때 JavaScript를 실행, DOM이 완전히 로드될 때까지 기다린 후 콘텐츠를 인덱싱하는 2단계 프로세스를 거친다고 한다. 하지만 이 과정에서도 JavaScript 실행에 시간이 걸리거나 오류가 발생하면 콘텐츠가 제대로 인덱싱되지 않을 수 있어서 주의해야 한다.

[한글과컴퓨터 FE 개발팀 - SEO 톺아보기, 정말 SSR이 SEO에 좋을까?](https://tech.hancom.com/2024-07-26-ssr-seo/)<br/>[(번역)Ultimate Guide to JavaScript SEO](https://helloinyong.tistory.com/308)

### SSR의 부활, 그러나...

이런 문제들을 해결하기 위해 SSR이 다시 관심을 받게 됐다. SSR은 단순히 '페이지가 빨리 뜨고 검색에 잘 걸리게 하는 것' 이상의 의미가 있었다. 초기 페이지 로드 속도에 따라 결국 사용자 만족도가 달라지고, SEO 측면에서도 검색엔진이 우리 서비스를 더 잘 찾으면 그건 퍼널 개선이나 매출 향상 등 비즈니스 임팩트로 이어진다.

하지만 SSR에도 트레이드 오프가 있었다. 서버가 필요하다는 건 피할 수 없는 문제였다 (위에서 express 예시 처럼) 모든 요청을 서버에서 처리해야 하니까 서버에 부담이 가고, 그만큼 운영 비용도 더 들었다. React를 쓰더라도 SSR을 구현하는 건 여전히 복잡했다. 상태 관리를 한다면, 클라이언트와 서버 상태 동기화도 신경써야 할 것이다.

<br/>

### Next.js: "모든 것을 가질 순 없을까?"

Next.js는 이런 트레이드오프를 최소화하려 했다. 페이지별로 다른 렌더링 전략을 선택할 수 있다. 즉, 원할 때 클라이언트에게, 서버에세 렌더링을 맡기는거다.

[Vercel - How to choose the best rendering strategy for your app](https://vercel.com/blog/how-to-choose-the-best-rendering-strategy-for-your-app)

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

하지만 또 언젠가, 다른 선택지가 나올 수 있을 것 같다. SSR 자체가 목표가 아니었으니까. 진짜 달성해야 할 목표는 탁월한 사용자 경험, 그것을 달성하는 과정에서의 효율적인 개발 프로세스와 유지보수 가능한 코드베이스일 것이다. 그 측면에서 현재 까지 Next.js가 SSR 구현의 단순화 뿐 아니라, 개발자가 이러한 본질적인 목표에 집중할 수 있게 해주는 것도 큰 가치일 거다.

<br/>

### (번외) 하지만 내 블로그가 Astro로 충분했던 이유

SSR, SSG, CSR의 장단점을 유연하게 선택할 수 있는 Next.js도 분명 매력적이다. 하지만 내 블로그의 현재 요구사항으로는, Astro로 충분했다. 지금 내가 필요한 건, 정적 콘텐츠를 로드하는 것만이 중요했다. 특히 마크다운 기반의 글이 대부분이라, 사용자 인터랙션이 필요한 동적 기능은 계획에 없었다. 또 Astro도 빠른 초기 로딩 측면에 이점이 있다. "Zero JavaScript by default"라는 멋진 메시지를 풍기며, 정적 콘텐츠에 최적화되어 있음을 보여준다. 사실 마음에 드는 템플릿도 찾았다. 블로그는 어떻게 만들든, 일단 시작하는게 중요한 것 같다. 블로그 시작에 필요한 기능들이 이미 잘 갖춰져 있는 템플릿을 활용해서 꾸준히 기록해보려고 한다.

#블로그 #astro #nextjs #react #javascript
