import * as THREE from 'three' // Importe las librerias que vamos a usar (Three.js, shaders, controles, GUI)
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import waterVertexShader from './shaders/water/vertex.glsl'
import holographicFragmentShader from './shaders/water/fragment.glsl'
//import waterFragmentShader from './shaders/water/fragment.glsl'


//base // Configuración de la GUI para moverle a los parámetros fácil

//debug
const gui = new GUI({ width: 340 })//// Seleccionamos el canvas donde se va a renderizar la escena
const debugObject = {}

//canvas:creamos la escena donde vamos a meter todo

const canvas = document.querySelector('canvas.webgl')

//scene
const scene = new THREE.Scene()//Creamos la geometría del agua, con muchos subdivs para que se vea chido


//water
//geometry
const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512)

//colors// Definimos los colores del agua: uno para lo profundo y otro para la superficie

debugObject.depthColor = '#186691'
debugObject.surfaceColor = '#9bd8ff'

gui.addColor(debugObject, 'depthColor').onChange(() => { waterMaterial.uniforms.uColor.value.set(debugObject.depthColor) })//// Conectamos los colores a la GUI para cambiarlos en tiempo real

gui.addColor(debugObject, 'surfaceColor').onChange(() => { waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor) })

//material// Material del agua usando shaders y pasando parámetros dinámicos
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: holographicFragmentShader, 
    transparent: true,
    uniforms:
    {
        uTime: { value: 0 },//El tiempo para animar las olas
        
        uBigWavesElevation: { value: 0.2 },// Configuración de las olas grandes (altura, frecuencia, velocidad)
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
        uBigWavesSpeed: { value: 0.75 },

        uSmallWavesElevation: { value: 0.15 },// Configuración de las olas pequeñas (altura, frecuencia, velocidad, iteraciones)
        uSmallWavesFrequency: { value: 3 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallIterations: { value: 4 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },// Colores del agua y ajustes para que se vean más vivos
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.08 },
        uColorMultiplier: { value: 5 },
        uColor: { value: new THREE.Color(debugObject.depthColor) },
    }
})

// Conectamos las propiedades del agua a la GUI para poder modificarlas
gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1).step(0.001).name('uBigWavesElevation')
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.001).name('uBigWavesFrequencyX')
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.001).name('uBigWavesFrequencyY')
gui.add(waterMaterial.uniforms.uBigWavesSpeed, 'value').min(0).max(4).step(0.001).name('uBigWavesSpeed')


gui.add(waterMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(1).step(0.001).name('uSmallWavesElevation')
gui.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(30).step(0.001).name('uSmallWavesFrequency')
gui.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(4).step(0.001).name('uSmallWavesSpeed')
gui.add(waterMaterial.uniforms.uSmallIterations, 'value').min(0).max(5).step(1).name('uSmallIterations')

gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset')
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier')

//mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)// Creamos la malla del agua y la rotamos para que quede como un piso
water.rotation.x = - Math.PI * 0.5
scene.add(water) // Agregamos la malla del agua a la escena


//sizes
 
const sizes = {
    width: window.innerWidth,// Configuramos las dimensiones iniciales (el tamaño de la ventana)
    height: window.innerHeight
}

window.addEventListener('resize', () => //para cuando cambie el tamaño de la ventana
{
    //update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    //update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    //update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Actualizamos el renderizador para que no se pixelee
})


//Camera
 
//base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100) // Configuración básica de la cámara y su posición inicial
camera.position.set(1, 1, 1)
scene.add(camera)

//controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


//renderer
 
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


//animate

const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //water
    waterMaterial.uniforms.uTime.value = elapsedTime

    //update controls
    controls.update()

    //render
    renderer.render(scene, camera)

    //call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
