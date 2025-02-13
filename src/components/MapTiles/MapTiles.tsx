import {useFrame, useThree} from "@react-three/fiber";
import {OGC3DTile, TileLoader} from "@jdultra/threedtiles";
import {useMemo} from "react";
import {DoubleSide} from "three";
import {earthAntiGeoreferencing} from "./earthAntiGeoreferencing.ts";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader.js";
const ktx2Loader = new KTX2Loader();

ktx2Loader.setTranscoderPath('https://storage.googleapis.com/ogc-3d-tiles/basis/');

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.3/');

export const MapTiles = () => {

    const gl = useThree((state) => state.gl);
    const defaultCamera = useThree((state) => state.camera);

    const tileLoader = useMemo(() => {
        return new TileLoader({
            maxCachedItems: 300,
            dracoLoader: dracoLoader,
            ktx2Loader: ktx2Loader,
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
        if (!tileLoader) return;
        const ogc = new OGC3DTile({
            url: 'https://tile.googleapis.com/v1/3dtiles/root.json',
            queryParams: {key: 'AIzaSyDg10FER_zvv7rJawymYfdfmcQU0ItvLtI'},
            geometricErrorMultiplier: 1,
            tileLoader,
        });
        earthAntiGeoreferencing(ogc, -76.613170, 39.274965, -16);
        console.log('ogc', ogc);
        return ogc;
    }, [tileLoader, gl]);

    useFrame(() => {
        ogc3DTile?.update(defaultCamera)
        tileLoader?.update();
    });

    if (!ogc3DTile) return;

    return <primitive name={'model'} object={ogc3DTile}/>;
};
