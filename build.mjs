import { mkdirSync, writeFileSync } from 'node:fs';
import { lessons } from './lessons.mjs';

const siteUrl = new URL(process.env.STARKVERB_ORIGIN ?? 'https://vinichsh-ship-it.github.io/starkverb/');
siteUrl.pathname = siteUrl.pathname.replace(/\/?$/, '/');
const publicUrl = path => new URL(path.replace(/^\//, ''), siteUrl).href;
const playUrl = 'https://play.google.com/store/apps/details?id=com.tempdev.starkdeutsch';
const siteName = 'StarkVerb';
const accents = ['lime', 'lavender', 'peach', 'mint'];
const samplePhrases = ['fahren · fuhr · gefahren', 'warten auf + Akkusativ', 'die Angst vor + Dativ', 'stolz auf + Akkusativ'];
const html = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const travelQuestion = {
  prompt: 'Ich warte ___ den Bus.',
  options: ['mit', 'auf', 'über'],
  correct: 1,
  explanation: 'Warten auf требует Akkusativ. Здесь это den Bus.',
};

function brand(root) {
  return `<a class="brand" href="${root}" aria-label="StarkVerb, главная"><span class="brand-mark" aria-hidden="true"><i></i><b></b></span><span>StarkVerb<span class="brand-dot">.</span></span></a>`;
}

function header(root) {
  return `<a class="skip" href="#main">К содержанию</a>
<header class="topbar"><div class="shell topbar-inner">
${brand(root)}
<nav aria-label="Основная навигация">
  <a href="${root}#themen">Темы</a><a href="${root}#praxis">Практика</a><a href="${root}#app">Приложение</a>
</nav>
<a class="pill pill-dark top-cta" href="${root}#app">StarkVerb для Android</a>
</div></header>`;
}

function footer(root) {
  return `<footer class="footer"><div class="shell footer-inner">
    ${brand(root)}<p>Тренажёр немецкого языка</p><a href="${root}#themen">Все темы</a><a href="${root}#app">Для Android</a>
  </div></footer>`;
}

function document({ title, description, pathname, root, main, kind = 'WebPage', image = false }) {
  const url = publicUrl(pathname);
  const structured = {
    '@context': 'https://schema.org',
    '@type': kind,
    name: title,
    description,
    inLanguage: 'ru',
    url,
    isPartOf: { '@type': 'WebSite', name: siteName, url: siteUrl.href },
    ...(kind === 'LearningResource' ? {
      learningResourceType: 'Lesson',
      teaches: title.split(' | ')[0],
      audience: { '@type': 'EducationalAudience', educationalRole: 'student' },
      author: { '@type': 'Organization', name: siteName, url: siteUrl.href },
    } : {}),
  };
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#f7f6f1">
<title>${html(title)}</title>
<meta name="description" content="${html(description)}">
<link rel="canonical" href="${html(url)}">
<meta property="og:type" content="${kind === 'LearningResource' ? 'article' : 'website'}">
<meta property="og:site_name" content="StarkVerb">
<meta property="og:title" content="${html(title)}">
<meta property="og:description" content="${html(description)}">
<meta property="og:url" content="${html(url)}">
${image ? `<meta property="og:image" content="${html(publicUrl('assets/berlin.jpg'))}">` : ''}
<link rel="icon" href="${root}assets/icon.png" type="image/png">
<link rel="stylesheet" href="${root}assets/style.css">
<script type="application/ld+json">${JSON.stringify(structured).replace(/</g, '\\u003c')}</script>
<script src="${root}assets/site.js" defer></script>
</head>
<body>
${header(root)}
${main}
${footer(root)}
</body>
</html>
`;
}

function quiz(question, id, compact = false) {
  return `<div class="quiz${compact ? ' quiz-compact' : ''}" data-quiz>
<p class="quiz-sentence" lang="de" id="${id}">${html(question.prompt)}</p>
<div class="options" role="group" aria-labelledby="${id}">
${question.options.map((option, index) => `<button type="button" class="option" lang="de" data-correct="${index === question.correct}" aria-pressed="false">${html(option)}</button>`).join('')}
</div>
<p class="quiz-feedback" role="status" data-explanation="${html(question.explanation)}"></p>
<noscript><p class="no-js">Ответ <strong lang="de">${html(question.options[question.correct])}</strong>. ${html(question.explanation)}</p></noscript>
</div>`;
}

function topicIcon(index) {
  const shapes = [
    '<path d="M25 2 7 23h14l-2 15L37 17H23z"/>',
    '<path d="M20 12 14 6a7 7 0 0 0-10 10l6 6a7 7 0 0 0 10 0m0-4 6 6a7 7 0 0 0 10-10l-6-6a7 7 0 0 0-10 0M14 24l12-12"/>',
    '<path d="M4 10 20 3l16 7-16 7-16-7Zm0 9 16 7 16-7M4 28l16 7 16-7"/>',
    '<path d="M20 2c0 12-6 18-18 18 12 0 18 6 18 18 0-12 6-18 18-18C26 20 20 14 20 2Z"/>',
  ];
  return `<svg viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round">${shapes[index]}</svg>`;
}

function topicCard(lesson, index, root = './') {
  return `<a class="topic-card tone-${accents[index]}" href="${root}${lesson.slug}/">
    <span class="topic-icon">${topicIcon(index)}</span>
    <span class="topic-german" lang="de">${html(lesson.tag)}</span>
    <h3>${html(lesson.shortTitle)}</h3>
    <span class="topic-sample" lang="de">${samplePhrases[index]}</span>
    <span class="topic-action">Открыть урок</span>
  </a>`;
}

function appPanel() {
  return `<section class="app-panel" id="app" aria-labelledby="app-title">
    <div class="app-copy">
      <span class="eyebrow"><span aria-hidden="true"></span> STARKVERB ДЛЯ ANDROID</span>
      <h2 id="app-title">Возьмите немецкий<br class="desktop-break"> с собой.</h2>
      <p>Карточки с формами глаголов, словарь управления, упражнения на предлоги и падежи и история занятий в одном приложении.</p>
      <a class="pill pill-lime" href="${playUrl}">Открыть в Google Play</a>
      <p class="availability">Доступность и условия покупки указаны в Google Play.</p>
    </div>
    <div class="app-art" aria-hidden="true">
      <span class="app-ring ring-one"></span><span class="app-ring ring-two"></span>
      <div class="study-card study-back"></div><div class="study-card study-front">
        <span class="study-label">STARKVERB</span><strong>nehmen</strong>
        <span>nimmt · nahm · genommen</span><div class="study-line"></div><small>брать</small>
      </div>
    </div>
  </section>`;
}

const homeTitle = 'StarkVerb — сильные глаголы и предлоги немецкого языка';
const homeDescription = 'Изучайте сильные немецкие глаголы и управление предлогами у глаголов, существительных и прилагательных. Правила, таблицы и бесплатные упражнения StarkVerb.';
const home = `<main class="shell" id="main">
<section class="hero" aria-labelledby="hero-title">
  <div class="hero-copy">
    <span class="eyebrow"><span aria-hidden="true"></span> ТРЕНАЖЁР НЕМЕЦКОГО ЯЗЫКА</span>
    <h1 id="hero-title">Немецкий.<br><em>По делу.</em></h1>
    <p>Разберитесь в сильных глаголах и научитесь выбирать предлог и падеж в немецких фразах.</p>
    <div class="hero-actions"><a class="pill pill-lime" href="#themen">Начать учиться</a><a class="pill pill-outline" href="#app">О приложении</a></div>
  </div>
  <div class="hero-visual">
    <img class="berlin" src="./assets/berlin.jpg" alt="" width="960" height="1200" fetchpriority="high">
    <div class="hero-shade"></div>
    <div class="place" aria-hidden="true"><span></span> BERLIN, DE</div>
    <div class="hero-quiz" id="praxis">
      <p class="mini-label"><span class="mini-icon" aria-hidden="true">✳</span> Быстрая практика</p>
      ${quiz(travelQuestion, 'hero-question', true)}
    </div>
  </div>
</section>
<section class="topics" id="themen" aria-labelledby="topics-title">
  <div class="section-heading"><div><span class="eyebrow"><span aria-hidden="true"></span> УЧЕБНЫЕ РАЗДЕЛЫ</span><h2 id="topics-title">Что будем учить?</h2></div><p>Правила, немецкие примеры с переводом и короткий тест в каждой теме.</p></div>
  <div class="topic-grid">${lessons.map((lesson, index) => topicCard(lesson, index)).join('')}</div>
</section>
<section class="comparison" aria-labelledby="compare-title">
  <div><span class="eyebrow"><span aria-hidden="true"></span> УПРАВЛЕНИЕ В КОНТЕКСТЕ</span><h2 id="compare-title">Одна тема.<br>Три конструкции.</h2><p>Об интересе можно сказать по-разному. Сравните предлог и падеж у глагола, существительного и прилагательного.</p></div>
  <div class="compare-list">
    <a href="./verben-mit-praepositionen/"><span>Глагол</span><strong lang="de">sich interessieren <mark>für</mark></strong><small>Akkusativ</small></a>
    <a href="./nomen-mit-praepositionen/"><span>Существительное</span><strong lang="de">das Interesse <mark>an</mark></strong><small>Dativ</small></a>
    <a href="./adjektive-mit-praepositionen/"><span>Прилагательное</span><strong lang="de">interessiert <mark>an</mark></strong><small>Dativ</small></a>
  </div>
</section>
${appPanel()}
</main>`;

function lessonPage(lesson, index) {
  const prefix = `lesson-${index}`;
  const main = `<main class="shell lesson" id="main">
<nav class="breadcrumb" aria-label="Путь к уроку"><a href="../">Главная</a><span aria-hidden="true">/</span><a href="../#themen">Темы</a><span aria-hidden="true">/</span><span aria-current="page">${html(lesson.shortTitle)}</span></nav>
<article>
  <header class="lesson-hero tone-${accents[index]}">
    <div><span class="eyebrow" lang="de"><span aria-hidden="true"></span> ${html(lesson.tag)}</span>
    <h1>${html(lesson.title)}</h1>
    <p>${html(lesson.intro)}</p>
    <div class="hero-actions"><a class="pill pill-dark" href="#examples">К примерам</a><a class="pill pill-outline" href="#practice">Решить тест</a></div></div>
    <div class="lesson-art" aria-hidden="true">${topicIcon(index)}</div>
  </header>
  <div class="lesson-layout">
    <aside class="lesson-nav"><nav aria-label="Другие темы"><h2>Уроки StarkVerb</h2>
    ${lessons.map((item, i) => `<a href="../${item.slug}/"${index === i ? ' aria-current="page"' : ''}><span class="lesson-nav-dot tone-${accents[i]}"></span>${html(item.shortTitle)}</a>`).join('')}
    </nav></aside>
    <div class="lesson-body">
      <section aria-labelledby="rule-title"><h2 id="rule-title">Как это работает</h2>
        <div class="explanation-grid">${lesson.sections.map(([heading, body]) => `<div><h3>${html(heading)}</h3><p>${html(body)}</p></div>`).join('')}</div>
      </section>
      <section id="examples" aria-labelledby="examples-title"><h2 id="examples-title">Таблица и примеры</h2>
        <div class="table-scroll" role="region" aria-label="Таблица примеров" tabindex="0"><table>
        <thead><tr>${lesson.headers.map(heading => `<th scope="col">${html(heading)}</th>`).join('')}</tr></thead>
        <tbody>${lesson.rows.map(row => `<tr>${row.map((cell, i) => i === 0 ? `<th scope="row" lang="de">${html(cell)}</th>` : `<td>${html(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div>
      </section>
      <section id="practice" aria-labelledby="practice-title"><h2 id="practice-title">Проверьте себя</h2>
        <p>Выберите ответ. После каждой попытки появится объяснение.</p>
        <div class="lesson-quizzes">${lesson.questions.map((item, i) => quiz(item, `${prefix}-q-${i}`)).join('')}</div>
      </section>
      <section aria-labelledby="faq-title"><h2 id="faq-title">Частые вопросы</h2>
        <div class="faq">${lesson.faq.map(([question, answer]) => `<details><summary>${html(question)}</summary><p>${html(answer)}</p></details>`).join('')}</div>
      </section>
      <section class="lesson-sources" aria-labelledby="sources-title"><h2 id="sources-title">Источники</h2>
        <ul>${lesson.sources.map(([label, url]) => `<li><a href="${html(url)}">${html(label)}</a></li>`).join('')}</ul>
      </section>
    </div>
  </div>
</article>
${appPanel()}
</main>`;
  return document({
    title: `${lesson.title} | StarkVerb`, description: lesson.description,
    pathname: `/${lesson.slug}/`, root: '../', main, kind: 'LearningResource',
  });
}

const paths = ['/', ...lessons.map(lesson => `/${lesson.slug}/`)];
writeFileSync('dist/index.html', document({
  title: homeTitle, description: homeDescription, pathname: '/', root: './', main: home, image: true,
}));
lessons.forEach((lesson, index) => {
  mkdirSync(`dist/${lesson.slug}`, { recursive: true });
  writeFileSync(`dist/${lesson.slug}/index.html`, lessonPage(lesson, index));
});
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(path => `  <url><loc>${html(publicUrl(path))}</loc></url>`).join('\n')}\n</urlset>\n`);
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: ${publicUrl('sitemap.xml')}\n`);
