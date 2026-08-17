import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { MoodTag, PostureTag } from '@shared/renderTags'

interface CoreTanaOrb3DProps {
  mood: MoodTag | null
  posture: PostureTag | null
  speaking: boolean
}

const MOOD_PALETTE: Record<MoodTag, { core: number; mid: number; edge: number }> = {
  calm: { core: 0xeaf6ff, mid: 0x5fc4ff, edge: 0x1c5fa8 },
  amused: { core: 0xeafcff, mid: 0x6fe0ff, edge: 0x1c7fa8 },
  urgent: { core: 0xfff3e6, mid: 0xffb15f, edge: 0xa85f1c },
  strain: { core: 0xdff0ff, mid: 0x8fd4ff, edge: 0x2a5f9c }
}

function fibonacciSphere(count: number, jitter: number): [number, number, number][] {
  const pts: [number, number, number][] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const radiusAtY = Math.sqrt(1 - y * y)
    const theta = golden * i
    const x = Math.cos(theta) * radiusAtY
    const z = Math.sin(theta) * radiusAtY
    const r = 1 + (Math.random() - 0.5) * jitter
    pts.push([x * r, y * r, z * r])
  }
  return pts
}

/**
 * CoreTana's idle form: a sphere built from thousands of individually
 * flickering points instead of a flat CSS gradient. Idle = slow gentle
 * twinkle; speaking = fast chaotic per-point flicker, since the OS TTS
 * voice doesn't expose real waveform data to react to.
 */
export function CoreTanaOrb3D({ mood, posture, speaking }: CoreTanaOrb3DProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const uniformsRef = useRef<{
    uTime: { value: number }
    uFlicker: { value: number }
    uColorCore: { value: THREE.Color }
    uColorMid: { value: THREE.Color }
    uColorEdge: { value: THREE.Color }
  } | null>(null)
  const pointsRef = useRef<THREE.Points | null>(null)
  const targetFlickerRef = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 400
    const height = container.clientHeight || 400

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100)
    camera.position.set(0, 0, 3.4)

    const SHELL_COUNT = 5000
    const HALO_COUNT = 1400
    const CORE_COUNT = 900

    const positions: number[] = []
    const seeds: number[] = []
    const sizes: number[] = []
    const layerAttr: number[] = []

    for (const [x, y, z] of fibonacciSphere(SHELL_COUNT, 0.06)) {
      positions.push(x * 0.62, y * 0.62, z * 0.62)
      seeds.push(Math.random())
      sizes.push(2.2 + Math.random() * 1.6)
      layerAttr.push(1)
    }
    for (const [x, y, z] of fibonacciSphere(HALO_COUNT, 0.5)) {
      const r = 0.78 + Math.random() * 0.28
      positions.push(x * r, y * r, z * r)
      seeds.push(Math.random())
      sizes.push(1.2 + Math.random() * 1.6)
      layerAttr.push(2)
    }
    for (let i = 0; i < CORE_COUNT; i++) {
      const r = Math.random() * 0.42
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi))
      seeds.push(Math.random())
      sizes.push(1.6 + Math.random() * 2.2)
      layerAttr.push(0)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1))
    geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1))
    geometry.setAttribute('aLayer', new THREE.Float32BufferAttribute(layerAttr, 1))

    const palette = MOOD_PALETTE[mood ?? 'calm']
    const uniforms = {
      uTime: { value: 0 },
      uFlicker: { value: 0 },
      uColorCore: { value: new THREE.Color(palette.core) },
      uColorMid: { value: new THREE.Color(palette.mid) },
      uColorEdge: { value: new THREE.Color(palette.edge) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    }
    uniformsRef.current = uniforms

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aSeed;
        attribute float aSize;
        attribute float aLayer;
        uniform float uTime;
        uniform float uFlicker;
        uniform float uPixelRatio;
        varying float vBrightness;
        varying float vLayer;

        float hash(float n) { return fract(sin(n) * 43758.5453123); }

        void main() {
          vLayer = aLayer;
          vec3 pos = position;

          float driftSpeed = 0.5 + aSeed * 0.6;
          float drift = sin(uTime * driftSpeed + aSeed * 40.0) * 0.02;
          pos += normalize(position) * drift;

          float ang = uTime * 0.18;
          float ca = cos(ang), sa = sin(ang);
          pos = vec3(pos.x * ca - pos.z * sa, pos.y, pos.x * sa + pos.z * ca);

          float idleFlicker = 0.65 + 0.35 * sin(uTime * (1.2 + aSeed * 1.8) + aSeed * 30.0);
          float fastFlicker = hash(floor(uTime * (14.0 + aSeed * 30.0)) + aSeed * 97.0);
          float brightness = mix(idleFlicker, fastFlicker, uFlicker);
          vBrightness = brightness;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          float sizeBoost = mix(1.0, 1.0 + fastFlicker * 0.9, uFlicker);
          gl_PointSize = aSize * sizeBoost * uPixelRatio * (6.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorCore;
        uniform vec3 uColorMid;
        uniform vec3 uColorEdge;
        varying float vBrightness;
        varying float vLayer;

        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv) * 2.0;
          float alpha = smoothstep(1.0, 0.0, d);
          alpha = pow(alpha, 1.6);

          vec3 color = vLayer < 0.5
            ? uColorCore
            : (vLayer < 1.5 ? uColorMid : uColorEdge);

          gl_FragColor = vec4(color, alpha * vBrightness);
        }
      `
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)
    pointsRef.current = points

    let raf = 0
    const clock = new THREE.Clock()
    function animate(): void {
      const t = clock.getElapsedTime()
      uniforms.uTime.value = t
      // ease current flicker toward target so speaking on/off isn't a hard cut
      uniforms.uFlicker.value += (targetFlickerRef.current - uniforms.uFlicker.value) * 0.08
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    function handleResize(): void {
      if (!container) return
      const w = container.clientWidth || width
      const h = container.clientHeight || height
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', handleResize)
      container.removeChild(renderer.domElement)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    targetFlickerRef.current = speaking ? 1 : 0
  }, [speaking])

  useEffect(() => {
    if (!uniformsRef.current) return
    const palette = MOOD_PALETTE[mood ?? 'calm']
    uniformsRef.current.uColorCore.value.set(palette.core)
    uniformsRef.current.uColorMid.value.set(palette.mid)
    uniformsRef.current.uColorEdge.value.set(palette.edge)
  }, [mood])

  useEffect(() => {
    if (!pointsRef.current) return
    let scale = 1.0
    if (posture === 'lean-in') scale = 1.08
    else if (posture === 'pull-back') scale = 0.9
    pointsRef.current.scale.setScalar(scale)
  }, [posture])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
