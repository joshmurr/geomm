export const basicVert = `#version 300 es
precision mediump float;

in vec3 i_Position;
in vec2 i_TexCoord;

out vec2 v_TexCoord;

void main(){
  gl_Position = vec4(i_Position, 1.0);
  v_TexCoord = i_TexCoord;
}`

export const basicFrag = `#version 300 es
precision mediump float;

uniform vec2 u_Resolution;
uniform float u_Time;
out vec4 OUTCOLOUR;

void main(){
    float r = gl_FragCoord.x / u_Resolution.x;
    float g = gl_FragCoord.y / u_Resolution.y;
    float b = sin(u_Time * 0.001);
    OUTCOLOUR = vec4(r, g, b, 1.0);
}`

export const outputFrag = `#version 300 es
precision mediump float;

uniform vec2 u_Resolution;
uniform sampler2D u_Texture;
in vec2 v_TexCoord;
out vec4 OUTCOLOUR;

void main(){
  OUTCOLOUR = texture(u_Texture, v_TexCoord);
}`
