import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { modelSpin } from './ModelReactivity';
import { addBlackPlane } from './Environment';

const ModelViewer = () => {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const sceneRef = useRef(null);
    const isDragging = useRef(false);
    const previousMousePosition = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const init = async () => {
            const scene = new THREE.Scene();
            sceneRef.current = scene;

            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            cameraRef.current = camera;

            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true; // Enable shadow map
            renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: set shadow map type
            mountRef.current.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            // Add a bright spotlight at a 45-degree angle
            const spotLight = new THREE.SpotLight('##ffffff', 10000); // Adjusted intensity
            spotLight.position.set(5, 30, 5); // Position at a 45-degree angle
            spotLight.castShadow = true; // Enable shadows for the spotlight
            spotLight.angle = Math.PI / 3.5; // Set the spotlight angle
            spotLight.penumbra = 0.5;
            spotLight.decay = 2;
            spotLight.distance = 200;
            scene.add(spotLight);

            /* HELPERS */   
            // Add a spotlight helper
            const spotLightHelper = new THREE.SpotLightHelper(spotLight);
            scene.add(spotLightHelper);

            // Add a shadow camera helper
            const shadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
            scene.add(shadowCameraHelper);

            // Add ambient light
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Adjusted intensity
            scene.add(ambientLight);

            // Add directional light
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2); // Adjusted intensity
            directionalLight.position.set(5, 5, 5).normalize();
            scene.add(directionalLight);

            const directionalLightHelper = new THREE.DirectionalLightHelper(spotLight);
            scene.add(directionalLightHelper);

            // Add black plane to the scene
            const floor = addBlackPlane(scene);
            floor.receiveShadow = true; // Enable shadows on the floor

            // Handle window resizing
            const onWindowResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener('resize', onWindowResize);

            // Add the object
            const loader = new OBJLoader();
            loader.load('/Sting-Sword-lowpoly.obj', (obj) => {
                obj.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true; // Enable shadows for the object
                    }
                });
                scene.add(obj);

                // Calculate the bounding box of the object
                const box = new THREE.Box3().setFromObject(obj);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());

                // Center the object
                obj.position.sub(center);

                // Normalize the size of the object
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 50 / maxDim;
                obj.scale.set(scale, scale, scale);

                // Rotate the object
                obj.rotation.x = Math.PI / 2;
                obj.rotation.y = Math.PI;
                obj.rotation.z = Math.PI;

                // Adjust the camera position
                const fov = camera.fov * (Math.PI / 180);
                let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));

                cameraZ *= 3; // Add some distance to fit the object nicely
                camera.position.z = cameraZ;

                const minZ = box.min.z;
                const cameraToFarEdge = minZ < 0 ? -minZ + cameraZ : cameraZ - minZ;

                camera.far = cameraToFarEdge * 3;
                camera.updateProjectionMatrix();

                obj.position.set(1, 1, 1);

                renderer.render(scene, camera);

                // Animate the rotation around the z-axis
                const animate = () => {
                    requestAnimationFrame(animate);
                    obj.rotation.z += 0.005; // Increment the rotation around the z-axis
                    renderer.render(scene, camera);
                };
                animate();

                // Cleanup function for the loader
                modelSpin(renderer, obj, isDragging, previousMousePosition);
            });

            // Cleanup function for the useEffect
            return () => {
                window.removeEventListener('resize', onWindowResize);
                if (rendererRef.current) {
                    rendererRef.current.dispose();
                }
                if (sceneRef.current) {
                    // Remove the black plane from the scene
                    addBlackPlane(sceneRef.current);
                }
            };
        };

        init();
    }, []);

    return <div ref={mountRef} />;
};

export default ModelViewer;
