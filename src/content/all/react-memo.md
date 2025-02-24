---
title: "함수도 값인데 useCallback 대신 useMemo로?"
pubDate: Oct 6 2024
description: "useMemo은 useCallback을 대체할 수 있는가 #react #hook"
tags: [""]
---

# 함수도 값인데 useCallback 대신 useMemo로? (결론: 가능✅)
useMemo은 useCallback을 대체할 수 있는가?

<div style="color: gray; font-size: 0.9em;">2024.10.06</div>

---

## 의심

React useMemo와 useCallback을 공부하면서 문득 의심이 생겼다. 둘 다 '값'을 메모이제이션하는 건데, 함수도 결국 값이니 useCallback 대신 useMemo를 사용해도 되지 않을까? 오히려 일관성이 있지 않을까? 사실 공식 문서에서도 기능상 대체할 수 있다고 하지만 [훅의 역할을 고려한다면 맥락상 useCallback 사용을 권장한다.](https://react.dev/reference/react/useMemo#memoizing-a-function) 그래서 이번 실험에서는 완전히 기능상 대체가 가능한지만 검증해보려고 했다. 여기에 더해서, 컴포넌트를 메모하는 React Memo를 useCallback로 대체할 수 있는지도 보려고 했다. 컴포넌트로 함수니까.

## 실험 설계 : 의도적인 리렌더링으로 함수 재생성되는지 보기

실험의 핵심은 함수가 실제로 재생성되는지, 그리고 그로 인해 컴포넌트가 리렌더링되는지를 검증하는 것이었다. 컴포넌트 리렌더링을 발생시키기 위해 텍스트 입력 상태를 추가했다. 이렇게 하면 텍스트가 변경될 때마다 컴포넌트가 리렌더링되면서, 설정한 로그를 통해 메모이제이션이 제대로 동작하는지 확인할 수 있었다. 이를 위해 세 가지 관찰 포인트를 설정했다. 먼저 단순히 "foo"를 출력하는 함수를 만들고, 이를 prop으로 전달받는 자식 컴포넌트가 "inside"를 출력하도록 했다.

마지막으로 함수의 재생성을 감지하기 위해 useEffect의 의존성 배열에 해당 함수를 넣어 "useE"가 출력되도록 했다. 이는 useEffect의 의존성 배열이 얕은 비교를 통해 함수의 참조가 변경되었는지 확인하는 특성을 활용한 것이다. GitHub의 이슈([#24123](https://github.com/facebook/react/issues/24123))를 보면, 의존성이 빈 배열일 때 useCallback은 컴포넌트 최초 마운트 시의 함수를 단 한 번만 할당하므로, 이를 통해 함수가 실제로 메모이제이션되어 재생성되지 않는지 검증할 수 있다.

<img src="https://i.imgur.com/Z9zUBcu.png" alt="useCallback-empty-array">

### 1. 기본 세팅

```jsx
// 테스트용 - Submit 관련 컴포넌트
const FormComponent = memo(({ onSubmit }) => {
  console.log("inside");
  return <div>Hello</div>;
});
```

```jsx
// ProductPage.jsx
import { useCallback, useState, useEffect } from "react";
import { ShippingForm } from "./Example2";

export default function ProductPage({ productId, referrer, theme }) {
  const [text, setText] = useState(0);
  const fooCallback = useCallback(() => console.log("foo"), []);

  useEffect(() => {
    console.log("useE");
  }, [fooCallback]);

  return (
    <div className={theme}>
      <ShippingForm fooCallback={fooCallback} />
      <div>{text}</div>
      <input type="text" onChange={handleSubmit} />
    </div>
  );
}
```

<br>

## 첫 검증: React.memo는 useMemo로 대체 가능하다 🙋

실험 결과 React.memo는 useMemo로 대체할 수 있었다. 차이점은 코드 레벨상 적용 위치일뿐. React.memo는 자식 컴포넌트 파일에서 직접 컴포넌트를 감싸는 반면, useMemo는 부모 컴포넌트에서 렌더링 결과물을 감싸게 된다. 흥미로운 건, useMemo가 단순히 값이 아닌 컴포넌트의 렌더링 결과 자체를 메모이제이션한다는 것이다. 의존성 배열의 fooCallback이 변경되지 않는 한, FormComponent는 이전 렌더링의 결과를 그대로 재사용한다.

```jsx
const FormComponent = useMemo(
  () => <ChildComponent fooCallback={fooCallback} />,
  [fooCallback]
);
```

## 두번째 검증: useCallback으로는 React.memo를 대체할 수 있지만... 🙅

useCallback으로 React.memo를 대체할 수 있지만, 메모가 무색해졌다. 즉 동일한 최적화를 시도했을 때 코드는 동작하지만 리렌더링을 막지는 못했다.

```jsx
const FormComponent = useCallback(
  () => <ChildComponent fooCallback={fooCallback} />,
  [fooCallback]
);
```
원인은 JSX에서 컴포넌트를 호출하는 방식에 있었다. JSX 코드에서 `{ShippingFormFinal()}`와 같이 함수를 직접 호출하면, useCallback으로 함수를 메모이제이션 했더라도 매 렌더링마다 새로운 컴포넌트 인스턴스가 생성된다. 즉, 함수 자체는 메모이제이션되어 동일한 참조를 유지하지만, JSX에서 이 함수를 호출할 때마다 새로운 React 엘리먼트가 생성되는 것이다. 매 렌더링마다 새로운 컴포넌트를 생성하는 셈이기 때문에, 결과적으로 memo의 최적화 효과가 사라지게 된다.

## 결론

단순한 의심에서 시작하긴 했지만, React의 메모이제이션을 언제 취하는게 좋을지에 대한 고민으로 이어졌다. 현재로써는 성급한 성능 최적화가 되지 않도록, 성능에 문제가 생겼을 때 활용해보면 좋겠다는 1차 결론을 냈다. useMemo, useCallback로 값 혹은 함수를 메모이제이션하더라도, 그 '메모'를 어떻게 사용하느냐에 따라 최적화의 효과와 유용함이 달라질 것이다. 최근 구현해본 어플리케이션은 대부분 단순한 서비스들이라, 메모이제이션에도 비용과 이득을 비교해보기 어려운 면이 있었다. 언젠가 비교해볼 기회가 생긴다면, 또 한 번 기록을 남겨보자.
