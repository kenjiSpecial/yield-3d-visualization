precision highp float;

varying float vRate; 

void main(){
    vec3 startColor = vec3(0.8, 0.8, 0.9);
    vec3 endColor = vec3(0.0, 0.0, 0.3);
    vec3 outputColor = mix(startColor, endColor, vRate);

    gl_FragColor = vec4(outputColor, 1.0);
}