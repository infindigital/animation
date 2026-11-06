(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HERO = window.HERO || { p: 0, visible: true };
  const q = (s) => document.querySelector(s),
    qa = (s, r = document) => [...r.querySelectorAll(s)];
  const soleD = document.getElementById("sole").getAttribute("d");

  // nav goes solid once the page moves
  const nav = q(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // only run the 3D loop while the hero is on screen
  new IntersectionObserver(([e]) => {
    HERO.visible = e.isIntersecting;
  }).observe(q("#studio"));

  // manifesto words
  const man = q("#manifesto");
  man.innerHTML = man.textContent
    .trim()
    .split(/\s+/)
    .map((w) => `<span class="mw">${w}</span>`)
    .join(" ");

  // footprints along the journey track, left and right
  const track = q("#jTrack"),
    trail = q("#trail");
  function buildTrail() {
    let h = "";
    for (let x = 30, i = 0; x < track.scrollWidth - 60; x += 62, i++) {
      h += `<span class="print" style="left:${x}px;top:${i % 2 ? 4 : 30}px;transform:rotate(90deg)${i % 2 ? " scaleX(-1)" : ""}"><svg viewBox="0 0 200 480"><path d="${soleD}"/></svg></span>`;
    }
    trail.innerHTML = h;
  }
  buildTrail();

  // the crowd at the door: a loose pile of pairs, one of them yours
  const crowd = q("#crowd");
  const pairSvg = `<svg viewBox="0 0 430 500"><path fill="currentColor" d="${soleD}" transform="translate(0 10)"/><path fill="currentColor" d="${soleD}" transform="translate(430 10) scale(-1 1)"/></svg>`;
  const greys = [
    "#2E2B28",
    "#3A3631",
    "#4A453F",
    "#57514A",
    "#26303F",
    "#5E6164",
    "#3F3A35",
  ];
  const small = innerWidth < 760;
  const cols = small ? 8 : 15,
    rows = small ? 11 : 8;
  let html = "";
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = ((c + 0.5) / cols) * 100 + (Math.random() - 0.5) * (60 / cols);
      const y = ((r + 0.5) / rows) * 100 + (Math.random() - 0.5) * (60 / rows);
      html += `<span style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;color:${greys[(Math.random() * greys.length) | 0]};transform:rotate(${(Math.random() * 360) | 0}deg)">${pairSvg}</span>`;
    }
  crowd.innerHTML =
    html +
    `<span class="mine" style="left:${small ? 30 : 34}%;top:68%;color:#57514A;transform:rotate(-24deg)">${pairSvg}</span>`;
  const mine = q(".crowd .mine"),
    others = qa(".crowd span:not(.mine)");

  function staticDoor() {
    q("#dL1").style.opacity = 0;
    q("#dL2").style.opacity = 1;
    Object.assign(mine.style, {
      left: "50%",
      top: "30%",
      color: "#D7B48A",
      transform: "scale(1.8)",
    });
    others.forEach((o) => (o.style.opacity = 0.16));
  }

  if (!window.gsap || !window.ScrollTrigger || reduce) {
    staticDoor();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // smooth scrolling
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const target = id === "#anatomy" ? 0 : q(id);
    if (target === null) return;
    e.preventDefault();
    lenis
      ? lenis.scrollTo(target, { duration: 1.6 })
      : scrollTo({
          top: target ? target.getBoundingClientRect().top + scrollY : 0,
          behavior: "smooth",
        });
  });

  gsap.to(".progress", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
  });

  const mm = gsap.matchMedia();
  mm.add({ desk: "(min-width: 821px)", mob: "(max-width: 820px)" }, (ctx) => {
    const { desk } = ctx.conditions;

    // 1. hero: scrolling folds the exploded view back together
    ScrollTrigger.create({
      trigger: "#studio",
      start: "top top",
      end: desk ? "+=90%" : "bottom top",
      pin: desk,
      scrub: true,
      onUpdate: (s) => {
        HERO.p = s.progress;
      },
    });
    if (desk)
      gsap.to(".studio .foot", {
        opacity: 0,
        y: 30,
        ease: "none",
        scrollTrigger: {
          trigger: "#studio",
          start: "top top",
          end: "+=40%",
          scrub: true,
        },
      });

    // 2. manifesto: words light up as you read
    gsap.fromTo(
      ".mw",
      { opacity: 0.12 },
      {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: {
          trigger: ".manifesto",
          start: "top 70%",
          end: "bottom 70%",
          scrub: true,
        },
      },
    );

    // 3. the journey runs sideways
    const dist = () => track.scrollWidth - innerWidth;
    const hTween = gsap.to(track, {
      x: () => -dist(),
      ease: "none",
      scrollTrigger: {
        trigger: "#journey",
        start: "top top",
        end: () => "+=" + dist(),
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (s) => {
          q("#jNum").textContent = String(
            Math.min(6, Math.floor(s.progress * 6) + 1),
          ).padStart(2, "0");
        },
      },
    });
    qa(".print").forEach((p) =>
      gsap.from(p.firstChild, {
        opacity: 0,
        scale: 0.3,
        duration: 0.5,
        ease: "back.out(2)",
        scrollTrigger: {
          trigger: p,
          containerAnimation: hTween,
          start: "left 70%",
          toggleActions: "play none none reverse",
        },
      }),
    );
    qa(".j-card").forEach((card) => {
      const paths = qa("svg.ic *", card);
      paths.forEach((p) => {
        const L = p.getTotalLength ? p.getTotalLength() : 200;
        p.style.strokeDasharray = L;
        p.style.strokeDashoffset = L;
      });
      gsap
        .timeline({
          scrollTrigger: {
            trigger: card,
            containerAnimation: hTween,
            start: "left 85%",
            toggleActions: "play none none reverse",
          },
        })
        .from(card, {
          y: 60,
          rotation: 3,
          opacity: 0,
          duration: 0.8,
          ease: "expo.out",
        })
        .to(
          paths,
          {
            strokeDashoffset: 0,
            duration: 1.2,
            stagger: 0.12,
            ease: "power2.inOut",
          },
          0.1,
        );
      const img = card.querySelector("img");
      if (img)
        gsap.fromTo(
          img,
          { scale: 1.3 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              containerAnimation: hTween,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          },
        );
    });

    // 4. fold, zip, carry
    const pair = q("#fPair"),
      pouch = q("#fPouch"),
      steps = qa("#fSteps li");
    const zip = q("#zip"),
      pull = q("#pull");
    const Z = { x1: 236, y1: 364, x2: 568, y2: 662 };
    const ZL = Math.hypot(Z.x2 - Z.x1, Z.y2 - Z.y1),
      ZA = (Math.atan2(Z.y2 - Z.y1, Z.x2 - Z.x1) * 180) / Math.PI;
    zip.style.strokeDasharray = ZL;
    const zipState = { p: 0 };
    const drawZip = () => {
      zip.style.strokeDashoffset = ZL * (1 - zipState.p);
      const x = Z.x1 + (Z.x2 - Z.x1) * zipState.p,
        y = Z.y1 + (Z.y2 - Z.y1) * zipState.p;
      pull.setAttribute("transform", `translate(${x} ${y}) rotate(${ZA})`);
    };
    drawZip();
    const into = () =>
      pouch.offsetTop +
      pouch.offsetHeight * 0.64 -
      (pair.offsetTop + pair.offsetHeight * 0.75);
    gsap
      .timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: "#fold",
          start: "top top",
          end: "+=260%",
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (s) => {
            const i = s.progress < 0.4 ? 0 : s.progress < 0.74 ? 1 : 2;
            steps.forEach((li, k) => li.classList.toggle("on", k === i));
          },
        },
      })
      .fromTo(
        pair,
        { y: 40, rotation: -6 },
        { y: 0, rotation: 0, duration: 0.4 },
      )
      .to("#fTop", { rotationX: -180, duration: 1 }, 0.3)
      .fromTo(
        pouch,
        { yPercent: 70, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8 },
        1,
      )
      .to(pair, { y: into, scale: 0.52, rotation: -38, duration: 1 }, 1.4)
      .to(pair, { opacity: 0, duration: 0.3 }, 2.2)
      .to(
        zipState,
        { p: 1, duration: 0.8, ease: "none", onUpdate: drawZip },
        2.4,
      )
      .to(
        pouch,
        {
          keyframes: [
            { rotation: -9 },
            { rotation: 6 },
            { rotation: -3 },
            { rotation: 0 },
          ],
          y: -16,
          duration: 1.2,
          ease: "sine.inOut",
        },
        3.3,
      )
      .to({}, { duration: 0.3 });

    // 5. the masjid door
    const pushX = (i, el) => (parseFloat(el.style.left) - 50) * (desk ? 9 : 5);
    const pushY = (i, el) => (parseFloat(el.style.top) - 50) * 6;
    gsap
      .timeline({
        scrollTrigger: {
          trigger: "#door",
          start: "top top",
          end: "+=200%",
          pin: true,
          scrub: 0.8,
        },
      })
      .from([...others, mine], {
        y: () => -gsap.utils.random(200, 700),
        opacity: 0,
        rotation: () => gsap.utils.random(-200, 200),
        duration: 0.5,
        stagger: { amount: 0.6, from: "random" },
        ease: "power2.out",
      })
      .from("#dL1", { opacity: 0, y: 50, duration: 0.3 }, 0.3)
      .to("#dL1", { opacity: 0, y: -50, duration: 0.3 }, 1.3)
      .to(
        others,
        {
          x: pushX,
          y: pushY,
          opacity: 0.1,
          scale: 0.7,
          duration: 0.7,
          ease: "power2.inOut",
        },
        1.3,
      )
      .to(
        mine,
        {
          left: "50%",
          top: "30%",
          rotation: 0,
          scale: desk ? 2.2 : 1.7,
          color: "#D7B48A",
          duration: 0.7,
          ease: "power3.inOut",
        },
        1.3,
      )
      .fromTo(
        "#ring",
        { opacity: 0, scale: 0.4, top: "30%" },
        { opacity: 1, scale: 1, duration: 0.5 },
        1.7,
      )
      .fromTo(
        "#dL2",
        { opacity: 0, y: 40, top: "68%" },
        { opacity: 1, y: 0, duration: 0.4 },
        1.75,
      )
      .to({}, { duration: 0.4 });

    // 6. headings and copy rise in
    qa(
      ".life .label, .life .h2, .life-text, .colours .label, .colours .h2, .c-head p, .stores .label, .stores .h2, .final .label, .final .ar.big, .final .row",
    ).forEach((el) =>
      gsap.from(el, {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
      }),
    );

    // 7. photos open like curtains, then drift
    qa(".reveal .ph").forEach((ph) => {
      gsap
        .timeline({ scrollTrigger: { trigger: ph, start: "top 85%" } })
        .from(ph, {
          clipPath: "inset(100% 0% 0% 0% round 22px)",
          duration: 1.5,
          ease: "expo.inOut",
        })
        .from(
          ph.querySelector("img"),
          { scale: 1.35, duration: 1.8, ease: "expo.out" },
          0.2,
        );
    });
    qa("img[data-speed]").forEach((img) =>
      gsap.to(img, {
        yPercent: +img.dataset.speed,
        ease: "none",
        scrollTrigger: {
          trigger: img.parentNode,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }),
    );

    // 8. colour cards fly in fanned out, then settle
    gsap.from(".c-card", {
      y: 220,
      rotation: (i) => [-14, 3, 14][i],
      opacity: 0,
      stagger: 0.12,
      ease: "none",
      scrollTrigger: {
        trigger: ".c-row",
        start: "top 100%",
        end: "top 45%",
        scrub: 1,
      },
    });
    if (desk)
      qa(".c-card").forEach((card) => {
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.6 }),
          ry = gsap.quickTo(card, "rotationY", { duration: 0.6 });
        gsap.set(card, { transformPerspective: 900 });
        card.addEventListener("pointermove", (e) => {
          const b = card.getBoundingClientRect();
          ry(((e.clientX - b.left) / b.width - 0.5) * 12);
          rx(-((e.clientY - b.top) / b.height - 0.5) * 12);
        });
        card.addEventListener("pointerleave", () => {
          rx(0);
          ry(0);
        });
      });

    // 9. marquee leans with scroll speed
    const skewTo = gsap.quickTo("#mqSkew", "skewX", {
      duration: 0.5,
      ease: "power3",
    });
    let settle;
    ScrollTrigger.create({
      trigger: ".marquee",
      start: "top bottom",
      end: "bottom top",
      onUpdate: (s) => {
        skewTo(gsap.utils.clamp(-14, 14, s.getVelocity() / -260));
        clearTimeout(settle);
        settle = setTimeout(() => skewTo(0), 120);
      },
    });

    // 10. stores: rules draw in, rows follow
    qa(".city").forEach((city) =>
      gsap
        .timeline({ scrollTrigger: { trigger: city, start: "top 88%" } })
        .from(city.querySelector(".rule"), {
          scaleX: 0,
          duration: 1.2,
          ease: "expo.inOut",
        })
        .from(
          qa("h3, li", city),
          { y: 26, opacity: 0, stagger: 0.06, duration: 0.9, ease: "expo.out" },
          0.3,
        ),
    );
    gsap.from(".s-online", {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: { trigger: ".s-online", start: "top 95%" },
    });

    // 11. the closing line rises letter-block by block, the pair keeps turning
    gsap.from(".final h2 .ln > span", {
      yPercent: 110,
      duration: 1.4,
      stagger: 0.14,
      ease: "expo.out",
      scrollTrigger: { trigger: ".final h2", start: "top 85%" },
    });
    gsap.from(".spin", {
      scale: 0.4,
      opacity: 0,
      y: 120,
      ease: "none",
      scrollTrigger: {
        trigger: ".final",
        start: "top 95%",
        end: "top 35%",
        scrub: 1,
      },
    });
  });

  // pins measure layout, so refresh once images have sized themselves
  addEventListener("load", () => ScrollTrigger.refresh());
})();
