---
title: "React 컴포넌트 return 안에서 일어나는 일"
pubDate: Sep 29 2024
description: "JSX 내부에서 JavaScript 표현식만 사용 가능한 이유"
tags: ["React"]
---

# React 컴포넌트 return 안에서 일어나는 일

JSX 내부에서 JavaScript 표현식만 사용 가능한 이유

---

### React JSX 규칙

React로 개발하면서 반드시 지켜야 하는 규칙이 있다. JSX 내부에서는 JavaScript의 모든 문법을 자유롭게 사용할 수 없고, 오직 '표현식(Expression)'만 사용 가능하다는 것이다. 보통 **"특정 OOO만 가능하다"는 제약은 그 기술의 깊은 원리를 이해할 수 있는 단서가 되기도 한다.** 이 제약의 이유를 이해하면 React의 동작 원리를 더 깊이 파악할 수 있을 것이라 생각했다.

<blockquote style="color: gray; font-size: 0.9em; margin: 1rem 0; padding-left: 1rem; border-left: 4px solid #ddd;">
  *Expressions<br/>Expression At a high level, an expression is a valid unit of code that resolves to a value. There are two types of expressions: those that have side effects (such as assigning values) and those that purely evaluate.
  <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators" style="color: gray; font-size: 0.9em;">MDN</a>
</blockquote>

<img src="/assets/img/jsx-react.png" width="1000" alt="jsx-react">
<a target="_blank" href="https://medium.com/@babux1/understanding-react-js-expressions-in-jsx-benefits-and-use-cases-d77ba54ad3d7" style="color: gray; font-size: 0.9em;">Medium - Understanding React.js Expressions in JSX: Benefits and Use Cases</a>

```jsx
// 작동하지 않는 코드 ‼
function MyComponent() {
  return (
    <div>
      {if (조건) {
        return <span>참</span>
      } else {
        return <span>거짓</span>
      }}
    </div>
  )
}

// 작동하는 코드 ✅
function MyComponent() {
  return (
    <div>
      {조건 ? <span>참</span> : <span>거짓</span>}
    </div>
  )
}
```

MDN 문서에서 설명하듯 자바스크립트 표현식은 값을 반환한다. 하지만 더 깊이 알아보고 싶었던 건 JSX에 '값'만 있어야 하는 근본적인 이유였다. 살펴보니 새로운 개념이 아닌, 이미 익숙한 개념에 기반하고 있었다. 다만 이를 React와 JSX의 맥락에서 이해하는 것이 중요했다. 하나씩 살펴보자.

<br>

### 1. 개념적으로 먼저 보기: 마크업을 위한 JSX와 React의 역할

JSX의 역할은 마크업이다. 결국 HTML '값'을 반환해야 한다. 대신 그 자체로 '값'으로 볼 수 있는 코드(표현식)를 JSX는 그나마 유연하게 허용해준다. 위 MDN에서 표현식을 언급한 것처럼, 값 자체 외에도 'those that have side effects (such as assigning values)'도 값으로 취급한다는 것이다.

React는 일종의 중개자 역할을 한다. 개발자나 사용자로부터 받은 입력(value, event)을 전달하는 것이 React의 주된 역할이며, 직접적인 연산이나 처리(statement)는 수행하지 않는다. 받은 데이터를 적절한 위치로 전달하는 것이 React의 핵심 책임이다. (마치 주문만 받고 요리는 하지 않는 ‘웨이터’다. 요리(연산 등 작업) 안하고 전달만 한다.)
<img src="/assets/img/react-waiter.png" width="1000" alt="react-waiter">
<a target="_blank" href="https://ko.react.dev/learn/render-and-commit" style="color: gray; font-size: 0.9em;">render and commit</a>

<br>

### 2. 문법적으로 접근해보기: `React.createElement` 함수의 동작 방식

```js
// 컴포넌트 구조
function Component() {
  return ( // JSX
    // Markup (태그, props, {JavaScript} 활용)
  );
}
```

컴포넌트가 반환하는 JSX 코드는 모두 `React.createElement` 함수의 인자로 전달된다. 여기서 **함수의 '인자'로 전달될 수 있는 것들이라는 점이 핵심 이유다.** React 공식 문서 [createElement API](https://ko.react.dev/reference/react/createElement)에 따르면, 이 과정은 이렇게 진행된다.

1. JSX 코드로 컴포넌트가 호출됨
2. Babel이 JSX 코드를 `React.createElement` 함수 호출로 변환
3. `React.createElement` 함수가 JavaScript 객체를 생성
4. 생성된 객체들이 모여 가상 DOM 트리를 구성
5. React가 변경사항을 감지하여 실제 DOM에 반영

<img src="/assets/img/react-createElement.png" width="1000" alt="react-createElement">

<div style="color: gray; font-style: italic; font-size: 0.9em;">(`React.createElement()` 동작 흐름)</div>

이 2가지가 핵심 이유 중 일부인데, 아래에서 각각 구체적으로 정리해보자.

- 그외 추가할 것 : 실험 내용 첨부, arguments 객체와 접점 있을지 조사해보기

<br>

### Statement(문) vs Expression(표현식) 차이

> A statement does something. An expression evaluates to a value.

이는 각각 '작업을 수행하는 코드'와 '값을 반환하는 코드'를 의미한다. 여기서 주목할 점은 expression이 statement의 일부라는 것이다([참고](https://shoark7.github.io/programming/knowledge/expression-vs-statement)). expression은 평가(evaluate) 과정을 거쳐 하나의 '값'으로 환원되는 반면, statement는 실행 가능한(executable) 최소 단위의 독립적인 코드 조각이다. 일반적으로 statement는 하나 이상의 expression과 프로그래밍 키워드를 포함한다.

<br>

### JSX의 본질: 마크업을 위한 도구

JSX는 'Javascript Syntax eXtension' 또는 'JavaScript to XML'의 약자로 불린다. 본질적으로 마크업을 위한 도구이고, JSX 코드를 실행하면 결과적으로 HTML이 생성되어야 한다. 핵심은 HTML Node의 '값(value)'을 반환하는 것이다. JavaScript가 데이터 타입에서 유연성을 보여주듯, JSX도 '값을 결정할 수 있는 코드'에 대해서는 유연성을 제공하는 것인지 하는 생각이 들었다. 표현식이 허용되는 이유도 JSX의 목표인 '값 결정'에 도움이 된다.([참고](https://stackoverflow.com/questions/60988649/why-can-you-only-use-expressions-in-jsx-not-statements))

<br>

### (반론) 중간에만 조건문 쓰고, 결과적으로 값만 반환할 수 있으면 안돼요?

"중간에 조건문을 사용하고 최종적으로 값만 반환하면 되지 않을까?"라는 의문이 들 수 있다. if 조건문과 삼항 연산자의 차이를 통해 이를 살펴보자.

```jsx
// statement(문)을 사용한 경우 - 반환 값이 없음
if(value){
    변수 = 10;
} else {
    변수 = 7;
}

// 함수 내부의 return문
function multiply(num1, num2) {
  if (num1 > 0 && num2 > 0) {
    return num1 * num2; // 이 return문은 함수에 속함
  }
  return 0;
}

// 표현식을 사용한 경우 - 값을 반환
변수 = value === true ? 10 : 7;
```

여기서 주목할 점은 return문의 역할이다. MDN 문서에 따르면 return은 함수를 종료하거나 함수의 반환값을 지정하는 두 가지 역할만을 수행한다([참고](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/return)).

<br>

### 그렇다고 React에서 조건문, 반복문 등을 활용하지 못하는 것은 아니다

JSX 내부에서 statement를 직접 사용할 수는 없지만, React에서는 다양한 방식으로 조건부 렌더링을 구현할 수 있다. 가령 조건부 렌더링을 구현할 때 삼항연산자, map() 메소드로 충분하지 않을 수 있다. 이때는 jsx 바깥에서 js 문법으로 연산 하고 결과(값)를 jsx에 가져와서 쓰면 된다. 또 기어코 JSX 안에서 IF 문 같은 statement를 꼭 써야겠다면, 즉시 실행 함수를 활용하는 방법도 있다.

1. JSX 외부에서 로직 처리
```jsx
let button;
if (value) {
    button = <LogoutButton />;
} else {
    button = <LoginButton />;
} 

return (
    <nav>
        <Home />
        {button}
    </nav>
);
```

2. 즉시 실행 함수(IIFE) 활용
- [IIFE’s Will Change The Way You Use React Hooks](https://javascript.plainenglish.io/iifes-can-change-the-way-you-write-the-useeffect-hook-in-react-a5cb5d69d14a)
- [즉시 실행 함수 표현식 IIFE (in React)](https://velog.io/@rmaomina/IIFE-in-react)

```jsx
function App() {
    return (
        <div className="App">
            <h1>조건부 렌더링</h1>
            <div>
                {(() => {
                    if (condition) {
                        return "참입니다";
                    } else {
                        return "거짓입니다";
                    }
                })()}
            </div>
        </div>
    );
}
```

---

https://react-cn.github.io/react/tips/if-else-in-JSX.html

https://brunch.co.kr/@skykamja24/576