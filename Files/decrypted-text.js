/**
 * DecryptedText Animation - Faithful Vanilla Integration of React Bits <DecryptedText />
 * Source: https://reactbits.dev/text-animations/decrypted-text?speed=120
 */
export function initDecryptedText({
  target = '#decryptedDecisions',
  text = 'DECISIONS',
  speed = 120,
  maxIterations = 10,
  sequential = true,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  animateOn = 'inViewHover',
  className = 'decrypted-revealed',
  parentClassName = 'decrypted-text-wrapper',
  encryptedClassName = 'decrypted-scrambled',
  startDelay = 650
} = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return null;

  const availableChars = useOriginalCharsOnly
    ? Array.from(new Set(text.split(''))).filter(c => c !== ' ')
    : characters.split('');

  let isAnimating = false;
  let isDecrypted = true;
  let revealedIndices = new Set();
  let hasAnimated = false;
  let intervalId = null;
  let pointer = 0;
  let order = [];

  function computeOrder(len) {
    const res = [];
    if (len <= 0) return res;
    if (revealDirection === 'start') {
      for (let i = 0; i < len; i++) res.push(i);
      return res;
    }
    if (revealDirection === 'end') {
      for (let i = len - 1; i >= 0; i--) res.push(i);
      return res;
    }
    // center
    const middle = Math.floor(len / 2);
    let offset = 0;
    while (res.length < len) {
      if (offset % 2 === 0) {
        const idx = middle + offset / 2;
        if (idx >= 0 && idx < len) res.push(idx);
      } else {
        const idx = middle - Math.ceil(offset / 2);
        if (idx >= 0 && idx < len) res.push(idx);
      }
      offset++;
    }
    return res.slice(0, len);
  }

  function shuffleText(originalText, currentRevealed) {
    return originalText
      .split('')
      .map((char, i) => {
        if (char === ' ') return ' ';
        if (currentRevealed.has(i)) return originalText[i];
        return availableChars[Math.floor(Math.random() * availableChars.length)];
      })
      .join('');
  }

  function render(currentText, revealedSet, animating) {
    let html = `<span class="decrypted-sr-only">${text}</span><span aria-hidden="true" class="decrypted-chars-container">`;
    for (let i = 0; i < currentText.length; i++) {
      const isRevealedOrDone = revealedSet.has(i) || (!animating && isDecrypted);
      const cls = isRevealedOrDone ? className : encryptedClassName;
      html += `<span class="decrypted-char ${cls}">${currentText[i]}</span>`;
    }
    html += '</span>';
    el.innerHTML = html;
  }

  function triggerDecrypt() {
    if (isAnimating) return;
    isAnimating = true;
    isDecrypted = false;
    revealedIndices = new Set();
    order = sequential ? computeOrder(text.length) : [];
    pointer = 0;
    let currentIteration = 0;

    if (intervalId) clearInterval(intervalId);

    intervalId = setInterval(() => {
      if (sequential) {
        if (revealedIndices.size < text.length) {
          let nextIndex;
          if (revealDirection === 'start') {
            nextIndex = revealedIndices.size;
          } else if (revealDirection === 'end') {
            nextIndex = text.length - 1 - revealedIndices.size;
          } else {
            nextIndex = order[pointer++];
          }
          revealedIndices.add(nextIndex);
          const shuffled = shuffleText(text, revealedIndices);
          render(shuffled, revealedIndices, true);
        } else {
          clearInterval(intervalId);
          intervalId = null;
          isAnimating = false;
          isDecrypted = true;
          render(text, revealedIndices, false);
        }
      } else {
        // Non-sequential mode
        const shuffled = shuffleText(text, revealedIndices);
        render(shuffled, revealedIndices, true);
        currentIteration++;
        if (currentIteration >= maxIterations) {
          clearInterval(intervalId);
          intervalId = null;
          isAnimating = false;
          isDecrypted = true;
          render(text, new Set(), false);
        }
      }
    }, speed);
  }

  function resetToPlainText() {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
    isAnimating = false;
    isDecrypted = true;
    revealedIndices = new Set();
    render(text, revealedIndices, false);
  }

  // Hover triggers
  if (animateOn === 'hover' || animateOn === 'inViewHover') {
    el.addEventListener('mouseenter', () => {
      triggerDecrypt();
    });
  }

  // Click trigger (click to decrypt)
  el.addEventListener('click', () => {
    triggerDecrypt();
  });

  // Ensure initial clean display
  el.classList.add(parentClassName);
  render(text, new Set(), false);

  // View / Entrance trigger
  if (animateOn === 'view' || animateOn === 'inViewHover') {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
              hasAnimated = true;
              setTimeout(() => {
                triggerDecrypt();
              }, startDelay);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
    } else {
      setTimeout(triggerDecrypt, startDelay);
    }
  }

  return {
    trigger: triggerDecrypt,
    reset: resetToPlainText,
    destroy() {
      if (intervalId) clearInterval(intervalId);
    }
  };
}

if (typeof window !== 'undefined') {
  window.initDecryptedText = initDecryptedText;
}
