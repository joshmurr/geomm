export const programFrag = `#version 300 es
precision highp float;
uniform sampler2D u_samp;
uniform sampler2D u_samp1;
in vec2 v_TexCoord;

const float d = 1./256.0, dth2 = .2;

out vec4 OUTCOLOUR;

void main() {
  float u = texture(u_samp, v_TexCoord).r;
  float u1  = texture(u_samp1, v_TexCoord).r;
  u = 2.*u1 - u +
    (texture(u_samp1, vec2(v_TexCoord.x, v_TexCoord.y + d) ).r +
     texture(u_samp1, vec2(v_TexCoord.x, v_TexCoord.y - d) ).r +
     texture(u_samp1, vec2(v_TexCoord.x + d, v_TexCoord.y) ).r +
     texture(u_samp1, vec2(v_TexCoord.x - d, v_TexCoord.y) ).r +
     - 4.*u1)*dth2;

  OUTCOLOUR = vec4(u, 0., 0., 0. );
}
`

export const outputFrag = `#version 300 es
precision highp float;
uniform sampler2D u_samp;
uniform vec3 u_colA;
uniform vec3 u_colB;
in vec2 v_TexCoord;

out vec4 OUTCOLOUR;

void main() {
  float c = texture(u_samp, v_TexCoord).r;
  /* if (c < 0.) OUTCOLOUR = vec4(0., 0., -c, 1.); */
  /* else OUTCOLOUR = vec4(c, 0., 0., 1.); */

  if (c < 0.) OUTCOLOUR = vec4(u_colA, 1.);
  else OUTCOLOUR = vec4(u_colB, 1.);
}
`
