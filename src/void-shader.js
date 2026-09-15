const vertexSource = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentSource = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_pulse;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.52;
    mat2 turn = mat2(0.86, -0.50, 0.50, 0.86);
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = turn * p * 2.03 + 8.17;
      amplitude *= 0.49;
    }
    return value;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = uv - 0.5;
    p.x *= u_resolution.x / u_resolution.y;

    float vignette = 1.0 - smoothstep(0.36, 1.02, length(p));
    float mirrorX = abs(p.x);
    float breathing = sin(u_time * 0.72) * 0.028 + (u_pulse - 0.5) * 0.018;

    vec2 q = vec2(mirrorX * 2.35, (p.y + breathing) * 7.2);
    float broadA = fbm(q * 0.43 + vec2(0.0, u_time * 0.025));
    float broadB = fbm(q * 0.54 + vec2(u_time * 0.019, 7.3));
    vec2 warp = vec2(broadA - 0.5, broadB - 0.5);
    q += warp * vec2(1.05, 1.5);
    q += vec2(sin(q.y * 0.34 + u_time * 0.08) * 0.16, sin(q.x * 0.7 - u_time * 0.04) * 0.12);

    float fieldA = fbm(q + vec2(-u_time * 0.032, u_time * 0.018));
    float fieldB = fbm(q * 1.72 + vec2(u_time * 0.046, -u_time * 0.035));
    float field = fieldA * 0.68 + fieldB * 0.32;

    float threads = abs(sin((field * 1.85 + q.y * 0.092) * 24.0));
    float crest = smoothstep(0.78, 0.985, threads);
    crest *= 0.52 + fieldB * 0.78;

    float radius = length(vec2(mirrorX * 0.82, p.y * 2.1));
    float basin = smoothstep(0.075 + breathing, 0.57, radius);
    float ringShape = sin(radius * 39.0 + fieldA * 7.0 - u_time * 0.38);
    float rings = smoothstep(0.73, 0.98, ringShape) * smoothstep(0.02, 0.43, radius) * (1.0 - smoothstep(0.34, 0.68, radius));

    float edgeBands = smoothstep(0.08, 0.50, abs(p.y));
    float depth = smoothstep(0.23, 0.82, field);
    float asymmetricGrain = noise(vec2(p.x * 18.0 + u_time * 0.02, p.y * 25.0));

    vec3 abyss = vec3(0.012, 0.008, 0.080);
    vec3 indigo = vec3(0.065, 0.045, 0.245);
    vec3 violet = vec3(0.285, 0.245, 0.545);
    vec3 lavender = vec3(0.635, 0.585, 0.835);

    vec3 color = mix(abyss, indigo, depth * 0.9 + edgeBands * 0.14);
    color = mix(color, violet, crest * (0.34 + edgeBands * 0.44));
    color = mix(color, lavender, crest * crest * (0.22 + edgeBands * 0.42));
    color += lavender * rings * (0.11 + u_pulse * 0.06);
    color *= mix(0.24, 1.0, basin);
    color *= 0.64 + edgeBands * 0.40;
    color += (asymmetricGrain - 0.5) * 0.012;
    color *= vignette * 0.78 + 0.22;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Void shader compilation failed: ${message}`);
  }
  return shader;
}

function createProgram(gl) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Void shader link failed: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

export function mountVoidShader(canvas) {
  if (!canvas) return;
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: 'high-performance',
  });
  if (!gl) {
    canvas.hidden = true;
    return;
  }

  let program;
  try {
    program = createProgram(gl);
  } catch (error) {
    console.error(error);
    canvas.hidden = true;
    return;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const position = gl.getAttribLocation(program, 'a_position');
  const resolution = gl.getUniformLocation(program, 'u_resolution');
  const time = gl.getUniformLocation(program, 'u_time');
  const pulse = gl.getUniformLocation(program, 'u_pulse');
  const startedAt = performance.now();
  let frame = 0;
  let width = 0;
  let height = 0;

  gl.useProgram(program);
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  function resize() {
    const density = Math.min(window.devicePixelRatio || 1, 1.25) * 0.78;
    const nextWidth = Math.max(1, Math.floor(innerWidth * density));
    const nextHeight = Math.max(1, Math.floor(innerHeight * density));
    if (nextWidth === width && nextHeight === height) return;
    width = canvas.width = nextWidth;
    height = canvas.height = nextHeight;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(resolution, width, height);
  }

  function draw(now) {
    if (!canvas.isConnected) {
      cancelAnimationFrame(frame);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      return;
    }
    resize();
    const seconds = (now - startedAt) / 1000;
    gl.uniform1f(time, seconds);
    gl.uniform1f(pulse, 0.5 + Math.sin(seconds * 1.36) * 0.5);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    frame = requestAnimationFrame(draw);
  }

  frame = requestAnimationFrame(draw);
}
