// ModelReactivity.jsx
import React from 'react';

export const modelSpin = (renderer, obj, isDragging, previousMousePosition) => {
    const onMouseDown = (event) => {
        isDragging.current = true;
        previousMousePosition.current = {
            x: event.clientX,
            y: event.clientY
        };
    };

    const onMouseMove = (event) => {
        if (!isDragging.current) return;

        const deltaMove = {
            x: event.clientX - previousMousePosition.current.x,
            y: event.clientY - previousMousePosition.current.y
        };

        obj.rotation.z += deltaMove.x * 0.01;

        previousMousePosition.current = {
            x: event.clientX,
            y: event.clientY
        };
    };

    const onMouseUp = () => {
        isDragging.current = false;
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mouseleave', onMouseUp);

    // Clean up event listeners on unmount
    return () => {
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('mouseup', onMouseUp);
        renderer.domElement.removeEventListener('mouseleave', onMouseUp);
    };
};