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
    frame: function() {
        APP.t = (Date.now() - APP._then) / 1000; // time since start in seconds

        APP.core.update();
        APP.core.animate();

        APP.animationFrameLoop = window.requestAnimationFrame(APP.core.frame);
    },

    update: function() {
        APP.workers.calcPos();
    },

    animate: function() {
        let data = [{
            x: APP.x,
            y: APP.y
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
        APP.kx = APP.rx * Math.PI / APP.a;
        APP.ky = APP.ry * Math.PI / APP.a;

        APP.w = 2 * APP.dw * Math.sqrt(Math.sin(APP.kx * APP.a / 2)**2 + Math.sin(APP.ky * APP.a / 2)**2);
    },

    calcPos: function() {
        APP.workers.calcParams();

        for (let i=0; i < APP.Nx; i++) {
            for (let j=0; j < APP.Ny; j++) {
                let n = APP.Ny * i + j;
                let offset = Math.cos(APP.kx*APP.a*i + APP.ky*APP.a*j - APP.w*APP.t);

                APP.x[n] = i*APP.a + APP.ux * offset;
                APP.y[n] = j*APP.a + APP.uy * offset;
            }
        }
    }
}

APP.setup = {
    initConsts: function() {
        APP.a = 1; // atomic spacing
        APP.dw = 1; // debye wavelength

        APP.Nx = 20; // # of atoms in x direction
        APP.Ny = 10; // # of atoms in y direction
    },

    initVars: function() {
        APP._then = Date.now();

        APP.rx = 0.5; // % of max x wavenumber, (-1, 1)
        APP.ry = 0.5; // % of max y wavenumber, (-1, 1)

        APP.ux = 0.5; // x amplitude
        APP.uy = 0.5; // y amplitude

        APP.x = new Array(APP.Nx * APP.Ny);
        APP.y = new Array(APP.Nx * APP.Ny);
    },

    initGraph: function() {
        APP.graph = document.getElementById('myDiv'); // div of graph

        let data = [{
            x: APP.x,
            y: APP.y,
            type: 'scatter',
            mode: 'markers',
            markers: {
                size: 6
            }
        }];

        let layout = {
            xaxis: { range: [0, APP.Nx * APP.a] },
            yaxis: { range: [0, APP.Ny * APP.a] }
        };

        Plotly.newPlot(APP.graph, data, layout);
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
        APP.rxRange = document.getElementById('rx-range');
        APP.rxDisplay = document.getElementById('rx-display');

        APP.rxRange.addEventListener('input', function() {
            APP.rx = APP.rxRange.value;
            APP.rxDisplay.textContent = 'rx = ' + APP.rx;
        });

        APP.ryRange = document.getElementById('ry-range');
        APP.ryDisplay = document.getElementById('ry-display');

        APP.ryRange.addEventListener('input', function() {
            APP.ry = APP.ryRange.value;
            APP.ryDisplay.textContent = 'ry = ' + APP.ry;
        });

        // u sliders
        APP.uxRange = document.getElementById('ux-range');
        APP.uxDisplay = document.getElementById('ux-display');

        APP.uxRange.addEventListener('input', function() {
            APP.ux = APP.uxRange.value;
            APP.uxDisplay.textContent = 'ux = ' + APP.ux;
        });

        APP.uyRange = document.getElementById('uy-range');
        APP.uyDisplay = document.getElementById('uy-display');

        APP.uyRange.addEventListener('input', function() {
            APP.uy = APP.uyRange.value;
            APP.uyDisplay.textContent = 'uy = ' + APP.uy;
        });
    }
}

document.addEventListener('DOMContentLoaded', APP.init);