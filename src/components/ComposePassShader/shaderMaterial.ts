import * as THREE from 'three';

export const vertexShader = `
    precision highp float;
	precision highp int;

	varying vec2 vUv;
	
	void main() {
		vUv = uv;

		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
    `

export const fragmentShader = `
    precision highp float;
	precision highp int;
    #include <packing>
	#include <common>
    #include <logdepthbuf_pars_fragment>
    
    uniform sampler2D depthA;
	uniform sampler2D depthB;
	uniform sampler2D colorA;
	uniform sampler2D colorB;
    uniform float cameraNear;
	uniform float cameraFar;
    uniform float ldf;
    uniform float margin;

    varying vec2 vUv;

     float readDepth( sampler2D depthSampler, vec2 coord ) {
        vec4 fragCoord = texture( depthSampler, coord );
        float viewZ = exp2(fragCoord.x / (ldf * 0.5)) - 1.0;
        return viewZToOrthographicDepth( -viewZ, cameraNear, cameraFar );
      } 

      void main() {
		float depthGoogleTiles = readDepth(depthA, vUv)*(cameraFar-cameraNear)+cameraNear;
		float depthTileset = readDepth(depthB, vUv)*(cameraFar-cameraNear)+cameraNear;

        if(depthTileset<depthGoogleTiles+margin){
            vec4 texColor = texture(colorB, vUv);
            gl_FragColor = vec4(pow(texColor.rgb,vec3(0.454545)),texColor.a);
            return;
        } 
        vec4 texColor = texture(colorA, vUv);
        gl_FragColor = vec4(pow(texColor.rgb,vec3(0.454545)),texColor.a);
	}
    `