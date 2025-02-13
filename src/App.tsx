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
    return <Canvas >
        <Stats/>
        <ambientLight intensity={Math.PI / 2}/>
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI}/>
        <Box position={[-1.2, 0, 0]}/>

        <axesHelper args={[50]}/>

        <OrbitControlsDrei makeDefault/>
        <PhotogrammetryTiles/>
        <P></P>
    </Canvas>
}





const P = () => {
    const renderTargetA = useFBO(4000, 4000);
    const renderTargetB = useFBO(4000, 4000);

    const camera = useThree(state => state.camera);
    const postCamera = new THREE.OrthographicCamera(- 1, 1, 1, - 1, 0, 1);


    const sceneA = useMemo(() => {
        const scene = new Scene()
        scene.name = 'sceneA'
        scene.background = new Color('whitesmock');
        return scene
    }, [])

    const sceneB = useMemo(() => {
        const scene = new Scene()
        scene.name = 'sceneA'
        scene.background = new Color('cyan');
        return scene
    }, [])


    const postScene = useMemo(() => {
        const scene = new Scene()
        scene.name = 'sceneA'
        scene.background = new Color('orange');

        // add postQuad
        const postPlane = new THREE.PlaneGeometry(1, 1);
        const postQuad = new THREE.Mesh(postPlane);
        postQuad.material = new THREE.MeshBasicMaterial({color: 0xff0000});
        scene.add(postQuad);

        return scene
    }, [])

    useFrame(({gl}) => {
        // render target A
        gl.setRenderTarget(renderTargetA)
        gl.render(sceneA, camera);

        // render target B
        //
        // gl.setRenderTarget(renderTargetB)
        // gl.render(sceneB, camera);


        gl.setRenderTarget(null);
        // gl.render(postScene, postCamera);
    })

    return <>
       {createPortal(<>
            <Box position={[1.2, 0, 0]}/>
            <MapTiles/>
        </>, sceneA)}
        {/*
        {createPortal(<>
            <Box position={[1.2, 0, 0]}/>
        </>, sceneB)}
*/}
        <Plane position={[0, 0, 0]} args={[300, 250]}>
            <meshStandardMaterial map={renderTargetA?.texture}/>
        </Plane>
    </>
}
