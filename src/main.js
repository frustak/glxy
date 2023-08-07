import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as dat from "lil-gui"
import gsap from "gsap"
import { Howl, Howler } from "howler"
import _ from "lodash"
import screenfull from "screenfull"

window.addEventListener("click", () => {
    if (screenfull.isEnabled && !screenfull.isFullscreen) {
        screenfull.request()
    }
    move()
})

const isDebug = window.location.hash === "#debug"

const sound = new Howl({
    src: ["/sounds/Delectatio - Silent Reverie.mp3"],
    autoplay: true,
    volume: 1,
    loop: true,
})
sound.orientation(0, 0, 0)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const textures = new Array(13)
    .fill(null)
    .map((_, i) => textureLoader.load(`/textures/particles/${i + 1}.png`))

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

if (!isDebug) {
    gui.hide()
}

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
const config = {
    preset: 5,
    move: move,
}
gui.add(config, "move")

const presets = [
    {
        count: 100000,
        size: 0.01,
        radius: 5,
        branches: 3,
        spin: 1,
        randomness: 0.2,
        randomnessPower: 3,
        insideColor: "#ff6030",
        outsideColor: "#1b3984",
        enableTexture: false,
        texture: 0,
        camera: [3, 3, 3],
        rotation: 0,
        galaxies: 1,
    },
    {
        count: 1000000,
        size: 0.01,
        radius: 20,
        branches: 20,
        spin: 5,
        randomness: 2,
        randomnessPower: 10,
        insideColor: "#ff6030",
        outsideColor: "#1b3984",
        enableTexture: true,
        texture: 0,
        camera: [3, 3, 3],
        rotation: Math.PI * 0.25,
        galaxies: 1,
    },
    {
        count: 100000,
        size: 0.01,
        radius: 3,
        branches: 4,
        spin: 0.5,
        randomness: 0.2,
        randomnessPower: 10,
        insideColor: "#ff4242",
        outsideColor: "#ff0000",
        enableTexture: true,
        texture: 0,
        camera: [0, 5, 0],
        rotation: 0,
        galaxies: 1,
    },
    {
        count: 100000,
        size: 0.001,
        radius: 20,
        branches: 20,
        spin: 0,
        randomness: 2,
        randomnessPower: 10,
        insideColor: "#ff6030",
        outsideColor: "#1b3984",
        enableTexture: true,
        texture: 0,
        camera: [3, 3, 3],
        rotation: 0,
        galaxies: 10,
    },
    {
        count: 100000,
        size: 0.001,
        radius: 20,
        branches: 2,
        spin: -5,
        randomness: 2,
        randomnessPower: 10,
        insideColor: "#eff96c",
        outsideColor: "#101b37",
        enableTexture: true,
        texture: 0,
        camera: [3, 3, 3],
        rotation: 0,
        galaxies: 3,
    },
    {
        count: 1000000,
        size: 0.01,
        radius: 5,
        branches: 20,
        spin: 5,
        randomness: 0.5,
        randomnessPower: 5,
        insideColor: "#010109",
        outsideColor: "#101b37",
        enableTexture: true,
        texture: 0,
        camera: [3, 2.5, 3],
        rotation: Math.PI * 0.25,
        galaxies: 1,
    },
    {
        count: 1000000,
        size: 0.01,
        radius: 5,
        branches: 20,
        spin: 5,
        randomness: 0.5,
        randomnessPower: 5,
        insideColor: "#301e33",
        outsideColor: "#01001f",
        enableTexture: true,
        texture: 0,
        camera: [3, 3, 0],
        rotation: Math.PI * 0.25,
        galaxies: 1,
    },
]
const parameters = Object.assign({}, presets[config.preset])

const generateGalaxy = () => {
    const geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3

        // Position
        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        const branchAngle =
            ((i % parameters.branches) / parameters.branches) * Math.PI * 2

        const randomX =
            Math.pow(Math.random(), parameters.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1) *
            parameters.randomness *
            radius
        const randomY =
            Math.pow(Math.random(), parameters.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1) *
            parameters.randomness *
            radius
        const randomZ =
            Math.pow(Math.random(), parameters.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1) *
            parameters.randomness *
            radius

        positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        // Color
        const mixedColor = colorInside
            .clone()
            .lerp(colorOutside, radius / parameters.radius)

        colors[i3 + 0] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    /**
     * Material
     */
    const material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        map: parameters.enableTexture ? textures[parameters.texture] : null,
    })

    /**
     * Points
     */
    const points = new THREE.Points(geometry, material)
    points.rotation.z = parameters.rotation
    scene.add(points)
    points.geometry.computeBoundingSphere()
    return points
}

const galaxies = new THREE.Group()
function regen() {
    galaxies.children.forEach((galaxy) => {
        galaxy.geometry.dispose()
        galaxy.material.dispose()
        scene.remove(galaxy)
    })
    galaxies.clear()
    const gCount = parameters.galaxies
    for (let i = 0; i < gCount; i++) {
        const angle = i / gCount
        const galaxy = generateGalaxy()
        galaxies.add(galaxy)
        if (gCount !== 1) {
            galaxy.rotation.z = Math.PI * angle
        }
    }
}
scene.add(galaxies)

regen()

let currentMove = 0
const cameraMovePoints = [
    {
        position: new THREE.Vector3(0, 0, 3),
        target: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, Math.PI * 0.25),
    },
    {
        position: new THREE.Vector3(0.8, 0.7, -3),
        target: new THREE.Vector3(2, 2, -4),
        rotation: new THREE.Euler(0, 0, 0),
    },
    {
        position: new THREE.Vector3(1, 1, 0),
        target: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
    },
    {
        position: new THREE.Vector3(3, 3, 3),
        target: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
    },
]
function move() {
    const movePoint = cameraMovePoints[currentMove]
    if (!galaxies.rotation.equals(movePoint.rotation)) {
        gsap.to(galaxies.rotation, {
            x: movePoint.rotation.x,
            y: movePoint.rotation.y,
            z: movePoint.rotation.z,
            ease: "power1.inOut",
            duration: 10,
        })
    }
    if (!camera.position.equals(movePoint.position)) {
        gsap.to(camera.position, {
            x: movePoint.position.x,
            y: movePoint.position.y,
            z: movePoint.position.z,
            ease: "power1.inOut",
            duration: 10,
        })
    }
    if (!controls.target.equals(movePoint.target)) {
        gsap.to(controls.target, {
            x: movePoint.target.x,
            y: movePoint.target.y,
            z: movePoint.target.z,
            ease: "power1.inOut",
            duration: 10,
        })
    }
    if (currentMove < cameraMovePoints.length - 1) currentMove++
    else currentMove = 0
}

gui.add(
    config,
    "preset",
    presets.map((_, i) => i)
).onChange((v) => {
    Object.assign(parameters, presets[v])
    tweaks.forEach((t) => t.updateDisplay())
    const [x, y, z] = presets[v].camera
    camera.position.set(x, y, z)
    camera.lookAt(0, 0, 0)
    regen()
})
const tweaks = [
    gui
        .add(parameters, "count")
        .min(1)
        .max(1000000)
        .step(100)
        .onFinishChange(regen),
    gui
        .add(parameters, "size")
        .min(0.001)
        .max(0.1)
        .step(0.001)
        .onFinishChange(regen),
    gui
        .add(parameters, "radius")
        .min(0.01)
        .max(20)
        .step(0.01)
        .onFinishChange(regen),
    gui
        .add(parameters, "branches")
        .min(2)
        .max(20)
        .step(1)
        .onFinishChange(regen),
    gui
        .add(parameters, "spin")
        .min(-5)
        .max(5)
        .step(0.001)
        .onFinishChange(regen),
    gui
        .add(parameters, "randomness")
        .min(0)
        .max(2)
        .step(0.001)
        .onFinishChange(regen),
    gui
        .add(parameters, "randomnessPower")
        .min(1)
        .max(10)
        .step(0.001)
        .onFinishChange(regen),
    gui.addColor(parameters, "insideColor").onFinishChange(regen),
    gui.addColor(parameters, "outsideColor").onFinishChange(regen),
    gui.add(parameters, "enableTexture").onFinishChange(regen),
    gui
        .add(
            parameters,
            "texture",
            new Array(13).fill(null).map((_, i) => i)
        )
        .onFinishChange(regen),
    gui
        .add(parameters, "galaxies")
        .min(1)
        .max(10)
        .step(1)
        .onFinishChange(regen),
]

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.001,
    100
)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
cameraGroup.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.autoRotate = true
controls.autoRotateSpeed = 0.02
controls.enabled = isDebug

gui.add(controls, "autoRotate")

const cursor = { x: 0, y: 0 }

const isTouch = isTouchDevice()

if (!isTouch) {
    window.addEventListener("mousemove", (event) => {
        cursor.x = (event.clientX / sizes.width - 0.5) * 2
        cursor.y = (event.clientY / sizes.height - 0.5) * -2
    })
}

const orientation = new THREE.Vector3(0, 0, 0)
window.addEventListener("deviceorientation", (event) => {
    const alpha = event.alpha / 360 - 0.5
    const beta = (event.beta + 180) / 360 - 0.5
    const gamma = (event.gamma + 90) / 180 - 0.5
    orientation.set(gamma * 2, beta * 2, alpha * 2)
})

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    const { x, y, z } = camera.position
    Howler.pos(x, y, z)
    const cameraDirection = camera.getWorldDirection(new THREE.Vector3(0, 0, 0))
    Howler.orientation(
        cameraDirection.x,
        cameraDirection.y,
        cameraDirection.z,
        camera.up.x,
        camera.up.y,
        camera.up.z
    )

    if (!isTouch) {
        const distance =
            camera.position.distanceTo(new THREE.Vector3(0, 0, 0)) /
            parameters.radius
        const normalDistance = Math.sqrt(_.clamp(distance, 0, 1))
        cameraGroup.position.lerp(
            new THREE.Vector3(
                cursor.x * 0.25 * normalDistance,
                cursor.y * 0.25 * normalDistance,
                cameraGroup.z
            ),
            0.01
        )
    } else {
        cameraGroup.position.lerp(orientation, 0.01)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

function isTouchDevice() {
    return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
    )
}
