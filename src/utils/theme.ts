export type Theme = "light" | "dark";

export function getInitialTheme(): Theme {
  // 저장된 테마 확인
  const savedTheme = localStorage.getItem("theme") as Theme;
  if (savedTheme) return savedTheme;

  // 시스템 설정 확인
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function setTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") as Theme;
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);
  return newTheme;
}
