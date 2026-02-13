/**
 * Template HTML/CSS content for GitHub Pages one-click deploy.
 * Each template exports files (index.html + style.css) to be pushed to a template repo.
 */

export interface TemplateFile {
  path: string;
  content: string;
}

export interface TemplateContent {
  slug: string;
  repoName: string;
  description: string;
  files: TemplateFile[];
}

// ─── Portfolio ───────────────────────────────────────────────

const portfolioHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Portfolio</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="hero">
    <nav><a href="#about">소개</a><a href="#projects">프로젝트</a><a href="#contact">연락처</a></nav>
    <h1>안녕하세요, <span class="accent">개발자</span>입니다</h1>
    <p class="subtitle">웹 개발 포트폴리오</p>
  </header>
  <section id="about" class="section">
    <h2>About Me</h2>
    <p>여기에 자기소개를 작성하세요. 기술 스택, 경험, 관심 분야 등을 소개해보세요.</p>
  </section>
  <section id="projects" class="section alt">
    <h2>Projects</h2>
    <div class="grid">
      <div class="card"><h3>프로젝트 1</h3><p>프로젝트 설명을 작성하세요.</p></div>
      <div class="card"><h3>프로젝트 2</h3><p>프로젝트 설명을 작성하세요.</p></div>
      <div class="card"><h3>프로젝트 3</h3><p>프로젝트 설명을 작성하세요.</p></div>
    </div>
  </section>
  <section id="contact" class="section">
    <h2>Contact</h2>
    <p>이메일: <a href="mailto:you@example.com">you@example.com</a></p>
    <p>GitHub: <a href="https://github.com/username">@username</a></p>
  </section>
  <footer><p>Powered by <a href="https://linkmap.vercel.app">Linkmap</a></p></footer>
</body>
</html>`;

const portfolioCss = `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Pretendard',system-ui,sans-serif;color:#1a1a2e;line-height:1.6}
.hero{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;text-align:center;padding:6rem 2rem 4rem}
.hero nav{margin-bottom:2rem}
.hero nav a{color:rgba(255,255,255,.85);text-decoration:none;margin:0 1rem;font-size:.9rem}
.hero h1{font-size:2.5rem;margin-bottom:.5rem}
.accent{color:#ffd166}
.subtitle{font-size:1.2rem;opacity:.85}
.section{padding:4rem 2rem;max-width:800px;margin:0 auto}
.section h2{font-size:1.8rem;margin-bottom:1.5rem;border-bottom:2px solid #667eea;padding-bottom:.5rem}
.alt{background:#f8f9fa}
.alt .section,.section.alt{max-width:none;padding:4rem calc((100% - 800px)/2)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:1.5rem;transition:transform .2s}
.card:hover{transform:translateY(-4px);box-shadow:0 8px 25px rgba(0,0,0,.1)}
.card h3{color:#667eea;margin-bottom:.5rem}
footer{text-align:center;padding:2rem;color:#888;font-size:.85rem}
footer a{color:#667eea;text-decoration:none}
@media(max-width:600px){.hero h1{font-size:1.8rem}.grid{grid-template-columns:1fr}}`;

// ─── Landing Page ────────────────────────────────────────────

const landingHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="hero">
    <nav class="nav"><span class="logo">MyBrand</span><a href="#features">기능</a><a href="#cta" class="btn-nav">시작하기</a></nav>
    <h1>더 나은 솔루션을<br>만나보세요</h1>
    <p>당신의 비즈니스를 성장시킬 최고의 도구</p>
    <a href="#cta" class="btn-hero">무료로 시작</a>
  </header>
  <section id="features" class="features">
    <h2>핵심 기능</h2>
    <div class="grid">
      <div class="feature"><div class="icon">&#9889;</div><h3>빠른 속도</h3><p>최적화된 성능으로 빠르게 로딩됩니다.</p></div>
      <div class="feature"><div class="icon">&#128274;</div><h3>보안</h3><p>안전한 데이터 보호를 보장합니다.</p></div>
      <div class="feature"><div class="icon">&#127759;</div><h3>글로벌</h3><p>전 세계 어디서나 접근 가능합니다.</p></div>
    </div>
  </section>
  <section id="cta" class="cta">
    <h2>지금 바로 시작하세요</h2>
    <p>무료 플랜으로 모든 기능을 체험해보세요.</p>
    <a href="mailto:hello@example.com" class="btn-cta">문의하기</a>
  </section>
  <footer><p>Powered by <a href="https://linkmap.vercel.app">Linkmap</a></p></footer>
</body>
</html>`;

const landingCss = `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Pretendard',system-ui,sans-serif;color:#1e293b;line-height:1.6}
.hero{background:linear-gradient(135deg,#0f172a 0%,#1e40af 100%);color:#fff;text-align:center;padding:2rem 2rem 5rem}
.nav{display:flex;align-items:center;justify-content:space-between;max-width:1000px;margin:0 auto 3rem}
.logo{font-size:1.4rem;font-weight:700}
.nav a{color:rgba(255,255,255,.8);text-decoration:none;margin-left:1.5rem;font-size:.9rem}
.btn-nav{background:rgba(255,255,255,.15);padding:.4rem 1rem;border-radius:8px}
.hero h1{font-size:2.8rem;margin-bottom:1rem;line-height:1.2}
.hero p{font-size:1.1rem;opacity:.8;margin-bottom:2rem}
.btn-hero{display:inline-block;background:#3b82f6;color:#fff;padding:.8rem 2rem;border-radius:10px;text-decoration:none;font-weight:600;transition:background .2s}
.btn-hero:hover{background:#2563eb}
.features{padding:5rem 2rem;text-align:center;max-width:1000px;margin:0 auto}
.features h2{font-size:2rem;margin-bottom:3rem}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:2rem}
.feature{padding:2rem;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0}
.icon{font-size:2rem;margin-bottom:1rem}
.feature h3{margin-bottom:.5rem;color:#1e40af}
.cta{background:#1e40af;color:#fff;text-align:center;padding:5rem 2rem}
.cta h2{font-size:2rem;margin-bottom:1rem}
.cta p{opacity:.85;margin-bottom:2rem}
.btn-cta{display:inline-block;background:#fff;color:#1e40af;padding:.8rem 2rem;border-radius:10px;text-decoration:none;font-weight:600}
footer{text-align:center;padding:2rem;color:#888;font-size:.85rem}
footer a{color:#3b82f6;text-decoration:none}
@media(max-width:600px){.hero h1{font-size:1.8rem}.nav{flex-direction:column;gap:.5rem}}`;

// ─── Resume ──────────────────────────────────────────────────

const resumeHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>이력서 - Resume</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>홍길동</h1>
      <p class="title">Full Stack Developer</p>
      <div class="contact-info">
        <span>you@example.com</span>
        <span>github.com/username</span>
        <span>Seoul, Korea</span>
      </div>
    </header>
    <section>
      <h2>경력 (Experience)</h2>
      <div class="entry">
        <div class="entry-header"><h3>시니어 개발자</h3><span>2022 - 현재</span></div>
        <p class="company">ABC 테크 주식회사</p>
        <ul>
          <li>React/Next.js 기반 프론트엔드 개발 리드</li>
          <li>마이크로서비스 아키텍처 설계 및 구현</li>
        </ul>
      </div>
      <div class="entry">
        <div class="entry-header"><h3>주니어 개발자</h3><span>2020 - 2022</span></div>
        <p class="company">XYZ 소프트웨어</p>
        <ul>
          <li>Node.js API 서버 개발</li>
          <li>CI/CD 파이프라인 구축</li>
        </ul>
      </div>
    </section>
    <section>
      <h2>기술 스택 (Skills)</h2>
      <div class="tags">
        <span class="tag">TypeScript</span><span class="tag">React</span><span class="tag">Next.js</span>
        <span class="tag">Node.js</span><span class="tag">PostgreSQL</span><span class="tag">Docker</span>
      </div>
    </section>
    <section>
      <h2>학력 (Education)</h2>
      <div class="entry">
        <div class="entry-header"><h3>컴퓨터공학 학사</h3><span>2016 - 2020</span></div>
        <p class="company">서울대학교</p>
      </div>
    </section>
  </div>
  <footer><p>Powered by <a href="https://linkmap.vercel.app">Linkmap</a></p></footer>
</body>
</html>`;

const resumeCss = `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Pretendard',system-ui,sans-serif;color:#1a1a2e;line-height:1.7;background:#f5f5f5}
.container{max-width:700px;margin:2rem auto;background:#fff;padding:3rem;border-radius:12px;box-shadow:0 2px 20px rgba(0,0,0,.08)}
header{text-align:center;margin-bottom:2.5rem;padding-bottom:2rem;border-bottom:2px solid #e2e8f0}
header h1{font-size:2.2rem;color:#1e293b}
.title{color:#6366f1;font-size:1.1rem;margin:.3rem 0 1rem}
.contact-info{display:flex;gap:1.5rem;justify-content:center;flex-wrap:wrap;font-size:.85rem;color:#64748b}
section{margin-bottom:2rem}
section h2{font-size:1.3rem;color:#6366f1;border-bottom:1px solid #e2e8f0;padding-bottom:.4rem;margin-bottom:1rem}
.entry{margin-bottom:1.5rem}
.entry-header{display:flex;justify-content:space-between;align-items:baseline}
.entry-header h3{font-size:1rem}
.entry-header span{font-size:.85rem;color:#64748b}
.company{color:#6366f1;font-size:.9rem;margin:.2rem 0 .5rem}
ul{padding-left:1.5rem}
li{margin-bottom:.3rem;font-size:.95rem}
.tags{display:flex;flex-wrap:wrap;gap:.5rem}
.tag{background:#eef2ff;color:#6366f1;padding:.3rem .8rem;border-radius:6px;font-size:.85rem;font-weight:500}
footer{text-align:center;padding:1.5rem;color:#888;font-size:.85rem}
footer a{color:#6366f1;text-decoration:none}
@media(max-width:600px){.container{margin:1rem;padding:1.5rem}.entry-header{flex-direction:column}.contact-info{flex-direction:column;align-items:center;gap:.3rem}}`;

// ─── Blog ────────────────────────────────────────────────────

const blogHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Blog</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <div class="header-inner">
      <h1><a href="/">My Blog</a></h1>
      <nav><a href="/">홈</a><a href="#about">소개</a></nav>
    </div>
  </header>
  <main class="layout">
    <div class="posts">
      <article class="post">
        <span class="date">2025-01-15</span>
        <h2>첫 번째 포스트</h2>
        <p>여기에 블로그 글 내용을 작성하세요. HTML을 직접 편집하거나, 정적 사이트 생성기를 연동할 수 있습니다.</p>
        <a href="#" class="read-more">더 읽기 &rarr;</a>
      </article>
      <article class="post">
        <span class="date">2025-01-10</span>
        <h2>두 번째 포스트</h2>
        <p>개발 경험, 기술 리뷰, 프로젝트 회고 등 다양한 주제로 글을 작성해보세요.</p>
        <a href="#" class="read-more">더 읽기 &rarr;</a>
      </article>
    </div>
    <aside class="sidebar" id="about">
      <div class="widget">
        <h3>About</h3>
        <p>개발자 블로그입니다. 기술과 경험을 공유합니다.</p>
      </div>
      <div class="widget">
        <h3>Tags</h3>
        <div class="tags"><span>JavaScript</span><span>React</span><span>TIL</span></div>
      </div>
    </aside>
  </main>
  <footer><p>Powered by <a href="https://linkmap.vercel.app">Linkmap</a></p></footer>
</body>
</html>`;

const blogCss = `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Pretendard',system-ui,sans-serif;color:#334155;line-height:1.7;background:#fafafa}
header{background:#fff;border-bottom:1px solid #e2e8f0;padding:1rem 2rem}
.header-inner{max-width:1000px;margin:0 auto;display:flex;justify-content:space-between;align-items:center}
header h1{font-size:1.4rem}
header h1 a{color:#0f172a;text-decoration:none}
header nav a{margin-left:1.5rem;color:#64748b;text-decoration:none;font-size:.9rem}
.layout{max-width:1000px;margin:2rem auto;padding:0 2rem;display:grid;grid-template-columns:1fr 280px;gap:2rem}
.post{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:2rem;margin-bottom:1.5rem}
.date{font-size:.8rem;color:#94a3b8}
.post h2{font-size:1.4rem;margin:.5rem 0;color:#0f172a}
.post p{margin-bottom:1rem}
.read-more{color:#3b82f6;text-decoration:none;font-size:.9rem;font-weight:500}
.sidebar .widget{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:1.5rem;margin-bottom:1rem}
.widget h3{font-size:1rem;margin-bottom:.5rem;color:#0f172a}
.widget p{font-size:.9rem;color:#64748b}
.tags{display:flex;flex-wrap:wrap;gap:.4rem}
.tags span{background:#eef2ff;color:#3b82f6;padding:.2rem .6rem;border-radius:5px;font-size:.8rem}
footer{text-align:center;padding:2rem;color:#888;font-size:.85rem;border-top:1px solid #e2e8f0;margin-top:2rem}
footer a{color:#3b82f6;text-decoration:none}
@media(max-width:700px){.layout{grid-template-columns:1fr}}`;

// ─── Documentation ───────────────────────────────────────────

const docsHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentation</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="layout">
    <aside class="sidebar">
      <h2>문서</h2>
      <nav>
        <a href="#intro" class="active">시작하기</a>
        <a href="#install">설치</a>
        <a href="#usage">사용법</a>
        <a href="#api">API 레퍼런스</a>
        <a href="#faq">FAQ</a>
      </nav>
    </aside>
    <main>
      <section id="intro">
        <h1>시작하기</h1>
        <p>프로젝트 문서에 오신 것을 환영합니다. 이 페이지를 수정하여 나만의 문서 사이트를 만들어보세요.</p>
      </section>
      <section id="install">
        <h2>설치</h2>
        <pre><code>npm install my-package</code></pre>
        <p>위 명령어로 패키지를 설치합니다.</p>
      </section>
      <section id="usage">
        <h2>사용법</h2>
        <pre><code>import { init } from 'my-package';
init({ key: 'YOUR_API_KEY' });</code></pre>
        <p>기본적인 초기화 방법입니다.</p>
      </section>
      <section id="api">
        <h2>API 레퍼런스</h2>
        <table>
          <thead><tr><th>메서드</th><th>설명</th></tr></thead>
          <tbody>
            <tr><td><code>init(config)</code></td><td>SDK를 초기화합니다</td></tr>
            <tr><td><code>getData(id)</code></td><td>데이터를 조회합니다</td></tr>
          </tbody>
        </table>
      </section>
      <section id="faq">
        <h2>FAQ</h2>
        <details><summary>무료인가요?</summary><p>네, 기본 기능은 무료입니다.</p></details>
        <details><summary>지원하는 브라우저는?</summary><p>Chrome, Firefox, Safari, Edge 최신 버전을 지원합니다.</p></details>
      </section>
      <footer><p>Powered by <a href="https://linkmap.vercel.app">Linkmap</a></p></footer>
    </main>
  </div>
</body>
</html>`;

const docsCss = `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Pretendard',system-ui,sans-serif;color:#334155;line-height:1.7}
.layout{display:grid;grid-template-columns:240px 1fr;min-height:100vh}
.sidebar{background:#0f172a;color:#fff;padding:2rem 1.5rem;position:sticky;top:0;height:100vh;overflow-y:auto}
.sidebar h2{font-size:1.2rem;margin-bottom:1.5rem;padding-bottom:.5rem;border-bottom:1px solid rgba(255,255,255,.15)}
.sidebar nav{display:flex;flex-direction:column;gap:.3rem}
.sidebar a{color:rgba(255,255,255,.7);text-decoration:none;padding:.5rem .8rem;border-radius:6px;font-size:.9rem;transition:background .2s}
.sidebar a:hover,.sidebar a.active{background:rgba(255,255,255,.1);color:#fff}
main{padding:3rem;max-width:800px}
section{margin-bottom:3rem}
h1{font-size:2rem;color:#0f172a;margin-bottom:1rem}
h2{font-size:1.5rem;color:#0f172a;margin-bottom:1rem;padding-top:1rem}
pre{background:#1e293b;color:#e2e8f0;padding:1rem;border-radius:8px;overflow-x:auto;margin:1rem 0;font-size:.9rem}
code{font-family:'Fira Code',monospace}
p code{background:#f1f5f9;padding:.1rem .4rem;border-radius:4px;font-size:.85rem;color:#e11d48}
table{width:100%;border-collapse:collapse;margin:1rem 0}
th,td{text-align:left;padding:.6rem;border-bottom:1px solid #e2e8f0}
th{background:#f8fafc;font-weight:600;font-size:.85rem;color:#64748b}
details{border:1px solid #e2e8f0;border-radius:8px;padding:1rem;margin-bottom:.5rem}
summary{cursor:pointer;font-weight:600;color:#0f172a}
details p{margin-top:.5rem;font-size:.95rem}
footer{margin-top:3rem;padding-top:1.5rem;border-top:1px solid #e2e8f0;text-align:center;color:#888;font-size:.85rem}
footer a{color:#3b82f6;text-decoration:none}
@media(max-width:700px){.layout{grid-template-columns:1fr}.sidebar{position:static;height:auto}}`;

// ─── Export all templates ────────────────────────────────────

export const homepageTemplates: TemplateContent[] = [
  {
    slug: 'portfolio-static',
    repoName: 'portfolio-static',
    description: 'Clean personal portfolio template',
    files: [
      { path: 'index.html', content: portfolioHtml },
      { path: 'style.css', content: portfolioCss },
    ],
  },
  {
    slug: 'landing-static',
    repoName: 'landing-static',
    description: 'Business landing page template',
    files: [
      { path: 'index.html', content: landingHtml },
      { path: 'style.css', content: landingCss },
    ],
  },
  {
    slug: 'resume-static',
    repoName: 'resume-static',
    description: 'Professional resume page template',
    files: [
      { path: 'index.html', content: resumeHtml },
      { path: 'style.css', content: resumeCss },
    ],
  },
  {
    slug: 'blog-static',
    repoName: 'blog-static',
    description: 'Simple blog template',
    files: [
      { path: 'index.html', content: blogHtml },
      { path: 'style.css', content: blogCss },
    ],
  },
  {
    slug: 'docs-static',
    repoName: 'docs-static',
    description: 'Documentation site template',
    files: [
      { path: 'index.html', content: docsHtml },
      { path: 'style.css', content: docsCss },
    ],
  },
];
