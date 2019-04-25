
/* 
 * // ShortCuts:
 * 
 * AutoLayout
 *      Ctrl K + F (doc: Ctrl K D)
 *      
 *
 *
 * https://web0087.zxcs.nl/phpmyadmin/sql.php?server=1&db=u39639p35134_impekt&table=impekt&pos=0
 *      
 * ToDo:
 * Comparision
 * Limit max numbers 9000000
 * Formula: Tag+a works = 0 , but no error
 * */



///////////// Others /////////////
function PrettyNumber(num, number?: boolean): string | number {
    let significance: number = 3
    let strlen: number
    let clean: number
    let RNum

    if (num == 0) { return '0'; }


    if (num > 10) { // Large Numbers
        strlen = (num.toFixed(0) + '').length
        clean = Math.pow(10, strlen - significance)
        RNum = parseInt((num / clean).toFixed(0)) * clean
        return (number) ? RNum : RNum.toLocaleString('fr-EG');
    }
    else if (num > 1) { // between 1 and 10
        strlen = (num.toFixed(0) + '').length
        clean = Math.pow(10, strlen - significance + 1) 	// -1 
        RNum = parseInt((num / clean).toFixed(1)) * clean			// +1

        return (number) ? RNum : RNum.toLocaleString('fr-EG');
    }
    else { // between 0 and 1 (starting with 0.)
        num = num.toFixed(100)
        clean = Math.abs(Math.floor(Math.log10(num)))
        RNum = (num + '').substring(0, clean + significance + 1)

        return (number) ? RNum : RNum.substring(0, 4) + " " + RNum.substring(4).replace(/(.{3})/g, "$1");
    }

}


class tooltip {
    select: d3.Selection<HTMLElement, {}, HTMLElement, any>
    x: number
    y: number
    text: string

    constructor() {
        this.select = d3.select(".graph-graph").append("div").attr("class", "tooltip").style("opacity", "0")
    };

    show(html: string, mouseX: number, mouseY: number) {

        this.select
            // make sure its empty
            .style("width", '')
            .style("bottom", '')
            .style("background", "")
            .style("margin", "")
            .style("padding", "")
            // change first HTML
            .html(html)
            .style("left", mouseX + "px")
            .style("top", mouseY + "px")
            // Fade in
            .transition()
            .duration(200)
            .style("opacity", .9)


    };

    showError(message: string, techinal: any) {
        let width = (<HTMLElement>this.select.node()).parentElement.getBoundingClientRect().width;
        this.select
            .html(message)
            .style("background", "#d85555")
            .style("margin", "0 40px")
            .style("left", "")
            .style("top", "")
            .style("bottom", "0")
            .style("width", (width - 80) + "px")
            .style("padding", "40px 0")
            // Fade in
            .transition()
            .duration(200)
            .style("opacity", .9)
    };

    hide() {
        this.select.transition().duration(200).style("opacity", 0)
    };


}

interface Iimpekt {
    uid: number;
    impact_id: number;
    version: number;
    subversion: number;
    long_code_name: string;
    title: string;
    sub_title: string;
    short_code_name: string;
    maingroup: string;
    subgroup: string;
    unit: string;
    descr: string;
    excl: string;
    tags: string[];
    date: string;
    links: link[] | number[];
    formula: Iformula[];
    impactdata: any[];
}
interface Iformula {
    technical: string
    title: string
    evalValue?: any
    readable?: string
    hr?: string
}
interface calculatedData {
    title: string
    data: number[]
}




///////////// Variables /////////////
class toggleVariable {
    alias1: string
    alias2: string
    id: string
    value1: string | number
    value2: string | number
    parentNode: d3.Selection<HTMLElement, any, HTMLElement, any>
    el: d3.Selection<HTMLElement, any, HTMLElement, any>
    value: number | graph.TypeOfComparison | string
    location: any
    constructor(alias1, alias2, id, value1, value2, parentNode) {

        this.alias1 = alias1
        this.alias2 = alias2
        this.id = id
        this.value1 = value1
        this.value2 = value2
        this.parentNode = parentNode
        this.createHTML()

    }
    private createHTML() {
        let uniqueName = this.id + "_" + this.alias1 + "_" + this.alias2


        this.el = this.parentNode.append('div')
            .attr('class', 'graph-buttons-switch').attr('title', uniqueName).attr('id', uniqueName)


        this.el.append('input')
            .attr('class', 'graph-buttons-switch-input')
            .attr('type', 'radio')
            .attr('name', uniqueName)
            .attr('value', '' + this.value1 + '')
            .attr('id', this.id + "_" + this.value1)
            .attr('type', 'radio')
            .property("checked", true)
        this.el.append('label')
            .attr('for', this.id + "_" + this.value1)
            .attr('class', 'graph-buttons-switch-label graph-buttons-switch-label-off')
            .html(this.alias1)


        this.el.append('input')
            .attr('class', 'graph-buttons-switch-input')
            .attr('type', 'radio')
            .attr('name', uniqueName)
            .attr('value', '' + this.value2 + '')
            .attr('id', this.id + "_" + this.value2)
            .attr('type', 'radio')
        this.el.append('label')
            .attr('for', this.id + "_" + this.value2)
            .attr('class', 'graph-buttons-switch-label graph-buttons-switch-label-on')
            .html(this.alias2)




        this.el.append('span')
            .attr('class', 'graph-buttons-switch-selection')



    }

    activate(callback) {
        this.el
            .on("mousedown touchstart", () => {
                this.el.classed("active", true)




                let mousemove = () => {
                    let switcherbbox = (<HTMLElement>this.el.node()).getBoundingClientRect()
                    let xcoord = d3.mouse(this.el.node())[0]
                    xcoord = (xcoord > switcherbbox.width / 2) ? switcherbbox.width / 2 : xcoord
                    xcoord = (xcoord < 0) ? 0 : xcoord
                    this.el.select('.graph-buttons-switch-selection').attr('style', 'left:' + xcoord + 'px;');
                }


                let mouseup = () => {
                    //console.log('mouseup')

                    let switcherbbox = (<HTMLElement>this.el.node()).getBoundingClientRect()
                    let xcoord = d3.mouse(this.el.node())[0]

                    // over half? pick value
                    this.value = (xcoord > switcherbbox.width / 2) ? this.value2 : this.value1;

                    // check the right input
                    this.el.selectAll('input').filter((d, i, arr) => { return (<HTMLElement>arr[i]).getAttribute('id') === this.id + "_" + this.value; }).property("checked", true);
                    w.on("mousemove", null).on("mouseup", null);

                    this.el.classed("active", false);
                    this.el.select('.graph-buttons-switch-selection').attr('style', '');

                    //console.log('mouseup', this.value)
                    callback(this.value)

                }
                d3.event.preventDefault()
                let w = this.el.on("mousemove touchmove", mousemove)
                    .on("mouseup touchend", mouseup);



            });
    }

}
class sliderVariable {
    min: number
    max: number
    step: number
    id: string
    value: number
    alias: string
    unit: string
    parentNode: d3.Selection<HTMLElement, any, HTMLElement, any>
    el: d3.Selection<HTMLElement, any, HTMLElement, any>
    timeout: any
    elUpdate: d3.Selection<HTMLElement, any, HTMLElement, any>[]


    constructor(min, max, step, value, alias, unit, parentNode) {
        this.min = min
        this.max = max
        this.step = step
        this.value = value
        this.alias = alias
        this.unit = unit
        this.parentNode = parentNode

        this.createHTML()

    }

    private createHTML() {

        //this.step = (this.max - this.min) / 40 // 30 steps in a slider
        //this.step = <number>PrettyNumber(this.step, true)

        this.id = 'variable_' + this.alias

        this.el = this.parentNode.append('div').attr('class', 'graph-buttons-slider')
            .attr('title', this.alias)


        this.el.append('input')
            .attr('type', 'range')
            .attr('min', this.min)
            .attr('max', this.max)
            .attr('value', this.value)
            .attr('step', this.step)
            .attr('data-unit', this.unit)
            .attr('name', this.alias)

        this.el.append('a')
            .attr('title', "More info")
            .attr('href', "#" + this.id)
            .html(this.alias)







    }

    activate(callback) {

        let updateValues = () => {

            if (this.elUpdate) {
                this.elUpdate.map((locations) => {
                    locations.html((<HTMLInputElement>this.el.select('input').node()).value)
                })
            }
            this.el.select('a').html((<HTMLInputElement>this.el.select('input').node()).value + ' ' + this.el.select('input').attr('data-unit'))

        }
        let mouseUp = () => {
            updateValues() // Update for Click only
            let value = (<HTMLInputElement>this.el.select('input').node()).value
            this.el.select('input').on("mousemove", null).on("mouseup", null);
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => { this.el.select('a').html((<HTMLInputElement>this.el.select('input').node()).name) }, 600);
            callback(value);

        }

        this.el.select('input')
            .on("mousedown touchstart", () => {
                this.el.select('input')
                    .on("mousemove touchmove", updateValues)
                    .on("mouseup touchend click touch", mouseUp);
            });
    }

}
class variable {
    // Elements for this link only
    link_uid: number
    value: number

    // Standard elements for this variable
    long_code_name: string
    short_code_name: string
    sub_title: string
    title: string
    uid: number
    unit: string
    var_id: number
    version: number
    versionID: number
    descr: string
    type: graph.typeOfVariable


    advanced: boolean;
    changeable: boolean;

    // Sliders
    max: number
    min: number
    step: number

    // Toggle
    value1: any
    alias1: string
    value2: any
    alias2: string

    // Extra D3 elements
    elControllers: d3.Selection<HTMLElement, any, HTMLElement, any>
    elTable: d3.Selection<HTMLElement, any, HTMLElement, any>
    elUpdate: d3.Selection<HTMLElement, any, HTMLElement, any>[] = [];


    constructor() { }
    fromJSON(json: any): variable {

        // link values
        /*this.link_amount = json.link_amount
        this.link_advanced = json.link_advanced
        this.link_changeable = json.link_changeable
        this.link_date = json.link_date
        this.link_descr = json.link_descr
        this.link_linked_id = json.link_linked_id
        this.link_type = json.link_type
        this.link_version = json.link_version*/
        this.link_uid = json.link_uid // For finding the right formula parts! (can be changed to ALIAS!)

        // Variable standards
        this.long_code_name = json.long_code_name
        this.short_code_name = json.short_code_name
        this.sub_title = json.sub_title
        this.title = json.title
        this.uid = json.uid
        this.unit = json.unit
        this.var_id = json.var_id
        this.version = json.version
        this.versionID = json.versionID
        this.descr = json.descr
        this.type = json.type

        // Sliders
        this.max = json.max
        this.min = json.min
        this.step = json.step

        // Toggle
        this.value1 = json.value1
        this.alias1 = json.alias1
        this.value2 = json.value2
        this.alias2 = json.alias2


        return this
    }
    fromID(var_id): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let url = 'https://u39639p35134.web0087.zxcs-klant.nl/api/'
            let xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var jsonData
                    try {
                        jsonData = JSON.parse(xhr.responseText)[0];
                        resolve(this.fromJSON(jsonData))
                    } catch (e) {
                        console.error(e);
                        reject(xhr.responseText);

                    }

                }
            }
            xhr.send('x=getVariableByID&y=' + var_id);
        })




    }



    // Called from addToUi or addToTable
    addConrollers(elControllers, callback) {
        if (this.type == graph.typeOfVariable.slider) {
            this.addSlider(elControllers, callback)
        }
        if (this.type == graph.typeOfVariable.toggle) {
            this.addToggle(elControllers, callback)
        }
    }

    // Add classes and update
    addSlider(elControllers, callback) {

        let newslider = new sliderVariable(this.min, this.max, this.step, this.value, this.short_code_name, this.unit, elControllers)
        newslider.elUpdate = this.elUpdate;
        // on change do this
        newslider.activate((amount) => {
            this.elUpdate.map((locations) => {
                locations.html(amount);
                this.value = amount;
            })
            callback(amount);

        })
    }
    addToggle(elControllers, callback) {
        let newToggle = new toggleVariable(this.alias1, this.alias2, this.short_code_name, this.value1, this.value2, elControllers)

        // on change do this
        newToggle.activate((amount) => {
            this.elUpdate.map((locations) => {
                locations.html(amount);
                this.value = amount;
            })

            callback(amount);

        })
    }

    // Interal fixed buttons
    internalStackCompare() {
        this.fromJSON({
            "uid": -1,
            "type": graph.typeOfVariable.internalStackCompare,
            "short_code_name": "internalStackCompare",
            "alias1": 'Stacked',
            "value1": graph.TypeOfComparison.Stacked,
            "alias2": 'Compared',
            "value2": graph.TypeOfComparison.Compare

        })
        return this
    }
    // Interal fixed buttons
    internalSimpleAdvanced() {
        this.fromJSON({
            "uid": -1,
            "type": graph.typeOfVariable.internalSimpleAdvanced,
            "short_code_name": "internalSimpleAdvanced",
            "alias1": 'Simple',
            "value1": graph.TypeOfComparison.Stacked,
            "alias2": 'Advanced',
            "value2": graph.TypeOfComparison.Compare

        })
        return this
    }
}



///////////// Main Graph /////////////
class graph {

    TypeOfComparison: graph.TypeOfComparison
    AmountOfComparison: graph.AmountOfComparison
    tooltip: tooltip = new tooltip();
    svg: d3.Selection<SVGElement, {}, HTMLElement, any>
    mainGroup: d3.Selection<SVGElement, {}, HTMLElement, any>
    series: d3.Selection<SVGElement, any, SVGElement, any>
    group: d3.Selection<SVGElement, any, SVGElement, any>
    barsLabel: d3.Selection<SVGElement, any, SVGElement, any>
    barsRect: d3.Selection<SVGElement, any, SVGElement, any>
    barsLegend: d3.Selection<SVGElement, any, SVGElement, any>
    height: number
    width: number
    usedFields: string[] = [];
    impekts: impekt[] = [];
    valueArray: calculatedData[] = [];
    d3DataArray: d3.SeriesPoint<{ [key: string]: number; }>[][]
    n: number
    m: number
    dataMax: number
    stackMax: number
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleBand<string>
    xAxis: any
    yAxis: any
    elControllers: d3.Selection<HTMLElement, any, HTMLElement, any>
    variables: variable[] = [];
    mode: graph.mode;

    errorState: boolean

    constructor() {
        // Set basics
        this.svg = d3.select("#graph");
        this.mainGroup = this.svg.append("g").attr('class', 'main');


        d3.selectAll('.graph-buttons-group').remove()
        this.elControllers = d3.select('.graph-graph').append('div').attr('class', 'graph-buttons-group')

        // Initial sizing
        this.sizing();

        // Show loader
        this.loader(true);


        // Default: Stacked Mode 
        this.TypeOfComparison = settings.TypeOfComparison;



    }

    // Start building from constuctor
    buildGraph(): Promise<void> {
        return new Promise((resolve) => {

            this.importData(settings.ids)
                .catch((error) => {
                    console.error(error)
                    this.loader(false);
                    this.errors(true, 'There is a technical error, contact Admin')
                })
                .then((arrayOfImpekts) => {

                    this.impekts = arrayOfImpekts;
                    this.AmountOfComparison = (this.impekts.length === 1) ? graph.AmountOfComparison.one : graph.AmountOfComparison.multiples;



                    this.addVariables();


                    this.update(true)

                    this.addButtons()
                    this.loader(false);
                    resolve()
                })


        })


    }

    // For all IDs get the data 
    importData(ids: number[]): Promise<any> {

        // Array of promises
        let Promises: Promise<any>[] = []

        // For each ID
        ids.map((id) => {


            Promises.push(new impekt(id).databaseRequest(this.variables))
        });

        return Promise.all(Promises)

    }

    addVariables() {


        // For every variable
        this.impekts.map(impekt => impekt.links.filter(e => { return e.variable }).map(link => {

            link.variable.elControllers = this.elControllers;

            //Todo? no update
            this.variables.push(link.variable)
        }))


    }


    // Add Default buttons
    addButtons() {
        /*
        let internalSimpleAdvanced = new variable()
        internalSimpleAdvanced.elControllers = this.elControllers
        internalSimpleAdvanced.internalSimpleAdvanced();
        internalSimpleAdvanced.type = graph.typeOfVariable.internalSimpleAdvanced
        internalSimpleAdvanced.addToggle(this.elControllers, (mode) => {
            this.changeMode(mode)
        });*/

        let internalStackCompare = new variable()
        internalStackCompare.elControllers = this.elControllers
        internalStackCompare.internalStackCompare();
        internalStackCompare.type = graph.typeOfVariable.internalStackCompare
        internalStackCompare.addToggle(this.elControllers, (TypeOfComparison) => {
            this.setTypeOfComparison(TypeOfComparison)
        });


    }

    // Extract all used field trough all impekts
    setUsedFields() {
        // ToDo, also for subimpekts
        try {
            this.impekts.map((x) => { // For every impekts
                this.usedFields.push.apply(this.usedFields,
                    Object.keys(x.impactdata.filter(x => x.dataset === 2)[0])// Merge new fields into array
                        .filter(x => !(x == "impekts" || x == "id" || x == "impact_id" || x == "version" || x == "date" || x == "uid" || x == "dataset")) // Except these
                )
            })
        }
        catch (e) {
            this.usedFields.push('co2')
            //this.usedFields.push('energy')
            console.warn('No data here, standard aspects of impekt')
        }


        this.usedFields = this.usedFields.filter((item, pos) => this.usedFields.indexOf(item) == pos) // Dont know Filter?
    }

    // Starts the loader Icon
    loader(show: boolean) {
        if (show === true) {
            d3.select('svg#graph .main').html(`<svg version="1.1" x="` + (this.width / 2 - 50) + `" y="` + (this.height / 2 - 50) + `" width="100" height="100" id="impektLogoLoader" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 100" xml:space="preserve"><path fill="none" class="loaderRight" stroke="#000" stroke-width="5" d="M116.077,76.085c27.202,33.218,45.571,8.413,45.571-26.012c0-41.059-26.131-68.432-77.018,0"/><path fill="none" class="loaderLeft" stroke="#000" stroke-width="5" d="M116.077,76.085c27.202,33.218,45.571,8.413,45.571-26.012c0-41.059-26.131-68.432-77.018,0" transform='scale(-1 -1)translate(-200 -100)'/></svg>`)
        } else {
            d3.select('svg#impektLogoLoader').remove();
        }

    }

    // Basic Resizing of the whole graph, based on amount of rows in graph
    sizing() {

        let svgNode: HTMLElement = <HTMLElement>this.svg.node().parentNode
        let fullwidth = svgNode.getBoundingClientRect().width;
        let fullheight = svgNode.getBoundingClientRect().height;



        // Resize
        this.width = fullwidth - settings.margin.left - settings.margin.right
        this.height = (this.n > 0) ? this.n * 60 : 300;

        let svgHeight = this.height + settings.margin.bottom + settings.margin.top

        // Set full height and with to SVG
        this.svg.attr("width", fullwidth).attr("height", svgHeight);
        // Move maingroup to margins as translation
        this.mainGroup.attr("transform", "translate(" + settings.margin.left + "," + settings.margin.top + ")")

        this.svg.style('fill', '#ef0')

    }

    // Change from Stack or Compare mode
    setTypeOfComparison(mode: graph.TypeOfComparison) {
        this.TypeOfComparison = mode;
        this.update();
    }

    // Change mode
    changeMode(mode) {
        console.log('Go to ', mode)
    }


    // If graph has any Error go here.
    errors(active: boolean, message?: string, techinal?: any) {

        if (active) {

            this.errorState = true
            d3.selectAll('.graph-UI-info-error').html(message)
            this.mainGroup
                .attr('pointer-events', 'none')
                .transition()
                .duration(300)
                .attr('opacity', '0.1')
            this.tooltip.showError(message, techinal);
            d3.selectAll('.graph-UI-info-error').html(message)
            console.error(message + ' | ' + techinal)
            throw new Error(message);
        } else {
            this.errorState = false
            d3.selectAll('.graph-UI-info-error').html('')
            this.mainGroup
                .transition()
                .duration(100)
                .attr('opacity', '1')
                .attr('pointer-events', 'initial')
            this.tooltip.hide();
        }

    }

    // Updates Graph
    update(redraw?: boolean) {

        // Reset some parameters
        redraw = (redraw) ? true : false; // based on more impekts or more elements
        this.errorState = false; // Check if an error is raied in caluclation data
        this.valueArray = [] // Clean
        this.d3DataArray = [] // Clean


        if (redraw) {
            // set used fields
            this.setUsedFields();
            // Check formula
            this.impekts.map((impekt) => {
                impekt.compileFormula((error) => {
                    this.loader(false);
                    this.errors(true, error); // Errors: unknown [tags] in formula
                })
            })
        }

        this.impekts.map((impekt) => {

            //Calculate data based on formula
            impekt.calculateData(this.usedFields, this.variables, (error, technical) => { this.errors(true, error, technical) }); // Callback: Error

            // Add calculated data to graph class
            impekt.calculatedData.map((x) => { this.valueArray.push(x) })

        })
        // If no new errors, clear the error
        if (!this.errorState) this.errors(false);

        // Y scale = elements
        let newN = this.valueArray[0].data.length;
        if (this.n !== newN) {
            this.n = newN
            redraw = true
        }
        // Amount of parts/colors (so legend items)
        let newM = this.valueArray.length;
        if (this.m !== newM) {
            this.m = newM
            redraw = true
        }


        // transpose data into D3 easy format (get calculated data)
        let series: string[] = this.impekts.map(impekt => impekt.calculatedData.map(x => x.title))[0]
        this.d3DataArray = d3.stack().keys(<any>d3.range(this.m))(<any>d3.transpose(this.valueArray.map(e => e.data)));


        if (redraw) {
            // Per impekt one group
            this.mainGroup.selectAll(".v").remove()
            this.series = this.mainGroup
                .selectAll(".v")
                .data(this.d3DataArray)
                .enter().append("g")
                .attr('class', 'v')
                .attr("fill", function (d, i) {
                    return color[i];
                })
                .attr("data-serie", (d, i) => { return series[i]; })
                .attr("data-serieID", (d, i) => { return i; })

            // Horizontal sets
            this.mainGroup.selectAll(".blokgroup").remove()
            this.group = this.series.selectAll(".blokgroup")
                .data(function (d) { return d; })
                .enter()
                .append("g")
                .attr('class', 'blokgroup')
        }
        // only update the data
        else {
            //console.log('No data change, just update')
            this.series.data(this.d3DataArray);
            this.series.selectAll(".blokgroup").data(function (d) { return d; });
            this.series.selectAll(".bars").data(function (d) { return d; });
            this.series.selectAll(".labels").data(function (d) { return d; });
        }

        // Add SVG to the graph
        this.updateCoordinateSystem()
        this.svgDrawAxis(redraw)
        this.svgDrawBlocks(redraw);
        this.svgDrawLabels(redraw);
        this.svgDrawLegend(redraw);


        this.interactive()

    }

    //with single impekt, update impeks[]
    updateFormula(newFormula) {

        this.errorState = false;

        this.impekts[0].newFormula(newFormula, (error) => {
            if (error) this.errors(true, error); // Errors: unknown [tags] in formula
        })


        if (this.errorState) { this.errors(false); }// If no new errors, clear the error
    }



    updateCoordinateSystem() {

        // max values (horizontal)
        this.dataMax = d3.max(this.d3DataArray, function (x) { return d3.max(x, function (d) { return d[1] - d[0]; }); });
        this.stackMax = d3.max(this.d3DataArray, function (x) { return d3.max(x, function (d) { return <number>d[1]; }); });

        this.sizing(); // Update before create scales!

        // Calculate the x and y scale
        this.xScale = d3.scaleLinear().range([0, this.width]);
        this.yScale = d3.scaleBand().domain(<any>d3.range(this.n)).rangeRound([0, this.height]).padding(0.18);
        if (this.TypeOfComparison === graph.TypeOfComparison.Compare) this.xScale.domain([0, this.dataMax])
        if (this.TypeOfComparison === graph.TypeOfComparison.Stacked) this.xScale.domain([0, this.stackMax])
    }
    svgDrawAxis(redraw: boolean) {
        let xAx: d3.Axis<d3.AxisDomain> = d3.axisBottom(this.xScale).tickSize(5).ticks(5).tickPadding(6);
        let yAx: d3.Axis<d3.AxisDomain> = d3.axisLeft(this.yScale).tickSize(0);



        if (redraw) {

            this.svg.selectAll('.axis--x').remove();
            this.svg.selectAll('.axis--y').remove();
            // Create elements
            this.xAxis = this.mainGroup.append("g").attr("class", "axis axis--x")
            this.yAxis = this.mainGroup.append("g").attr("class", "axis axis--y")

            this.xAxis.attr('opacity', '0.5')
            this.yAxis.attr('opacity', '0.5')


            this.yAxis.call(yAx);
            this.yAxis.selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-0.1em")
                .attr("dy", "-.3em")
                .attr("width", "40px")
                .attr("fill", "rgba(0,0,0,0.8)")
                .attr("transform", "rotate(-25)")
                .text((d, i, arr) => {
                    if (this.usedFields[i].length < 10) { return this.usedFields[i] }
                    else {
                        //.append('text').text('hahah');
                        /*var node = d3.select(this).node();
                        var extra = d3.select(node.parentNode.insertBefore(node.cloneNode(true), node.nextSibling));
                        extra.text(usedfields[i].split(' ')[1]).attr("dy", ".5em");
                        return usedfields[i].split(' ')[0] + '' //10*/
                    }
                    ;
                });

        }

        this.xAxis
            .transition()
            .duration(500)
            .attr("transform", "translate(0," + this.height + ")") // move {height} down
            .call(xAx)
            .selectAll("text")
            .text(function (d, i) { return PrettyNumber(d); });

    }
    svgDrawBlocks(redraw: boolean) {




        if (redraw) { // if Redraw or Newgraphs
            this.svg.selectAll('.blocks').remove();
            this.barsRect = this.group.append("rect").attr('class', 'bars')
                .attr("x", 0)
                .attr("y", (d, i) => { return this.yScale(i.toString()); })
                .attr("height", this.yScale.bandwidth())
                .attr("width", 0)
                .attr("data-serieID", (d, i, arr, ) => {
                    let index = (<HTMLElement>arr[i].parentNode.parentNode).getAttribute('data-serieID')
                    return index;
                })
        }


        if (this.TypeOfComparison === graph.TypeOfComparison.Compare) {
            this.barsRect.transition()
                .duration(500)
                .delay((d, i) => { return i * 50; })
                .attr("y", (d, i, arr, ) => {
                    var id: number = parseInt((<SVGElement>arr[i]).getAttribute('data-serieID'))
                    let w = this.yScale(i.toString()) + this.yScale.bandwidth() / this.m * id
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
        //default
        if (this.TypeOfComparison === graph.TypeOfComparison.Stacked) {
            //console.log('Stacked',this.xScale(3))
            this.barsRect.transition()
                .duration(500)
                .delay(function (d, i) { return i * 50; })
                .attr("x", (d) => {
                    let w = this.xScale(d[0]);
                    return isNaN(w) ? 0 : w;
                })
                .attr("width", (d) => {
                    let w: number = this.xScale(d[1]) - this.xScale(d[0])
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
    svgDrawLabels(redraw: boolean) {
        if (redraw) {
            this.svg.selectAll('.labels').remove();
            this.barsLabel = this.group.append("text")
                .attr("class", "labels").attr("fill", "black").attr("y", (d, i) => { return this.yScale(i.toString()) + this.yScale.bandwidth() / 2; }).attr("text-anchor", "begin")
                .attr("dx", ".35em")
                .attr('word-spacing', '0.5px')
                .attr("data-serieID", (d, i, arr, ) => {
                    let index = (<HTMLElement>arr[i].parentNode.parentNode).getAttribute('data-serieID')
                    return index;
                })
        }



        if (this.TypeOfComparison === graph.TypeOfComparison.Compare) {
            // text
            this.barsLabel.transition()
                .duration(500)
                .attr("y", (d, i, arr) => {
                    var id: number = parseInt((<SVGElement>arr[i]).getAttribute('data-serieID'))
                    let w = this.yScale(i.toString()) + this.yScale.bandwidth() / this.m * id
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
                }) // remove smaller than 50px
                .attr("fill", "black")

                .attr("text-anchor", "begin")
                .attr("dx", ".35em")

        }
        if (this.TypeOfComparison === graph.TypeOfComparison.Stacked) {
            this.barsLabel.transition()
                .duration(500)
                .attr("x", (d) => {
                    let w = this.xScale(d[1]);
                    return isNaN(w) ? 0 : w;
                })
                .transition()

                //.attr("dy", ".35em")
                .attr("opacity", "0")
                .attr("alignment-baseline", "hanging")
                .text((d) => { return PrettyNumber(d[1]); })
                .attr("y", (d, i) => {
                    let w = this.yScale(i.toString()) + this.yScale.bandwidth() / 3;
                    return isNaN(w) ? 0 : w;
                })
                .filter((d, i, arr) => {
                    return this.xScale(d[1]) - this.xScale(d[0]) > 100 /*|| arr[i].parentNode.parentNode.__data__.key == (this.m - 1); */

                }) // remove smaller than 50px
                .attr("fill", "white")
                .attr("text-anchor", "end")
                .attr("alignment-baseline", "hanging")
                .attr("dx", "-.35em")
                .attr("opacity", "1")
                .filter((d) => {
                    return this.xScale(d[1]) - this.xScale(d[0]) < 50;
                }) // remove smaller than 50px
                .attr("fill", "black")
                .attr("text-anchor", "begin")
                .attr("dx", ".35em")
        }

    }
    svgDrawLegend(redraw: boolean) {
        let labelheight = 12
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
            .attr('fill', '#000')
        legenditem.attr("x", (d, i) => { return this.width - (40 * ((this.m) * 1.5)) + (i * 40 * 1.5); })
            .attr("y", -labelheight - 10)
            .attr("height", labelheight)
            .attr("width", 40)
            .attr('stroke', (d, i) => { return color[i]; })
            .attr("class", "legendblock")
            .attr("opacity", "1");
        if (this.m === 1) legendtext.attr("opacity", "1");
    }

    interactive() {

        this.barsLegend
            .on("mouseover", (d, i, v) => {
                this.series.filter(function (dd, ii) { return i !== ii })
                    .transition()
                    .duration(200)
                    .selectAll('.blokgroup')
                    .style("opacity", 0);
                //d3.select(this.parentNode).selectAll('text').style("opacity", 1)
                //svgDrawLabels(false)
                //if (relative) refrect.transition().duration(200).attr("opacity", 0)
            })
            .on("mouseout", (d) => {
                this.series.transition()
                    .duration(500)
                    .selectAll('.blokgroup')
                    .style("opacity", 1);
                // d3.select(this.parentNode).selectAll('text').style("opacity", '')
                // svgDrawLabels(false)
                //if (relative) refrect.transition().duration(500).attr("opacity", 1)
            });
        /*if (relative) {
            refrect
                .on("mouseover", function (d, i) {
                    globals.tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    globals.tooltip.html("Ref value<br/>" + usedfields[i] + ': ' + PrettyNumber(d))
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function (d) {
                    globals.tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        }
        */
        this.barsRect
            .on("mouseover", (d, i, arr) => {
                this.tooltip.show(
                    // HTML:
                    (<HTMLElement>arr[i].parentNode.parentNode).getAttribute('data-serie') + "<br/>" + this.usedFields[i] + ': ' + PrettyNumber(d[1] - d[0])
                    , d3.mouse(<d3.ContainerElement>this.svg.node())["0"], d3.mouse(<d3.ContainerElement>this.svg.node())["1"])
            })
            .on("mouseout", (d) => { this.tooltip.hide(); });

    }

}
module graph {
    export enum mode {
        Simple,
        Advanced
    }
    export enum TypeOfComparison {
        Compare,
        Stacked
    }
    export enum AmountOfComparison {
        one,
        multiples
    }
    export enum typeOfLink {
        subimpekt,
        variable
    }
    export enum typeOfVariable {
        toggle,
        slider,
        internalStackCompare,
        internalSimpleAdvanced,
        picklist
    }
    export enum fields {
        co2
        , energy
        , polution
        , water
    }


}


///////////// Impekts /////////////


class impekt implements Iimpekt {



    uid: number;
    impact_id: number;
    version: number;
    subversion: number;
    long_code_name: string;
    title: string;
    sub_title: string;
    short_code_name: string;
    maingroup: string;
    subgroup: string;
    unit: string;
    descr: string;
    excl: string;
    tags: string[] = []
    date: string;
    edited: boolean;
    links: link[] = [];
    formula: Iformula[];
    impactdata: impektdata[] = []

    variables: any[]
    subimpekts: any[]

    calculatedData: calculatedData[] = []



    constructor(uid: number) {
        this.uid = uid;
    };

    bindData(json): impekt {

        try {
            // Simple fields
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
                let newLink = new impektdata(e)
                this.impactdata.push(newLink)

            })


            // include links
            if (Array.isArray(json.subimpact)) {
                json.subimpact.map((e, i) => {
                    let newLink = new link(e)
                    this.links.push(newLink)
                })
            }
            if (Array.isArray(json.impactvariables)) {
                json.impactvariables.map(e => {
                    let newLink: link = new link(e)
                    this.links.push(newLink)

                })
            }


            //console.log('Links:', this.links)
            return this;
        }
        catch (e) {
            console.error(e);
        }

    };

    databaseRequest(variables): Promise<impekt> {
        let promise = new Promise<any>((resolve, reject) => {
            let uid = this.uid
            if (uid > -1) {


                let url = 'https://u39639p35134.web0087.zxcs-klant.nl/api/'


                let xhr = new XMLHttpRequest();
                xhr.open("POST", url, true);
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                xhr.onreadystatechange = () => {
                    if (xhr.readyState == 4) {

                        if (xhr.status == 202) {

                            try {
                                let jsonData = JSON.parse(xhr.responseText);
                                return resolve(this.bindData(jsonData[0]));

                            } catch (e) {
                                return reject(xhr.responseText);
                            }

                        }
                        else if (xhr.status == 400) { // Known Errors in API
                            return reject(JSON.parse(xhr.responseText))
                        }
                        else if (xhr.status == 200) {
                            console.error(xhr.responseText)

                            return reject('Internal Error')
                        }
                        else if (xhr.status == 0) {
                            return reject('Highlikely SSL error');
                        }

                        else {
                            console.error(xhr)
                            return reject('Wrong header: ' + xhr.status)
                        }

                    }
                    // Never reach 
                    else {
                        if (xhr.status == 0) { // API Down... :(
                            return reject('Service down, status 0')
                        }

                    }
                }
                xhr.send('x=getData&y=' + this.uid);


            } else {
                return reject('Id ' + this.uid + ' should be bigger than 0');
            }


        });

        return promise;

    };


    newFormula(newFormula: Iformula[], callback) {
        this.formula = newFormula
        this.compileFormula(callback)
    }
    compileFormula(callback) {

        console.log('compiling', this)
        let reg = /(\[.+?\])/g
        this.formula.map((formula) => { // Per sub formula compile


            let evalValueParts: any[] = formula.technical.toString().split(reg).filter((val) => val)
            let readParts: string[] = formula.technical.toString().split(reg).filter((val) => val)
            let hrParts: string[] = formula.technical.toString().split(reg).filter((val) => val)


            for (var i = 0, j = evalValueParts.length; i < j; i += 1) {

                if (evalValueParts[i].includes('[')) { // For {items} 

                    var x = parseInt(evalValueParts[i].slice(1, -1)) // Get value outside []

                    if (this.links.map(e => e.link_uid).indexOf(x) > -1) {


                        let link: link = this.links.filter(e => { return e.link_uid == x })[0]
                        evalValueParts[i] = link
                        readParts[i] = link.getAlias()
                        hrParts[i] = '<hr class="graph-UI-input-tags" data-alias="' + link.getAlias() + '" data-value="' + x + '">'
                    }
                    // Error		
                    else {
                        if (Number.isNaN(x)) { x = evalValueParts[i] }
                        console.error('Tag', x, ' unknown in formula: ', formula, 'available codes: ', this.links.map(e => e.link_uid))
                        //console.error('codeParts', codeParts[i])
                        //console.error('short_code_name', this.short_code_name)
                        //console.error('subimpact', this.subimpact.map(e => e.short_code_name))
                        //console.error('variables', this.variables.map(e => e.short_code_name))
                        callback('There is a unclear part in the formula: ' + x);
                    }



                }
                else {
                    // Normal characters
                }

            }



            formula.evalValue = evalValueParts

            formula.readable = readParts.join('')
            formula.hr = hrParts.join('')

        })
    }
    calculateData(usedFields: string[], given_variable, callback) {

        // Update variables in impekt from Graph


        this.calculatedData = [] // clean
        this.formula.map((formula) => {


            let calData: calculatedData = { data: [], title: formula.title };
            calData.data =
                usedFields.map((field): number => { // for each active field

                    let evalValue = formula.evalValue.map((part: link) => {
                        // Special link 
                        if (typeof part == 'object') {
                            return '(' + part.getValue(field, given_variable) + ')'
                        }
                        // Normal formula parts
                        else {
                            return part
                        }
                    }).join('')

                    try {// Check if number and catch errors
                        //console.log(evalValue, formula.evalValue, formula.technical)
                        return isFinite(eval(evalValue)) && eval(evalValue) >= 0 ? eval(evalValue) : 0;
                    }
                    catch (e) { // If error, make them readble and go callback!
                        console.error('Formula:', evalValue, formula.evalValue, formula.technical)
                        callback(this.readableFormulaErrors(e.message, formula.readable), e.message);
                    }
                })
            // Set back to instance
            this.calculatedData.push(calData)

        })

    }
    readableFormulaErrors(message, formula) {
        let mess = message
        if (message.indexOf("Cannot read property 'value' of") > -1) {
            mess = 'Cannot find right variable(s):'
        }

        if (mess.indexOf("Invalid regular expression") > -1) {
            mess = 'Unexpected start of: <b>/</b> '
        }
        if (mess.indexOf("Unexpected end of input") > -1) {
            mess = 'Unbalanced formula: <b>( [ ] )</b>'
        }
        if (mess.indexOf("is not a function") > -1) {
            mess = 'Missing sign around tag'
        }
        if (mess.indexOf("Invalid or unexpected token") > -1 ||
            mess.indexOf("Unexpected token class") > -1) {
            mess = 'Unknown text in formula'
        }
        if (mess.indexOf("Invalid left-hand side expression in postfix operation") > -1 ||
            mess.indexOf("Unexpected identifier") > -1
        ) {
            mess = 'No proper use of symbols: + - / *'
        }
        return '<b>Formula error:</b><br/> ' + mess + '<br/><i>' + formula + '</i>'

    }




}
class subimpekt extends impekt {

    constructor(uid: number) {
        super(uid);
    };

    getSubImpektData(field) {
        return this.impactdata[0][field];
    }
}
class impektdata {
    // basic
    date: string
    impact_id: number
    dataset: number
    uid: number
    version: number

    // data fields
    co2: number
    energy: number
    polution: number
    water: number
    constructor(json) {
        this.date = json.date
        this.impact_id = json.impact_id
        this.dataset = json.dataset
        this.uid = json.uid
        this.version = json.version

        // data fields
        this.co2 = json.co2
        this.energy = json.energy
        this.polution = json.polution
        this.water = json.water
    }
}


class link {
    link_uid: number;
    link_version: number;
    link_linked_id: number;
    link_date: string;
    link_type: graph.typeOfLink;
    link_amount: number;
    link_advanced: boolean;
    link_changeable: boolean;
    link_descr: string;
    link_alias: string;
    subimpact: subimpekt;
    variable: variable;
    edited: boolean;

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
            this.subimpact = new subimpekt(json.link_linked_id)
            this.subimpact.bindData(json);
            this.link_alias = json.short_code_name;
        }

        else if (this.link_type == graph.typeOfLink.variable) {
            this.variable = new variable().fromJSON(json);
            this.variable.value = this.link_amount;
            if (this.link_advanced) this.variable.advanced = this.link_advanced;
            if (this.link_changeable) this.variable.changeable = this.link_changeable;
            this.link_alias = json.short_code_name;
        }
        // If newly created
        else {
            this.link_alias = json.link_alias;
        }
    };
    getValue(field, given_variable) {
        if (this.link_type == graph.typeOfLink.subimpekt) {
            return this.subimpact.getSubImpektData(field);
        }
        if (this.link_type == graph.typeOfLink.variable) {
            let oneVar = given_variable.filter((variable) => { return variable.link_uid == this.link_uid })
            if (oneVar.length > 0) {
                return oneVar[0].value
            } else {
                console.error('ERROR', given_variable, oneVar.length, this.link_uid)
            }

        }
    };
    getAlias() {
        return this.link_alias
    };

}






let settings = {
    margin: { top: 40, right: 0, bottom: 30, left: 90 },
    TypeOfComparison: 1,
    ids: [100],
    barheight: 50,
    mode: graph.mode.Simple
}
let x
let color = ['#157a6e', '#ffba49', '#da2c38', '#87c38f', '#b8b8d1']









