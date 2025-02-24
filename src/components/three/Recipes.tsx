import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

function RecipesThreeModel() {
    const { scene } = useGLTF('/models/Recipes.glb');
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

export default function RecipesThree() {
    return (
        <div className="w-[35vw] h-[50vh]">
            <Canvas
                className="w-full h-full"
                shadows
                camera={{ position: [0, 5, 4.2], fov: 75 }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 10, 7]} intensity={3} castShadow />
                <pointLight position={[-2, 3, -4]} intensity={50} />
                <pointLight position={[0, 5, 3]} intensity={50} />
                <hemisphereLight intensity={0.3} />

                <Suspense fallback={null}>
                    <RecipesThreeModel />
                </Suspense>
            </Canvas>
        </div>
    );
}
