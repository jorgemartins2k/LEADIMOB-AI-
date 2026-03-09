<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LeadiMob Ai — Variações de Logo</title>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #E8EDF6; font-family: 'Sora', sans-serif; padding: 48px 36px; }
  h1 { font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #8899BB; margin-bottom: 36px; }
  .section-label { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #8899BB; margin: 44px 0 18px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
  .card { border-radius: 18px; padding: 36px 32px 28px; display: flex; flex-direction: column; align-items: flex-start; }
  .lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 18px; opacity: 0.35; }
  .light  { background: #fff; box-shadow: 0 2px 20px rgba(10,25,70,.07); }
  .tinted { background: #EEF4FF; border: 1.5px solid #C8D9F5; }
  .navy-bg { background: #0D2040; }
  .dark-bg { background: #080E1E; }
  .grad   { background: linear-gradient(135deg, #0D2040 0%, #1A6FD4 100%); }
  .outline-card { background: transparent; border: 2px solid #C8D5E8; }
  .wm { display: flex; align-items: baseline; gap: 8px; margin-top: 14px; }
  .wm-text { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; font-family: 'Sora', sans-serif; }
  .wm-ai { font-size: 26px; font-weight: 800; font-family: 'Sora', sans-serif; }
  .icon-row { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
  .ibadge { width: 58px; height: 58px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }

  .code-wrap { margin-top: 52px; background: #0C1424; border-radius: 18px; overflow: hidden; }
  .code-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid rgba(255,255,255,.06); flex-wrap: wrap; gap: 10px; }
  .code-header span { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #475569; }
  .tabs { display: flex; gap: 6px; }
  .tab { padding: 5px 14px; border-radius: 7px; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; border: 1px solid rgba(255,255,255,.08); color: #475569; background: transparent; transition: all .2s; font-family: 'Sora', sans-serif; }
  .tab.active { background: #1A6FD4; color: #fff; border-color: transparent; }
  pre { font-family: 'SF Mono','Fira Code',monospace; font-size: 12px; line-height: 1.75; color: #94A3B8; padding: 24px 28px; overflow-x: auto; }
  .code-panel { display: none; }
  .code-panel.active { display: block; }
  .copy-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #94A3B8; font-family: 'Sora',sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 6px 14px; border-radius: 8px; cursor: pointer; transition: all .2s; }
  .copy-btn:hover { background: rgba(255,255,255,.14); color: #fff; }
  .copy-btn.ok { color: #4ADE80; border-color: #4ADE80; }
</style>
</head>
<body>

<h1>LeadiMob Ai — Variações de Logo</h1>

<!--
  SVG icon mapped from actual pixel data:
  ViewBox 168x175 (original pixel dimensions)

  NAVY (#0E2040):
    Vertical bar: x=1..33, y=48..143  (left wall)
    Horizontal bar: x=1..127, y=143..172  (base/floor)
    → Classic "L" shape

  BLUE (#0A4A96 / #1A6FD4):
    Roof triangle peak at ~(91, 1)
    Left slope: from (18,56) up to (91,1) — diagonal
    Right side: from (91,1) down to (139,40) then vertical to (139,172) (thin right wall)
    Inner cutout creates white void (the house interior)

  DOT (#1A6FD4 bright): circle at ~(91, 12) r~15px
-->

<!-- Shared SVG icon symbol -->
<svg width="0" height="0" style="position:absolute;overflow:hidden">
<defs>

  <!--
    Reconstructed from pixel scan:
    - Navy L: left bar x=1-33 from y=48 to 143, base x=1-127 from y=143-172
    - Blue: roof apex at (91,1), left edge at (18,57), right outer wall x=139-167 y=40-172
             with inner white void
    - Dot: center ~(91,12) r=14
    
    Scaling to viewBox="0 0 100 102" (÷1.68 and ÷1.71)
  -->
  <symbol id="ico" viewBox="0 0 100 102">
    <!-- NAVY L shape -->
    <!-- Left vertical bar -->
    <rect x="0.6" y="28" width="19" height="57" fill="#0E2040"/>
    <!-- Bottom horizontal bar -->
    <rect x="0.6" y="84" width="76" height="17" fill="#0E2040"/>

    <!-- BLUE: roof + right wall + inner area -->
    <!-- 
      Roof: triangle with apex at (54,1), left base at (11,34), right at (83,34)
      Right wall: from (83,34) down to (83,101) width ~17px → x=83..100
      Inner void: white rectangle showing through
    -->
    <!-- Full blue shape as polygon -->
    <polygon points="
      54,1
      83,34
      100,34
      100,102
      83,102
      83,34
      54,1
      10,34
      19,34
      19,57
      10,57
    " fill="#1362C6"/>
    <!-- Simplified: draw roof triangle + right wall separately for clarity -->
    <!-- Reset: use path for exact shape -->
    <!-- Blue roof chevron (no fill on interior) -->
    <path d="
      M 54,1
      L 100,34
      L 100,102
      L 83,102
      L 83,34
      L 54,8
      L 19,34
      L 19,57
      L 10,57
      L 10,34
      Z
    " fill="#1362C6"/>

    <!-- Dot -->
    <circle cx="91" cy="8" r="9" fill="#1875E8"/>
  </symbol>

  <!-- WHITE version -->
  <symbol id="ico-w" viewBox="0 0 100 102">
    <rect x="0.6" y="28" width="19" height="57" fill="rgba(255,255,255,0.9)"/>
    <rect x="0.6" y="84" width="76" height="17" fill="rgba(255,255,255,0.9)"/>
    <path d="M 54,1 L 100,34 L 100,102 L 83,102 L 83,34 L 54,8 L 19,34 L 19,57 L 10,57 L 10,34 Z" fill="rgba(255,255,255,0.55)"/>
    <circle cx="91" cy="8" r="9" fill="white"/>
  </symbol>

  <!-- MONO NAVY -->
  <symbol id="ico-mono" viewBox="0 0 100 102">
    <rect x="0.6" y="28" width="19" height="57" fill="#0E2040"/>
    <rect x="0.6" y="84" width="76" height="17" fill="#0E2040"/>
    <path d="M 54,1 L 100,34 L 100,102 L 83,102 L 83,34 L 54,8 L 19,34 L 19,57 L 10,57 L 10,34 Z" fill="#0E2040"/>
    <circle cx="91" cy="8" r="9" fill="#0E2040"/>
  </symbol>

  <!-- OUTLINE -->
  <symbol id="ico-out" viewBox="0 0 100 102">
    <rect x="0.6" y="28" width="19" height="57" fill="none" stroke="#0E2040" stroke-width="3"/>
    <rect x="0.6" y="84" width="76" height="17" fill="none" stroke="#0E2040" stroke-width="3"/>
    <path d="M 54,1 L 100,34 L 100,102 L 83,102 L 83,34 L 54,8 L 19,34 L 19,57 L 10,57 L 10,34 Z" fill="none" stroke="#1362C6" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="91" cy="8" r="8" fill="none" stroke="#1875E8" stroke-width="3"/>
  </symbol>

</defs>
</svg>

<!-- ─── FUNDOS CLAROS ─── -->
<div class="section-label">Fundos Claros</div>
<div class="grid">

  <div class="card light">
    <svg width="58" height="60" viewBox="0 0 100 102"><use href="#ico"/></svg>
    <div class="wm">
      <span class="wm-text" style="color:#0E2040">LEADIMOB</span>
      <span class="wm-ai" style="color:#1362C6">Ai</span>
    </div>
    <div class="lbl" style="color:#0E2040">Padrão — Fundo Branco</div>
  </div>

  <div class="card tinted">
    <svg width="58" height="60" viewBox="0 0 100 102"><use href="#ico"/></svg>
    <div class="wm">
      <span class="wm-text" style="color:#0E2040">LEADIMOB</span>
      <span class="wm-ai" style="color:#1362C6">Ai</span>
    </div>
    <div style="font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#5A7DBB;margin-top:5px;font-family:'Sora',sans-serif">Inteligência Imobiliária</div>
    <div class="lbl" style="color:#0E2040">Com Tagline</div>
  </div>

  <div class="card light">
    <svg width="58" height="60" viewBox="0 0 100 102"><use href="#ico-mono"/></svg>
    <div class="wm">
      <span class="wm-text" style="color:#0E2040">LEADIMOB</span>
      <span class="wm-ai" style="color:#0E2040">Ai</span>
    </div>
    <div class="lbl" style="color:#0E2040">Monocromático Navy</div>
  </div>

  <div class="card outline-card">
    <svg width="58" height="60" viewBox="0 0 100 102"><use href="#ico-out"/></svg>
    <div class="wm">
      <span class="wm-text" style="color:#0E2040">LEADIMOB</span>
      <span class="wm-ai" style="color:#1362C6">Ai</span>
    </div>
    <div class="lbl" style="color:#0E2040">Outline</div>
  </div>

</div>

<!-- ─── FUNDOS ESCUROS ─── -->
<div class="section-label">Fundos Escuros & Gradiente</div>
<div class="grid">

  <div class="card dark-bg">
    <svg width="58" height="60" viewBox="0 0 100 102"><use href="#ico-w"/></svg>
    <div class="wm">
      <span class="wm-text" style="color:#fff">LEADIMOB</span>
      <span class="wm-ai" style="color:#5BAEF0">Ai</span>
    </div>
    <div class="lbl" style="color:#fff">Dark Mode</div>
  </div>

  <div class="card navy-bg">
    <svg width="58" height="60" viewBox="0 0 100 102"><use href="#ico-w"/></svg>
    <div class="wm">
      <span class="wm-text" style="color:#fff">LEADIMOB</span>
      <span class="wm-ai" style="color:#5BAEF0">Ai</span>
    </div>
    <div class="lbl" style="color:#fff">Fundo Navy</div>
  </div>

  <div class="card grad">
    <svg width="58" height="60" viewBox="0 0 100 102"><use href="#ico-w"/></svg>
    <div class="wm">
      <span class="wm-text" style="color:#fff">LEADIMOB</span>
      <span class="wm-ai" style="color:#fff">Ai</span>
    </div>
    <div class="lbl" style="color:#fff">Gradiente Azul</div>
  </div>

  <div class="card light">
    <svg width="58" height="60" viewBox="0 0 100 102"><use href="#ico"/></svg>
    <div class="wm">
      <span class="wm-text" style="color:#1362C6">LEADIMOB</span>
      <span class="wm-ai" style="color:#0E2040">Ai</span>
    </div>
    <div class="lbl" style="color:#0E2040">Cores Invertidas</div>
  </div>

</div>

<!-- ─── ÍCONE SOLO ─── -->
<div class="section-label">Ícone Solo (Favicon / App Icon)</div>
<div class="card light" style="max-width:460px">
  <div class="icon-row">
    <div class="ibadge" style="background:#fff;box-shadow:0 2px 14px rgba(0,0,0,.1)">
      <svg width="36" height="37" viewBox="0 0 100 102"><use href="#ico"/></svg>
    </div>
    <div class="ibadge" style="background:#0E2040">
      <svg width="36" height="37" viewBox="0 0 100 102"><use href="#ico-w"/></svg>
    </div>
    <div class="ibadge" style="background:#1362C6">
      <svg width="36" height="37" viewBox="0 0 100 102"><use href="#ico-w"/></svg>
    </div>
    <div class="ibadge" style="background:linear-gradient(135deg,#0E2040,#1875E8)">
      <svg width="36" height="37" viewBox="0 0 100 102"><use href="#ico-w"/></svg>
    </div>
    <div class="ibadge" style="background:#fff;border:2px solid #CBD5E1">
      <svg width="36" height="37" viewBox="0 0 100 102"><use href="#ico-out"/></svg>
    </div>
  </div>
  <div class="lbl" style="color:#0E2040">Branco · Navy · Azul · Gradiente · Outline</div>
</div>

<!-- ─── CÓDIGO ─── -->
<div class="code-wrap">
  <div class="code-header">
    <span>Código SVG pronto para usar</span>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <div class="tabs">
        <button class="tab active" onclick="sw('padrao',this)">Padrão</button>
        <button class="tab" onclick="sw('dark',this)">Dark</button>
        <button class="tab" onclick="sw('branco',this)">Branco</button>
        <button class="tab" onclick="sw('icone',this)">Ícone</button>
      </div>
      <button class="copy-btn" onclick="cp()">Copiar</button>
    </div>
  </div>

  <div id="padrao" class="code-panel active"><pre>&lt;!-- LeadiMob Ai | Logo Padrão --&gt;
&lt;svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg"&gt;
  &lt;!-- Ícone: barra navy esquerda (parede) --&gt;
  &lt;rect x="0" y="16" width="11" height="33" fill="#0E2040"/&gt;
  &lt;!-- Base navy (chão) --&gt;
  &lt;rect x="0" y="49" width="45" height="10" fill="#0E2040"/&gt;
  &lt;!-- Telhado + parede dir azul (com vão branco interno) --&gt;
  &lt;path d="M32,1 L58,20 L58,59 L49,59 L49,20 L32,5 L11,20 L11,33 L6,33 L6,20 Z" fill="#1362C6"/&gt;
  &lt;!-- Ponto azul --&gt;
  &lt;circle cx="54" cy="5" r="5.5" fill="#1875E8"/&gt;
  &lt;!-- Texto --&gt;
  &lt;text x="70" y="44" font-family="'Sora',sans-serif" font-size="28" font-weight="700" fill="#0E2040" letter-spacing="-0.5"&gt;LEADIMOB&lt;/text&gt;
  &lt;text x="220" y="44" font-family="'Sora',sans-serif" font-size="28" font-weight="800" fill="#1362C6"&gt;Ai&lt;/text&gt;
&lt;/svg&gt;</pre></div>

  <div id="dark" class="code-panel"><pre>&lt;!-- LeadiMob Ai | Logo Dark --&gt;
&lt;svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg"&gt;
  &lt;rect x="0" y="16" width="11" height="33" fill="rgba(255,255,255,0.9)"/&gt;
  &lt;rect x="0" y="49" width="45" height="10" fill="rgba(255,255,255,0.9)"/&gt;
  &lt;path d="M32,1 L58,20 L58,59 L49,59 L49,20 L32,5 L11,20 L11,33 L6,33 L6,20 Z" fill="rgba(255,255,255,0.55)"/&gt;
  &lt;circle cx="54" cy="5" r="5.5" fill="white"/&gt;
  &lt;text x="70" y="44" font-family="'Sora',sans-serif" font-size="28" font-weight="700" fill="#ffffff" letter-spacing="-0.5"&gt;LEADIMOB&lt;/text&gt;
  &lt;text x="220" y="44" font-family="'Sora',sans-serif" font-size="28" font-weight="800" fill="#5BAEF0"&gt;Ai&lt;/text&gt;
&lt;/svg&gt;</pre></div>

  <div id="branco" class="code-panel"><pre>&lt;!-- LeadiMob Ai | Logo Branco total --&gt;
&lt;svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg"&gt;
  &lt;rect x="0" y="16" width="11" height="33" fill="white"/&gt;
  &lt;rect x="0" y="49" width="45" height="10" fill="white"/&gt;
  &lt;path d="M32,1 L58,20 L58,59 L49,59 L49,20 L32,5 L11,20 L11,33 L6,33 L6,20 Z" fill="rgba(255,255,255,0.6)"/&gt;
  &lt;circle cx="54" cy="5" r="5.5" fill="white"/&gt;
  &lt;text x="70" y="44" font-family="'Sora',sans-serif" font-size="28" font-weight="700" fill="#ffffff" letter-spacing="-0.5"&gt;LEADIMOB&lt;/text&gt;
  &lt;text x="220" y="44" font-family="'Sora',sans-serif" font-size="28" font-weight="800" fill="#ffffff"&gt;Ai&lt;/text&gt;
&lt;/svg&gt;</pre></div>

  <div id="icone" class="code-panel"><pre>&lt;!-- LeadiMob Ai | Ícone com fundo (favicon/app) --&gt;
&lt;svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"&gt;
  &lt;rect width="48" height="48" rx="11" fill="#0E2040"/&gt;
  &lt;rect x="5" y="17" width="9" height="20" fill="rgba(255,255,255,0.85)"/&gt;
  &lt;rect x="5" y="37" width="28" height="7" fill="rgba(255,255,255,0.85)"/&gt;
  &lt;path d="M24,6 L40,17 L40,44 L33,44 L33,17 L24,9 L14,17 L14,24 L5,24 L5,17 Z" fill="rgba(255,255,255,0.5)"/&gt;
  &lt;circle cx="37" cy="9" r="4" fill="#1875E8"/&gt;
&lt;/svg&gt;</pre></div>

</div>

<script>
function sw(id, btn) {
  document.querySelectorAll('.code-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}
function cp() {
  const pre = document.querySelector('.code-panel.active pre');
  navigator.clipboard.writeText(pre.textContent.trim()).then(() => {
    const b = document.querySelector('.copy-btn');
    b.textContent = '✓ Copiado!'; b.classList.add('ok');
    setTimeout(() => { b.textContent = 'Copiar'; b.classList.remove('ok'); }, 2000);
  });
}
</script>
</body>
</html>