# SPA 라우팅과 Vercel 배포 가이드

## 문제 상황

### 증상

- `www.quasa.info/` (루트) → 정상 동작
- `www.quasa.info/search` (직접 URL 입력 또는 새로고침) → **404 에러**
- 버튼 클릭으로 `/search` 이동 → 정상 동작

### 원인

SPA(Single Page Application)의 클라이언트 사이드 라우팅과 서버의 정적 파일 서빙 방식 간의 불일치

---

## 핵심 개념

### 1. SPA (Single Page Application)

SPA는 하나의 HTML 파일(`index.html`)만 서버에서 받아오고, 이후 페이지 전환은 JavaScript가 처리하는 웹 애플리케이션 아키텍처입니다.

```
전통적 웹 (MPA)          SPA
─────────────────       ─────────────────
/           → index.html    /           → index.html
/about      → about.html    /about      → index.html (JS가 라우팅)
/search     → search.html   /search     → index.html (JS가 라우팅)
```

### 2. 클라이언트 사이드 라우팅 (Client-Side Routing)

React Router의 `BrowserRouter`는 브라우저의 History API를 사용하여 URL을 변경합니다.

```typescript
// React Router 예시
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/search" element={<Search />} />
    <Route path="/company/:id" element={<CompanyDetail />} />
  </Routes>
</BrowserRouter>
```

#### 동작 방식

| 상황             | 동작                              | 서버 요청 |
| ---------------- | --------------------------------- | --------- |
| 링크/버튼 클릭   | `history.pushState()`로 URL 변경  | ❌ 없음   |
| 주소창 직접 입력 | 브라우저가 서버에 요청            | ✅ 있음   |
| 새로고침 (F5)    | 브라우저가 현재 URL로 서버에 요청 | ✅ 있음   |

### 3. 문제 발생 원리

```
[사용자] → www.quasa.info/search 입력
    ↓
[브라우저] → Vercel 서버에 /search 요청
    ↓
[Vercel] → /search 파일 찾음 → 없음 → 404 반환
    ↓
[사용자] → 404 에러 페이지 확인
```

Vercel(또는 Nginx, Apache 등)은 기본적으로 요청된 경로에 해당하는 **실제 파일**을 찾습니다. SPA에서는 `/search` 경로에 대한 실제 파일이 없고, `index.html` 하나만 존재합니다.

---

## 해결 방법

### Vercel 설정 (vercel.json)

프로젝트 루트에 `vercel.json` 파일을 생성합니다:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

이 설정은 모든 경로 요청을 `index.html`로 리다이렉트합니다. 이후 React Router가 클라이언트에서 URL을 파싱하여 적절한 컴포넌트를 렌더링합니다.

### 다른 호스팅 환경

#### Nginx

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Apache (.htaccess)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Netlify (\_redirects)

```
/*    /index.html   200
```

---

## 대안: HashRouter

`BrowserRouter` 대신 `HashRouter`를 사용하면 서버 설정 없이도 작동합니다.

```typescript
import { HashRouter } from "react-router-dom";

// URL이 다음과 같이 변경됨:
// www.quasa.info/#/search
// www.quasa.info/#/company/005930
```

### BrowserRouter vs HashRouter

| 특성       | BrowserRouter   | HashRouter  |
| ---------- | --------------- | ----------- |
| URL 형태   | `/search`       | `/#/search` |
| 서버 설정  | 필요 (rewrites) | 불필요      |
| SEO        | 유리            | 불리        |
| 깔끔한 URL | ✅              | ❌          |

**권장**: 프로덕션 환경에서는 `BrowserRouter` + 서버 설정을 권장합니다.

---

## 정리

```
[문제]
SPA에서 직접 URL 접근 시 404 발생

[원인]
서버가 /search 경로의 실제 파일을 찾지 못함

[해결]
모든 경로를 index.html로 리다이렉트 (vercel.json rewrites)

[원리]
index.html 반환 → React 앱 로드 → React Router가 URL 파싱 → 해당 컴포넌트 렌더링
```

---

## 참고 자료

- [React Router - Deployment](https://reactrouter.com/en/main/guides/deployment)
- [Vercel - Rewrites](https://vercel.com/docs/projects/project-configuration#rewrites)
- [Vite - Static Deploy](https://vitejs.dev/guide/static-deploy.html)
