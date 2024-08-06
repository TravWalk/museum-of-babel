// Environment.js
import * as THREE from 'three';

export const addBlackPlane = (scene) => {
    const geometry = new THREE.PlaneGeometry(500, 500);
    const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = - Math.PI / 2;
    plane.position.y = -25; // Adjust the height of the plane as needed
    plane.position.z = 0; // Adjust the position of the plane as needed
    plane.receiveShadow = true; // Ensure the plane can receive shadows
    scene.add(plane);
    return plane;
};
