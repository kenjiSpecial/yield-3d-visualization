precision highp float;

uniform float startZ;
uniform float startX;
uniform float dateUnit;
uniform float yieldUnit;

varying float vRate; 
varying vec3 vPos;

void main(){
    vec3 startColor = vec3(0.8, 0.8, 0.9);
    vec3 endColor = vec3(0.3, 0.3, 0.6);
    vec3 outputColor = mix(startColor, endColor, vRate);

    float rateX = mod(vPos.x - startX, yieldUnit);  
    // rateX  = 1.0;
    // float rateZ = mod(vPos.z - startZ, dateUnit);
    float rate = rateX; //min();  

    if(rate < 0.2 ){
        float val = smoothstep(0.12, 0.2, rate);
        gl_FragColor = mix( vec4(startColor * 1.2, 1.0), vec4(outputColor, 1.0), val);
    }else{
        gl_FragColor = vec4(outputColor, 1.0);
    }
}