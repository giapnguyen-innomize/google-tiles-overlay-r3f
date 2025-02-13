import * as THREE from 'three'
import {Color, Scene} from 'three'
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
    return <Canvas>
        <Stats/>
        <ambientLight intensity={Math.PI / 2}/>
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI}/>

        <axesHelper args={[50]}/>

        <OrbitControlsDrei makeDefault/>

        <P></P>
    </Canvas>
}


const P = () => {
    const renderTargetA = useFBO(4000, 4000);
    const renderTargetB = useFBO(4000, 4000);
    const camera = useThree(state => state.camera);
    const planeRef = useRef<any>();


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

    useFrame(({gl}) => {
        // render target A
        gl.setRenderTarget(renderTargetA)
        gl.render(sceneA, camera);

        // render target B
        gl.setRenderTarget(renderTargetB)
        gl.render(sceneB, camera);

        if (planeRef.current) {
            planeRef.current.material.uniforms.depthA.value = renderTargetA.depthTexture;
            planeRef.current.material.uniforms.colorA.value = renderTargetA.texture;
            planeRef.current.material.uniforms.depthB.value = renderTargetB.depthTexture;
            planeRef.current.material.uniforms.colorB.value = renderTargetB.texture;
            planeRef.current.material.uniforms.margin.value = 1.0;
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

        <Plane position={[0, 0, 0]} args={[300, 250]} ref={planeRef}>
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
