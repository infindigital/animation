(() => {
  const NS = "http://www.w3.org/2000/svg";
  const W = 200,
    H = 480; // sole viewBox
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);

  const svg = (inner, extra = "") =>
    `<svg viewBox="0 -24 ${W} ${H + 48}" ${extra}>${inner}</svg>`;

  // one layer = a stack of edge slices with a detailed top face, so it reads as solid
  function build(layer, { slices, step, edge, top, pins }) {
    let html = "";
    for (let i = 0; i < slices; i++) {
      const shade = edge(i / Math.max(1, slices - 1));
      html += `<div class="slice" style="transform:translateZ(${(i * step).toFixed(2)}px)">${svg(shade)}</div>`;
    }
    html += `<div class="slice top" style="transform:translateZ(${(slices * step).toFixed(2)}px)">${svg(top)}`;
    for (const [name, x, y] of pins) {
      // map viewBox coords to the slice box (viewBox is padded 24 top and bottom)
      html += `<span class="pin" data-pin="${name}" style="left:${((x / W) * 100).toFixed(3)}%;top:${(((y + 24) / (H + 48)) * 100).toFixed(3)}%"></span>`;
    }
    layer.innerHTML = html + "</div>";
    return Object.fromEntries(
      [...layer.querySelectorAll(".pin")].map((p) => [p.dataset.pin, p]),
    );
  }

  const mix = (a, b, t) => {
    const p = (s) => s.match(/\w\w/g).map((h) => parseInt(h, 16));
    const [x, y] = [p(a), p(b)];
    return (
      "#" +
      x
        .map((v, i) =>
          Math.round(v + (y[i] - v) * t)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
    );
  };

  const HOLES = [
    ["post", 96, 120],
    ["left", 52, 258],
    ["right", 150, 258],
  ];

  // 03 grip sole
  const solePins = build($("lSole"), {
    slices: 14,
    step: 0.9,
    edge: (t) => `<use href="#sole" fill="${mix("5A3D26", "8A6645", t)}"/>`,
    top: `
      <use href="#sole" fill="url(#rubber)"/>
      <g clip-path="url(#soleClip)">
        <rect x="0" y="0" width="${W}" height="${H}" fill="url(#tread)"/>
        <path d="M30 252 C80 240 120 240 172 252" stroke="#5A3D26" stroke-width="7" fill="none"/>
        <use href="#sole" fill="none" stroke="#C49B71" stroke-width="9"/>
        <use href="#sole" fill="none" stroke="#5A3D26" stroke-width="2.5" transform="translate(100 240) scale(.93) translate(-100 -240)" opacity=".6"/>
      </g>
      <use href="#sole" fill="url(#sheen)"/>
      ${HOLES.map(([, x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="#3A2716"/><circle cx="${x}" cy="${y}" r="5.5" fill="none" stroke="#C49B71" stroke-width="1"/>`).join("")}`,
    pins: [...HOLES, ["call", 160, 380]],
  });

  // 02 memory cushion
  const foamPins = build($("lFoam"), {
    slices: 18,
    step: 0.9,
    edge: (t) => `<use href="#sole" fill="${mix("B08A60", "D6B58C", t)}"/>`,
    top: `
      <use href="#sole" fill="url(#foam)"/>
      <g clip-path="url(#soleClip)">
        <rect x="0" y="0" width="${W}" height="${H}" fill="url(#pores)"/>
        <use href="#sole" fill="none" stroke="#F7E6CE" stroke-width="10" opacity=".55"/>
        <use href="#sole" fill="none" stroke="#BF9B70" stroke-width="1.2" transform="translate(100 240) scale(.9) translate(-100 -240)"/>
        <ellipse cx="100" cy="392" rx="50" ry="62" fill="url(#heelCup)"/>
        <ellipse cx="104" cy="100" rx="62" ry="58" fill="url(#heelCup)" opacity=".7"/>
        <path d="M30 250 C80 238 120 238 172 250" stroke="#B08A60" stroke-width="1.4" stroke-dasharray="3 3" fill="none"/>
        <text transform="translate(150 446) rotate(-90)" font-family="Archivo,sans-serif" font-weight="900" font-size="66" letter-spacing="-1" fill="#1B1714" opacity=".92">H WALK</text>
      </g>
      ${HOLES.map(([, x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#8C6845"/><circle cx="${x - 0.8}" cy="${y - 0.8}" r="3" fill="#5E422A"/>`).join("")}`,
    pins: [...HOLES, ["call", 182, 150]],
  });

  // 01 premium straps: an arched thong built from short segments, rising from the post and falling to each side
  const strapPins = (() => {
    const layer = $("lStrap");
    const K = 220 / W; // viewBox -> px
    const px = (x, y) => [x * K, (y + 24) * K];
    const bez = (p0, p1, p2, p3, t) =>
      p0.map(
        (_, i) =>
          (1 - t) ** 3 * p0[i] +
          3 * (1 - t) ** 2 * t * p1[i] +
          3 * (1 - t) * t * t * p2[i] +
          t ** 3 * p3[i],
      );
    const POST = [96, 120],
      TOP = 34; // height of the post, in px
    const arms = [
      [POST, [74, 132], [52, 176], [52, 258]],
      [POST, [118, 134], [150, 178], [150, 258]],
    ];
    const height = (t) => TOP * Math.pow(Math.cos((t * Math.PI) / 2), 0.75);
    let html = "";
    const seg = (a, b, za, zb, w, color, extra = "") => {
      const [x1, y1] = px(...a),
        [x2, y2] = px(...b);
      const len = Math.hypot(x2 - x1, y2 - y1) + w * 0.9;
      const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
      const z = (za + zb) / 2;
      return `<div style="position:absolute;left:${((x1 + x2) / 2 - len / 2).toFixed(2)}px;top:${((y1 + y2) / 2 - w / 2).toFixed(2)}px;width:${len.toFixed(2)}px;height:${w}px;border-radius:${w / 2}px;background:${color};transform:translateZ(${z.toFixed(2)}px) rotate(${ang.toFixed(2)}deg);${extra}"></div>`;
    };
    // post: a short column of discs
    for (let z = 0; z <= TOP; z += 1.5) {
      const [x, y] = px(...POST);
      html += `<div style="position:absolute;left:${x - 8}px;top:${y - 8}px;width:16px;height:16px;border-radius:50%;background:${mix("5A3E28", "8E6849", z / TOP)};transform:translateZ(${z}px)"></div>`;
    }
    const N = 26;
    for (const arm of arms) {
      for (let i = 0; i < N; i++) {
        const t1 = i / N,
          t2 = (i + 1) / N;
        const a = bez(...arm, t1),
          b = bez(...arm, t2);
        const z1 = height(t1),
          z2 = height(t2);
        const slope = Math.min(1, Math.abs(z2 - z1) / 3);
        html += seg(a, b, z1 - 4, z2 - 4, 22, "#5C402A");
        html += seg(
          a,
          b,
          z1 - 2,
          z2 - 2,
          22,
          mix("6E4F37", "82603F", 1 - slope),
        );
        html += seg(
          a,
          b,
          z1,
          z2,
          22,
          `linear-gradient(180deg,${mix("CFA886", "B48A67", slope)},#8C6548 72%)`,
        );
      }
    }
    // cap on the post with the H mark
    {
      const [x, y] = px(...POST);
      html += `<div style="position:absolute;left:${x - 14}px;top:${y - 14}px;width:28px;height:28px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#D2AC88,#8C6548 72%);transform:translateZ(${TOP + 1}px);display:grid;place-items:center;font:900 10px Archivo,sans-serif;color:#5C402A">H</div>`;
    }
    // pins: the three holes at the base, and a lead point on the right arm
    const pins = [
      ...HOLES.map(([n, x, y]) => [n, x, y, 0]),
      ["call", ...bez(...arms[1], 0.45), height(0.45) + 1],
    ];
    for (const [n, x, y, z] of pins) {
      const [X, Y] = px(x, y);
      html += `<span class="pin" data-pin="${n}" style="left:${X}px;top:${Y}px;transform:translateZ(${z}px)"></span>`;
    }
    layer.innerHTML = html;
    return Object.fromEntries(
      [...layer.querySelectorAll(".pin")].map((p) => [p.dataset.pin, p]),
    );
  })();

  // soft studio shadow under the whole stack
  $("lShadow").innerHTML =
    `<div class="shadow">${svg('<use href="#sole" fill="#000" filter="url(#blur)"/>')}</div>`;

  // overlay: guides between holes, leads from each layer to its callout
  const lines = $("lines");
  const callouts = [...document.querySelectorAll(".callout")];
  const layers = [strapPins, foamPins, solePins];
  lines.innerHTML = `
    <g class="guides">${HOLES.map(() => '<path class="guide"/>').join("")}</g>
    <g class="leads">${layers
      .map(
        (_, i) => `
      <g><path class="lead"/><circle class="node" r="6"/><circle class="core" r="2.2"/></g>`,
      )
      .join("")}</g>`;
  const guidePaths = [...lines.querySelectorAll(".guide")];
  const leadGroups = [...lines.querySelectorAll(".leads > g")];

  // state
  const studio = $("studio"),
    stage = $("stage"),
    scaler = $("scaler");
  const GAP = 130;
  let gap = reduce ? 1 : 0,
    gapTarget = 1;
  let rx = 58,
    rz = 33,
    mx = 0,
    my = 0;
  let scale = 1,
    small = false;

  function layout() {
    const r = stage.getBoundingClientRect();
    small = innerWidth <= 820;
    const sx = (small ? r.width * 0.95 : r.width * 0.48) / 520;
    const sy = r.height / 640;
    scale = Math.max(0.42, Math.min(1.08, sx, sy));
  }
  addEventListener("resize", layout);
  layout();

  function setExploded(on) {
    gapTarget = on ? 1 : 0;
    studio.classList.toggle("assembled", !on);
    $("toggle").setAttribute("aria-pressed", on);
    $("toggleLabel").textContent = on ? "Assemble" : "Explode";
    $("viewMode").textContent = on ? "Exploded" : "Assembled";
    if (reduce) gap = gapTarget;
  }
  $("toggle").addEventListener("click", () => setExploded(gapTarget === 0));
  stage.addEventListener("click", () => setExploded(gapTarget === 0));

  if (!reduce) {
    addEventListener("pointermove", (e) => {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
    });
  }

  const lerp = (a, b, t) => a + (b - a) * t;
  const hostRect = () => studio.querySelector(".main").getBoundingClientRect();
  const center = (el, o) => {
    const b = el.getBoundingClientRect();
    return [b.left + b.width / 2 - o.left, b.top + b.height / 2 - o.top];
  };

  // the scroll script drives HERO.p (0 = exploded on load, 1 = assembled and scrolled away)
  const HERO = (window.HERO = { p: 0, visible: true });
  const start = performance.now();
  let last = start;
  function frame(now) {
    if (!HERO.visible) {
      last = now;
      requestAnimationFrame(frame);
      return;
    }
    const t = (now - start) / 1000;
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    const k = (r) => 1 - Math.exp(-dt * r); // frame-rate independent easing
    // intro: hold assembled for a beat, then come apart
    const introDone = reduce || t > 0.9;
    gap = lerp(
      gap,
      introDone ? gapTarget * (1 - HERO.p) : 0,
      reduce ? 1 : k(3.2),
    );
    if (introDone && !studio.classList.contains("ready") && gap > 0.8)
      studio.classList.add("ready");

    rx = lerp(rx, 58 - my * 8, k(3));
    rz = lerp(rz, 33 + mx * 14 + HERO.p * 40, k(3));
    const bob = reduce ? 0 : Math.sin(t * 1.1) * 6;
    scaler.style.transform = `translateY(${(-8 + bob * 0.4 - HERO.p * 40).toFixed(2)}px) scale(${(scale * (1 - HERO.p * 0.18)).toFixed(3)})`;
    if (!small) {
      const fade = Math.max(0, 1 - HERO.p * 2.2).toFixed(3);
      lines.style.opacity = fade;
      $("callouts").style.opacity = fade;
    }
    $("rig").style.transform =
      `rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;

    const g = gap * GAP;
    const f = (i) => (reduce ? 0 : Math.sin(t * 1.1 + i * 0.9) * 5 * gap);
    $("lSole").style.transform = `translateZ(${(-g + f(2)).toFixed(2)}px)`;
    $("lFoam").style.transform = `translateZ(${(13 + f(1)).toFixed(2)}px)`;
    $("lStrap").style.transform = `translateZ(${(30 + g + f(0)).toFixed(2)}px)`;
    $("lShadow").style.transform =
      `translateZ(${(-g - 26).toFixed(2)}px) scale(${(1 + gap * 0.08).toFixed(3)})`;
    $("lShadow").style.opacity = (0.24 - gap * 0.1).toFixed(3);

    // project pins into the overlay
    const o = hostRect();
    HOLES.forEach(([name], i) => {
      const pts = layers.map((L) => center(L[name], o));
      guidePaths[i].setAttribute(
        "d",
        "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L"),
      );
      guidePaths[i].style.opacity = Math.min(1, gap * 1.4).toFixed(2);
    });

    const W2 = o.width;
    const gut =
      parseFloat(
        getComputedStyle(document.querySelector(".nav")).paddingLeft,
      ) || 32;
    const labelX = small ? 0 : Math.min(W2 - 250 - gut, W2 * 0.74);
    const slots = [0.26, 0.5, 0.74].map((p) => o.height * p);
    layers.forEach((L, i) => {
      const [ax, ay] = center(L.call, o);
      const grp = leadGroups[i];
      grp.querySelector(".node").setAttribute("cx", ax.toFixed(1));
      grp.querySelector(".node").setAttribute("cy", ay.toFixed(1));
      grp.querySelector(".core").setAttribute("cx", ax.toFixed(1));
      grp.querySelector(".core").setAttribute("cy", ay.toFixed(1));
      if (small) {
        callouts[i].style.transform = "";
        return;
      }
      const ly = slots[i];
      const elbowX = labelX - 46;
      grp
        .querySelector(".lead")
        .setAttribute(
          "d",
          `M${ax.toFixed(1)} ${ay.toFixed(1)} L${elbowX.toFixed(1)} ${ly.toFixed(1)} L${(labelX - 14).toFixed(1)} ${ly.toFixed(1)}`,
        );
      callouts[i].style.transform =
        `translate(${labelX.toFixed(1)}px, ${(ly - 22).toFixed(1)}px)`;
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
