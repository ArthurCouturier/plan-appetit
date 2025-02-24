import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

function BusinessPlanThreeModel() {
    const { scene } = useGLTF('/models/business-plan-lower.glb');
    const modelRef = useRef<THREE.Object3D>();

    const setFrustumCulled = (object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh) {
            if (object.name === "geo_kart") {
                console.log("carte")
            }
            object.frustumCulled = false;
            object.material.side = THREE.DoubleSide;
            object.material.opacity = 1; // Set opacity to fully opaque
            object.material.needsUpdate = true
        }
        object.children.forEach(setFrustumCulled);
    };

    scene.traverse(setFrustumCulled);

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

export default function BusinessPlanThree() {
    return (
        <div className="w-[35vw] h-[50vh]">
            <Canvas
                className="w-full h-full"
                shadows
                camera={{ position: [0, 1.4, 1.5], near: 0.01, far: 10, fov: 100, zoom: 1.1 }}
            >
                <ambientLight intensity={5} />
                <pointLight position={[0, 4, 2]} intensity={100} />

                <Suspense fallback={null}>
                    <BusinessPlanThreeModel />
                </Suspense>
            </Canvas>
        </div>
    );
}
