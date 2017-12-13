# study-WebGL

I'm currently playing around with WebGL. The source files hosted in
this repo are based on
[http://learningwebgl.com/](http://learningwebgl.com/), which are
based on the classic NeHe tutorials.

When I went through the tutorials, I found myself nodding along
*thinking* I knew the deal but, for me, knowledge doesn't stick until
I've done something from scratch.

I'm writing these attempts at the tutorials:

- Mostly independently of the source material, to try and solidify my
  knowledge a bit (although the end-result is *similar*).
- Using a slightly more modern ES6 style (classes, deconstructing)
- With more focus on project layout. Shaders are in their own files
  (rather than embedded), models are held in data files, etc. This is
  so that I can explore how to keep a WebGL project clean.
- With a more "entity-centric" design - my specific needs for WebGL
  are for making basic hobby games and convention showcases, rather
  than *pure* visualizations (I'll just use blender for that), so I'm
  trying to explore how to create a "game enginey" design from
  scratch. I haven't made a big game before, so expect my designs to
  suck.

This repo isn't guaranteed to go anywhere, but if I find that I: a)
finish the tutorials (good luck), b) clean up the implementations, and
c) make it into idiomatic ES6 then I might publish these examples in a
set of blog posts or something, just to demonstrate a *very slightly*
different angle on the already excellent tutorials I'm working from.
