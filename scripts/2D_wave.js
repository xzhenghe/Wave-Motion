window.APP = window.APP || {};

APP.init = function() {
    APP.isRunning = false;

    APP.setup.initConsts();
    APP.setup.initVars();

    APP.setup.initGraph();
    APP.setup.initButton();
    APP.setup.initSlider();

    APP.start();
};

APP.start = function() {
    if (APP._stoptime) {
        APP._then += Date.now() - APP._stoptime; // add stopped time
    };

    if (!APP.isRunning) {
        APP.core.frame();
        APP.isRunning = true;
    };
};

APP.stop = function() {
    window.cancelAnimationFrame(APP.animationFrameLoop);
    APP.isRunning = false;
    APP._stoptime = Date.now(); // record when animation paused
}

APP.core = {
    frame: function(timenow) {
        APP.t = (timenow - APP._then) / 1000; // time since start in seconds

        APP.core.update();
        APP.core.animate();

        APP.animationFrameLoop = window.requestAnimationFrame(APP.core.frame);
    },

    update: function() {
        APP.workers.calcPos();
    },

    animate: function() {
        let data = [{
            x: APP.x
        }];

        Plotly.animate(APP.graph, {
            data: data
        }, {
            transition: {
                duration: 0
            },
            frame: {
                duration: 0,
                redraw: false
            }
        });
    }
}

APP.workers = {
    calcParams: function() {
        APP.k = APP.r * Math.PI / APP.a;
        APP.w = 2 * APP.dw * Math.sin(APP.k * APP.a / 2);
    },

    calcPos: function() {
        APP.workers.calcParams();

        for (let i=0; i < APP.N; i++) {
            let offset = APP.u * Math.cos(APP.k*APP.a*i - APP.w*APP.t);
            APP.x[i] = i*APP.a + offset;
        }
    }
}

APP.setup = {
    initConsts: function() {
        APP.a = 1; // atomic spacing
        APP.dw = 1; // debye wavelength

        APP.N = 10; // # of atoms
    },

    initVars: function() {
        APP._then = Date.now();

        APP.r = 0.5; // % of max wavenumber, (-1, 1)
        APP.u = 0.5; // amplitude

        APP.x = new Array(APP.N);

        APP.y = new Array(APP.N);
        for (let i=0; i < APP.N; i++) {
            APP.y[i] = 0; // initialize all to zeroes
        };
    },

    initGraph: function() {
        APP.graph = document.getElementById('myDiv'); // div of graph

        let data = [{
            x: APP.x,
            y: APP.y,
            type: 'scatter',
            mode: 'markers',
            marker: {
                size: 10
            }
        }];

        let layout = {
            xaxis: { range: [0, APP.N * APP.a] },
            yaxis: { range: [-1, 1] }
        };

        Plotly.plot(APP.graph, data, layout);
    },

    initButton: function() {
        APP.button = document.getElementById('start-stop');

        APP.button.addEventListener('click', function() {
            if (APP.isRunning) {
                APP.stop();
            } else {
                APP.start();
            };
        });
    },

    initSlider: function() {
        // r sliders
        APP.rRange = document.getElementById('r-range');
        APP.rDisplay = document.getElementById('r-display');

        APP.rRange.addEventListener('input', function() {
            APP.r = APP.rRange.value;
            APP.rDisplay.textContent = 'r = ' + APP.r;
        });

        // u sliders
        APP.uRange = document.getElementById('u-range');
        APP.uDisplay = document.getElementById('u-display');

        APP.uRange.addEventListener('input', function() {
            APP.u = APP.uRange.value;
            APP.uDisplay.textContent = 'u = ' + APP.u;
        });
    }
}

document.addEventListener('DOMContentLoaded', APP.init);