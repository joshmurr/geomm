const hash22 =
  '\nvec2 hash22(vec2 p)\n{\n\tvec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));\n    p3 += dot(p3, p3.yzx+33.33);\n    return fract((p3.xx+p3.yz)*p3.zy);\n\n}\n'

export const update_vs = `#version 300 es
  in vec2 a_position;
  out vec2 v_position;

  #define PI 3.1415926535897932384626433832795
  #define aspect 1.0

  uniform float a;
  uniform float b;
  uniform float m;
  uniform float n;
  uniform float vel;
  uniform float minWalk;
  uniform float time;
  uniform float displaceFromCenter;
  uniform sampler2D displacementImg;
  uniform float chladniDisplace;
  uniform float imgDisplace;
  uniform vec3 mouse;
  uniform sampler2D audioTex;

  ${hash22}

  float chladni(vec2 pos, float a, float b, float m, float n) {
    return a * sin(PI * n * pos.x * aspect) * sin(PI * m * pos.y) +
           b * sin(PI * m * pos.x * aspect) * sin(PI * n * pos.y);
  }

  float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898 * float(gl_VertexID), 4.1414 * float(gl_VertexID)))) * 43758.5453);
  }

  vec2 random2(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
               dot(st,vec2(269.5,183.3)) );
    return fract(sin(st)*43758.5453123);
  }

  float stoch(vec2 pos) {
    float lower = 1.0;
    float lowMid = 1.0;
    float highMid = 1.0;
    float higher = 1.0;

    for (float i = 0.0; i < 512.0; i+=64.0) {
      float u = i / 512.0;
      float fft = texture(audioTex, vec2(u, 0)).r;
      if (u < 0.25) {
        lower += fft;
      } else if (u < 0.5) {
        lowMid += fft;
      } else if (u < 0.75) {
        highMid += fft;
      } else {
        higher += fft;
      }

      /* lower /= 64.0; */
      /* lowMid /= 64.0; */
      /* highMid /= 64.0; */
      /* higher /= 64.0; */
    }

    float eq = chladni(pos, a + lower, b + lowMid, m + lower, n + lowMid) * chladniDisplace;
    float displace = texture(displacementImg, pos * 0.5 + vec2(0.5)).r * imgDisplace;
    float positionalDisplace = smoothstep(1.8, 2.2, 1.0 / length(pos)) * displaceFromCenter;
    float newStoch = max((vel + displace + positionalDisplace) * 0.5 * abs(eq), minWalk);

    return newStoch;
  }

  float randRange(float min, float max) {
    return rand(vec2(min, max)) * (max - min) + min;
  }

  vec2 move(vec2 pos, float stochasticAmp) {
    vec2 r = random2(pos) * stochasticAmp - stochasticAmp * 0.5;
    vec2 newPos = pos + r;

    return newPos;
  }

  vec2 bound(vec2 pos) {
    vec2 newPos = pos;
    if(abs(pos.x) > 1.0 || abs(pos.y) > 1.0){
      newPos = hash22(hash22(pos)+fract(time)) - 0.5;
      newPos *= 2.0;
      /* newPos = mix(newPos,vec2(0.),vec2(1.0)); */
    }
    return newPos;
  }

  void main(){

    float stochasticAmp = stoch(a_position);
    v_position = bound(move(a_position, stochasticAmp));


    /* if(mouse.z > 0.5) {
      int scale = 3;
      float _x = float(gl_VertexID * scale % 512);
      float _y = floor(float(gl_VertexID * scale) / 512.0);
      v_position = vec2(_x, _y) / 512.0 * 2.0 - 1.0;
    } */
  }
`
export const update_fs = `#version 300 es
	precision mediump float;

	void main() {
		discard;
	}
`

export const render_vs = `#version 300 es
  in vec2 a_position;
  uniform float particleSize;

  void main(){
    gl_PointSize = particleSize;
		gl_Position = vec4(a_position, 0.0, 1.0);
  }
`
export const render_fs = `#version 300 es
  precision mediump float;
  uniform vec3 particleColor;
  uniform sampler2D backplateImg;
  out vec4 outcolor;

  void main(){
    float distance = length(2.0 * gl_PointCoord - 1.0);
    if (distance > 1.0) {
            discard;
    }
    outcolor = vec4(particleColor, 1.0);
  }
`
