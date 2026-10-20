import React, { useEffect, useRef } from 'react';

const VERTEX_SHADER = `#version 300 es
in vec2 aPos;
void main() { 
  gl_Position = vec4(aPos, 0.0, 1.0); 
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uDeep;
uniform vec3 uCrest;
uniform float uAmp;
uniform float uLayers;
uniform float uGlow;
out vec4 fragColor;

float hash(vec2 p) {  
  vec3 q = fract(vec3(p.xyx) * 0.1031);  
  q += dot(q, q.yzx + 33.33);  
  return fract((q.x + q.y) * q.z);
}

void main() {  
  vec2 uv = gl_FragCoord.xy / uRes;  
  float aspect = uRes.x / uRes.y;  
  float x = (uv.x - 0.5) * aspect;  
  float t = uTime;  
  vec3 col = vec3(0.0);  
  for (int i = 0; i < 10; i++) {    
    if (float(i) >= uLayers) break;    
    float f = float(i) / max(uLayers - 1.0, 1.0);    
    float px = x + (uMouse.x - 0.5) * 0.25 * (0.4 + f);    
    float y = 0.08 + f * 0.2      
      + uAmp * (0.55 + f * 0.6) * sin(px * (1.7 + f * 1.1) + t * (0.32 + f * 0.18) + f * 6.0)      
      + uAmp * 0.35 * sin(px * 4.3 - t * 0.47 + f * 2.7)      
      + uAmp * 0.12 * sin(px * 9.0 + t * 0.8 + f * 5.0);    
    float d = uv.y - y;    
    float fill = smoothstep(0.0, -0.32, d) * step(d, 0.0);    
    float crest = exp(-abs(d) * 85.0);    
    float halo = exp(-max(d, 0.0) * 14.0) * step(0.0, d);    
    vec3 tone = mix(uDeep, uCrest, f * 0.8 + 0.2);    
    col += tone * (fill * 0.07 + crest * 0.55 + halo * 0.06) * (0.35 + f * 0.9);  
  }  
  // keep the middle of the card readable  
  float centre = 1.0 - 0.55 * smoothstep(0.55, 0.0, distance(uv, vec2(0.5, 0.55)));  
  col *= uGlow * centre;  
  col += (hash(gl_FragCoord.xy + floor(uTime * 24.0)) - 0.5) * 0.025;  
  fragColor = vec4(max(col, 0.0), 1.0);
}`;

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
    : [1, 1, 1];
};

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

interface AboutCanvasProps {
  deepColor?: string;
  crestColor?: string;
  speed?: number;
  amplitude?: number;
  layers?: number;
  glow?: number;
  parallax?: number;
  className?: string;
}

export const AboutCanvas: React.FC<AboutCanvasProps> = ({
  deepColor = '#8a5a12',
  crestColor = '#ffd76a',
  speed = 1,
  amplitude = 0.07,
  layers = 6,
  glow = 1,
  parallax = 1,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cleanupFn: (() => void) | undefined;
    let isInitialized = false;

    const setupWebGL = () => {
      if (isInitialized) return;
      isInitialized = true;

      const canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText = 'display:block;width:100%;height:100%;position:absolute;inset:0;';

      const gl = canvas.getContext('webgl2', { antialias: false });
      if (!gl) return;
      container.appendChild(canvas);

      const vert = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
      const frag = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      if (!vert || !frag) return;

      const program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vert);
      gl.attachShader(program, frag);
      gl.linkProgram(program);
      gl.useProgram(program);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW
      );

      const aPos = gl.getAttribLocation(program, 'aPos');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const getLoc = (name: string) => gl.getUniformLocation(program, name);
      const uRes = getLoc('uRes');
      const uTime = getLoc('uTime');
      const uMouse = getLoc('uMouse');

      gl.uniform3fv(getLoc('uDeep'), hexToRgb(deepColor));
      gl.uniform3fv(getLoc('uCrest'), hexToRgb(crestColor));
      gl.uniform1f(getLoc('uAmp'), amplitude);
      gl.uniform1f(getLoc('uLayers'), Math.min(10, Math.max(1, layers)));
      gl.uniform1f(getLoc('uGlow'), glow);

      const mouse = { x: 0.5, tx: 0.5 };
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const startTime = performance.now();
      let animId = 0;
      let isVisible = true;

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(1, Math.floor(container.clientWidth * dpr));
        const h = Math.max(1, Math.floor(container.clientHeight * dpr));
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
        render(performance.now());
      };

      const render = (now: number) => {
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        gl.uniform1f(uTime, prefersReducedMotion ? 4 : ((now - startTime) / 1000) * speed);
        gl.uniform2f(uMouse, mouse.x, 0.5);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };

      const loop = (now: number) => {
        render(now);
        animId = requestAnimationFrame(loop);
      };

      const start = () => {
        if (!animId && isVisible && !document.hidden && !prefersReducedMotion) {
          animId = requestAnimationFrame(loop);
        }
      };

      const stop = () => {
        cancelAnimationFrame(animId);
        animId = 0;
      };

      const onPointerMove = (e: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        mouse.tx = 0.5 + ((e.clientX - rect.left) / rect.width - 0.5) * parallax;
      };

      const onVisibilityChange = () => (document.hidden ? stop() : start());

      const ro = new ResizeObserver(resize);
      ro.observe(container);

      const io = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) start();
        else stop();
      });
      io.observe(container);

      if (parallax) window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('visibilitychange', onVisibilityChange);

      resize();
      start();

      cleanupFn = () => {
        stop();
        ro.disconnect();
        io.disconnect();
        window.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        canvas.remove();
      };
    };

    // Defer initialization until About section is near viewport
    const viewportObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setupWebGL();
          viewportObserver.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    viewportObserver.observe(container);

    return () => {
      viewportObserver.disconnect();
      cleanupFn?.();
    };
  }, [deepColor, crestColor, speed, amplitude, layers, glow, parallax]);

  return <div ref={containerRef} className={className} />;
};
