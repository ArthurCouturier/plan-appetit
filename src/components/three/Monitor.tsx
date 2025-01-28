import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, useGLTF } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

function MonitorModel() {
    const { scene } = useGLTF('/models/Monitor.glb');
    const modelRef = useRef<THREE.Object3D>();

    useFrame((state) => {
        const elapsedTime = state.clock.getElapsedTime();
        if (modelRef.current) {
            modelRef.current.rotation.y = (elapsedTime * Math.PI * 2) / 7;
        }
    });


    return scene ?
        <primitive object={scene} ref={modelRef} />
        :
        <div>
            Chargement...
        </div>

}

export default function Monitor() {
    return (
        <div className="w-full h-[60vh]">
            <Canvas
                className="w-full h-full"
                shadows
                camera={{ position: [0, 0, 8], fov: 75 }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 10, 7]} intensity={3} castShadow />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <hemisphereLight intensity={0.3} />

                <OrbitControls />

                <Suspense fallback={null}>
                    <MonitorModel />
                </Suspense>

                <Text
                    position={[0, -2, 0]}
                    fontSize={0.5}
                    color="black"
                    anchorX="center"
                    anchorY="middle"
                >
                    Revenez sur un PC/tablette
                </Text>
            </Canvas>
        </div>
    );
}
