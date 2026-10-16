import { useEffect, type RefObject } from "react";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

/** Maximum offset of an extruded glyph's face, in glyph units (1 = 1% of a cell). */
const MAX_EXTRUDE = 6;
/** Share of the remaining distance covered each frame (simple exponential easing). */
const EASE = 0.08;

/**
 * Drives `--extrude-x/y` on `targetRef` from the mouse position, so the
 * extruded logo glyphs look like blocks standing on the grid, seen from where
 * the pointer is. Mouse only: touch screens get a slow idle animation in CSS.
 */
export function usePointerDepth(targetRef: RefObject<HTMLElement | null>, enabled: boolean) {
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");

  useEffect(() => {
    const el = targetRef.current;
    if (!el || !enabled || !finePointer) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const render = () => {
      current.x += (target.x - current.x) * EASE;
      current.y += (target.y - current.y) * EASE;
      const settled =
        Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001;
      if (settled) Object.assign(current, target);

      el.style.setProperty("--extrude-x", `${(current.x * MAX_EXTRUDE).toFixed(2)}px`);
      el.style.setProperty("--extrude-y", `${(current.y * MAX_EXTRUDE).toFixed(2)}px`);

      frame = settled ? 0 : requestAnimationFrame(render);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      target.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.y = (event.clientY / window.innerHeight) * 2 - 1;
      schedule();
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      el.style.removeProperty("--extrude-x");
      el.style.removeProperty("--extrude-y");
    };
  }, [targetRef, enabled, finePointer]);
}
