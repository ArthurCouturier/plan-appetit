import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, useGLTF } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

function MonitorModel() {
    // Charger le modèle GLTF
    const { scene } = useGLTF('/models/Monitor.glb');
    const modelRef = useRef<THREE.Object3D>();

    // Optionnel : Ajouter des logs pour déboguer le modèle
    console.log(scene);

    useFrame((state) => {
        const elapsedTime = state.clock.getElapsedTime(); // Temps écoulé en secondes
        if (modelRef.current) {
            modelRef.current.rotation.y = (elapsedTime * Math.PI * 2) / 7; // Un tour en 7 secondes
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
                {/* Lumières */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 10, 7]} intensity={3} castShadow />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <hemisphereLight intensity={0.3} />

                {/* Contrôles de caméra */}
                <OrbitControls />

                {/* Chargement avec un fallback */}
                <Suspense fallback={<Loader />}>
                    <MonitorModel />
                </Suspense>

                <Text
                    position={[0, -2, 0]} // Position sous le modèle
                    fontSize={0.5} // Taille du texte
                    color="black" // Couleur du texte
                    anchorX="center" // Centre horizontalement
                    anchorY="middle" // Centre verticalement
                >
                    Revenez sur un PC/tablette
                </Text>
            </Canvas>
        </div>
    );
}

function Loader() {
    return (
        <div>
            Revenez sur un PC/tablette
        </div>
    );
}
