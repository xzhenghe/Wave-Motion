window.Arrow = window.Arrow || {};

Arrow.init = function() {
    Arrow.setup.initConst();
    Arrow.setup.initObjects();
    Arrow.setup.initDrag();

};

Arrow.start = function() {

};

Arrow.core = {
    draw: function() {
        Arrow.core.drawArrow(Arrow.rArrow);
        Arrow.core.drawArrow(Arrow.uArrow);
    },

    drawArrow: function(arrow) {
        Arrow.helpers.updateArrow(arrow);
    }
}

Arrow.helpers = {
    updateArrow: function(arrow) {
        let tipx = (arrow.x + 1)*Arrow.width/2;
        let tipy = (1 - arrow.y)*Arrow.height/2;

        arrow.body.attr('x2', tipx)
                  .attr('y2', tipy);
        arrow.tip.attr('cx', tipx)
                 .attr('cy', tipy);
        arrow.text.attr('x', tipx + 5)
                  .attr('y', tipy - 5);
    },

    convertCoords: function(sx, sy) {
        x = 2*sx/Arrow.width - 1;
        y = 1 - 2*sy/Arrow.height;
        return [x, y]
    },

    updateAPP: function() {
        APP.rx = Arrow.rArrow.x;
        APP.ry = Arrow.rArrow.y;

        APP.ux = Arrow.uArrow.x;
        APP.uy = Arrow.uArrow.y;
    }
}

Arrow.setup = {
    initConst: function() {
        Arrow.width = window.innerHeight*0.45;
        Arrow.height = window.innerHeight*0.45;

        Arrow.strokeWidth = 2;
        Arrow.tipRadius = 5;
    },

    initObjects: function() {
        Arrow.svg = d3.select('#arrow');
        Arrow.svg.attr('width', Arrow.width)
                 .attr('height', Arrow.height);

        Arrow.rArrow = {
            x: APP.rx,
            y: APP.ry,
            text: 'r'
        };

        Arrow.uArrow = {
            x: APP.ux,
            y: APP.uy,
            text: 'u'
        };

        Arrow.setup.initArrow(Arrow.rArrow);
        Arrow.setup.initArrow(Arrow.uArrow);
    },

    initDrag: function() {
        function dragged(arrow, name) {
            return function() {
                let xy = Arrow.helpers.convertCoords(d3.event.x, d3.event.y);
                arrow.x = xy[0];
                arrow.y = xy[1];
                Arrow.helpers.updateArrow(arrow);
                Arrow.helpers.updateAPP();
                APP.core.updateSliders();
            }
        };
        Arrow.rArrow.tip.call(d3.drag().on('drag', dragged(Arrow.rArrow)));
        Arrow.uArrow.tip.call(d3.drag().on('drag', dragged(Arrow.uArrow)));
    },

    initArrow: function(arrow) {
        arrow.container = Arrow.setup.createArrowContainer();
        arrow.body = Arrow.setup.createArrowBody(arrow);
        arrow.tip = Arrow.setup.createArrowTip(arrow);
        arrow.text = Arrow.setup.createArrowText(arrow);

        Arrow.helpers.updateArrow(arrow);
    },

    createArrowContainer: function() {
        return Arrow.svg.append('svg')
                        .attr('width', Arrow.width)
                        .attr('height', Arrow.height);
    },

    createArrowBody: function(arrow) {
        return arrow.container.append('line')
                                  .attr('x1', Arrow.width/2).attr('y1', Arrow.width/2)
                                  .attr('stroke-width', Arrow.strokeWidth)
                                  .attr('stroke', 'black');
    },

    createArrowTip: function(arrow) {
        return arrow.container.append('circle')
                              .attr('r', Arrow.tipRadius);
    },

    createArrowText: function(arrow) {
        return arrow.container.append('text').text(arrow.text);
    }
};