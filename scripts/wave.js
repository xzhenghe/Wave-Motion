var t = [];
var f = [];

const omega = 1
const A = 2

function rotate(a) {
    x = a.shift();
    a.push(x);
};

function sin(t, omega, A) {
    return A * Math.sin(omega*t);
};

const N = 300
for (let i = 0; i < N; i++) {
    var x = i * 6*Math.PI / N;
    t.push(x);
    f.push(sin(x, omega, A));
};

data = [{
    x: t,
    y: f,
    mode: 'markers',
    type: 'scatter'
}];

function main() {
    Plotly.plot('myDiv', data);

    setInterval(
        function() {
            rotate(f)
            Plotly.animate(
                'myDiv', {data: [{y: f}]}, 
                {
                    fromcurrent: true,
                    transition: {duration: 0,},
                    frame: {duration: 0, redraw: false,},
                    mode: "afterall"
                });
        }, 30);
};

$(document).ready(main);