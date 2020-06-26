precision highp float;

attribute vec4 position;
attribute float rate;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec2 vUv;
varying float vRate; 
varying vec3 vPos;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * position;

    vPos = position.xyz;
    vRate = rate;
}