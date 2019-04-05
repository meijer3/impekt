function toggleMenu(x) {
    x.parentNode.parentNode.classList.toggle("header-menu-open");
}
var insights = [];
var th;
window.onload = () => {
    console.clear();
    if (d3.select('#page').empty()) {
        let svg = d3.select('svg').node().outerHTML;
        d3.select('body').html('');
        d3.select('body').append('div').attr('id', 'page').html(svg);
        d3.select('#page svg').attr('id', 'insight');
    }
    let allElements = d3.select('#Main');
    let nowActive = 'Main';
    d3.selectAll('svg#insight g').style('display', 'none');
    allElements.style('display', 'block');
    d3.selectAll('path').each((d, i, arr) => {
        let path = d3.select(arr[i]);
        try {
            path.attr('id', path.attr('id').replace(/_[0-9]{0,3}_$/gm, ''));
        }
        catch (e) { }
    });
    d3.selectAll('#clip').style('opacity', 0);
    let contr = d3.select('#page').append('div').attr('class', 'controls');
    contr.append('input').attr('type', 'range').attr('min', 0.01).attr('max', 100).attr('step', 0.001).attr('value', 4).style('width', '100%');
    th = new morpher('svg#insight', '#Main');
    th.insights.push(new insight('Can', 'Cannetje', 0, 0.33, morpher.direction.vertical, 1.4));
    th.insights.push(new insight('Bottle', 'Bottle', 0.33, 1.5, morpher.direction.vertical, 1));
    th.insights.push(new insight('Bucket', 'Bucket', 1.5, 10, morpher.direction.vertical, 1));
    th.insights.push(new insight('Barrol', 'Barrol', 10, 160, morpher.direction.vertical, 1.25));
    th.insights.push(new insight('Trailer', 'Trailer', 160, 2500, morpher.direction.horizontal, 1));
    th.insights.push(new insight('Tanker truck', 'Tank', 2500, 20000, morpher.direction.horizontal, 1));
    th.insights.map((insight) => {
        contr.append('button').html(insight.name).on('click touch', () => {
            console.clear();
            let kg = (insight.minLiters + (insight.maxLiters - insight.minLiters) / 2) / 559;
            th.calculateValues(kg);
        });
    });
    d3.select('#page').append('label').html();
};
class morpher {
    constructor(selectionSVG, selectionGroup) {
        this.insights = [];
        this.percentage = 0.5;
        this.svg = d3.select(selectionSVG);
        this.mainGroup = this.svg.select(selectionGroup);
        this.volumaPath = this.svg.select('#voluma');
        this.volumaPath
            .attr("clip-path", "url(#cutpercentage)")
            .style('transform', 'translate(0,0)');
        let def = this.svg.insert('defs', 'g');
        let mask = def.append('mask').attr('id', 'gasses');
        def.append('filter').attr('id', 'blur').attr('x', '0').attr('y', '0').html('<feGaussianBlur in="SourceGraphic" stdDeviation = "7" />');
        let d1 = d3.select('#Smoke1 path').attr('d');
        let d2 = d3.select('#Smoke2 path').attr('d');
        d3.select('#Smoke1').remove();
        d3.select('#Smoke2').remove();
        mask.html(`
                <path filter="url(#blur)" fill="#454545" d="` + d1 + `">
                <animate id="gass2" xmlns="http://www.w3.org/2000/svg" attributeType="XML" attributeName="d" dur="8s" repeatCount="indefinite" values="` + d1 + `;` + d2 + `;` + d1 + `"></animate>
                </path>
		`);
        d3.selectAll('#voluma').each((d, i, arr) => {
            clone(d3.select(arr[i]));
            function clone(selector) {
                var node = selector.node();
                d3.select(node.parentNode.insertBefore(node.cloneNode(true), node.nextSibling))
                    .attr('id', 'volumaDark')
                    .attr('fill', '#000')
                    .attr("mask", "url(#gasses)")
                    .style('transform', 'translate(0,0)');
            }
        });
        let clipPath = def.append('clipPath').attr('id', 'cutpercentage');
        clipPath.html('<path fill="#000" d="M187.83,212.64c-0.1-6.52-0.5-138.77-0.5-144.02, c-13.14-12.5,45.94-16.19,59.53-16.5.08,0,76.58,6.32,58.67,16.19c0.5,19.38,0.5,136.26,0,143.89, c12.53,10.37-13.6,17.37-65.15,17.14C211.25,228.88,177.63,224.25,187.83,212.64z" ></path>');
        this.clipPathElement = clipPath.select('path');
        d3.select('input').on('input', () => {
            this.calculateValues(logslider(parseFloat(d3.select('input').property('value'))));
            function logslider(position) {
                var minp = 0;
                var maxp = 100;
                var minv = Math.log(0.0001);
                var maxv = Math.log(35);
                var scale = (maxv - minv) / (maxp - minp);
                return Math.exp(minv + scale * (position - minp));
            }
        });
    }
    calculateValues(kg) {
        let Lco2 = (kg * 559);
        let LAir = Lco2 / 0.0033;
        let m3co2 = Lco2 / 1000;
        let m3Air = LAir / 1000;
        let insight = this.insights.filter((insight) => { return insight.select(Lco2); })[0];
        if (typeof insight !== 'undefined') {
            this.percentage = insight.percentage(Lco2);
            if (this.active == insight) {
                this.updatePercentage(false);
            }
            else {
                this.active = insight;
                this.morph(this.active);
            }
            d3.select('label').html('<table>' +
                '<tr><td>' + insight.name + ' </td><td> ' + Math.round(this.percentage * 100) + '%</td></tr>' +
                '<tr><td>CO<sub>2</sub></td><td>' + PrettyNumber(kg) + ' kg</td><td>' + PrettyNumber(Lco2) + ' L</td><td>' + PrettyNumber(m3co2) + ' m3</td></tr>' +
                '<tr><td>Air 2018</td><td></td><td>' + PrettyNumber(LAir) + ' L</td><td>' + PrettyNumber(m3Air) + ' m3</td></tr>' +
                '<tr><td>Air 2050</td><td></td><td>' + PrettyNumber(LAir) + ' L</td><td>' + PrettyNumber(m3Air) + ' m3</td></tr>' +
                '</table>');
        }
        else {
            console.error('Lco2', Lco2, this.insights);
        }
    }
    updatePercentage(reset) {
        let bbox = this.volumaPath.node().getBBox();
        let x = bbox.x;
        let y = bbox.y;
        let width = bbox.width;
        let height = bbox.height;
        let duration = 1200;
        console.log('Morph to: ' + Math.round(this.percentage * 100) + '%');
        if (reset) {
            let d = this.svg.select('#' + this.active.classname).select('#clip').attr('d');
            this.clipPathElement
                .attr('d', d)
                .style('transform', 'translate(0,0)');
        }
        if (this.active.direction == morpher.direction.horizontal) {
            this.clipPathElement.transition().duration(duration)
                .style('transform', 'translate(' + (width * this.percentage / this.active.offset) + 'px,' + 0 + 'px)');
        }
        if (this.active.direction == morpher.direction.vertical) {
            this.clipPathElement.transition().duration(duration).style('transform', 'translate(' + 0 + 'px,' + -(height * this.percentage / this.active.offset) + 'px)');
        }
    }
    stopClip(duration) {
        if (this.clipPathElement) {
            this.clipPathElement.transition().style('transform', 'translate(0px,0px)').style('transform', 'translate(-5000px,5000px)');
        }
    }
    morph(insight) {
        this.stopClip(200);
        let promises = [];
        this.mainGroup.selectAll('path').each((d, i, arr) => {
            let pathID = arr[i].getAttribute('id');
            let animate = true;
            if (pathID == 'volumaDark' || pathID == 'voluma' || pathID == 'clip') {
                animate = false;
            }
            promises.push(this.morphPath(insight, pathID, animate));
        });
        Promise.all(promises).then(() => {
            this.updatePercentage(true);
        }).catch((e) => {
            console.error(e);
        });
    }
    morphPath(insight, pathID, animate) {
        let duration = animate ? 1000 : 0;
        return new Promise((resolve, reject) => {
            let pathSelection = '#' + pathID;
            let targetSelection = '#' + insight.classname + ' #' + pathID;
            let path = this.mainGroup.select(pathSelection);
            let d = d3.select(targetSelection).attr('d').split('  ').join();
            if (duration == 0) {
                path.attr('d', d);
                return resolve();
            }
            path.transition().duration(duration).attr('d', d).on('end', function () {
                return resolve();
            });
        });
    }
}
class insight {
    constructor(name, classname, min, max, direction, offset) {
        this.classname = classname;
        this.minLiters = min;
        this.maxLiters = max;
        this.name = name;
        this.direction = direction;
        this.offset = offset;
    }
    select(liters) {
        if (liters > this.minLiters && liters <= this.maxLiters) {
            return this;
        }
    }
    percentage(liters) {
        return (liters / this.maxLiters);
    }
}
(function (morpher) {
    let direction;
    (function (direction) {
        direction[direction["horizontal"] = 0] = "horizontal";
        direction[direction["vertical"] = 1] = "vertical";
        direction[direction["diagonal"] = 2] = "diagonal";
    })(direction = morpher.direction || (morpher.direction = {}));
})(morpher || (morpher = {}));
function PrettyNumber(num) {
    let significance = 3;
    let strlen;
    let clean;
    let RNum;
    if (num == 0) {
        return '0';
    }
    if (num > 10) {
        strlen = (num.toFixed(0) + '').length;
        clean = Math.pow(10, strlen - significance);
        RNum = parseInt((num / clean).toFixed(0)) * clean;
        return RNum.toLocaleString('fr-EG');
    }
    else if (num > 1) {
        strlen = (num.toFixed(0) + '').length;
        clean = Math.pow(10, strlen - significance + 1);
        RNum = parseInt((num / clean).toFixed(1)) * clean;
        return RNum.toLocaleString('fr-EG');
    }
    else {
        num = num.toFixed(100);
        clean = Math.abs(Math.floor(Math.log10(num)));
        RNum = (num + '').substring(0, clean + significance + 1);
        return RNum.substring(0, 4) + " " + RNum.substring(4).replace(/(.{3})/g, "$1");
    }
}
