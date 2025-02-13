import {OGC3DTile, TileLoader} from "@jdultra/threedtiles";
import {useMemo} from "react";
import {useFrame, useThree} from "@react-three/fiber";
import {DoubleSide, Vector3} from "three";

export const PhotogrammetryTiles = () => {
    const defaultCamera = useThree((state) => state.camera);
    const gl = useThree((state) => state.gl);

    const tileLoader = useMemo(() => {
        return new TileLoader({
            renderer: gl,
            maxCachedItems: 600,
            meshCallback: (mesh: any) => {
                mesh.material.wireframe = false;
                mesh.material.side = DoubleSide;
            },
            pointsCallback: (points: any, geometricError: any) => {
                points.material.size = Math.min(1.0, 0.5 * Math.sqrt(geometricError));
                points.material.sizeAttenuation = true;
            },
        });
    }, [gl]);

    const ogc3DTile = useMemo(() => {
        const a = new OGC3DTile({
            url: `https://storage.googleapis.com/ogc-3d-tiles/policeStation/tileset.json`,
            renderer: gl,
            geometricErrorMultiplier: 1,
            loadOutsideView: false,
            tileLoader,
            centerModel: true,
            displayErrors: true,
        });
        a.rotateOnAxis(new Vector3(1, 0, 0), Math.PI * -0.5);
        a.rotateOnAxis(new Vector3(0, 0, 1), Math.PI * -0.78);
        a.scale.set(1.15, 1.15, 1.15);
        a.translateX(-1);
        a.updateMatrix()
        return a
    }, [tileLoader, gl]);

    useFrame(() => {
        ogc3DTile?.update(defaultCamera);
        tileLoader?.update();
    });

    return ogc3DTile && <primitive name={'model'} object={ogc3DTile} matrixAutoUpdate={false}/>;
}