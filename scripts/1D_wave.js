var t = [];
var f = [];

const omega = 1;
const A = 2;
const N = 50;          //N atoms
const a = 1;           //atomic spacing
const wd = 1;          //Debye wavelength


for (let i=0; i<N; i++) {
    t.push(0);
};

function wave_1d(uk, k, t) {
    var x = [];
    var w = Math.sqrt(4*wd*(Math.sin(k*a/2)**2));
    for (let l = 0; l < N; l++) {
        x.push(l*a + uk*Math.cos(l*k*a - w*t));
    };
    return x;
};



data = [{
    x: t,
    y: t,
    mode: 'markers',
    type: 'scatter'
}];

let T = 0;

function main() {
    Plotly.plot('myDiv', data);

    setInterval(
        function() {
            let f = wave_1d(0.1, 0.1, T);
            //console.log(f);
            T += 1
            Plotly.animate(
                'myDiv', {data: [{x: f}]}, 
                {
                    fromcurrent: true,
                    transition: {duration: 0,},
                    frame: {duration: 0, redraw: false,},
                    mode: "afterall"
                });
        }, 30);
};

$(document).ready(main);