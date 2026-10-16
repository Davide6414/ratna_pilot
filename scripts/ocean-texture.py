"""
Generates the seamless water texture shown behind the grid cells.

    python3 scripts/ocean-texture.py  # writes src/components/LogoGrid/ocean.webp

Caustics (the light network on a shallow sea floor) are the soft edges of a
periodic Voronoi diagram, gently warped so the lines meander. Everything is
periodic on the unit square, so the image tiles without seams. Fixed seeds:
the output is reproducible. Requires numpy and Pillow.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

SIZE = 768  # px, one tile
OUT = Path(__file__).resolve().parent.parent / "src/components/LogoGrid/ocean.webp"

# Deep water, mid water, light (sRGB 0–1). Calm, slightly teal blues.
DEEP = np.array([0x0B, 0x34, 0x4F]) / 255
MID = np.array([0x16, 0x5B, 0x7E]) / 255
LIGHT = np.array([0x9F, 0xD8, 0xE8]) / 255


def periodic_noise(u, v, rng, terms=6, max_freq=3):
    """Smooth noise that tiles: a sum of sinusoids with integer frequencies."""
    out = np.zeros_like(u)
    for _ in range(terms):
        kx, ky = rng.integers(-max_freq, max_freq + 1, size=2)
        if kx == 0 and ky == 0:
            kx = 1
        phase = rng.uniform(0, 2 * np.pi)
        out += np.sin(2 * np.pi * (kx * u + ky * v) + phase) / np.hypot(kx, ky)
    return out / terms


def spaced_sites(rng, count, min_dist):
    """Random points on the torus, never closer than min_dist (no light fans)."""
    sites = []
    while len(sites) < count:
        candidate = rng.random(2)
        delta = np.abs(np.array(sites) - candidate) if sites else np.empty((0, 2))
        delta = np.minimum(delta, 1 - delta)  # wrap-around distance
        if not sites or np.hypot(delta[:, 0], delta[:, 1]).min() >= min_dist:
            sites.append(candidate)
    return np.array(sites)


def caustics(u, v, points, width):
    """Bright where the two nearest (wrapped) Voronoi sites are equidistant."""
    offsets = np.array([(dx, dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1)])
    sites = (points[:, None, :] + offsets[None, :, :]).reshape(-1, 2)
    out = np.empty_like(u)
    for r0 in range(0, u.shape[0], 48):  # row chunks keep memory small
        du = u[r0 : r0 + 48, :, None] - sites[None, None, :, 0]
        dv = v[r0 : r0 + 48, :, None] - sites[None, None, :, 1]
        dist = np.sort(np.hypot(du, dv), axis=-1)[..., :2]
        edge = dist[..., 1] - dist[..., 0]
        out[r0 : r0 + 48] = np.exp(-((edge / width) ** 1.5))
    return out


def main():
    rng = np.random.default_rng(7)
    v, u = np.mgrid[0:SIZE, 0:SIZE] / SIZE

    # Meandering lines: warp the lookup coordinates with smooth periodic noise,
    # a broad swell plus a finer ripple.
    wu = u + 0.07 * periodic_noise(u, v, rng, terms=8, max_freq=2)
    wu += 0.025 * periodic_noise(u, v, rng, terms=8, max_freq=5)
    wv = v + 0.07 * periodic_noise(u, v, rng, terms=8, max_freq=2)
    wv += 0.025 * periodic_noise(u, v, rng, terms=8, max_freq=5)

    # The same network twice, slightly offset, like light refracted at two depths.
    sites = spaced_sites(rng, 18, min_dist=0.16)
    near = caustics(wu % 1, wv % 1, sites, width=0.012)
    far = caustics((wu + 0.013) % 1, (wv + 0.021) % 1, sites, width=0.03)
    light = np.clip(0.8 * near + 0.35 * far, 0, 1) ** 1.2
    # Sunlight is uneven: some patches glow, others fade.
    light *= 0.55 + 0.45 * (0.5 + 0.5 * periodic_noise(u, v, rng, terms=5, max_freq=2))

    # Large, slow variations of depth so the surface is not flat.
    depth = 0.5 + 0.5 * periodic_noise(u, v, rng, terms=4, max_freq=2)
    base = DEEP + (MID - DEEP) * depth[..., None] * 0.45
    # Low contrast on purpose: the water is a backdrop, not a picture.
    rgb = base + (LIGHT - base) * (light[..., None] * 0.22)

    tile = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8))
    # Blur on a 3 × 3 mosaic and keep the centre, so the blur wraps around too.
    mosaic = Image.new("RGB", (SIZE * 3, SIZE * 3))
    for i in range(3):
        for j in range(3):
            mosaic.paste(tile, (i * SIZE, j * SIZE))
    mosaic = mosaic.filter(ImageFilter.GaussianBlur(1.2))
    tile = mosaic.crop((SIZE, SIZE, 2 * SIZE, 2 * SIZE))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    tile.save(OUT, "WEBP", quality=82, method=6)
    print(f"{OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
