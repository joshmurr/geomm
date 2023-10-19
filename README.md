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
2. ~With that in mind you can (and should) now add the reference to the project `tsconfig` wherever imports are made: `"references": [{ "path": "../maths" }]`. This is a bit annoying as it's not automatic like when you `npm i` something.. but it helps.~
   > LOL - turns out DON'T do that as it leads to another kind of circular dependency within typescript. This was another good hour-and-a-half wasted.
3. So it looks like a cause of the the "cannot write to `<file>.d.ts`" that seems to come up so often is [down to `*.d.ts` files being in the same dir as the `*.js` files](https://www.codejam.info/2021/10/typescript-cannot-write-file-overwrite-input.html), despite typescript emitting files by default this way (??). Any way the workaround, for now, is the add `"declarationDir": "lib/types"` to the project `tsconfig.json` file. This does what it says and seperates the two types of files. Then you need to make sure you have `"typings": "./lib/types/index.d.ts"` in the project `package.json` file so other things know where to find the types. Sigh..
4. Keep an eye on `node_modules` - internal packages should by symlinked, but sometimes it's easy to mess up an "installation" and it will add a new `node_modules` folder, pinned to a version, which can cause `Module XXX has no named export YYY` kinda errors. Deleting the unecessary `node_modules` folder can fix this.
5. Another cause of much time wasted is just circular dependencies. It's not always obvious that that is the issue, but keep an eye on the sequence that projects are built. I have now defined the order (roughly in order of dependence) in the root `package.json`.
