---
title: "함수도 값인데 useCallback 대신 useMemo로?"
pubDate: Oct 6 2024
description: "useMemo은 useCallback을 대체할 수 있는가 #react #hook"
tags: [""]
---

# 함수도 값인데 `useCallback` 대신 `useMemo`로?
`useMemo`는 `useCallback`을 대체할 수 있는가?

<div style="color: gray; font-size: 0.9em;">2024.10.06</div>

---

## 결론은 `useMemo`로 대체 가능했다

React `useMemo`와 `useCallback`을 공부하면서 문득 궁금했다. 둘 다 '값'을 메모이제이션하는 건데, 함수도 결국 '값'이니 `useCallback` 대신 `useMemo`를 사용해도 되지 않을까? 오히려 `useMemo`를 사용하는 것이 일관성이 있지 않을까? 물론 맥락상 함수의 캐싱에 `useCallback`를 사용하는 것이 적합하고, 공식 문서에서도 기능상 대체할 수 있다고 하지만, [훅의 역할을 고려하여 `useCallback` 사용을 권장한다.](https://react.dev/reference/react/useMemo#memoizing-a-function) 그래서 이번 실험에서는, **동일한 동작 > 대체 가능한 것인지** 검증해보려고 했다. 이 과정에서 리액트 캐싱을 어떻게 바라보면 좋을지 생각해보게 되었다. **캐싱이 필요한 시점과 그렇지 않은 시점을 구분하고, 상황에 맞는 적절한 도구를 선택**하는 것이 중요하다는 것을 배웠다.

<img src="https://i.imgur.com/XZS4lXj.png" alt="useMemo-useCallback" style="display: block; margin: 0 auto;">
<div style="color: gray; font-size: 0.9em;">`useMemo` 대신 `useCallback`!</div>

- 이후 확인할 부분 : `useCallback` 훅 소스 코드

추가로, 컴포넌트를 메모하는 [`React Memo`](https://react.dev/reference/react/memo)도 `useCallback`로 대체할 수 있는지 실험해보았다. 컴포넌트도 함수니까, `useCallback`로도 prop에 따라 컴포넌트 리렌더링을 건너 뛸 수 있을까? **이것의 결론은 `useCallback`으로 동작하나, 메모이제이션이 무색하게 리렌더링은 여전히 발생했다.** 이 실험 과정을 정리해보았다.

<br>

## 실험 설계를 어떻게 할까 : useEffect 의존성 배열 얕은 비교 활용하기

사실 설계가 쉽지 않았다. 함수가 재생성 되지 않고 이전 값과 동일함을 증명하려면 어떤 방법이 필요할지 고민했다. React 공식 문서에서 useEffect 내부에서 함수를 의존성 배열에 포함할 때 useCallback으로 활용하는 예시가 떠올랐다. 여기에서 착안해서 useEffect의 의존성 배열이 얕은 비교를 통해 함수의 참조가 변경되었는지 확인하는 로직을 활용하자는 접근이었다. 그리고 useCallback을 useMemo로 교체해서 동일한 동작이 가능한지 검증하면 원하는 결과를 확인할 수 있었다.

<img src="https://i.imgur.com/me7e8yj.png" alt="useCallback-empty-array" style="display: block; margin: 0 auto;">

위 구조를 활용하기로 하고, 폼 형태의 제어 컴포넌트를 만들어 해당 컴포넌트 리렌더링을 발생시키기 위해 텍스트 입력 상태를 추가했다. 이렇게 하면 텍스트가 변경될 때마다 컴포넌트가 리렌더링되면서, 설정한 로그를 통해 메모이제이션이 제대로 동작하는지 확인할 수 있었다. 그래서 **부모 컴포넌트의 `useCallback`으로 감싸준 함수가 실제로 재생성 되지 않는지, 그리고 그로 인해 자식 컴포넌트 리렌더링도 막을 수 있는지** 검증하는 것이었다.

- [GitHub - 의존성이 빈 배열이라면 useCallback은 최초 마운트시 함수 1번만 할당](https://github.com/facebook/react/issues/24123#issuecomment-1075117581)

### 첫 검증: `useCallback`과 `useMemo`는 동일한 동작을 한다

아래 코드에서 `useCallback`을 `useMemo`로 교체해도 동일하게 동작했다. 의존성 배열이 빈 배열일 때 최초 마운트 시점의 함수를 메모이제이션하고, 이후 리렌더링에서도 동일한 함수 참조를 유지했다.

```jsx
// 부모 컴포넌트
import { useCallback, useState, useEffect } from "react";
import { ShippingForm } from "./Example2";

export default function ParentComponent({ productId, referrer, theme }) {
  const [text, setText] = useState(0);
  const callbackFn = useCallback(() => console.log("초기 함수 생성"), []);

  // ...

  useEffect(() => {
    console.log("callback 함수가 바뀜!");
  }, [callbackFn]);

  return (
    <div className={theme}>
      <ChildComponent callbackFn={callbackFn} />
      <div>{text}</div>
      <input type="text" onChange={handleSubmit} />
    </div>
  );
}
```

<br>

## 다음 검증 : `React.memo`는 `useMemo`로 대체 가능하다 🙋

실험 결과 React.memo는 useMemo로 대체할 수 있었다. 차이점은 코드 레벨상 적용 위치일뿐. React.memo는 자식 컴포넌트 파일에서 직접 컴포넌트를 감싸는 반면, useMemo는 부모 컴포넌트에서 렌더링 결과물을 감싸게 된다. 흥미로운 건, useMemo가 단순히 값이 아닌 컴포넌트의 렌더링 결과 자체를 메모이제이션한다는 것이다. 의존성 배열의 callbackFn 변경되지 않는 한, FormComponent는 이전 렌더링의 결과를 그대로 재사용한다.

```jsx
const FormComponent = useMemo(
  () => <Form callbackFn={callbackFn} />,
  [callbackFn]
);
```

## 마지막 검증: useCallback으로는 React.memo를 대체할 수 있지만... 🙅

useCallback으로 React.memo를 대체할 수 있지만, 메모가 무색해졌다. 즉 동일한 최적화를 시도했을 때 코드는 동작하지만 리렌더링을 막지는 못했다.

```jsx
const FormComponent = useCallback(
  () => <Form callbackFn={callbackFn} />,
  [callbackFn]
);

// 호출부
FormComponent();
```

원인은 JSX에서 컴포넌트를 호출하는 방식에 있었다. JSX 코드에서 `{Form()}`와 같이 함수를 직접 호출하면, useCallback으로 함수를 메모이제이션 했더라도 매 렌더링마다 새로운 컴포넌트 인스턴스가 생성된다. 즉, 함수 자체는 메모이제이션되어 동일한 참조를 유지하지만, JSX에서 이 함수를 호출할 때마다 새로운 React 엘리먼트가 생성되는 것이다. 매 렌더링마다 새로운 컴포넌트를 생성하는 셈이기 때문에, 결과적으로 memo의 최적화 효과가 사라지게 된다.

## 결론

단순한 의심에서 시작하긴 했지만, React의 메모이제이션을 언제 취하는게 좋을지에 대한 고민으로 이어졌다. 현재로써는 성급한 성능 최적화가 되지 않도록, 성능에 문제가 생겼을 때 활용해보면 좋겠다는 1차 결론을 냈다. 특히 메모이제이션은 메모리 사용과 초기 계산 비용이라는 트레이드오프가 있으니, 실제 성능 측정을 통해 필요한 곳에 적용하는 것이 바람직할 것이다. 최근 구현해본 어플리케이션은 대부분 단순한 서비스들이라, 메모이제이션에도 비용과 이득을 비교해보기 어려운 면이 있었다. 언젠가 비교해볼 기회가 생긴다면, 또 한 번 기록을 남겨보자.
