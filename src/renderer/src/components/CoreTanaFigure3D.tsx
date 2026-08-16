import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { MoodTag, PostureTag } from '@shared/renderTags'

interface CoreTanaFigure3DProps {
  mood: MoodTag | null
  posture: PostureTag | null
  speaking: boolean
}

const MOOD_GLOW: Record<MoodTag, number> = {
  calm: 0x5fc4ff,
  amused: 0x6fe0ff,
  urgent: 0xffb15f,
  strain: 0x8fd4ff
}

/**
 * CoreTana's sparring form: a real volumetric holographic figure (not a
 * flat cutout). Torso is a lathed (revolved) profile curve — the same
 * kind of precise curve control as a 2D silhouette, but as actual 3D
 * geometry — with capsule limbs and a Fresnel-rim "hologram" shader that
 * reacts to her mood/posture/speaking state.
 */
export function CoreTanaFigure3D({ mood, posture, speaking }: CoreTanaFigure3DProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const uniformsRef = useRef<{ uTime: { value: number }; uFlicker: { value: number }; uGlowColor: { value: THREE.Color } } | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 400
    const height = container.clientHeight || 560

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100)

    scene.add(new THREE.AmbientLight(0x2255aa, 1.2))
    const key = new THREE.DirectionalLight(0x66ccff, 2.0)
    key.position.set(2, 3, 4)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x99ddff, 1.5)
    rim.position.set(-2, 1, -3)
    scene.add(rim)

    const uniforms = {
      uColor: { value: new THREE.Color(0x2a72c9) },
      uGlowColor: { value: new THREE.Color(0x5fc4ff) },
      uTime: { value: 0 },
      uFlicker: { value: 1.0 }
    }
    uniformsRef.current = uniforms

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      side: THREE.DoubleSide,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uGlowColor;
        uniform float uTime;
        uniform float uFlicker;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec3 vWorldPosition;
        void main() {
          vec3 viewDir = normalize(vViewPosition);
          vec3 n = normalize(vNormal);
          float fresnel = pow(1.0 - max(dot(viewDir, n), 0.0), 2.2);
          float scan = sin(vWorldPosition.y * 36.0 - uTime * 2.6);
          scan = smoothstep(0.88, 1.0, scan * 0.5 + 0.5);
          vec3 base = mix(uColor, uGlowColor, fresnel * 0.75 + 0.15);
          base += uGlowColor * scan * 0.5;
          float alpha = clamp(0.62 + fresnel * 0.4 + scan * 0.25, 0.0, 1.0) * uFlicker;
          gl_FragColor = vec4(base, alpha);
        }
      `
    })

    const figure = new THREE.Group()
    scene.add(figure)

    // Torso: spline-smoothed lathe profile (bottom -> top, x = radius)
    const torsoKeyPoints = [
      [0.26, 0.0],
      [0.32, 0.12],
      [0.37, 0.22],
      [0.34, 0.34],
      [0.28, 0.44],
      [0.24, 0.5],
      [0.235, 0.55],
      [0.24, 0.6],
      [0.29, 0.68],
      [0.33, 0.76],
      [0.36, 0.82],
      [0.3, 0.87],
      [0.2, 0.92],
      [0.14, 0.96]
    ].map(([x, y]) => new THREE.Vector2(x, y))
    const torsoProfile = new THREE.SplineCurve(torsoKeyPoints).getPoints(80)
    const torso = new THREE.Mesh(new THREE.LatheGeometry(torsoProfile, 40), material)
    figure.add(torso)

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), material)
    head.position.y = 0.96 + 0.19
    figure.add(head)

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 0.1, 16), material)
    neck.position.y = 0.96 + 0.03
    figure.add(neck)

    function makeLeg(xSign: number): THREE.Group {
      const leg = new THREE.Group()
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.34, 4, 12), material)
      thigh.position.set(xSign * 0.15, -0.22, 0)
      leg.add(thigh)
      const calf = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.36, 4, 12), material)
      calf.position.set(xSign * 0.15, -0.62, 0)
      leg.add(calf)
      return leg
    }
    figure.add(makeLeg(-1))
    figure.add(makeLeg(1))

    function makeArm(xSign: number): THREE.Group {
      const arm = new THREE.Group()
      const armX = xSign * 0.56
      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.3, 4, 12), material)
      upper.position.set(armX, 0.7, 0)
      arm.add(upper)
      const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.062, 0.28, 4, 12), material)
      lower.position.set(armX, 0.38, 0)
      arm.add(lower)
      return arm
    }
    figure.add(makeArm(-1))
    figure.add(makeArm(1))

    groupRef.current = figure

    // Auto-frame the camera from the real bounding box
    const bbox = new THREE.Box3().setFromObject(figure)
    const centerY = (bbox.min.y + bbox.max.y) / 2
    const halfHeight = (bbox.max.y - bbox.min.y) / 2
    const halfWidth = Math.max(Math.abs(bbox.min.x), Math.abs(bbox.max.x))
    const vFov = (camera.fov * Math.PI) / 180
    const distForHeight = (halfHeight / Math.tan(vFov / 2)) * 1.2
    const distForWidth = (halfWidth / (Math.tan(vFov / 2) * camera.aspect)) * 1.2
    const dist = Math.max(distForHeight, distForWidth)
    camera.position.set(0, centerY, dist)
    camera.lookAt(0, centerY, 0)

    let raf = 0
    const clock = new THREE.Clock()
    function animate(): void {
      const t = clock.getElapsedTime()
      uniforms.uTime.value = t
      figure.rotation.y = Math.sin(t * 0.25) * 0.35
      figure.position.y = Math.sin(t * 1.1) * 0.015
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
      torsoProfile.length = 0
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
        }
      })
      material.dispose()
      renderer.dispose()
    }
  }, [])

  useEffect(() => {
    if (!uniformsRef.current) return
    const glow = mood ? MOOD_GLOW[mood] : MOOD_GLOW.calm
    uniformsRef.current.uGlowColor.value.set(glow)
  }, [mood])

  useEffect(() => {
    if (!uniformsRef.current) return
    uniformsRef.current.uFlicker.value = mood === 'strain' ? 0.75 : 1.0
  }, [mood, posture])

  useEffect(() => {
    if (!groupRef.current) return
    let scale = 1.0
    if (posture === 'lean-in') scale = 1.06
    else if (posture === 'pull-back') scale = 0.92
    if (speaking) scale += 0.03
    groupRef.current.scale.setScalar(scale)
  }, [posture, speaking])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
