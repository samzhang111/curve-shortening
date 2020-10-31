import { shortenCurve, ChowGlickStepPoint, NSWStepPoint, JeckoLegerStepPoint, DziukStepPoint } from "./curveshortening-algorithms"

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

        shortenedCurveDataSelectors.push(mathbox2d.select(`#curve${i}`))
        shortenedCurveSelectors.push(mathbox2d.select(`#curve${i}line`))
    }



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

            shortenedCurveDataSelectors.push(mathbox2d.select(`#curve${i}`))
            shortenedCurveSelectors.push(mathbox2d.select(`#curve${i}line`))
        }

        currentIterCap = Math.max(currentIterCap, shortenedCurves.length)

        for (let i = 0; i < shortenedCurves.length; i++) {
            shortenedCurveSelectors[i].set('width', width)
            shortenedCurveDataSelectors[i].set('data', shortenedCurves[i])
        }

        for (let j = shortenedCurves.length; j < currentIterCap; j++) {
            shortenedCurveDataSelectors[j].set('data', nullData3d)
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

    let numNodesSlider = board.create('slider', [[-0.8, 1.3], [0.8, 1.3], [3, 10, 20]], {name:'# points', size: 7, label: {fontSize: 13}, snapWidth: 1, precision: 0});
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

