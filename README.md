# GEOMM

A [~~soon to be~~] collection of composable function blocks for creative computing [one day].

This is largely a big playground for me to learn as I make. I'm trying to consolidate previous attempts at making flexible WebGL boilerplate libraries ([GL_BL](https://github.com/joshmurr/webgl_boilerplate), [GL-Handler](https://github.com/joshmurr/gl-handler)) and 3D graphics experiments into one network of packages. Whilst learning about functional programming methods in the process.

It is a very iterative process which normally starts with building an example...

```bash
./scripts/example.sh -n new-example
```

...and in making that example/demo finding features to add and ways to improve the API.

I'm not sure this will ever be done or useful for anyone other than me, but it's always good to experiment in public I think.

If it's not obvious this is heavily inspired by Karsten Schmidt's [thi.ng/umbrella](https://github.com/thi-ng/umbrella).

### Workspaces

Monorepos are a nightmare it turns out. I think it's mainly getting Typescript and linting/intellisense/etc to work nicely with workspaces. One day things seem to work fine and then the next things behave differently. Any way these are some of the things I had to do to get things working:

1. Add `"composite": true` to `/tsconfig.base.json`. This allows for [Project Referencing](https://www.typescriptlang.org/docs/handbook/project-references.html) to help import resolution.
2. With that in mind you can (and should) now add the reference to the project `tsconfig` wherever imports are made: `"references": [{ "path": "../maths" }]`. This is a bit annoying as it's not automatic like when you `npm i` something.. but it helps.
