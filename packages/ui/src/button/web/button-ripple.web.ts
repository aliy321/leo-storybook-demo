/**
 * Material-style ripple adapted from v2's RippleJS (samthor/rippleJS).
 * Scoped to a single button so it works inside Stencil shadow DOM.
 */

const rippleTypeAttr = 'data-ripple-event';

type RipplePoint = {
  clientX: number;
  clientY: number;
  offsetX?: number;
  offsetY?: number;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function startRipple(
  target: HTMLElement,
  holder: HTMLElement,
  type: string,
  at: RipplePoint,
) {
  if ('disabled' in target && (target as HTMLButtonElement).disabled) {
    return false;
  }

  const prev = holder.getAttribute(rippleTypeAttr);
  if (prev && prev !== type) {
    return false;
  }
  holder.setAttribute(rippleTypeAttr, type);

  const rect = target.getBoundingClientRect();
  let x: number;
  let y: number;

  if (at.offsetX !== undefined) {
    x = at.offsetX;
    y = at.offsetY ?? 0;
  } else {
    x = at.clientX - rect.left;
    y = at.clientY - rect.top;
  }

  const max =
    rect.width === rect.height
      ? rect.width * 1.412
      : Math.sqrt(rect.width * rect.width + rect.height * rect.height);
  const dim = `${max * 2}px`;

  const ripple = document.createElement('div');
  ripple.className = 'ripple';
  ripple.style.width = dim;
  ripple.style.height = dim;
  ripple.style.marginLeft = `${-max + x}px`;
  ripple.style.marginTop = `${-max + y}px`;

  holder.appendChild(ripple);
  window.requestAnimationFrame(() => {
    ripple.classList.add('held');
  });

  const releaseEvent = type === 'mousedown' ? 'mouseup' : 'touchend';
  const release = () => {
    document.removeEventListener(releaseEvent, release);
    ripple.classList.add('done');

    window.setTimeout(() => {
      ripple.remove();
      if (!holder.children.length) {
        holder.removeAttribute(rippleTypeAttr);
      }
    }, 250);
  };

  document.addEventListener(releaseEvent, release);
  return true;
}

export function attachButtonRipple(
  target: HTMLElement,
  holder: HTMLElement,
): () => void {
  if (prefersReducedMotion()) {
    return () => undefined;
  }

  const onMouseDown = (event: MouseEvent) => {
    if (event.button === 0) {
      startRipple(target, holder, 'mousedown', event);
    }
  };

  const onTouchStart = (event: TouchEvent) => {
    for (let i = 0; i < event.changedTouches.length; i += 1) {
      startRipple(target, holder, 'touchstart', event.changedTouches[i]);
    }
  };

  target.addEventListener('mousedown', onMouseDown, { passive: true });
  target.addEventListener('touchstart', onTouchStart, { passive: true });

  return () => {
    target.removeEventListener('mousedown', onMouseDown);
    target.removeEventListener('touchstart', onTouchStart);
  };
}
