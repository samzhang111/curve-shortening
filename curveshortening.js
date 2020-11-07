import { shortenCurve, ChowGlickStepPoint, NSWStepPoint, JeckoLegerStepPoint, DziukStepPoint } from "./curveshortening-algorithms"

import { abs, dot, add, subtract, complex, multiply, divide, norm, min, sqrt, cross } from "mathjs"

function normalize(v, scaleBy) {
    return multiply(scaleBy, divide(v, norm(v)))
}

function calculateA(point1, point2, point3) {
    var padX = -min(point1[0], point2[0], point3[0], 0)
    var padY = -min(point1[1], point2[1], point3[1], 0)

    var p1c = complex({re: padX + point1[0], im: padY + point1[1]})
    var p2c = complex({re: padX + point2[0], im: padY + point2[1]})
    var p3c = complex({re: padX + point3[0], im: padY + point3[1]})

    var e1 = subtract(p1c, p3c)
    var e2 = subtract(p2c, p1c)
    var e3 = subtract(p3c, p2c)

    var sq1 = sqrt(e1)
    var sq2 = sqrt(e2)
    var sq3 = sqrt(e3)

    var u1 = [sq1.re, sq2.re, sq3.re]
    var v1 = [sq1.im, sq2.im, sq3.im]
    var u2 = [-sq1.re, sq2.re, sq3.re]
    var v2 = [-sq1.im, sq2.im, sq3.im]
    var u3 = [sq1.re, -sq2.re, sq3.re]
    var v3 = [sq1.im, -sq2.im, sq3.im]
    var u4 = [sq1.re, sq2.re, -sq3.re]
    var v4 = [sq1.im, sq2.im, -sq3.im]
    var u5 = [-sq1.im, -sq2.im, sq3.im]
    var v5 = [-sq1.re, -sq2.re, sq3.re]
    var u6 = [-sq1.im, sq2.im, -sq3.im]
    var v6 = [-sq1.re, sq2.re, -sq3.re]
    var u7 = [sq1.im, -sq2.im, -sq3.im]
    var v7 = [sq1.re, -sq2.re, -sq3.re]
    var u8 = [-sq1.im, -sq2.im, -sq3.im]
    var v8 = [-sq1.re, -sq2.re, -sq3.re]

    var z1 = normalize(cross(u1, v1), 1)
    var z2 = normalize(cross(u2, v2), 1)
    var z3 = normalize(cross(u3, v3), 1)
    var z4 = normalize(cross(u4, v4), 1)
    var z5 = normalize(cross(u5, v5), 1)
    var z6 = normalize(cross(u6, v6), 1)
    var z7 = normalize(cross(u7, v7), 1)
    var z8 = normalize(cross(u8, v8), 1)

    return z7
    //return [z1, z2, z3, z4, z5, z6, z7, z8]
}

function drawPointsUnitCircle(n, board, onDrag) {
    /* draw jsxgraph points on the unit circle */

    let points = []
    for (let i = 0; i < n; i++) {
        let x = Math.cos(i/n * 2 * Math.PI)
        let y = Math.sin(i/n * 2 * Math.PI)
        
        let point = board.create('point', [x, y], {name: i, size:2})
        point.on("drag", onDrag)
        points.push(point)
    }

    return points
}


function getPointDataCircular(points) {
    /* get points from jsxgraph points object, with the first element repeated */
    let pointData = []

    points.forEach(function(p)  {
        pointData.push([p.X(), p.Y()])
    })

    pointData.push([points[0].X(), points[0].Y()])

    return pointData
}


(function(){

    /************
     * sphere
     ************/

    var mathboxGrass = mathBox({
      element: document.querySelector("#grassman"),
      plugins: ['core', 'controls', 'cursor', 'mathbox'],
      controls: {
        // Orbit controls, i.e. Euler angles, with gimbal lock
        klass: THREE.OrbitControls,

        // Trackball controls, i.e. Free quaternion rotation
        //klass: THREE.TrackballControls,
      },
      renderer: { parameters: { alpha: true } }
    });

    let threeGrass = mathboxGrass.three

    threeGrass.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
    threeGrass.renderer.setClearAlpha(0);

    var cameraGrass = mathboxGrass.camera({
        proxy: true,
        position: [1, 0.4, 1]
    })
    mathboxGrass.set('focus', 1);

    var sizeGrass = 2;
    const xminGrass = -sizeGrass;
    const yminGrass = -sizeGrass;
    const zminGrass = -sizeGrass;
    const xmaxGrass = sizeGrass;
    const ymaxGrass = sizeGrass;
    const zmaxGrass = sizeGrass;

    var viewGrass = mathboxGrass.cartesian({
      range: [[xminGrass, xmaxGrass], [yminGrass, ymaxGrass], [zminGrass, zmaxGrass]],
      scale: [1, 1, 1],
    });

    var colorsGrass = {
        x: new THREE.Color(0xFF4136),
        y: new THREE.Color(0x2ECC40),
        z: new THREE.Color(0x0074D9),
    };

    var maxlen = 1000;
    const r = 0.98

    viewGrass.area({
      width: 64,
      height: 64,
      rangeX: [0, 2*Math.PI],
      rangeY: [0, Math.PI],
      axes: [1, 3],
      expr: function (emit, x, y, i, j, time) {
          emit(r*Math.cos(x)*Math.sin(y), r*Math.sin(x)*Math.sin(y), r*Math.cos(y));
      },
      live: false,
      items: 1,
      channels: 3,
      fps: 1,
    }).surface({
      opacity: 0.3,
      lineX: true,
      lineY: true,
      color: "purple",
      width: 3,
      fill: false,
    })

    viewGrass.area({
      width: 64,
      height: 64,
      rangeX: [0, Math.PI/2],
      rangeY: [0, Math.PI/2],
      axes: [1, 3],
      expr: function (emit, x, y, i, j, time) {
          emit(r*Math.cos(x)*Math.sin(y), r*Math.sin(x)*Math.sin(y), r*Math.cos(y));
      },
      live: false,
      items: 1,
      channels: 3,
      fps: 1,
    }).surface({
      opacity: 0.5,
      color: "blue",
      fill: true,
    })

    /*********************
     * Curve shortening main display
     ********************/

    const size = 2;
    const xmin = -size;
    const ymin = -size;
    const zmin = -size;

    const xmax = size;
    const ymax = size;
    const zmax = size;

    const mbxmin = xmin* 2
    const mbxmax = xmax* 2

    let delta = 0.05
    let numIters = 40
    let currentIterCap = numIters
    let MAX_ITERS = 100

    //**********************
    // mathbox (2d)
    //**********************

    let mathbox2d = mathBox({
      element: document.querySelector("#curve-2d"),
      plugins: ['core', 'controls', 'cursor', 'mathbox'],
      controls: {
        // Orbit controls, i.e. Euler angles, with gimbal lock
        klass: THREE.OrbitControls,

        // Trackball controls, i.e. Free quaternion rotation
        //klass: THREE.TrackballControls,
      },
      renderer: { parameters: { alpha: true } }
    });
    if (mathbox2d.fallback) throw "WebGL not supported"

    let three = mathbox2d.three;
    three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
    three.renderer.setClearAlpha(0);

    let camera = mathbox2d.camera({
        proxy: true,
        position: [0, 0, 3]
    })
    mathbox2d.set('focus', 1);


    let view = mathbox2d.cartesian({
      range: [[xmin, xmax], [ymin, ymax], [zmin, zmax]],
      scale: [2, 2, 3],
    });

    view.axis({
      detail: 30,
    });

    view.grid({
      divideX: 10,
      width: 2,
      opacity: 0.8,
      zBias: -5,
    });

    let colors = {
        x: new THREE.Color(0xFF4136),
        y: new THREE.Color(0x2ECC40),
        z: new THREE.Color(0x0074D9),
    };

    let colorscale = chroma.scale(['008ae5', 'yellow']).domain([0,numIters+1]);

    view.array({
        id: 'curve',
        data: [[0, 0], [0, 0], [0, 0]],
        channels: 2,
        live: false
    })

    view.line({
        points: '#curve',
        color: colorscale(0).hex(),
        width: 10,
        join: 'round',
    });

    let currentCurve = [[0, 0], [0, 0], [0, 0]]
    let shortenedCurves = [ currentCurve ]
    /*
    view.interval({
      id: 'shortenedCurve',
      width: 3,
      expr: function (emit, x, i, t) {
          emit(currentCurve[i][0], currentCurve[i][1])
      },
      channels: 2,
    })

    view.line({
        points: '#shortenedCurve',
        color: 0x3090FF,
        width: 5,
    })
    */

    let mathboxCartesian = mathbox2d.select('cartesian')
    let mathboxCurveData = mathbox2d.select('#curve')
    let mathboxShortenedCurve = mathbox2d.select('#shortenedCurve')
    let shortenedCurveDataSelectors = []
    let shortenedCurveSelectors = []
    let grassDataSelectors = []
    let grassSelectors = []

    let nullData3d = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]

    for (let i = 0; i < currentIterCap; i++) {
        view.array({
            id: `curve${i}`,
            data: nullData3d,
            channels: 3,
            live: false
        })

        view.line({
            id: `curve${i}line`,
            points: `#curve${i}`,
            color: colorscale(i+1).hex(),
            width: 3,
            opacity: 0.9,
            join: 'round',
        });

        viewGrass.array({
            id: `grass${i}`,
            data: [nullData3d[0]],
            channels: 3,
            live: false
        })

        viewGrass.point({
            id: `grass${i}points`,
            points: `#grass${i}`,
            size: 5,
            color: colorscale(i+1).hex(),
        })

        shortenedCurveDataSelectors.push(mathbox2d.select(`#curve${i}`))
        shortenedCurveSelectors.push(mathbox2d.select(`#curve${i}line`))
        grassDataSelectors.push(mathboxGrass.select(`#grass${i}`))
        grassSelectors.push(mathboxGrass.select(`#grass${i}points`))
    }

    let equilateral = []
    for (let i = 0; i < 3; i++) {
        let x = Math.cos(i/3 * 2 * Math.PI)
        let y = Math.sin(i/3 * 2 * Math.PI)
        
        equilateral.push([x, y])
    }
    let equilateralProj = calculateA(...equilateral)
    let equilateralProjNorm = normalize(equilateralProj, 1)

    function geo(t) {
            let u0 = abs(calculateA(shortenedCurves[0][0], shortenedCurves[0][1], shortenedCurves[0][2]))
        if (isNaN(u0[0])) {
            u0 = [1, 1, 1]
        }
            var u = normalize(u0, 1)
            var v = equilateralProjNorm

            var w0 = subtract(u, multiply(dot(u, v), v))
            var w = normalize(w0, 1)

            t = t*Math.acos(dot(u, v))

            return [
                Math.cos(t)*v[0] + Math.sin(t)*w[0],
                Math.cos(t)*v[1] + Math.sin(t)*w[1],
                Math.cos(t)*v[2] + Math.sin(t)*w[2],
            ]
    }

    console.log({test: geo(1)})


    var geodesic = viewGrass.interval({
        channels: 3,
        width: maxlen,
        range: [0, 1],
        expr: function(emit, x, i, t, delta) {
            var g = geo(x)

            emit(g[0], g[1], g[2])
        },
    }).line({
        width: 5,
        color: "yellow",
    })

    function updateMathbox2dPlot() {
        let width = numNodesSlider.Value() + 1
        let pointData = getPointDataCircular(points)
        mathboxCurveData.set('data', pointData);
        mathboxShortenedCurve.set('width', width)
        currentCurve = pointData

        //shortenedCurves = shortenCurve(ChowGlickStepPoint, currentCurve, delta, numIters)
        //shortenedCurves = shortenCurve(DziukStepPoint, currentCurve, delta, numIters)
        shortenedCurves = shortenCurve(NSWStepPoint, currentCurve, delta, numIters)
        //shortenedCurves = shortenCurve(JeckoLegerStepPoint, currentCurve, delta, numIters)
        
        for (let i = currentIterCap; i < shortenedCurves.length; i++) {
            view.array({
                id: `curve${i}`,
                data: nullData3d,
                channels: 3,
                live: false
            })

            view.line({
                id: `curve${i}line`,
                points: `#curve${i}`,
                color: colorscale(i+1).hex(),
                width: 3,
                opacity: 0.9,
                join: 'round',
            });

            viewGrass.array({
                id: `grass${i}`,
                data: [nullData3d[0]],
                channels: 3,
                live: false
            })

            viewGrass.point({
                id: `grass${i}points`,
                points: `#grass${i}`,
                size: 5,
                color: colorscale(i+1).hex(),
            })

            shortenedCurveDataSelectors.push(mathbox2d.select(`#curve${i}`))
            shortenedCurveSelectors.push(mathbox2d.select(`#curve${i}line`))
            grassDataSelectors.push(mathboxGrass.select(`#grass${i}`))
            grassSelectors.push(mathboxGrass.select(`#grass${i}points`))
        }

        currentIterCap = Math.max(currentIterCap, shortenedCurves.length)

        for (let i = 0; i < shortenedCurves.length; i++) {
            shortenedCurveSelectors[i].set('width', width)
            shortenedCurveDataSelectors[i].set('data', shortenedCurves[i])

            let grassPt = calculateA(shortenedCurves[i][0], shortenedCurves[i][1], shortenedCurves[i][2])
            grassDataSelectors[i].set('data', [grassPt])
        }

        for (let j = shortenedCurves.length; j < currentIterCap; j++) {
            shortenedCurveDataSelectors[j].set('data', nullData3d)
            grassDataSelectors[j].set('data', [nullData3d[0]])
        }
    }


    /************
     * JSX Graph
     ************/

    JXG.Options.layer['polygon'] = 8;
    let board = JXG.JSXGraph.initBoard('control', {
        boundingbox: [-xmax, ymax, xmax, -ymax],
        axis: true,
        pan: {
            needTwoFingers: true,
        }
    });

    let numNodesSlider = board.create('slider', [[-0.8, 1.3], [0.8, 1.3], [3, 3, 20]], {name:'# points', size: 7, label: {fontSize: 13}, snapWidth: 1, precision: 0});
    let deltaSlider = board.create('slider', [[-0.8, -1.3], [0.8, -1.3], [0.001, delta, 0.2]], {name:'delta', size: 7, label: {fontSize: 13}, snapWidth: 0.001, precision: 3});
    let numItersSlider = board.create('slider', [[-0.8, -1.5], [0.8, -1.5], [1, numIters, MAX_ITERS]], {name:'iters', size: 7, label: {fontSize: 13}, snapWidth: 1, precision: 0});

    let points = drawPointsUnitCircle(numNodesSlider.Value(), board, updateMathbox2dPlot)
    let polygon = board.create('polygon', points, { borders:{strokeColor:'black'} });
    polygon.on("drag", updateMathbox2dPlot)

    function updateNumNodes () {
        polygon.remove()
        points.forEach(function(p) {
            p.remove()
        }) 

        points = drawPointsUnitCircle(numNodesSlider.Value(), board, updateMathbox2dPlot)
        polygon = board.create('polygon', points, { borders:{strokeColor:'black'} });
        polygon.on("drag", updateMathbox2dPlot)
        updateMathbox2dPlot()
    }

    numNodesSlider.on("drag", updateNumNodes)
    numItersSlider.on("drag", function() {
        numIters = numItersSlider.Value()
        colorscale = colorscale.domain([0,numIters+1]);
        updateMathbox2dPlot()
    })
    deltaSlider.on("drag", function() {
        delta = deltaSlider.Value()
        updateMathbox2dPlot()
    })

    updateNumNodes()

})()

