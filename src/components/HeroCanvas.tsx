import React, { useEffect, useRef } from 'react';

const VERTEX_SHADER = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {  
  vUv = aPos * 0.5 + 0.5;  
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const SPLAT_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uSrc;
uniform vec2 uSize;
uniform vec2 uPoint;
uniform vec3 uValue;
uniform float uRadius;
out vec4 fragColor;
void main() {  
  vec2 d = (vUv - uPoint) * uSize;  
  float falloff = exp(-dot(d, d) / (uRadius * uRadius));  
  fragColor = vec4(texture(uSrc, vUv).xyz + uValue * falloff, 1.0);
}`;

const ADVECTION_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uVel;
uniform sampler2D uSrc;
uniform vec2 uSize;
uniform float uDt;
uniform float uDecay;
out vec4 fragColor;
void main() {  
  vec2 v = texture(uVel, vUv).xy;  
  vec2 from = vUv - uDt * v / uSize;  
  fragColor = texture(uSrc, from) / (1.0 + uDecay * uDt);
}`;

const RENDER_SHADER = `#version 300 es
precision highp float;
in vec2 vUv;
uniform vec2 uSize;
uniform float uDpr;
uniform vec2 uOrigin;
uniform vec2 uPitch;
uniform vec2 uSlat;
uniform float uRound;
uniform float uTime;
uniform float uIntro;
uniform float uShade;
uniform sampler2D uDye;
uniform sampler2D uVel;
uniform vec3 uColor;
uniform vec3 uGlint;
uniform vec3 uBg;
out vec4 fragColor;

float pill(vec2 p, vec2 b, float r) {  
  vec2 q = abs(p) - b + r;  
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {  
  vec2 p = vec2(gl_FragCoord.x, uSize.y * uDpr - gl_FragCoord.y) / uDpr;  
  vec2 cell = floor((p - uOrigin) / uPitch);  
  vec2 centre = uOrigin + cell * uPitch + uSlat * 0.5;  
  vec2 local = p - centre;  
  vec2 uv = centre / uSize;  
  vec2 simUv = vec2(uv.x, 1.0 - uv.y);  
  float energy = min(texture(uDye, simUv).x, 1.3);  
  vec2 flow = texture(uVel, simUv).xy;  
  vec2 w = (centre - vec2(flow.x, -flow.y) * 0.03) / 150.0;  
  float swell = 0.5 * sin(w.x * 1.1 + w.y * 0.7 + uTime * 0.9)              
              + 0.3 * sin(w.x * 0.6 - w.y * 1.3 - uTime * 0.7)              
              + 0.2 * sin(w.y * 2.1 + w.x * 0.4 + uTime * 1.3);  
  float level = clamp(0.5 + 0.5 * swell, 0.0, 1.0);  
  float front = uIntro * 1.35;  
  float reveal = 1.0 - smoothstep(front - 0.3, front, uv.y);  
  float span = clamp(mix(0.32, 1.0, level) + energy * 0.35, 0.08, 1.0) * mix(0.1, 1.0, reveal);  
  vec2 extent = vec2(uSlat.x * 0.5, uSlat.y * 0.5 * span);  
  float cover = clamp(0.5 - pill(local, extent, uRound * min(extent.x, extent.y)) * uDpr, 0.0, 1.0);  
  float centreDist = length((uv - 0.5) * vec2(uSize.x / uSize.y, 1.0));  
  float shade = mix(1.0 - uShade, 1.0, smoothstep(0.12, 0.8, centreDist));  
  float light = mix(0.1, 0.46, pow(level, 1.6)) * shade;  
  light = clamp(light + energy * 0.7, 0.0, 1.0) * reveal;  
  float glint = clamp(energy * 0.8 + pow(level, 7.0) * 0.2, 0.0, 1.0);  
  vec3 slat = mix(uColor, uGlint, glint) * light * cover;  
  fragColor = vec4(slat + uBg * (1.0 - cover * light), 1.0);
}`;

const parseColor = (color: string): [number, number, number] => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [1, 1, 1];
  ctx.fillStyle = '#000';
  ctx.fillStyle = color;
  const num = parseInt(ctx.fillStyle.slice(1), 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
};

interface HeroCanvasProps {
  color?: string;
  glintColor?: string;
  backgroundColor?: string;
  slatWidth?: number;
  slatHeight?: number;
  gap?: number;
  roundness?: number;
  speed?: number;
  centerShade?: number;
  brushSize?: number;
  interactive?: boolean;
  className?: string;
}

export const HeroCanvas: React.FC<HeroCanvasProps> = ({
  color = '#ffd04f',
  glintColor = '#fff4cf',
  backgroundColor = '#0b0b0c',
  slatWidth = 9,
  slatHeight = 26,
  gap = 4,
  roundness = 0.8,
  speed = 0.7,
  centerShade = 0.6,
  brushSize = 22,
  interactive = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'display:block;width:100%;height:100%;position:absolute;inset:0;';

    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
    if (!gl) return;
    container.appendChild(canvas);

    const createShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
      }
      return s;
    };

    const createProgram = (fragSrc: string) => {
      const p = gl.createProgram()!;
      gl.attachShader(p, createShader(gl.VERTEX_SHADER, VERTEX_SHADER));
      gl.attachShader(p, createShader(gl.FRAGMENT_SHADER, fragSrc));
      gl.bindAttribLocation(p, 0, 'aPos');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(p));
      }
      return p;
    };

    const renderProg = createProgram(RENDER_SHADER);
    const splatProg = createProgram(SPLAT_SHADER);
    const advectProg = createProgram(ADVECTION_SHADER);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const getLoc = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);

    const hasFloat = Boolean(
      gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')
    );

    const dummyTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, dummyTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));

    const createFBO = (w: number, h: number) => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { texture: tex, fbo };
    };

    const createDoubleFBO = (w: number, h: number) => {
      const obj = {
        read: createFBO(w, h),
        write: createFBO(w, h),
        swap: () => {
          const tmp = obj.read;
          obj.read = obj.write;
          obj.write = tmp;
        },
      };
      return obj;
    };

    const destroyDoubleFBO = (obj: ReturnType<typeof createDoubleFBO>) => {
      for (const f of [obj.read, obj.write]) {
        gl.deleteTexture(f.texture);
        gl.deleteFramebuffer(f.fbo);
      }
    };

    interface SimState {
      w: number;
      h: number;
      vel: ReturnType<typeof createDoubleFBO>;
      dye: ReturnType<typeof createDoubleFBO>;
    }

    let sim: SimState | null = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const splats: Array<{ u: number; v: number; vx: number; vy: number; dye: number; radius: number }> = [];

    const palette = {
      color: parseColor(color),
      glint: parseColor(glintColor),
      bg: parseColor(backgroundColor),
    };

    let width = 1;
    let height = 1;
    let animId = 0;
    let isIntersecting = true;
    let simTime = 0;
    let introProgress = reducedMotion ? 1 : 0;
    let lastTime = performance.now();
    let splatTimeout = 0;
    let currentDpr = 1;
    let origin = { ox: 0, oy: 0 };

    const SIM_RES = 96;
    const VEL_DECAY = 1.6;
    const DYE_DECAY = 1.1;

    const initSim = () => {
      if (!hasFloat) return;
      const sh = SIM_RES;
      const sw = Math.max(16, Math.round((SIM_RES * width) / height));
      if (!sim || sim.w !== sw || sim.h !== sh) {
        if (sim) {
          destroyDoubleFBO(sim.vel);
          destroyDoubleFBO(sim.dye);
        }
        sim = {
          w: sw,
          h: sh,
          vel: createDoubleFBO(sw, sh),
          dye: createDoubleFBO(sw, sh),
        };
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
          sim = null;
        }
      }
    };

    const resize = () => {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      currentDpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4e6 / (width * height)));
      canvas.width = Math.round(width * currentDpr);
      canvas.height = Math.round(height * currentDpr);

      const cellW = slatWidth + gap;
      const cellH = slatHeight + gap;
      const cols = Math.ceil((width + gap) / cellW);
      const rows = Math.ceil((height + gap) / cellH);
      origin = {
        ox: (width - (cols * cellW - gap)) / 2,
        oy: (height - (rows * cellH - gap)) / 2,
      };

      initSim();
      wake();
    };

    const bindTexture = (unit: number, tex: WebGLTexture | null, prog: WebGLProgram, name: string) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(getLoc(prog, name), unit);
    };

    const stepSimulation = (dt: number) => {
      if (!sim) return;
      gl.viewport(0, 0, sim.w, sim.h);
      gl.useProgram(splatProg);
      gl.uniform2f(getLoc(splatProg, 'uSize'), width, height);

      for (const sp of splats) {
        gl.uniform2f(getLoc(splatProg, 'uPoint'), sp.u, sp.v);
        gl.uniform1f(getLoc(splatProg, 'uRadius'), sp.radius);

        gl.bindFramebuffer(gl.FRAMEBUFFER, sim.vel.write.fbo);
        bindTexture(0, sim.vel.read.texture, splatProg, 'uSrc');
        gl.uniform3f(getLoc(splatProg, 'uValue'), sp.vx, sp.vy, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        sim.vel.swap();

        gl.bindFramebuffer(gl.FRAMEBUFFER, sim.dye.write.fbo);
        bindTexture(0, sim.dye.read.texture, splatProg, 'uSrc');
        gl.uniform3f(getLoc(splatProg, 'uValue'), sp.dye, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        sim.dye.swap();
      }
      splats.length = 0;

      gl.useProgram(advectProg);
      gl.uniform2f(getLoc(advectProg, 'uSize'), width, height);
      gl.uniform1f(getLoc(advectProg, 'uDt'), dt);

      gl.bindFramebuffer(gl.FRAMEBUFFER, sim.vel.write.fbo);
      bindTexture(0, sim.vel.read.texture, advectProg, 'uVel');
      bindTexture(1, sim.vel.read.texture, advectProg, 'uSrc');
      gl.uniform1f(getLoc(advectProg, 'uDecay'), VEL_DECAY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      sim.vel.swap();

      gl.bindFramebuffer(gl.FRAMEBUFFER, sim.dye.write.fbo);
      bindTexture(0, sim.vel.read.texture, advectProg, 'uVel');
      bindTexture(1, sim.dye.read.texture, advectProg, 'uSrc');
      gl.uniform1f(getLoc(advectProg, 'uDecay'), DYE_DECAY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      sim.dye.swap();
    };

    const tick = (now: number) => {
      animId = 0;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (!reducedMotion) simTime += dt * speed;
      if (introProgress < 1) {
        introProgress = Math.min(1, introProgress + dt / 1.5);
      }

      const easeIntro =
        introProgress < 0.5
          ? 4 * introProgress ** 3
          : 1 - (-2 * introProgress + 2) ** 3 / 2;

      const hasActivity = sim !== null && (splats.length > 0 || now < splatTimeout);
      if (hasActivity) {
        stepSimulation(Math.max(dt, 1 / 240));
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(renderProg);

      gl.uniform2f(getLoc(renderProg, 'uSize'), width, height);
      gl.uniform1f(getLoc(renderProg, 'uDpr'), currentDpr);
      gl.uniform2f(getLoc(renderProg, 'uOrigin'), origin.ox, origin.oy);
      gl.uniform2f(getLoc(renderProg, 'uPitch'), slatWidth + gap, slatHeight + gap);
      gl.uniform2f(getLoc(renderProg, 'uSlat'), slatWidth, slatHeight);
      gl.uniform1f(getLoc(renderProg, 'uRound'), roundness);
      gl.uniform1f(getLoc(renderProg, 'uShade'), centerShade);
      gl.uniform3fv(getLoc(renderProg, 'uColor'), palette.color);
      gl.uniform3fv(getLoc(renderProg, 'uGlint'), palette.glint);
      gl.uniform3fv(getLoc(renderProg, 'uBg'), palette.bg);
      gl.uniform1f(getLoc(renderProg, 'uTime'), simTime);
      gl.uniform1f(getLoc(renderProg, 'uIntro'), easeIntro);

      bindTexture(0, sim ? sim.dye.read.texture : dummyTex, renderProg, 'uDye');
      bindTexture(1, sim ? sim.vel.read.texture : dummyTex, renderProg, 'uVel');

      gl.drawArrays(gl.TRIANGLES, 0, 3);

      const needsAnim = !reducedMotion && speed > 0;
      if (isIntersecting && !document.hidden && (needsAnim || introProgress < 1 || hasActivity)) {
        animId = requestAnimationFrame(tick);
      }
    };

    function wake() {
      if (!animId && isIntersecting) {
        lastTime = performance.now();
        animId = requestAnimationFrame(tick);
      }
    }

    const addSplat = (x: number, y: number, vx: number, vy: number, dye: number, radius: number) => {
      splats.push({
        u: x / width,
        v: 1 - y / height,
        vx,
        vy: -vy,
        dye,
        radius,
      });
      while (splats.length > 48) splats.shift();
      splatTimeout = performance.now() + 4500;
      wake();
    };

    const getLocalPos = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      return { x, y, inside: x >= 0 && y >= 0 && x <= rect.width && y <= rect.height };
    };

    let lastPtr: { x: number; y: number; t: number } | null = null;

    const onPointerMove = (e: PointerEvent) => {
      const { x, y, inside } = getLocalPos(e);
      if (!inside) {
        lastPtr = null;
        return;
      }
      const now = performance.now();
      if (lastPtr) {
        const dx = x - lastPtr.x;
        const dy = y - lastPtr.y;
        const dist = Math.hypot(dx, dy);
        if (dist >= 0.5) {
          const dt = Math.max(0.008, (now - lastPtr.t) / 1000);
          const vel = Math.min(1800, dist / dt);
          const scale = (vel / dist) * 0.45;
          const dyeStrength = 0.08 + 0.5 * Math.min(1, vel / 900);
          const steps = Math.min(10, Math.max(1, Math.ceil(dist / (brushSize * 0.6))));
          for (let step = 1; step <= steps; step++) {
            const frac = step / steps;
            addSplat(
              lastPtr.x + dx * frac,
              lastPtr.y + dy * frac,
              dx * scale,
              dy * scale,
              dyeStrength / Math.sqrt(steps),
              brushSize
            );
          }
        }
      }
      lastPtr = { x, y, t: now };
    };

    const onPointerDown = (e: PointerEvent) => {
      const { x, y, inside } = getLocalPos(e);
      if (inside) {
        for (let i = 0; i < 8; i++) {
          const rad = (i / 8) * Math.PI * 2;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          addSplat(
            x + cos * brushSize * 0.8,
            y + sin * brushSize * 0.8,
            cos * 700,
            sin * 700,
            0.5,
            brushSize
          );
        }
      }
    };

    const onBlur = () => {
      lastPtr = null;
    };

    if (interactive && !reducedMotion) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerdown', onPointerDown, { passive: true });
      window.addEventListener('blur', onBlur);
    }

    const onVisibilityChange = () => !document.hidden && wake();
    document.addEventListener('visibilitychange', onVisibilityChange);

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const io = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      wake();
    });
    io.observe(container);

    resize();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };
  }, [
    color,
    glintColor,
    backgroundColor,
    slatWidth,
    slatHeight,
    gap,
    roundness,
    speed,
    centerShade,
    brushSize,
    interactive,
  ]);

  return <div ref={containerRef} className={className} style={{ backgroundColor }} />;
};
