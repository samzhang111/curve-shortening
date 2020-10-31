# Curve-shortening flows in Javascript

This is a work-in-progress extension of the work currently on display on [the blog](https://sam.zhang.fyi/2020/10/29/curve-shortening/).

For example, I chunked out the progress into different files, and implemented several more of the flows surveyed by Chow and Glickenstein. Note these are not live on the website yet. I also setup a very hacky guard against numerical issues (that doesn't work all the time), basically to bail when a particular edge stops decreasing between iterations.

The two main files are:

* curveshortening.js (view logic)
* curveshortening-algorithms.js (actual curve shortening algorithms)
