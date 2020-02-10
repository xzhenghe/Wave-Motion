window.Vis = window.Vis || {};

Vis.init = function() {
    Vis.isRunning = false;

    Vis.setup.initConsts();
    Vis.setup.initVars();

    Arrow.init(); // init arrows

    Vis.setup.initGraph();
    Vis.setup.initButton();
    Vis.setup.initSlider();

    Vis.start();
};

Vis.start = function() {
    if (Vis._stoptime) {
        Vis._then += Date.now() - Vis._stoptime; // add stopped time
    };

    if (!Vis.isRunning) {
        Vis.core.frame();
        Vis.isRunning = true;
    };
};

Vis.stop = function() {
    window.cancelAnimationFrame(Vis.animationFrameLoop);
    Vis.isRunning = false;
    Vis._stoptime = Date.now(); // record when animation paused
}

Vis.core = {
    frame: function() {
        Vis.t = (Date.now() - Vis._then) / 1000; // time since start in seconds

        Vis.core.update();
        Vis.core.animate();

        Vis.animationFrameLoop = window.requestAnimationFrame(Vis.core.frame);
    },

    update: function() {
        Vis.workers.calcParams();
        Vis.workers.calcPos();
        Vis.workers.calcPhase();
    },

    animate: function() {
        Vis.circle.data(d3.zip(Vis.x, Vis.y))
                    .attr('cx', function(d) { return d[0] })
                    .attr('cy', function(d) { return Vis.Ny*Vis.a - d[1] });
    },

    updateSliders: function() {
        Vis.rxRange.value = Vis.rx;
        Vis.rxDisplay.textContent = 'rx = ' + Number(Vis.rx).toFixed(2);

        Vis.ryRange.value = Vis.ry;
        Vis.ryDisplay.textContent = 'ry = ' + Number(Vis.ry).toFixed(2);

        Vis.uxRange.value = Vis.ux;
        Vis.uxDisplay.textContent = 'ux = ' + Number(Vis.ux).toFixed(2);

        Vis.uyRange.value = Vis.uy;
        Vis.uyDisplay.textContent = 'uy = ' + Number(Vis.uy).toFixed(2);
    }
}

Vis.workers = {
    calcParams: function() {
        Vis.kx = Vis.rx * Math.PI / Vis.a;
        Vis.ky = Vis.ry * Math.PI / Vis.a;

        Vis.w = 2 * Vis.dw * Math.sqrt(Math.sin(Vis.kx * Vis.a / 2)**2 + Math.sin(Vis.ky * Vis.a / 2)**2);
    },

    calcPos: function() {
        for (let i=0; i < Vis.Nx; i++) {
            for (let j=0; j < Vis.Ny; j++) {
                let n = Vis.Ny * i + j;
                let offset = Math.cos(Vis.kx*Vis.a*i + Vis.ky*Vis.a*j - Vis.w*Vis.t);

                Vis.x[n] = i*Vis.a + Vis.ux * offset;
                Vis.y[n] = j*Vis.a + Vis.uy * offset;
            }
        }
    },

    calcPhase: function() {
        let k = Math.sqrt(Vis.kx**2 + Vis.ky**2);
        let v = Vis.w / k;
        let wl = 2 * Math.PI / k;
        let nx = Math.round(Vis.Nx*Vis.a/wl);
        let ny = Math.round(Vis.Ny*Vis.a/wl);
        for (let i=-5; i <= 5; i++) {
            Vis.phasex[i+1] = (Vis.t*v*Vis.kx/k + i*Vis.Nx*Vis.a/2) % (nx * wl);
            Vis.phasey[i+1] = (Vis.t*v*Vis.ky/k + i*Vis.Ny*Vis.a/2) % (ny * wl);
        }
    }
}

Vis.setup = {
    initConsts: function() {
        Vis.a = 1; // atomic spacing
        Vis.dw = 1; // debye wavelength

        Vis.Nx = 25; // # of atoms in x direction
        Vis.Ny = 15; // # of atoms in y direction

        Vis.pointR = 0.15 * Vis.a;
    },

    initVars: function() {
        Vis._then = Date.now();

        Vis.rx = 0.5; // % of max x wavenumber, (-1, 1)
        Vis.ry = 0.5; // % of max y wavenumber, (-1, 1)

        Vis.ux = -0.5; // x amplitude
        Vis.uy = 0.5; // y amplitude

        Vis.x = new Array(Vis.Nx * Vis.Ny);
        Vis.y = new Array(Vis.Nx * Vis.Ny);
        Vis.workers.calcParams();
        Vis.workers.calcPos();

        Vis.phasex = new Array(11);
        Vis.phasey = new Array(11);
    },

    initGraph: function() {
        Vis.svg = d3.select('#visualisation')
                        .attr('width', (Vis.Nx/Vis.Ny)*window.innerHeight/2)
                        .attr('height', window.innerHeight/2)
                        .attr('viewBox', '0 0 ' + Vis.Nx*Vis.a + ' ' + Vis.Ny*Vis.a);

        Vis.svg.selectAll('circle')
                .data(d3.zip(Vis.x, Vis.y))
                .enter()
                    .append('circle')
                        .attr('r', Vis.pointR)
                        .attr('fill', 'orange')
        
        Vis.circle = Vis.svg.selectAll('circle')

        let data = [{
            x: Vis.x,
            y: Vis.y,
            type: 'scatter',
            mode: 'markers',
            marker: {
                size: 6
            }
        }, {
            x: Vis.phasex,
            y: Vis.phasey,
            type: 'scatter',
            mode: 'markers',
            marker: {
                size: 7,
                color: 'orange'
            }
        }];

        let layout = {
            height: window.innerHeight/2,
            width: (Vis.Nx/Vis.Ny)*window.innerHeight/2,
            margin: {
                l: 20,
                r: 25,
                b: 25,
                t: 20,
                pad: 4
              },
            showlegend: false,
            xaxis: { range: [0, Vis.Nx * Vis.a] },
            yaxis: { range: [0, Vis.Ny * Vis.a] }
        };
    },

    initButton: function() {
        Vis.button = document.getElementById('start-stop');

        Vis.button.addEventListener('click', function() {
            if (Vis.isRunning) {
                Vis.stop();
            } else {
                Vis.start();
            };
        });
    },

    initSlider: function() {
        // r sliders
        Vis.rxRange = document.getElementById('rx-range');
        Vis.rxDisplay = document.getElementById('rx-display');

        Vis.rxRange.addEventListener('input', function() {
            Vis.rx = Vis.rxRange.value;
            Vis.rxDisplay.textContent = 'rx = ' + Vis.rx;

            Arrow.rArrow.x = parseFloat(Vis.rx);
            Arrow.core.draw();
        });

        Vis.ryRange = document.getElementById('ry-range');
        Vis.ryDisplay = document.getElementById('ry-display');

        Vis.ryRange.addEventListener('input', function() {
            Vis.ry = Vis.ryRange.value;
            Vis.ryDisplay.textContent = 'ry = ' + Vis.ry;

            Arrow.rArrow.y = parseFloat(Vis.ry);
            Arrow.core.draw();
        });

        // u sliders
        Vis.uxRange = document.getElementById('ux-range');
        Vis.uxDisplay = document.getElementById('ux-display');

        Vis.uxRange.addEventListener('input', function() {
            Vis.ux = Vis.uxRange.value;
            Vis.uxDisplay.textContent = 'ux = ' + Vis.ux;

            Arrow.uArrow.x = parseFloat(Vis.ux);
            Arrow.core.draw();
        });

        Vis.uyRange = document.getElementById('uy-range');
        Vis.uyDisplay = document.getElementById('uy-display');

        Vis.uyRange.addEventListener('input', function() {
            Vis.uy = Vis.uyRange.value;
            Vis.uyDisplay.textContent = 'uy = ' + Vis.uy;

            Arrow.uArrow.y = parseFloat(Vis.uy);
            Arrow.core.draw();
        });
    }
}

document.addEventListener('DOMContentLoaded', Vis.init);