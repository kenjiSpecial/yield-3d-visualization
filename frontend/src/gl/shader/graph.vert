precision highp float;

attribute vec4 position;
// attribute float ;
attribute float rate;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec2 vUv;
varying float vRate; 

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * position;

    vRate = rate;
}