window.Arrow = window.Arrow || {};

Arrow.init = function() {
    Arrow.setup.initConst();
    Arrow.setup.initObjects();


};

Arrow.start = function() {

};

Arrow.core = {
    draw: function() {
        Arrow.core.drawArrow(Arrow.rArrow);
        Arrow.core.drawArrow(Arrow.uArrow);
    },

    drawArrow: function(arrow) {
        Arrow.helpers.updateArrowPoint(arrow);
    }
}

Arrow.helpers = {
    updateArrowPoint: function(arrow) {
        arrow.body.attr('x2', (arrow.x + 1)*Arrow.width/2)
                  .attr('y2', (1 - arrow.y)*Arrow.height/2);
    }
}

Arrow.setup = {
    initConst: function() {
        Arrow.width = 100;
        Arrow.height = 100;
    },

    initObjects: function() {
        Arrow.svg = d3.select('#arrow');

        Arrow.rArrow = {
            x: 0.5,
            y: 0.5,
        };

        Arrow.uArrow = {
            x: 0.5,
            y: 0.5,
        };

        Arrow.setup.initArrow(Arrow.rArrow);
        Arrow.setup.initArrow(Arrow.uArrow);
    },

    initArrow: function(arrow) {
        arrow.container = Arrow.setup.createArrowContainer();
        arrow.body = Arrow.setup.createArrowBody(arrow);
        Arrow.helpers.updateArrowPoint(arrow);
    },

    createArrowContainer: function() {
        return Arrow.svg.append('svg')
                            .attr('width', Arrow.width)
                            .attr('height', Arrow.height);
    },

    createArrowBody: function(arrow) {
        let body = arrow.container.append('line')
                                .attr('x1', Arrow.width/2).attr('y1', Arrow.width/2)
                                .attr('stroke-width', 2)
                                .attr('stroke', 'black');
        return body;
    }
};