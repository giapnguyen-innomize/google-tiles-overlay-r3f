import * as THREE from 'three'
import {Color, DepthTexture, Scene, PerspectiveCamera, OrthographicCamera} from 'three'
import {useMemo, useRef, useState} from 'react'
import {Canvas, createPortal, ThreeElements, useFrame, useThree} from '@react-three/fiber'
import './index.css'
import {
    OrbitControls as OrbitControlsDrei,
    PerspectiveCamera as PerspectiveCameraDrei, Plane,
    Stats,
    useFBO
} from "@react-three/drei";
import {MapTiles} from "./components/MapTiles/MapTiles.tsx";
import {PhotogrammetryTiles} from "./components/PhotogrammetryTiles/PhotogrammetryTiles.tsx";
import {fragmentShader, vertexShader} from "./components/ComposePassShader/shaderMaterial.ts";
import {useControls} from "leva";


export const Box = (props: ThreeElements['mesh']) => {
    const meshRef = useRef<THREE.Mesh>(null!)
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)

    return (
        <mesh
            {...props}
            ref={meshRef}
            scale={active ? 1.5 : 1}
            onClick={() => setActive(!active)}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}>
            <boxGeometry args={[1, 1, 1]}/>
            <meshStandardMaterial color={hovered ? 'hotpink' : '#2f74c0'}/>
        </mesh>
    )
}


export const App = () => {

    return <Canvas camera={{position: [0, 0, 2]}}>
        <Stats/>
        <ambientLight intensity={Math.PI / 2}/>
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI}/>

        <axesHelper args={[10]}/>

        <Controls/>

        <P></P>
    </Canvas>
}

const Controls = () => {
    const {
        gl: {domElement},
    } = useThree();

    const ref = useRef<any>()

    return <>
        <PerspectiveCameraDrei ref={ref} name={'main camera'} near={0.01} far={40000} fov={60} position={[0, 0, 20]}/>
        <OrbitControlsDrei camera={ref.current} domElement={domElement}/>
    </>
}


const P = () => {
    const {scene, size: {width, height}} = useThree();
    const renderTargetA = useFBO(width, height, {
        stencilBuffer: false,
        depthBuffer: true,
        depthTexture: new DepthTexture(),

    });
    const renderTargetB = useFBO(width, height, {
        stencilBuffer: false,
        depthBuffer: true,
        depthTexture: new DepthTexture(),
    });

    const mainCamera = scene.getObjectByName('main camera')
    const planeRef = useRef<any>();

    console.log('mainCamera', mainCamera)

    const sceneA = useMemo(() => {
        const scene = new Scene()
        scene.name = 'sceneA'
        scene.background = new Color('#c4ffc6');
        return scene
    }, [])

    const sceneB = useMemo(() => {
        const scene = new Scene()
        scene.name = 'sceneA'
        scene.background = new Color('#9cc2ff');
        return scene
    }, [])

    const {margin} = useControls({margin: {value: 2, min: 0, max: 29.9}})

    useFrame(({gl}) => {
        // render target A
        gl.setRenderTarget(renderTargetA)
        gl.render(sceneA, mainCamera);

        // render target B
        gl.setRenderTarget(renderTargetB)
        gl.render(sceneB, mainCamera);

        if (planeRef.current) {
            planeRef.current.material.uniforms.depthA.value = renderTargetA.depthTexture;
            planeRef.current.material.uniforms.colorA.value = renderTargetA.texture;
            planeRef.current.material.uniforms.depthB.value = renderTargetB.depthTexture;
            planeRef.current.material.uniforms.colorB.value = renderTargetB.texture;
            planeRef.current.material.uniforms.margin.value = margin;
            planeRef.current.material.needsUpdate = true
        }

        gl.setRenderTarget(null);
    })


    const uniforms = useMemo(() => ({
        cameraNear: {value: 0.01},
        cameraFar: {value: 40000.0},
        depthA: {value: new THREE.Texture()},
        depthB: {value: new THREE.Texture()},
        colorA: {value: new THREE.Texture()},
        colorB: {value: new THREE.Texture()},
        ldf: {value: 0.13082371200719234},
        margin: {value: 1.5}
    }), [])

    return <>
        {createPortal(<>
            <ambientLight intensity={Math.PI / 2}/>
            <Box position={[1.2, 0, 0]}/>
            <MapTiles/>

        </>, sceneA)}
        {createPortal(<>
            <Box position={[1.2, 0, 0]}/>
            <ambientLight intensity={Math.PI / 2}/>
            <PhotogrammetryTiles/>
        </>, sceneB)}

        <Plane name={'Plane'} position={[0, 0, 0]} args={[2, 2]} ref={planeRef}>
            {/*<meshStandardMaterial map={renderTargetA?.texture}/>*/}
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                depthTest={false}
                depthWrite={false}
                uniforms={uniforms}/>
        </Plane>
    </>
}
