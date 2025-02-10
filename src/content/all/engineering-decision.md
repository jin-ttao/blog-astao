---
title: "개발 과정에서의 고민, 의사결정 #1"
pubDate: Feb 4 2025
description: "@welcome-toast가 CDN 제공에 명시적 버전 관리 방식을 택한 이유"
tags: [""]
---

# 개발 고민, 의사결정 #1

## welcome-toast가 CDN 제공에 명시적 버전 관리 방식을 택한 이유

<div style="color: gray; font-size: 0.9em;">2025.02.04</div>

<blockquote style="color: gray; font-size: 0.9em; margin: 1rem 0; padding-left: 1rem; border-left: 4px solid #ddd;">
  jsDelivr 만으론 부족해<br>
  연동 후 다시 스크립트를 교체하지 않도록 (하고 싶었지만)<br>
  Timestamp 쿼리 파라미터 vs 명시적 버전 관리<br>
  레슨 "결국 맥락에 따라 균형점 찾기!"
</blockquote>


---

### jsDelivr 만으론 부족해

개인 프로젝트로 진행 중인 @[welcome-toast SDK](https://github.com/welcome-toast/welcome-toast)는 웹사이트 온보딩을 위한 토스트 메시지를, 어드민 페이지 편집 만으로 바로 적용할 수 있는 JavaScript SDK 입니다.

```js
// 연동이 쉬운 Amplitude script 예시
<script src="https://cdn.amplitude.com/libs/amplitude-8.21.2-min.gz.js"></script>
```

[welcome-toast](https://welcome-toast.com/)는 첫 런칭을 앞두고 있다. SDK 프로젝트를 진행하면서 오래 고민했던 부분 중 하나가 버전 관리 구조다. 처음에는 단순히 "사용자가 버전을 신경 쓰지 않아도 되게 할 수는 없을까?"라는 생각으로 시작했다. 초기 단계다 보니 잦은 업데이트가 예상되는데, 매번 사용자가 연동 스크립트를 수정하고 배포해야 한다면 불편할 것 같았다. 하지만 이 고민은 결국 "**왜 여러 검증된 SDK들이 명시적 버전 관리를 선택했을까?**"라는 질문으로 이어졌고, 그 답을 찾아가는 과정이 되었다.


<img src="/assets/img/jsdelivr-github.png" width="1000" alt="jsdelivr-github">

우선 별도 서버 구축 없이도 쉽고 안정적으로 배포가 가능한 [jsDelivr](https://www.jsdelivr.com)를 CDN으로 선택했었다. GitHub 리포지토리와 연동이 (정말) 간편하고, 무료로 제공되는 SSL 인증서, 전세계적인 CDN 네트워크 활용 등 이점이 있었기 때문이다. **다만 jsDelivr를 사용하다 보니 ETag나 Cache-Control과 같은 HTTP 캐시 헤더를 직접 제어할 수 없어서, 다른 방식의 캐싱 전략이 필요했다.** 프로젝트 일정상 CDN 제공을 위한 별도의 서버를 구축하기에 한계가 있었다.

이런 상황에서 캐시 버스팅(Cache Busting) 기법을 활용하기로 했다. 캐시 버스팅은 브라우저가 파일의 최신 버전을 강제로 로드하도록 하는 기술이다. 구현 방식으로는 **(1) Timestamp를 Query String으로 포함, (2) 명시적 버전 관리** 이 두 가지를 위주로 검토했고 최종적으로 후자를 선택했다.

<div style="color: gray; font-style: italic; font-size: 0.9em;">
  * 캐시 버스팅(Cache Busting) : 매 요청마다 새로운 타임스탬프를 쿼리 파라미터로 추가해서 브라우저가 파일의 최신 버전을 강제로 로드하도록 한다.
  <a target="_blank" href="https://www.keycdn.com/support/what-is-cache-busting#what-is-cache-busting" style="color: gray; font-style: italic; font-size: 0.9em;">참고 KeyCDN</a>
</div>


<br>

### 연동 후 다시 스크립트를 교체하지 않도록 (하고 싶었지만)

처음 정의했던, 이상적인 사용자 경험은 이러했다.

> 1. 사용자는 한 번만 스크립트를 연동한다
> 2. 이후 SDK 업데이트가 있어도 자동으로 최신 버전이 적용된다
> 3. 성능 관점에서 CDN 캐싱의 이점을 최대한 활용한다

```js
// 이상적인 사용자 연동 코드 (라고 생각한 모습)
<script>
  window.welcometoastConfig = {
    apiKey: "프로젝트 고유의 API_KEY",
    init: function() {
      window.welcometoast.getProject(window.welcometoastConfig.apiKey);
    }
  };
</script>
<script async src="https://cdn.jsdelivr.net/gh/welcome-toast/welcome-toast@refs/heads/publish/src/main.js"></script>
```

사실 욕심이었다. 아무런 조치 없이 이 3가지를 동시에 충족하는 솔루션이 쉽게 보이지 않았다. 이러한 구조를 구현하기 위해서는 몇 가지 기술적 고민을 해결해야 했다. (이 글에서는 1번 주제를 중심으로 다룬다.)

> 1. 'CDN 캐싱'과 '최신 버전 제공'이라는 두 이슈를 어떻게 함께 해결할 수 있을까? ✅
> 2. SDK 스크립트가 로드되기 전에 config 설정값을 어떻게 보존할 수 있을까?
> 3. 스크립트 실행 순서를 어떻게 보장할 수 있을까?

위에서 언급했듯 `캐시 버스팅(Cache Busting)`을 기법을 활용했는데, 이번에 새롭게 학습하면새 '캐시(cache)'와 조금 친해질 수 있었다. 캐시 버스팅은 사용자의 브라우저가 이전에 받은 정적 파일을 오래 저장할 수 있기 때문에, 그 이전 버전으로 인해 최신 변경사항이 즉시 반영되지 않는 문제를 해결해준다. 고유한 파일 버전 식별자를 사용함으로써, 브라우저에게 새로운 버전의 파일이 있음을 알리는 방식으로 작동한다.

<img src="/assets/img/cache-busting.png" width="1000" alt="cache-busting">

[출처 - KeyCDN](https://www.keycdn.com/support/what-is-cache-busting)


<br>

### 1. Timestamp 쿼리 파라미터 방식

처음에 시도했던 방식이다. [Stack Overflow](https://stackoverflow.com/questions/32414/how-can-i-force-clients-to-refresh-javascript-files)에서 처음 발견한 이 방법은 쿼리 파라미터에 타임스탬프를 추가하여 캐싱을 우회하는 접근이었다. 구현이 단순하고, 무엇보다 사용자가 최초 연동 외에 다시 스크립트를 업데이트하지 않아도 최신 버전을 제공받을 수 있다는 점이 매력적이었다.

```js
const sdkScript = `<script>
  (function(w,d) {
    w.welcometoastConfig = {
      apiKey: "API_KEY"
    };

    const script = d.createElement("script");
    script.src = "https://cdn.jsdelivr.net/sdk.js?t=" + Date.now(); // 👈 이렇게!
    script.async = true;
    script.crossOrigin = "anonymous";
    d.head.appendChild(script);
  })(window, document);
</script>`;
```
하지만 매 요청마다 새로운 리소스로 인식되어 CDN과 브라우저 캐시를 전혀 활용할 수 없다. 캐시를 활용하지 못하기 때문에, 사용자 애플리케이션에 주입된 스크립트로 인해 매번 새로운 네트워크 요청이 발생하게 될 것이다. 또한 [KeyCDN의 자료](https://www.keycdn.com/support/what-is-cache-busting#3-query-strings)에 따르면, 일부 프록시나 CDN은 쿼리 스트링이 포함된 파일을 아예 캐시하지 못한다고 한다.

더불어 버전 관리 측면에서도 우려점이 있었다. 현재 사용자에게 제공되고 있는 SDK가 어떤 버전인지 정확히 추적하기 어렵고, 문제 발생 시 특정 버전으로의 롤백도 복잡해질 수 있었다. KeyCDN 자료를 통해 [Steve Souders 블로그](https://www.stevesouders.com/blog/2008/08/23/revving-filenames-dont-use-querystring)도 확인할 수 있었는데, 이러한 이유로 쿼리 스트링 방식 대신 파일명이나 경로에 버전을 포함하는 방식을 권장하고 있었다.

- 그외 참고 : [Web Cache와 Cache Busting이란?](https://jongminlee0.github.io/2021/01/23/cachebusting/)

<br>

### 2. 명시적 버전 관리 방식

고민 끝에 최종 선택한 방식이다. **파일명에 버전을 직접 명시하여 안정성을 확보하고 캐싱도 온전히 활용할 수 있다.**

```js
const sdkScript = `<script>
  (function(w,d) {
    w.welcometoastConfig = {
      apiKey: "API_KEY"
    };

    const script = d.createElement("script");
    script.src = "https://cdn.jsdelivr.net/sdk@1.0.0/sdk.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    d.head.appendChild(script);
  })(window, document);
</script>`;
```

처음에는 초기 단계라 버전이 자주 바뀔 것이라, 사용자가 매번 업데이트하지 않아도 되게 하려고 했다. 하지만 오히려 초기일수록 안정적인 버전 관리가 중요할 수도 있다는 점을 깨달았다. [Google의 API 디자인 가이드](https://cloud.google.com/apis/design/versioning)를 참고하면서, Breaking changes가 발생했을 때 기존 사용자들의 서비스가 영향받지 않아야 하고 문제 발생 시 특정 버전으로의 롤백도 가능해야 한다는 점을 배웠다. 명시적 버전 관리가 이런 요구사항을 모두 충족했다.

그리고 CDN의 캐싱 메커니즘도 온전히 활용할 수 있다. 버전이 명시된 파일은 CDN과 브라우저 모두에서 캐시되어서, 웰컴토스트와 연동한 사용자의 웹 애플리케이션 성능에 직접적인 도움이 된다. 네트워크 연결이 불안정하거나, 데이터 요금제가 제한된 모바일 환경에서 특히 이러한 캐싱 전략이 더욱 중요하다고 한다. (모바일에서 페이지 로드가 1초에서 3초로 늘어나기만 해도 이탈률이 32% 증가한다고 하니...)

(+ 추가) [Semantic Versioning](https://semver.org/)이라는 개념도 자세히 알게 되었다. 버전 번호에 의미를 부여해서 변경사항의 크기를 직관적으로 알 수 있게 해준다. 가령 `MAJOR.MINOR.PATCH` 형식에서 `MAJOR` 버전이 올라가면 이전 버전과 호환되지 않는 변경사항이 있다는 것을 의미하는 식. ([npm도 이 방식을 채택한다.](https://docs.npmjs.com/about-semantic-versioning))

<br>

### 레슨 "결국 맥락에 따라 균형점 찾기!"

SDK 버전 관리 구조를 고민하면서 얻은 깨달음은 '사용자 편의성'과 '안정성' 사이의 균형점을 찾는 것이었다. **처음에는 사용자 편의성만을 고려했지만, 여러 조사와 고민을 하면서 초기 단계일수록 오히려 안정성과 예측 가능성이 더 중요한 부분이 될 수 있다**는 점을 배웠다. 앞으로도 이런 기술적 결정들을 할 때는 "할 수 있는 것"과 함께 "해야 하는 것"에 더 초점을 맞추어 고민해야겠다.

<br>

### 참고
- [MDN: HTTP 캐싱](https://developer.mozilla.org/ko/docs/Web/HTTP/Caching)
- [Cache와 Cache Busting이란?](https://jongminlee0.github.io/2021/01/23/cachebusting/)
- [KeyCDN: What is Cache Busting?](https://www.keycdn.com/support/what-is-cache-busting)
- [Steve Souders - Revving Filenames: don't use querystring](https://www.stevesouders.com/blog/2008/08/23/revving-filenames-dont-use-querystring)
- [Google - API Design Guide - Versioning](https://cloud.google.com/apis/design/versioning)
- [npm Docs - About semantic versioning](https://docs.npmjs.com/about-semantic-versioning)
- [Semantic Versioning 2.0.0](https://semver.org/)

<br>

#SDK #프론트엔드 #기술아키텍처 #버전관리
