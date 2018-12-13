let settings = {
    margin: { top: 40, right: 0, bottom: 30, left: 90 },
    TypeOfComparison: 1,
    ids: [10],
    barheight: 50,
};
let x;
let color = ['#157a6e', '#ffba49', '#da2c38', '#87c38f', '#b8b8d1'];
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
class tooltip {
    constructor() {
        this.select = d3.select(".graph-graph").append("div").attr("class", "tooltip").style("opacity", "0");
    }
    ;
    show(html, mouseX, mouseY) {
        this.select
            .style("width", '')
            .style("bottom", '')
            .style("background", "")
            .style("margin", "")
            .style("padding", "")
            .html(html)
            .style("left", mouseX + "px")
            .style("top", mouseY + "px")
            .transition()
            .duration(200)
            .style("opacity", .9);
    }
    ;
    showError(message, techinal) {
        let width = this.select.node().parentElement.getBoundingClientRect().width;
        this.select
            .html(message)
            .style("background", "#d85555")
            .style("margin", "0 40px")
            .style("left", "")
            .style("top", "")
            .style("bottom", "0")
            .style("width", (width - 80) + "px")
            .style("padding", "40px 0")
            .transition()
            .duration(200)
            .style("opacity", .9);
    }
    ;
    hide() {
        this.select.transition().duration(200).style("opacity", 0);
    }
    ;
}
class toggleVariable {
    constructor(alias1, alias2, id, value1, value2, parentNode) {
        this.alias1 = alias1;
        this.alias2 = alias2;
        this.id = id;
        this.value1 = value1;
        this.value2 = value2;
        this.parentNode = parentNode;
        this.createHTML();
    }
    createHTML() {
        let uniqueName = this.id + "_" + this.alias1 + "_" + this.alias2;
        this.el = this.parentNode.append('div')
            .attr('class', 'graph-buttons-switch').attr('title', uniqueName);
        this.el.append('input')
            .attr('class', 'graph-buttons-switch-input')
            .attr('type', 'radio')
            .attr('name', uniqueName)
            .attr('value', '' + this.value1 + '')
            .attr('id', this.id + "_" + this.value1)
            .attr('type', 'radio')
            .property("checked", true);
        this.el.append('label')
            .attr('for', this.id + "_" + this.value1)
            .attr('class', 'graph-buttons-switch-label graph-buttons-switch-label-off')
            .html(this.alias1);
        this.el.append('input')
            .attr('class', 'graph-buttons-switch-input')
            .attr('type', 'radio')
            .attr('name', uniqueName)
            .attr('value', '' + this.value2 + '')
            .attr('id', this.id + "_" + this.value2)
            .attr('type', 'radio');
        this.el.append('label')
            .attr('for', this.id + "_" + this.value2)
            .attr('class', 'graph-buttons-switch-label graph-buttons-switch-label-on')
            .html(this.alias2);
        this.el.append('span')
            .attr('class', 'graph-buttons-switch-selection');
    }
    activate(callback) {
        this.el
            .on("mousedown touchstart", () => {
            this.el.classed("active", true);
            let mousemove = () => {
                let switcherbbox = this.el.node().getBoundingClientRect();
                let xcoord = d3.mouse(this.el.node())[0];
                xcoord = (xcoord > switcherbbox.width / 2) ? switcherbbox.width / 2 : xcoord;
                xcoord = (xcoord < 0) ? 0 : xcoord;
                this.el.select('.graph-buttons-switch-selection').attr('style', 'left:' + xcoord + 'px;');
            };
            let mouseup = () => {
                let switcherbbox = this.el.node().getBoundingClientRect();
                let xcoord = d3.mouse(this.el.node())[0];
                this.value = (xcoord > switcherbbox.width / 2) ? this.value2 : this.value1;
                this.el.selectAll('input').filter((d, i, arr) => { return arr[i].getAttribute('id') === this.id + "_" + this.value; }).property("checked", true);
                w.on("mousemove", null).on("mouseup", null);
                this.el.classed("active", false);
                this.el.select('.graph-buttons-switch-selection').attr('style', '');
                callback(this.value);
            };
            d3.event.preventDefault();
            let w = this.el.on("mousemove touchmove", mousemove)
                .on("mouseup touchend", mouseup);
        });
    }
}
class sliderVariable {
    constructor(min, max, value, alias, unit, parentNode) {
        this.min = min;
        this.max = max;
        this.value = value;
        this.alias = alias;
        this.unit = unit;
        this.parentNode = parentNode;
        this.createHTML();
    }
    createHTML() {
        this.step = (this.max - this.min) / 20;
        this.id = 'variable_' + this.alias;
        this.el = this.parentNode.append('div').attr('class', 'graph-buttons-slider')
            .attr('title', this.alias);
        this.el.append('input')
            .attr('type', 'range')
            .attr('min', this.min)
            .attr('max', this.max)
            .attr('value', this.value)
            .attr('step', this.step)
            .attr('data-unit', this.unit)
            .attr('name', this.alias);
        this.el.append('a')
            .attr('title', "More info")
            .attr('href', "#" + this.id)
            .html(this.alias);
    }
    activate(callback) {
        let updateValues = () => {
            this.el.select('a').html(this.el.select('input').node().value + ' ' + this.el.select('input').attr('data-unit'));
        };
        let mouseUp = () => {
            updateValues();
            let value = this.el.select('input').node().value;
            this.el.select('input').on("mousemove", null).on("mouseup", null);
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => { this.el.select('a').html(this.el.select('input').node().name); }, 600);
            callback(value);
        };
        this.el.select('input')
            .on("mousedown touchstart", () => {
            this.el.select('input')
                .on("mousemove touchmove", updateValues)
                .on("mouseup touchend click touch", mouseUp);
        });
    }
}
class variable {
    constructor() {
        this.elUpdate = [];
    }
    fromJSON(json, value) {
        this.link_uid = json.link_uid;
        this.value = 123;
        this.long_code_name = json.long_code_name;
        this.short_code_name = json.short_code_name;
        this.sub_title = json.sub_title;
        this.title = json.title;
        this.uid = json.uid;
        this.unit = json.unit;
        this.var_id = json.var_id;
        this.version = json.version;
        this.versionID = json.versionID;
        this.descr = json.descr;
        this.type = graph.typeOfController.slider;
        this.max = json.max;
        this.min = json.min;
        this.value1 = json.value1;
        this.alias1 = json.alias1;
        this.value2 = json.value2;
        this.alias2 = json.alias2;
        return this;
    }
    fromID(var_id) {
        return new Promise((resolve, reject) => {
            let url = 'https://u39639p35134.web0087.zxcs-klant.nl/api/';
            let xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var jsonData;
                    try {
                        jsonData = JSON.parse(xhr.responseText)[0];
                        resolve(this.fromJSON(jsonData));
                    }
                    catch (e) {
                        console.error(e);
                        reject(xhr.responseText);
                    }
                }
            };
            xhr.send('x=getVariableByID&y=' + var_id);
        });
    }
    addToUI(callback) {
        this.addToTable();
        if (this.type == graph.typeOfController.slider) {
            this.addSlider(callback);
        }
        if (this.type == graph.typeOfController.toggle) {
            this.addToggle(callback);
        }
    }
    addToTable() {
        let row = this.elTable.append('tr')
            .attr('class', 'graph-UI-table-tr graph-UI-table-variable')
            .attr('title', 'drag me into the formula');
        row.append('td')
            .attr('class', 'graph-UI-info-copy')
            .html(`<span data-type="` + this.type + `" data-name="` + this.short_code_name + `" data-drop='<hr class="graph-UI-input-tags" data-alias="` + this.short_code_name + `" data-value="` + this.link_uid + `">'>` + this.short_code_name + `</span>`);
        row.append('td')
            .html(this.title + `(` + this.short_code_name + `)`);
        let update = row.append('td')
            .style('text-align', 'right')
            .style('padding-right', '5px')
            .html(this.value.toString());
        row.append('td')
            .html(this.unit);
        this.elUpdate.push(update);
    }
    addSlider(callback) {
        let newslider = new sliderVariable(this.min, this.max, this.value, this.short_code_name, this.unit, this.elControllers);
        newslider.activate((amount) => {
            this.elUpdate.map((locations) => {
                locations.html(amount);
                this.value = amount;
            });
            callback(amount);
        });
    }
    addToggle(callback) {
        let newToggle = new toggleVariable(this.alias1, this.alias2, this.short_code_name, this.value1, this.value2, this.elControllers);
        newToggle.activate((amount) => {
            this.elUpdate.map((locations) => {
                locations.html(amount);
                this.value = amount;
            });
            callback(amount);
        });
    }
    internalStackCompare() {
        this.fromJSON({
            "uid": -1,
            "type": graph.typeOfController.internalStackCompare,
            "short_code_name": "internalStackCompare",
            "alias1": 'Stacked',
            "value1": graph.TypeOfComparison.Stacked,
            "alias2": 'Compared',
            "value2": graph.TypeOfComparison.Compare
        });
        return this;
    }
}
class graph {
    constructor() {
        this.tooltip = new tooltip();
        this.usedFields = [];
        this.impekts = [];
        this.valueArray = [];
        this.variables = [];
        this.svg = d3.select("#graph");
        this.mainGroup = this.svg.append("g").attr('class', 'main');
        d3.selectAll('.graph-buttons-group').remove();
        this.elControllers = d3.select('.graph-graph').append('div').attr('class', 'graph-buttons-group');
        this.sizing();
        this.loader(true);
        this.TypeOfComparison = settings.TypeOfComparison;
    }
    buildGraph() {
        return new Promise((resolve, reject) => {
            this.importData(settings.ids)
                .catch((error) => {
                console.error(error);
                this.loader(false);
                this.errors(true, 'There is a technical error, contact Admin');
            })
                .then((arrayOfImpekts) => {
                this.impekts = arrayOfImpekts;
                this.AmountOfComparison = (this.impekts.length === 1) ? graph.AmountOfComparison.one : graph.AmountOfComparison.multiples;
                this.addVariables();
                this.update(true);
                this.addButtons();
                this.loader(false);
                resolve();
            });
        });
    }
    importData(ids) {
        let Promises = [];
        ids.map((id) => {
            Promises.push(new impekt(id).databaseRequest(this.variables));
        });
        return Promise.all(Promises);
    }
    addVariables() {
        this.impekts.map(impekt => impekt.links.filter(e => { return e.variable; }).map(link => {
            link.variable.elControllers = this.elControllers;
            this.variables.push(link.variable);
        }));
    }
    addButtons() {
        let internalStackCompare = new variable();
        internalStackCompare.elControllers = this.elControllers;
        internalStackCompare.internalStackCompare();
        internalStackCompare.type = graph.typeOfController.internalStackCompare;
        internalStackCompare.addToggle((TypeOfComparison) => {
            this.setMode(TypeOfComparison);
        });
    }
    setUsedFields() {
        this.impekts.map((x) => {
            this.usedFields.push.apply(this.usedFields, Object.keys(x.impactdata.filter(x => x.dataset === 2)[0])
                .filter(x => !(x == "impekts" || x == "id" || x == "impact_id" || x == "version" || x == "date" || x == "uid")));
        });
        this.usedFields = this.usedFields.filter((item, pos) => this.usedFields.indexOf(item) == pos);
    }
    loader(show) {
        if (show === true) {
            d3.select('svg#graph .main').html(`<svg version="1.1" x="` + (this.width / 2 - 50) + `" y="` + (this.height / 2 - 50) + `" width="100" height="100" id="impektLogoLoader" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 100" xml:space="preserve"><path fill="none" class="loaderRight" stroke="#000" stroke-width="5" d="M116.077,76.085c27.202,33.218,45.571,8.413,45.571-26.012c0-41.059-26.131-68.432-77.018,0"/><path fill="none" class="loaderLeft" stroke="#000" stroke-width="5" d="M116.077,76.085c27.202,33.218,45.571,8.413,45.571-26.012c0-41.059-26.131-68.432-77.018,0" transform='scale(-1 -1)translate(-200 -100)'/></svg>`);
        }
        else {
            d3.select('svg#impektLogoLoader').remove();
        }
    }
    sizing() {
        let svgNode = this.svg.node().parentNode;
        let fullwidth = svgNode.getBoundingClientRect().width;
        let fullheight = svgNode.getBoundingClientRect().height;
        this.width = fullwidth - settings.margin.left - settings.margin.right;
        this.height = (this.n > 1) ? this.n * 60 : 300;
        let svgHeight = this.height + settings.margin.bottom + settings.margin.top;
        this.svg.attr("width", fullwidth).attr("height", svgHeight);
        this.mainGroup.attr("transform", "translate(" + settings.margin.left + "," + settings.margin.top + ")");
        this.svg.style('fill', '#ef0');
    }
    setMode(mode) {
        this.TypeOfComparison = mode;
        this.update();
    }
    errors(active, message, techinal) {
        if (active) {
            this.errorState = true;
            d3.selectAll('.graph-UI-info-error').html(message);
            this.mainGroup
                .attr('pointer-events', 'none')
                .transition()
                .duration(300)
                .attr('opacity', '0.1');
            this.tooltip.showError(message, techinal);
            d3.selectAll('.graph-UI-info-error').html(message);
            console.error(message + ' | ' + techinal);
            throw new Error(message);
        }
        else {
            this.errorState = false;
            d3.selectAll('.graph-UI-info-error').html('');
            this.mainGroup
                .transition()
                .duration(100)
                .attr('opacity', '1')
                .attr('pointer-events', 'initial');
            this.tooltip.hide();
        }
    }
    update(redraw) {
        redraw = (redraw) ? true : false;
        this.errorState = false;
        this.valueArray = [];
        this.d3DataArray = [];
        if (redraw) {
            this.setUsedFields();
            this.impekts.map((impekt) => {
                impekt.compileFormula((error) => {
                    this.loader(false);
                    this.errors(true, error);
                });
            });
        }
        this.impekts.map((impekt) => {
            impekt.calculateData(this.usedFields, this.variables, (error, technical) => { this.errors(true, error, technical); });
            impekt.calculatedData.map((x) => { this.valueArray.push(x); });
        });
        if (!this.errorState)
            this.errors(false);
        let newN = this.valueArray[0].data.length;
        if (this.n !== newN) {
            this.n = newN;
            redraw = true;
        }
        let newM = this.valueArray.length;
        if (this.m !== newM) {
            this.m = newM;
            redraw = true;
        }
        let series = this.impekts.map(impekt => impekt.calculatedData.map(x => x.title))[0];
        this.d3DataArray = d3.stack().keys(d3.range(this.m))(d3.transpose(this.valueArray.map(e => e.data)));
        if (redraw) {
            this.mainGroup.selectAll(".v").remove();
            this.series = this.mainGroup
                .selectAll(".v")
                .data(this.d3DataArray)
                .enter().append("g")
                .attr('class', 'v')
                .attr("fill", function (d, i) {
                return color[i];
            })
                .attr("data-serie", (d, i) => { return series[i]; })
                .attr("data-serieID", (d, i) => { return i; });
            this.mainGroup.selectAll(".blokgroup").remove();
            this.group = this.series.selectAll(".blokgroup")
                .data(function (d) { return d; })
                .enter()
                .append("g")
                .attr('class', 'blokgroup');
        }
        else {
            this.series.data(this.d3DataArray);
            this.series.selectAll(".blokgroup").data(function (d) { return d; });
            this.series.selectAll(".bars").data(function (d) { return d; });
            this.series.selectAll(".labels").data(function (d) { return d; });
        }
        this.updateCoordinateSystem();
        this.svgDrawAxis(redraw);
        this.svgDrawBlocks(redraw);
        this.svgDrawLabels(redraw);
        this.svgDrawLegend(redraw);
        this.interactive();
    }
    updateFormula(newFormula) {
        this.errorState = false;
        this.impekts[0].newFormula(newFormula, (error) => {
            if (error)
                this.errors(true, error);
        });
        if (this.errorState) {
            this.errors(false);
        }
    }
    updateCoordinateSystem() {
        this.dataMax = d3.max(this.d3DataArray, function (x) { return d3.max(x, function (d) { return d[1] - d[0]; }); });
        this.stackMax = d3.max(this.d3DataArray, function (x) { return d3.max(x, function (d) { return d[1]; }); });
        this.sizing();
        this.xScale = d3.scaleLinear().range([0, this.width]);
        this.yScale = d3.scaleBand().domain(d3.range(this.n)).rangeRound([0, this.height]).padding(0.18);
        if (this.TypeOfComparison === graph.TypeOfComparison.Compare)
            this.xScale.domain([0, this.dataMax]);
        if (this.TypeOfComparison === graph.TypeOfComparison.Stacked)
            this.xScale.domain([0, this.stackMax]);
    }
    svgDrawAxis(redraw) {
        let xAx = d3.axisBottom(this.xScale).tickSize(5).ticks(5).tickPadding(6);
        let yAx = d3.axisLeft(this.yScale).tickSize(0);
        if (redraw) {
            this.svg.selectAll('.axis--x').remove();
            this.svg.selectAll('.axis--y').remove();
            this.xAxis = this.mainGroup.append("g").attr("class", "axis axis--x");
            this.yAxis = this.mainGroup.append("g").attr("class", "axis axis--y");
            this.xAxis.attr('opacity', '0.5');
            this.yAxis.attr('opacity', '0.5');
            this.yAxis.call(yAx);
            this.yAxis.selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-0.1em")
                .attr("dy", "-.3em")
                .attr("width", "40px")
                .attr("fill", "rgba(0,0,0,0.8)")
                .attr("transform", "rotate(-25)")
                .text((d, i, arr) => {
                if (this.usedFields[i].length < 10) {
                    return this.usedFields[i];
                }
                else {
                }
                ;
            });
        }
        this.xAxis
            .transition()
            .duration(500)
            .attr("transform", "translate(0," + this.height + ")")
            .call(xAx)
            .selectAll("text")
            .text(function (d, i) { return PrettyNumber(d); });
    }
    svgDrawBlocks(redraw) {
        if (redraw) {
            this.svg.selectAll('.blocks').remove();
            this.barsRect = this.group.append("rect").attr('class', 'bars')
                .attr("x", 0)
                .attr("y", (d, i) => { return this.yScale(i.toString()); })
                .attr("height", this.yScale.bandwidth())
                .attr("width", 0)
                .attr("data-serieID", (d, i, arr) => {
                let index = arr[i].parentNode.parentNode.getAttribute('data-serieID');
                return index;
            });
        }
        if (this.TypeOfComparison === graph.TypeOfComparison.Compare) {
            this.barsRect.transition()
                .duration(500)
                .delay((d, i) => { return i * 50; })
                .attr("y", (d, i, arr) => {
                var id = parseInt(arr[i].getAttribute('data-serieID'));
                let w = this.yScale(i.toString()) + this.yScale.bandwidth() / this.m * id;
                return isNaN(w) ? 0 : w;
            })
                .attr("height", this.yScale.bandwidth() / this.m)
                .transition()
                .attr("x", (d, i) => {
                let w = this.xScale(d[1] - d[0]) - this.xScale(d[1] - d[0]);
                return isNaN(w) ? 0 : w;
            })
                .attr("width", (d) => {
                let w = this.xScale(d[1] - d[0]);
                return isNaN(w) ? 0 : w;
            });
        }
        if (this.TypeOfComparison === graph.TypeOfComparison.Stacked) {
            this.barsRect.transition()
                .duration(500)
                .delay(function (d, i) { return i * 50; })
                .attr("x", (d) => {
                let w = this.xScale(d[0]);
                return isNaN(w) ? 0 : w;
            })
                .attr("width", (d) => {
                let w = this.xScale(d[1]) - this.xScale(d[0]);
                return isNaN(w) ? 0 : w;
            })
                .transition()
                .attr("y", (d, i) => {
                let w = this.yScale(i.toString());
                return isNaN(w) ? 0 : w;
            })
                .attr("height", this.yScale.bandwidth());
        }
    }
    svgDrawLabels(redraw) {
        if (redraw) {
            this.svg.selectAll('.labels').remove();
            this.barsLabel = this.group.append("text")
                .attr("class", "labels").attr("fill", "black").attr("y", (d, i) => { return this.yScale(i.toString()) + this.yScale.bandwidth() / 2; }).attr("text-anchor", "begin")
                .attr("dx", ".35em")
                .attr('word-spacing', '0.5px')
                .attr("data-serieID", (d, i, arr) => {
                let index = arr[i].parentNode.parentNode.getAttribute('data-serieID');
                return index;
            });
        }
        if (this.TypeOfComparison === graph.TypeOfComparison.Compare) {
            this.barsLabel.transition()
                .duration(500)
                .attr("y", (d, i, arr) => {
                var id = parseInt(arr[i].getAttribute('data-serieID'));
                let w = this.yScale(i.toString()) + this.yScale.bandwidth() / this.m * id;
                return isNaN(w) ? 0 : w;
            })
                .transition()
                .attr("x", d => {
                let w = this.xScale(d[1] - d[0]);
                return isNaN(w) ? 0 : w;
            })
                .text((d) => { return PrettyNumber(d[1] - d[0]); })
                .attr("fill", "white")
                .attr("text-anchor", "end")
                .attr("alignment-baseline", "text-before-edge")
                .attr("dx", "-.35em")
                .attr("opacity", "1")
                .filter((d) => {
                return this.xScale(d[1]) - this.xScale(d[0]) < 50;
            })
                .attr("fill", "black")
                .attr("text-anchor", "begin")
                .attr("dx", ".35em");
        }
        if (this.TypeOfComparison === graph.TypeOfComparison.Stacked) {
            this.barsLabel.transition()
                .duration(500)
                .attr("x", (d) => {
                let w = this.xScale(d[1]);
                return isNaN(w) ? 0 : w;
            })
                .transition()
                .attr("opacity", "0")
                .attr("alignment-baseline", "hanging")
                .text((d) => { return PrettyNumber(d[1]); })
                .attr("y", (d, i) => {
                let w = this.yScale(i.toString()) + this.yScale.bandwidth() / 3;
                return isNaN(w) ? 0 : w;
            })
                .filter((d, i, arr) => {
                return this.xScale(d[1]) - this.xScale(d[0]) > 100;
            })
                .attr("fill", "white")
                .attr("text-anchor", "end")
                .attr("alignment-baseline", "hanging")
                .attr("dx", "-.35em")
                .attr("opacity", "1")
                .filter((d) => {
                return this.xScale(d[1]) - this.xScale(d[0]) < 50;
            })
                .attr("fill", "black")
                .attr("text-anchor", "begin")
                .attr("dx", ".35em");
        }
    }
    svgDrawLegend(redraw) {
        let labelheight = 12;
        this.svg.selectAll('.legend').remove();
        this.barsLegend = this.series.append("g").attr('class', 'legend');
        let legendtext = this.barsLegend.append('text');
        let legenditem = this.barsLegend.append("rect");
        legendtext
            .text((d, i) => { return '' + d.set; })
            .attr("x", (d, i) => { return this.width - (40 * ((this.m) * 2)); })
            .attr("text-anchor", "end")
            .attr("alignment-baseline", "hanging")
            .attr("y", -labelheight - 10)
            .attr("opacity", "0")
            .attr('class', 'text')
            .attr('fill', '#000');
        legenditem.attr("x", (d, i) => { return this.width - (40 * ((this.m) * 1.5)) + (i * 40 * 1.5); })
            .attr("y", -labelheight - 10)
            .attr("height", labelheight)
            .attr("width", 40)
            .attr('stroke', (d, i) => { return color[i]; })
            .attr("class", "legendblock")
            .attr("opacity", "1");
        if (this.m === 1)
            legendtext.attr("opacity", "1");
    }
    interactive() {
        this.barsLegend
            .on("mouseover", (d, i, v) => {
            this.series.filter(function (dd, ii) { return i !== ii; })
                .transition()
                .duration(200)
                .selectAll('.blokgroup')
                .style("opacity", 0);
        })
            .on("mouseout", (d) => {
            this.series.transition()
                .duration(500)
                .selectAll('.blokgroup')
                .style("opacity", 1);
        });
        this.barsRect
            .on("mouseover", (d, i, arr) => {
            this.tooltip.show(arr[i].parentNode.parentNode.getAttribute('data-serie') + "<br/>" + this.usedFields[i] + ': ' + PrettyNumber(d[1] - d[0]), d3.mouse(this.svg.node())["0"], d3.mouse(this.svg.node())["1"]);
        })
            .on("mouseout", (d) => { this.tooltip.hide(); });
    }
}
(function (graph) {
    let TypeOfComparison;
    (function (TypeOfComparison) {
        TypeOfComparison[TypeOfComparison["Compare"] = 0] = "Compare";
        TypeOfComparison[TypeOfComparison["Stacked"] = 1] = "Stacked";
    })(TypeOfComparison = graph.TypeOfComparison || (graph.TypeOfComparison = {}));
    let AmountOfComparison;
    (function (AmountOfComparison) {
        AmountOfComparison[AmountOfComparison["one"] = 0] = "one";
        AmountOfComparison[AmountOfComparison["multiples"] = 1] = "multiples";
    })(AmountOfComparison = graph.AmountOfComparison || (graph.AmountOfComparison = {}));
    let typeOfLink;
    (function (typeOfLink) {
        typeOfLink[typeOfLink["subimpekt"] = 0] = "subimpekt";
        typeOfLink[typeOfLink["variable"] = 1] = "variable";
    })(typeOfLink = graph.typeOfLink || (graph.typeOfLink = {}));
    let typeOfController;
    (function (typeOfController) {
        typeOfController[typeOfController["toggle"] = 0] = "toggle";
        typeOfController[typeOfController["slider"] = 1] = "slider";
        typeOfController[typeOfController["internalStackCompare"] = 2] = "internalStackCompare";
    })(typeOfController = graph.typeOfController || (graph.typeOfController = {}));
})(graph || (graph = {}));
class impekt {
    constructor(uid) {
        this.tags = [];
        this.links = [];
        this.impactdata = [];
        this.calculatedData = [];
        this.uid = uid;
    }
    ;
    bindData(json) {
        try {
            this.uid = json.uid;
            this.impact_id = json.impact_id;
            this.version = json.version;
            this.subversion = json.subversion;
            this.long_code_name = json.long_code_name;
            this.title = json.title;
            this.sub_title = json.sub_title;
            this.short_code_name = json.short_code_name;
            this.maingroup = json.maingroup;
            this.subgroup = json.subgroup;
            this.unit = json.unit;
            this.descr = json.descr;
            this.excl = json.excl;
            this.tags = json.tags;
            this.date = json.date;
            this.formula = json.formula;
            json.impactdata.map(e => {
                let newLink = new impektdata(e);
                this.impactdata.push(newLink);
            });
            if (Array.isArray(json.impactvariables)) {
                json.impactvariables.map(e => {
                    let newLink = new link(e);
                    this.links.push(newLink);
                });
            }
            if (Array.isArray(json.subimpact)) {
                json.subimpact.map((e, i) => {
                    let newLink = new link(e);
                    this.links.push(newLink);
                });
            }
            console.log('Links:', this.links);
            return this;
        }
        catch (e) {
            console.error(e);
        }
    }
    ;
    databaseRequest(variables) {
        let promise = new Promise((resolve, reject) => {
            let uid = this.uid;
            if (uid > -1) {
                let url = 'https://u39639p35134.web0087.zxcs-klant.nl/api/';
                let xhr = new XMLHttpRequest();
                xhr.open("POST", url, true);
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                xhr.onreadystatechange = () => {
                    if (xhr.readyState == 4 && xhr.status == 202) {
                        try {
                            let jsonData = JSON.parse(xhr.responseText);
                            return resolve(this.bindData(jsonData[0]));
                        }
                        catch (e) {
                            return reject(xhr.responseText);
                        }
                    }
                    else {
                        if (xhr.status == 0) {
                            return reject('Service down');
                        }
                        else if (xhr.status != 202) {
                            console.error('wrong header', xhr);
                            return reject('headers');
                        }
                    }
                };
                xhr.send('x=getData&y=' + this.uid);
            }
            else {
                return reject('Id ' + this.uid + ' should be bigger than 0');
            }
        });
        return promise;
    }
    ;
    newFormula(newFormula, callback) {
        this.formula = newFormula;
        this.compileFormula(callback);
    }
    compileFormula(callback) {
        console.log('compiling', this);
        let reg = /(\[.+?\])/g;
        this.formula.map((formula) => {
            let evalValueParts = formula.technical.toString().split(reg).filter((val) => val);
            let readParts = formula.technical.toString().split(reg).filter((val) => val);
            let hrParts = formula.technical.toString().split(reg).filter((val) => val);
            for (var i = 0, j = evalValueParts.length; i < j; i += 1) {
                if (evalValueParts[i].includes('[')) {
                    var x = parseInt(evalValueParts[i].slice(1, -1));
                    if (this.links.map(e => e.link_uid).indexOf(x) > -1) {
                        let link = this.links.filter(e => { return e.link_uid == x; })[0];
                        evalValueParts[i] = link;
                        readParts[i] = link.getAlias();
                        hrParts[i] = '<hr class="graph-UI-input-tags" data-alias="' + link.getAlias() + '" data-value="' + x + '">';
                    }
                    else {
                        console.error('getFormula Unknown Tag in Formula: ', x, this.links.map(e => e.link_uid));
                        callback('getFormula Unknown Tag in Formula: ' + x);
                    }
                }
                else {
                }
            }
            formula.evalValue = evalValueParts;
            formula.readable = readParts.join('');
            formula.hr = hrParts.join('');
        });
    }
    calculateData(usedFields, given_variable, callback) {
        this.calculatedData = [];
        this.formula.map((formula) => {
            let calData = { data: [], title: formula.title };
            calData.data =
                usedFields.map((field) => {
                    let evalValue = formula.evalValue.map((part) => {
                        if (typeof part == 'object') {
                            return '(' + part.getValue(field, given_variable) + ')';
                        }
                        else {
                            return part;
                        }
                    }).join('');
                    try {
                        return isFinite(eval(evalValue)) && eval(evalValue) >= 0 ? eval(evalValue) : 0;
                    }
                    catch (e) {
                        console.error('Formula:', evalValue, formula.evalValue, formula.technical);
                        callback(this.readableFormulaErrors(e.message, formula.readable), e.message);
                    }
                });
            this.calculatedData.push(calData);
        });
    }
    readableFormulaErrors(message, formula) {
        let mess = message;
        if (message.indexOf("Cannot read property 'value' of") > -1) {
            mess = 'Cannot find right variable(s):';
        }
        if (mess.indexOf("Invalid regular expression") > -1) {
            mess = 'Unexpected start of: <b>/</b> ';
        }
        if (mess.indexOf("Unexpected end of input") > -1) {
            mess = 'Unbalanced formula: <b>( [ ] )</b>';
        }
        if (mess.indexOf("is not a function") > -1) {
            mess = 'Missing sign around tag';
        }
        if (mess.indexOf("Invalid or unexpected token") > -1 ||
            mess.indexOf("Unexpected token class") > -1) {
            mess = 'Unknown text in formula';
        }
        if (mess.indexOf("Invalid left-hand side expression in postfix operation") > -1 ||
            mess.indexOf("Unexpected identifier") > -1) {
            mess = 'No proper use of symbols: + - / *';
        }
        return '<b>Formula error:</b><br/> ' + mess + '<br/><i>' + formula + '</i>';
    }
}
class subimpekt extends impekt {
    constructor(uid) {
        super(uid);
    }
    ;
    getSubImpektData(field) {
        return this.impactdata[0][field];
    }
}
class impektdata {
    constructor(json) {
        this.date = json.date;
        this.impact_id = json.impact_id;
        this.dataset = json.dataset;
        this.uid = json.uid;
        this.version = json.version;
        this.co2 = json.co2;
        this.energy = json.energy;
        this.polution = json.polution;
        this.water = json.water;
    }
}
class link {
    constructor(json) {
        this.link_uid = json.link_uid;
        this.link_version = json.link_version;
        this.link_linked_id = json.link_linked_id;
        this.link_date = json.link_date;
        this.link_type = json.link_type;
        this.link_amount = json.link_amount;
        this.link_advanced = json.link_advanced;
        this.link_changeable = json.link_changeable;
        this.link_descr = json.link_descr;
        if (this.link_type == graph.typeOfLink.subimpekt) {
            this.subimpact = new subimpekt(json.uid);
            this.subimpact.bindData(json);
            this.link_alias = json.short_code_name;
        }
        if (this.link_type == graph.typeOfLink.variable) {
            this.variable = new variable().fromJSON(json);
            this.link_alias = json.short_code_name;
        }
    }
    ;
    getValue(field, given_variable) {
        if (this.link_type == graph.typeOfLink.subimpekt) {
            return this.subimpact.getSubImpektData(field);
        }
        if (this.link_type == graph.typeOfLink.variable) {
            return given_variable.filter((e) => { return e.link_uid == this.link_uid; })[0].value;
        }
    }
    getAlias() {
        return this.link_alias;
    }
}
