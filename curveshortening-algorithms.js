import { add, subtract, complex, multiply } from "mathjs"


const discreteNormal = (x1, x2, x3) => {
    return add(subtract(x3, x2), subtract(x1, x2))
    //return add(subtract(x3, x2), subtract(x1, x2))
}


const norm = (v) => {
    return Math.sqrt(v[0]*v[0] + v[1]*v[1])
}

const dotproduct = (v1, v2) => {
    return v1[0] * v2[0] + v1[1] * v2[1]
}

const angleBetween = (v1, v2) => {
    const dp = dotproduct(v1, v2)
    const v1Norm = norm(v1)
    const v2Norm = norm(v2)

    if (v1Norm == 0 && v2Norm == 0) {
        return 0
    }

    const angle = Math.acos(dp / (v1Norm * v2Norm))

    return angle
}


export const ChowGlickStepPoint = (x1, x2, x3, delta) => {
    let dn = discreteNormal(x1, x2, x3)

    return add(x2, multiply(dn, delta))
}

export const NSWStepPoint = (x1, x2, x3, delta) => {
    /* Perform a step of the Nakayama, Segur, Wadati curve shortening flow */

    let dn = discreteNormal(x1, x2, x3)

    let v1 = subtract(x1, x2)
    let v2 = subtract(x2, x3)

    let angle = angleBetween(v1, v2)
    let g_i_inv = angle / (norm(v1) * norm(v2) * Math.sin(angle))

    return add(x2, multiply(dn, delta * g_i_inv))
}

export const JeckoLegerStepPoint = (x1, x2, x3, delta) => {
    /* Perform a step of the Jecko Leger algorithm that shortens using the Menger curvature */

    const p1m = subtract(x1, x2)
    const p3m = subtract(x3, x2)
    const p1mComplex = complex(p1m[0], p1m[1])
    const p3mComplex = complex(p3m[0], p3m[1])

    const leftRaw = subtract(x1, x3)
    const left = complex(leftRaw[0], leftRaw[1]).inverse()
    const t2 = multiply(p1mComplex, p1mComplex.inverse().conjugate())
    const t3 = multiply(p3mComplex, p3mComplex.inverse().conjugate())
    const right = subtract(t2, t3)

    return add([x2[0], x2[1]], multiply(delta, multiply(left, right).toVector()))
}


export const DziukStepPoint = (x1, x2, x3, delta) => {
    const p1m = subtract(x1, x2)
    const p3m = subtract(x3, x2)

    const p1mNorm = norm(p1m)
    const p3mNorm = norm(p3m)

    const L_i = (p3mNorm + p1mNorm)/2

    return add(x2, multiply(
        delta/L_i, 
        add(
            multiply( p1m, 1/p1mNorm ),
            multiply( p3m, 1/p3mNorm )
        )
    ))
}


const performStep = (stepAlgorithm, points, delta, z) => {
    /* given an array of points that define the boundary of a polygon, with the first entry repeated,
     * return the new polygon formed by performing one Chow-Glickenstein update
     * on each point */
    let N = points.length - 1
    let pt = stepAlgorithm(points[N-1], points[0], points[1], delta)
    let newPoints = [[pt[0], pt[1], z]]

    for (let i = 1; i <= N - 1; i++) {
        let x1 = points[i-1]
        let x2 = points[i]
        let x3 = points[i+1]

        pt = stepAlgorithm(x1, x2, x3, delta)
        newPoints.push([pt[0], pt[1], z])
    }

    pt = stepAlgorithm(points[N-1], points[0], points[1], delta)
    newPoints.push([pt[0], pt[1], z])

    return newPoints
}


export const shortenCurve = (stepAlgorithm, points, delta, iters) => {
    /* given points that define the boundary of a polygon, and a particular iterative step algorithm, shorten the curve
     *
     * delta: step size
     * iters: number of times to repeat shortening
     *
     * returns a list of lists
     * */

    let nextCurve = points
    let shortenedCurves = []

    for (let i = 0; i < iters; i++) {
        let nextNextCurve = performStep(stepAlgorithm, nextCurve, delta, Math.sqrt((i + 1)/(iters + 1)))

        if (norm(subtract(nextNextCurve[1], nextNextCurve[0])) >= norm(subtract(nextCurve[1], nextCurve[0]))) {
            shortenedCurves.pop()
            return shortenedCurves
        }

        nextCurve = nextNextCurve

        shortenedCurves.push(nextCurve)
    }

    return shortenedCurves
}
