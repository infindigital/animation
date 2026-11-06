(() => {
  document.querySelector(".yr").textContent = new Date().getFullYear();

  /* ---------- hero: the pair, colour switching ---------- */
  const COLORS = {
    sand: { name: "Sand", tint: "#EFE3D2", sole: "#C79B6D", accent: "#9C6E42" },
    stone: {
      name: "Stone",
      tint: "#E4E5E3",
      sole: "#8E9194",
      accent: "#5D6064",
    },
    midnight: {
      name: "Midnight",
      tint: "#DCE0E9",
      sole: "#232B3E",
      accent: "#33405F",
    },
  };
  const ORDER = Object.keys(COLORS);
  ORDER.forEach((k) => {
    const i = new Image();
    i.src = `assets/cut-${k}.webp`;
  });
  const hero = document.querySelector(".hero"),
    pair = hero.querySelector(".pair"),
    pairImg = pair.querySelector("img");
  if (!window.gsap || !document.documentElement.classList.contains("js"))
    return;
  gsap.registerPlugin(ScrollTrigger);

  /* smooth scrolling */
  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) =>
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        e.preventDefault();
        lenis.scrollTo(id.length > 1 ? id : 0, { duration: 1.4 });
      }),
    );
  }

  const feet = [pairImg],
    wordSpan = hero.querySelector(".word span");
  const REST = [{ rotation: -4 }];
  gsap.set(pairImg, REST[0]);
  const btns = [...hero.querySelectorAll(".sw-btn")];
  let current = "sand",
    cycle;

  function paint(key) {
    const c = COLORS[key];
    ["tint", "sole", "accent"].forEach((k) =>
      hero.style.setProperty("--" + k, c[k]),
    );
    pairImg.src = `assets/cut-${key}.webp`;
    wordSpan.textContent = c.name;
    hero.querySelector(".tag-name").textContent = c.name;
    pairImg.alt = "A pair of H WALK slippers in " + c.name;
  }
  function mark(key) {
    btns.forEach((b) => {
      const on = b.dataset.color === key;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on);
    });
    hero.querySelector(".idx-n").textContent = "0" + (ORDER.indexOf(key) + 1);
  }
  function show(key) {
    if (key === current) return;
    current = key;
    mark(key);
    gsap
      .timeline()
      .to(feet, {
        y: -70,
        opacity: 0,
        rotation: -16,
        scale: 0.92,
        duration: 0.42,
        ease: "power3.in",
      })
      .to(wordSpan, { yPercent: -110, duration: 0.42, ease: "power3.in" }, 0)
      .to(".tag", { x: -14, opacity: 0, duration: 0.3, ease: "power2.in" }, 0)
      .to(".ring", { rotation: "+=70", duration: 1.5, ease: "power3.inOut" }, 0)
      .add(() => paint(key))
      .fromTo(
        wordSpan,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9, ease: "power4.out" },
      )
      .fromTo(
        feet,
        { y: 110, opacity: 0, rotation: 10, scale: 0.92 },
        {
          y: 0,
          opacity: 1,
          rotation: REST[0].rotation,
          scale: 1,
          duration: 1,
          ease: "back.out(1.5)",
        },
        "<",
      )
      .to(
        ".tag",
        { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "<.3",
      );
    autoplay();
  }
  function autoplay() {
    cycle && cycle.kill();
    gsap.set(".sw-btn .bar", { scaleX: 0 });
    const bar = btns[ORDER.indexOf(current)].querySelector(".bar");
    cycle = gsap.to(bar, {
      scaleX: 1,
      duration: 4.5,
      ease: "none",
      onComplete: () =>
        show(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]),
    });
  }
  btns.forEach((b) => b.addEventListener("click", () => show(b.dataset.color)));
  paint("sand");

  // the pair leans toward the cursor
  const stage = hero.querySelector(".hero-stage");
  stage.addEventListener("mousemove", (e) => {
    const r = stage.getBoundingClientRect(),
      x = (e.clientX - r.left) / r.width - 0.5,
      y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(pair, {
      rotationY: x * 22,
      rotationX: -y * 16,
      duration: 0.9,
      ease: "power3.out",
    });
    gsap.to(".word", { x: -x * 40, duration: 1.2, ease: "power3.out" });
    gsap.to(".disc", {
      x: x * 14,
      y: y * 14,
      duration: 1.2,
      ease: "power3.out",
    });
  });
  stage.addEventListener("mouseleave", () => {
    gsap.to(pair, {
      rotationY: 0,
      rotationX: 0,
      duration: 1.2,
      ease: "elastic.out(1,.5)",
    });
    gsap.to(".word, .disc", { x: 0, y: 0, duration: 1.2, ease: "power3.out" });
  });

  gsap.to(".ring", {
    rotation: "+=360",
    duration: 60,
    ease: "none",
    repeat: -1,
  });
  gsap.to(pair, {
    y: -12,
    duration: 2.6,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
  gsap.to(".floor", {
    scaleX: 0.88,
    opacity: 0.7,
    duration: 2.6,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });

  /* opening */
  gsap.set(".hero", { visibility: "visible" });
  gsap
    .timeline({ defaults: { ease: "power4.out" } })
    .from(".top-line", { scaleX: 0, duration: 1.4, ease: "power3.inOut" }, 0)
    .from(
      ".top > a, .top nav a",
      { y: -14, opacity: 0, duration: 0.8, stagger: 0.06 },
      0.2,
    )
    .from(
      hero,
      {
        clipPath: "inset(8% 6% 8% 6% round 40px)",
        opacity: 0,
        duration: 1.4,
        ease: "expo.out",
      },
      0.1,
    )
    .from(".kicker", { opacity: 0, x: -20, duration: 0.8 }, 0.5)
    .from(
      "h1 .ln > span",
      { yPercent: 105, duration: 1.2, stagger: 0.12 },
      0.55,
    )
    .from(
      ".hero .intro, .cta, .counts",
      { opacity: 0, y: 22, duration: 0.9, stagger: 0.1 },
      1,
    )
    .from(".disc", { scale: 0, duration: 1.4, ease: "expo.out" }, 0.6)
    .from(
      ".ring",
      { scale: 0.7, opacity: 0, duration: 1.6, ease: "expo.out" },
      0.7,
    )
    .from(wordSpan, { yPercent: 110, duration: 1.1 }, 0.8)
    .fromTo(
      feet,
      { y: 220, opacity: 0, rotation: 18 },
      {
        y: 0,
        opacity: 1,
        rotation: REST[0].rotation,
        duration: 1.4,
        ease: "back.out(1.3)",
      },
      0.8,
    )
    .from(".floor", { scaleX: 0, opacity: 0, duration: 1 }, 1.1)
    .from(
      ".tag",
      { x: -30, opacity: 0, duration: 0.8, ease: "back.out(2)" },
      1.5,
    )
    .from(
      ".hero-side .ar, .sw-btn, .hero-side .idx",
      {
        x: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "transform",
      },
      1.1,
    )
    .add(() => {
      hero.querySelectorAll(".count").forEach((c) => {
        const o = { v: 0 },
          dec = +c.dataset.dec || 0;
        gsap.to(o, {
          v: +c.dataset.to,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => (c.textContent = o.v.toFixed(dec)),
        });
      });
      gsap.set(hero, { clearProps: "clipPath" });
      autoplay();
    }, 1.6);

  // pause the colour cycle while the hero is off screen
  ScrollTrigger.create({
    trigger: hero,
    start: "top top",
    end: "bottom top",
    onLeave: () => cycle && cycle.pause(),
    onEnterBack: () => cycle && cycle.resume(),
  });
  gsap.to(".hero-stage", {
    yPercent: 10,
    ease: "none",
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  /* the hanging pouch: drops onto its hook, then sways; scrolling and the cursor push it */
  const swing = document.querySelector(".swing"),
    pouchFloor = document.querySelector(".pouch-floor");
  if (swing) {
    const sway = gsap
      .timeline({
        paused: true,
        repeat: -1,
        yoyo: true,
        defaults: { duration: 2.2, ease: "sine.inOut" },
      })
      .fromTo(swing, { rotation: -3.5 }, { rotation: 3.5 })
      .fromTo(pouchFloor, { x: -10, scaleX: 0.94 }, { x: 10, scaleX: 0.94 }, 0);
    const push = (deg) => {
      sway.pause();
      gsap
        .timeline()
        .to(swing, { rotation: deg, duration: 0.35, ease: "power2.out" })
        .to(pouchFloor, { x: deg * 3, duration: 0.35, ease: "power2.out" }, 0)
        .to(swing, {
          rotation: -3.5,
          duration: 2.4,
          ease: "elastic.out(1,.18)",
        })
        .to(
          pouchFloor,
          { x: -10, duration: 2.4, ease: "elastic.out(1,.18)" },
          "<",
        )
        .add(() => sway.restart());
    };
    gsap
      .timeline({
        scrollTrigger: { trigger: ".pouch-hang", start: "top 85%" },
        onComplete: () => sway.play(),
      })
      .from(".pouch-hang .hook", {
        scale: 0,
        duration: 0.5,
        ease: "back.out(3)",
      })
      .fromTo(
        swing,
        { y: -60, opacity: 0, rotation: 28 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        0.2,
      )
      .to(
        swing,
        { rotation: -3.5, duration: 2.6, ease: "elastic.out(1,.22)" },
        0.2,
      )
      .from(pouchFloor, { opacity: 0, scaleX: 0.4, duration: 1.2 }, 0.5)
      .from(".pouch-hang figcaption", { opacity: 0, y: 10, duration: 0.6 }, 1);
    let cool = 0;
    ScrollTrigger.create({
      trigger: ".pouch-hang",
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const v = self.getVelocity(),
          now = Date.now();
        if (Math.abs(v) > 600 && now - cool > 900 && sway.isActive()) {
          cool = now;
          push(gsap.utils.clamp(-16, 16, -v / 120));
        }
      },
    });
    swing.addEventListener("mouseenter", (e) => {
      const r = swing.getBoundingClientRect();
      if (sway.isActive() || sway.paused())
        push(e.clientX < r.left + r.width / 2 ? 12 : -12);
    });
  }

  /* slogan strip drifts with the scroll */
  const strip = {
    trigger: ".strip",
    start: "top bottom",
    end: "bottom top",
    scrub: true,
  };
  gsap.fromTo(
    ".strip .row-a",
    { xPercent: 0 },
    { xPercent: -28, ease: "none", scrollTrigger: strip },
  );
  gsap.fromTo(
    ".strip .row-b",
    { xPercent: -30 },
    { xPercent: -4, ease: "none", scrollTrigger: strip },
  );

  /* rules draw in, headings rise word by word */
  document.querySelectorAll(".sec").forEach((s) => {
    const l = document.createElement("div");
    l.className = "line";
    s.prepend(l);
    gsap.from(l, {
      scaleX: 0,
      duration: 1.4,
      ease: "power3.inOut",
      scrollTrigger: { trigger: s, start: "top 88%" },
    });
  });
  document.querySelectorAll(".sec-head").forEach((head) => {
    const h = head.querySelector("h2");
    h.innerHTML = h.textContent
      .trim()
      .split(" ")
      .map((w) => `<span class="w"><span>${w}</span></span>`)
      .join(" ");
    gsap
      .timeline({ scrollTrigger: { trigger: head, start: "top 85%" } })
      .from(h.querySelectorAll(".w > span"), {
        yPercent: 110,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.07,
      })
      .from(
        head.querySelector(".ar"),
        { opacity: 0, x: -20, duration: 0.9, ease: "power3.out" },
        0.3,
      );
  });

  gsap.from(".slipper-copy p", {
    opacity: 0,
    y: 24,
    duration: 0.9,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".slipper", start: "top 82%" },
  });
  gsap.from(".perk", {
    opacity: 0,
    y: 24,
    duration: 0.8,
    stagger: 0.08,
    ease: "power3.out",
    scrollTrigger: { trigger: ".perks", start: "top 88%" },
  });
  gsap.from(".find", {
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: { trigger: ".find", start: "top 95%" },
  });
  gsap.from(".specs > div", {
    opacity: 0,
    x: 30,
    duration: 0.8,
    stagger: 0.07,
    ease: "power3.out",
    scrollTrigger: { trigger: ".specs", start: "top 85%" },
  });

  /* pairs drop onto the rail and swing to rest */
  const hangs = gsap.utils.toArray(".pairs .hang");
  gsap
    .timeline({ scrollTrigger: { trigger: ".pairs", start: "top 80%" } })
    .from(".rail", { scaleX: 0, duration: 1, ease: "power3.inOut" })
    .from(
      hangs,
      {
        y: -70,
        opacity: 0,
        rotation: (i) => [-18, 14, -12, 16][i],
        duration: 2.4,
        ease: "elastic.out(1,.28)",
        stagger: 0.12,
      },
      0.5,
    )
    .from(
      ".pairs figcaption",
      { opacity: 0, y: 10, duration: 0.6, stagger: 0.08 },
      1,
    );
  hangs.forEach((h) =>
    h.addEventListener("mouseenter", (e) => {
      const r = h.getBoundingClientRect(),
        dir = e.clientX < r.left + r.width / 2 ? -1 : 1;
      gsap.fromTo(
        h,
        { rotation: dir * 7 },
        {
          rotation: 0,
          duration: 1.8,
          ease: "elastic.out(1,.22)",
          overwrite: true,
        },
      );
    }),
  );

  /* fold, zip, carry */
  const words = gsap.utils.toArray(".band .bw"),
    steps = gsap.utils.toArray(".band li");
  const fold = gsap.timeline({ defaults: { ease: "power2.inOut" } });
  fold
    .set([words, steps], { opacity: 0.25 })
    .to([words[0], steps[0]], { opacity: 1, duration: 0.3 }, 0)
    .to(".half.top", { rotationX: -180, duration: 1.1 }, 0.3)
    .to(".pair3d", { y: -18, duration: 0.55, ease: "power2.out" }, 0.3)
    .to(".pair3d", { y: 0, duration: 0.55, ease: "power2.in" }, 0.85)
    .to([words[0], steps[0]], { opacity: 0.25, duration: 0.2 }, 1.45)
    .to([words[1], steps[1]], { opacity: 1, duration: 0.2 }, 1.45)
    .to(
      ".pair3d",
      {
        scale: 0.45,
        yPercent: 32,
        opacity: 0,
        duration: 0.7,
        ease: "power3.in",
      },
      1.5,
    )
    .fromTo(
      ".pouch",
      { opacity: 0, scale: 0.7, yPercent: 18 },
      {
        opacity: 1,
        scale: 1,
        yPercent: 0,
        duration: 0.7,
        ease: "back.out(1.7)",
      },
      1.95,
    )
    .to([words[1], steps[1]], { opacity: 0.25, duration: 0.2 }, 2.8)
    .to([words[2], steps[2]], { opacity: 1, duration: 0.2 }, 2.8)
    .to(
      ".pouch",
      { xPercent: 10, yPercent: -8, rotation: -6, duration: 0.6 },
      2.8,
    )
    .to(
      ".pouch",
      { xPercent: -4, yPercent: 0, rotation: 3, duration: 0.6 },
      3.4,
    )
    .to(".pouch", { xPercent: 0, rotation: 0, duration: 0.4 }, 4);

  ScrollTrigger.matchMedia({
    "(min-width: 901px)": () => {
      ScrollTrigger.create({
        animation: fold,
        trigger: ".band",
        start: "top top",
        end: "+=240%",
        pin: true,
        scrub: 1,
      });
    },
    "(max-width: 900px)": () => {
      ScrollTrigger.create({
        animation: fold,
        trigger: ".stage",
        start: "top 75%",
      });
    },
  });

  /* header: blur once scrolled, tuck away going down, return going up */
  const head = document.querySelector(".site-head");
  let lastY = 0;
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      head.classList.toggle("scrolled", y > 40);
      const hide = y > 400 && y > lastY;
      gsap.to(head, {
        yPercent: hide ? -100 : 0,
        duration: 0.45,
        ease: "power3.out",
        overwrite: true,
      });
      lastY = y;
    },
  });

  /* on the walk */
  gsap.utils.toArray(".story .ph").forEach((ph, i) => {
    gsap.fromTo(
      ph,
      { clipPath: "inset(100% 0 0 0)" },
      {
        clipPath: "inset(0% 0 0 0)",
        duration: 1.5,
        ease: "expo.inOut",
        delay: i * 0.15,
        scrollTrigger: { trigger: ph, start: "top 85%" },
      },
    );
    gsap.from(ph.querySelector("img"), {
      scale: 1.25,
      duration: 2.2,
      ease: "expo.out",
      delay: i * 0.15 + 0.3,
      scrollTrigger: { trigger: ph, start: "top 85%" },
    });
    gsap.to(ph.querySelector("img"), {
      yPercent: 8,
      ease: "none",
      scrollTrigger: {
        trigger: ph,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
  ScrollTrigger.matchMedia({
    "(min-width: 901px)": () => {
      gsap.to(".story .s2", {
        yPercent: -18,
        ease: "none",
        scrollTrigger: {
          trigger: ".story",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
  });
  gsap.from(".story-text > *", {
    opacity: 0,
    y: 30,
    duration: 1,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".story-text", start: "top 80%" },
  });
  gsap.from(".story figcaption", {
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    scrollTrigger: { trigger: ".story", start: "top 60%" },
  });

  /* full-bleed ledge photo */
  gsap.fromTo(
    ".wide img",
    { scale: 1.22 },
    {
      scale: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".wide",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    },
  );
  gsap
    .timeline({ scrollTrigger: { trigger: ".wide", start: "top 60%" } })
    .from(".wide .wl > *", {
      yPercent: 110,
      duration: 1.2,
      ease: "power4.out",
      stagger: 0.12,
    })
    .from(
      ".wide p",
      { opacity: 0, y: 20, duration: 0.9, stagger: 0.1, ease: "power3.out" },
      0.4,
    );

  /* stores and contact */
  gsap.from("#where tbody tr", {
    opacity: 0,
    y: 18,
    duration: 0.7,
    stagger: 0.06,
    ease: "power3.out",
    scrollTrigger: { trigger: "#where table", start: "top 85%" },
  });
  gsap.from(".online", {
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: "power3.out",
    scrollTrigger: { trigger: ".online", start: "top 92%" },
  });
  gsap.from(".numbers > *", {
    opacity: 0,
    yPercent: 60,
    duration: 0.9,
    stagger: 0.08,
    ease: "power4.out",
    scrollTrigger: { trigger: ".numbers", start: "top 85%" },
  });

  /* big logo rises out of the footer */
  gsap.from(".giant img", {
    yPercent: 70,
    ease: "none",
    scrollTrigger: {
      trigger: ".giant",
      start: "top bottom",
      end: "bottom bottom",
      scrub: true,
    },
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
