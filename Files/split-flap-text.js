/**
 * SplitFlapText - Faithful Vanilla Engine of React Bits <SplitFlapText />
 * Source: https://reactbits.dev/text-animations/split-flap-text
 */

const CHARSETS = {
  alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  numeric: '0123456789'
};

const toCssUnit = value => (typeof value === 'number' ? `${value}px` : value);

const resolveCharset = charset => {
  if (CHARSETS[charset]) return CHARSETS[charset];
  return typeof charset === 'string' && charset.length > 0 ? charset : CHARSETS.alphanumeric;
};

const normalizePhrase = (phrase, width) => {
  const safe = String(phrase ?? '');
  return safe.padEnd(width, ' ').slice(0, width);
};

const sampleChar = charset => charset.charAt(Math.floor(Math.random() * charset.length)) || ' ';

const buildSequence = (target, flips, charset) => {
  const steps = [];
  for (let i = 0; i < flips; i += 1) {
    steps.push(sampleChar(charset));
  }
  steps.push(target);
  return steps;
};

export function initSplitFlapText(target, userOptions = {}) {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) return null;

  const defaultText = container.getAttribute('data-split-flap') || container.textContent.trim() || 'FEATURED PROJECTS';
  
  const defaults = {
    text: defaultText,
    words: null,
    flipDuration: 0.12,
    stagger: 0.045,
    cycleDelay: 2400,
    charset: 'alphanumeric',
    flipsPerChar: 7,
    tileColor: 'auto',
    textColor: 'auto',
    tileRadius: '0.16em',
    gap: '0.12em',
    fontSize: 'inherit',
    loop: false,
    padTo: 0,
    animateOn: 'inViewHover',
    className: ''
  };

  const s = { ...defaults, ...userOptions };

  const sourceWords = Array.isArray(s.words) && s.words.length > 0 ? s.words : (s.text ? [s.text] : [defaultText]);
  const phrases = sourceWords.map(w => String(w ?? ''));
  const width = Math.max(1, Math.ceil(Number(s.padTo) || 0), phrases.reduce((m, p) => Math.max(m, p.length), 1));
  const normalizedPhrases = phrases.map(p => normalizePhrase(p, width));

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // Root container setup
  container.classList.add('split-flap-root');
  container.setAttribute('role', 'text');
  container.setAttribute('aria-label', phrases[0] || '');

  // Apply CSS custom properties
  if (s.tileColor && s.tileColor !== 'auto') container.style.setProperty('--split-flap-tile-color', s.tileColor);
  if (s.textColor && s.textColor !== 'auto') container.style.setProperty('--split-flap-text-color', s.textColor);
  if (s.tileRadius) container.style.setProperty('--split-flap-radius', toCssUnit(s.tileRadius));
  if (s.gap) container.style.setProperty('--split-flap-gap', toCssUnit(s.gap));
  if (s.fontSize && s.fontSize !== 'inherit') container.style.setProperty('--split-flap-font-size', toCssUnit(s.fontSize));
  container.style.setProperty('--split-flap-flip-duration', `${Math.max(0.04, Number(s.flipDuration) || 0.12)}s`);

  let tiles = [];
  let currentText = normalizedPhrases[0] || '';
  let rafId = null;
  let cycleTimer = null;
  let phraseIndex = 0;
  let hasInViewAnimated = false;
  let isAnimating = false;

  // Build tile DOM nodes grouped by word for responsive wrapping
  function buildDOM() {
    container.innerHTML = '';

    // Screen reader accessible copy
    const srOnly = document.createElement('span');
    srOnly.className = 'split-flap-sr-only';
    srOnly.textContent = phrases[0] || '';
    container.appendChild(srOnly);

    const board = document.createElement('div');
    board.className = `split-flap-text ${s.className}`.trim();
    board.setAttribute('aria-hidden', 'true');

    tiles = [];
    const chars = currentText.split('');

    let currentWordSpan = document.createElement('span');
    currentWordSpan.className = 'split-flap-word';
    board.appendChild(currentWordSpan);

    chars.forEach((char, index) => {
      if (char === ' ') {
        // Space between words creates word boundary for wrapping
        currentWordSpan = document.createElement('span');
        currentWordSpan.className = 'split-flap-word';
        
        const spaceGap = document.createElement('span');
        spaceGap.className = 'split-flap-space';
        spaceGap.innerHTML = '&nbsp;';
        board.appendChild(spaceGap);
        board.appendChild(currentWordSpan);
        
        tiles.push({
          element: null,
          topChar: null,
          bottomChar: null,
          isSpace: true,
          current: ' ',
          next: ' ',
          flipping: false,
          tick: 0
        });
        return;
      }

      const tileEl = document.createElement('span');
      tileEl.className = 'split-flap-text__tile';

      const halfTop = document.createElement('span');
      halfTop.className = 'split-flap-text__half split-flap-text__half--top';
      const topChar = document.createElement('span');
      topChar.className = 'split-flap-text__char';
      topChar.textContent = char;
      halfTop.appendChild(topChar);

      const halfBottom = document.createElement('span');
      halfBottom.className = 'split-flap-text__half split-flap-text__half--bottom';
      const bottomChar = document.createElement('span');
      bottomChar.className = 'split-flap-text__char';
      bottomChar.textContent = char;
      halfBottom.appendChild(bottomChar);

      tileEl.appendChild(halfTop);
      tileEl.appendChild(halfBottom);
      currentWordSpan.appendChild(tileEl);

      tiles.push({
        element: tileEl,
        topChar,
        bottomChar,
        isSpace: false,
        current: char,
        next: char,
        flipping: false,
        tick: 0
      });
    });

    container.appendChild(board);
  }

  function renderTileUpdate(index, current, next, flipping) {
    const tile = tiles[index];
    if (!tile || tile.isSpace || !tile.element) return;

    tile.current = current;
    tile.next = next;
    tile.flipping = flipping;

    tile.topChar.textContent = current === ' ' ? '\u00A0' : current;
    tile.bottomChar.textContent = flipping ? (next === ' ' ? '\u00A0' : next) : (current === ' ' ? '\u00A0' : current);

    // Remove existing flaps
    const oldFlaps = tile.element.querySelectorAll('.split-flap-text__flap');
    oldFlaps.forEach(f => f.remove());

    if (flipping) {
      tile.tick += 1;

      const flapFront = document.createElement('span');
      flapFront.className = 'split-flap-text__flap split-flap-text__flap--front';
      const frontChar = document.createElement('span');
      frontChar.className = 'split-flap-text__char';
      frontChar.textContent = current === ' ' ? '\u00A0' : current;
      flapFront.appendChild(frontChar);

      const flapBack = document.createElement('span');
      flapBack.className = 'split-flap-text__flap split-flap-text__flap--back';
      const backChar = document.createElement('span');
      backChar.className = 'split-flap-text__char';
      backChar.textContent = next === ' ' ? '\u00A0' : next;
      flapBack.appendChild(backChar);

      tile.element.appendChild(flapFront);
      tile.element.appendChild(flapBack);
    }
  }

  const safeFlipMs = Math.max(40, (Number(s.flipDuration) || 0.12) * 1000);
  const safeStaggerMs = Math.max(0, (Number(s.stagger) || 0.045) * 1000);
  const safeFlips = Math.max(1, Math.floor(Number(s.flipsPerChar) || 7));
  const activeCharset = resolveCharset(s.charset);

  function animateTo(targetPhrase) {
    if (prefersReducedMotion) {
      currentText = targetPhrase;
      targetPhrase.split('').forEach((char, i) => {
        renderTileUpdate(i, char, char, false);
      });
      return 0;
    }

    isAnimating = true;
    const fromPhrase = normalizePhrase(currentText, width);
    const targetChars = targetPhrase.split('');

    const plans = targetChars
      .map((targetChar, index) => {
        const fromChar = fromPhrase[index] || ' ';
        if (fromChar === targetChar) return null;

        return {
          index,
          from: fromChar,
          target: targetChar,
          sequence: buildSequence(targetChar, safeFlips, activeCharset),
          start: index * safeStaggerMs,
          step: -1,
          done: false
        };
      })
      .filter(Boolean);

    if (!plans.length) {
      currentText = targetPhrase;
      isAnimating = false;
      return 0;
    }

    const totalDuration = plans.reduce(
      (max, plan) => Math.max(max, plan.start + plan.sequence.length * safeFlipMs),
      0
    );
    const startedAt = performance.now();

    function tick(now) {
      const elapsed = now - startedAt;
      let shouldContinue = false;

      plans.forEach(plan => {
        const localElapsed = elapsed - plan.start;

        if (localElapsed < 0) {
          shouldContinue = true;
          return;
        }

        const step = Math.floor(localElapsed / safeFlipMs);

        if (step < plan.sequence.length) {
          shouldContinue = true;

          if (step !== plan.step) {
            plan.step = step;
            const cur = step === 0 ? plan.from : plan.sequence[step - 1];
            const nxt = plan.sequence[step];
            renderTileUpdate(plan.index, cur, nxt, true);
          }
        } else if (!plan.done) {
          plan.done = true;
          renderTileUpdate(plan.index, plan.target, plan.target, false);
        }
      });

      if (shouldContinue) {
        rafId = requestAnimationFrame(tick);
      } else {
        currentText = targetPhrase;
        isAnimating = false;
        rafId = null;
      }
    }

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
    return totalDuration;
  }

  function triggerFlip(target = phrases[0]) {
    if (isAnimating) return;
    // Animate from random intermediate back to target phrase for a fresh flip
    const randomStart = target
      .split('')
      .map(c => (c === ' ' ? ' ' : sampleChar(activeCharset)))
      .join('');
    currentText = randomStart;
    target.split('').forEach((_, i) => {
      const startChar = randomStart[i] || ' ';
      renderTileUpdate(i, startChar, startChar, false);
    });
    animateTo(target);
  }

  // Initial build
  buildDOM();

  // Scroll Entrance Observer
  if (s.animateOn === 'inView' || s.animateOn === 'inViewHover') {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !hasInViewAnimated) {
              hasInViewAnimated = true;
              setTimeout(() => {
                triggerFlip(phrases[0]);
              }, 120);
            }
          });
        },
        { threshold: 0.15 }
      );
      observer.observe(container);
    } else {
      setTimeout(() => triggerFlip(phrases[0]), 300);
    }
  }

  // Hover Flip Trigger
  if (s.animateOn === 'hover' || s.animateOn === 'inViewHover') {
    container.addEventListener('mouseenter', () => {
      triggerFlip(phrases[0]);
    });
  }

  // Loop cycle if multiple words
  if (phrases.length > 1 && s.loop) {
    const scheduleNext = delay => {
      cycleTimer = setTimeout(() => {
        phraseIndex = (phraseIndex + 1) % phrases.length;
        const dur = animateTo(phrases[phraseIndex]);
        scheduleNext(s.cycleDelay + dur);
      }, delay);
    };
    scheduleNext(s.cycleDelay);
  }

  return {
    flip: triggerFlip,
    animateTo,
    destroy() {
      if (rafId) cancelAnimationFrame(rafId);
      if (cycleTimer) clearTimeout(cycleTimer);
    }
  };
}

/**
 * Automatically initializes all elements with class '.split-flap-target'
 */
export function initAllSplitFlap(selector = '.split-flap-target', options = {}) {
  const elements = document.querySelectorAll(selector);
  const instances = [];
  elements.forEach(el => {
    const text = el.getAttribute('data-split-flap') || el.textContent.trim();
    if (text) {
      instances.push(initSplitFlapText(el, { text, ...options }));
    }
  });
  return instances;
}

if (typeof window !== 'undefined') {
  window.initSplitFlapText = initSplitFlapText;
  window.initAllSplitFlap = initAllSplitFlap;
}
