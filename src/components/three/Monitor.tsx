import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

function MonitorModel() {
    // Charger le modèle GLTF
    const { scene } = useGLTF('/models/Monitor.glb');

    // Optionnel : Ajouter des logs pour déboguer le modèle
    console.log(scene);

    return scene ?
        <primitive object={scene} />
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
                <Suspense fallback={null}>
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
