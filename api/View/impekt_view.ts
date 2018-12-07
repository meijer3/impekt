﻿

/* This Typescript is meant for Impekt Viewer */




class UI {
    graph: graph
    title: string = ''
    subtitle: string = ''
    elUI: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elFormula: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elAdvanced: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elAdvancedError: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elAdvancedForm: d3.Selection<HTMLElement, {}, HTMLElement, any>[] = [];
    elInfo: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elTable: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elImpekt: d3.Selection<HTMLElement, {}, HTMLElement, any>
    elResource: d3.Selection<HTMLElement, {}, HTMLElement, any>
    timeout: any



     
    constructor(graph) {
        this.graph = graph
        this.elUI = d3.select('.graph-container').append('div').attr('class', 'graph-UI-group')
        this.elAdvanced = this.elUI.append('div').attr('class', 'graph-UI-advanced')
        this.elFormula = this.elUI.append('div').attr('class', 'graph-UI-formula')
        this.elImpekt = this.elUI.append('div').attr('class', 'graph-UI-impekt')
        this.elResource = this.elUI.append('div').attr('class', 'graph-UI-resource')
    }

    // Update UI
    update() {
        this.setTitle();
        if (this.graph.AmountOfComparison == graph.AmountOfComparison.one) {

            this.addOverviewFormula();
            this.addAdvanced();
            this.addAdvancedFormula();
            this.addImpekt();
            this.addResource()
        }
        this.addVariable()
    }

    // Updates the variables inside graph (also used for calculating data)
    addVariable() {        
        this.graph.variables.map((variable) => {
            variable.elTable = this.elTable
            variable.addSlider(() => { this.graph.update() });
            variable.addToTable();
        })
    }

    // Get from a change in formula (typing or adding HR-tag)
    decodeFormula() {
        //this.graph.errors(false);

        // Decode HR into normal formula like in de DB
        let newFormula: Iformula[] = []
        this.elAdvancedForm.map((formulaPart, k) => {

            let HRformula = formulaPart.html();
            let technicalFormula: string = HRformula
                .replace(/  /g, ' ')
                .split(/(<hr.+?>+)/g)
                .filter(x => x/*.trim()*/)
                .map((x) => {

                    if (x.indexOf('<hr') === 0) {
                        let value = x.match(/data-alias=".*?"/g)[0]
                        return ('[' + value.substring(12, value.length - 1) + ']')
                    }
                    else {
                        return x;
                    }
                })
                .join('')
            // Create new formula and put in Array()
            let newFormulaPart: Iformula = { title: this.graph.impekts[0].formula[k].title, technical: technicalFormula }
            newFormula.push(newFormulaPart)
        })
        this.graph.impekts[0].edited = true;


        // Update formula 
        this.graph.updateFormula(newFormula)
        


        // Update graph
        this.graph.update();



        // Update also UI
        if (this.graph.AmountOfComparison == graph.AmountOfComparison.one) {
            this.addOverviewFormula();

        } else {
            console.log('requested soft data update, but will do a hard one, data changed too much')
            this.update() // Do hard update
        }
    }


    ///////////// Add data on build /////////////
    //Set title
    setTitle() {
        let subtitleString = ''
        if (this.graph.AmountOfComparison == graph.AmountOfComparison.one) {
            this.title = this.graph.impekts[0].title
            this.subtitle = this.graph.impekts[0].sub_title
            subtitleString = '<div  id="graph-UI-title-sub">' + this.graph.impekts[0].sub_title + '</div>'
        } else {
            this.title = this.graph.impekts.map(x => x.title).join(' ')
            this.subtitle = ''
        }
        d3.selectAll('.graph-title').remove()
        d3.select('.graph-container')
            .insert('h1', '.graph-graph')
            .attr('class', 'graph-title')
            .html('<div id="graph-UI-title-main">' + this.title + '</div>' + subtitleString)
    }
    // Add text formula to mainpage
    addOverviewFormula() {
        this.elFormula.html('')
        this.elFormula.append('h4').html('Formula')
        let singleImpekt = this.graph.impekts[0]

        if (typeof singleImpekt.formula !== "undefined") {
            // Input JSON formula with name and groups
            // Outputs a Formula with {<hr>+<hr>}
            // In the end formula is like a update


            // per group in formula
            for (var k = 0, groups = singleImpekt.formula.length; k < groups; k += 1) {
                if (k !== 0) { // Skip first but add + sign
                    this.elFormula.append('div').attr('class', 'sign').html('+').style('display', 'inline-block')
                }
                this.elFormula.append('div')
                    .attr('class', 'graph-UI-info-form graph-form-hr')
                    .attr('id', 'graph-UI-info-form-' + k)
                    .attr('title', singleImpekt.formula[k].title)
                    .html(singleImpekt.formula[k].hr)
                    .style('border-bottom', ' solid 2px' + color[k])
                this.resizeAllFormulaBlocks() // Update so the HR are not collapsed
            }
        }

    }
    // Adds advanced folding div
    addAdvanced() {

        this.elAdvanced.html('')
        var block = this.elAdvanced.append('div').attr('id', 'graph-group-main')

        // Advanced button
        let label = block.append('label')
            .attr('class', 'settings-button')
        label.append('input')
            .attr('class', 'settings-toggle-main')
            .attr('type', 'checkbox')
        label.append('span')
        label.append('span')
        label.append('span')
        label.append('span')
        label.append('div')
        label.on('change', () => { this.toggleAdvanced() })

        // Info div
        this.elInfo = block.append('div').attr('class', 'graph-UI-info').attr('id', 'graph-UI-info-main')
        this.elInfo.style('max-height', '0px')




        // Overview Table
        this.elTable = this.elInfo.append('table')
        this.elTable.append('tr').html("<th></th><th>Forumla</th><th colspan='2' style='text-align:center;	padding: 5px 20px 5px 0;' >Value</th><th></th>")
        this.graph.impekts[0].subimpact.map((e) => { // Add subimpekts to table

            this.elTable.append('tr')
                .attr('class', 'graph-UI-table-tr graph-UI-table-impact')
                .attr('title', 'drag me into the formula')
                .html(`
                    <td class="graph-UI-info-copy"><span data-type="`+ graph.typeOfLink.subimpekt + `" data-name="` + e.short_code_name + `" data-drop='<hr class="graph-UI-input-tags" data-alias="` + e.short_code_name + `" data-value="dataset[0].subimpact[` + e.localid + `].impactdata[0][field]">'>` + e.short_code_name + `</span></td>
                    <td>` + e.title + ` (` + e.short_code_name + `)</td>
                    <td colspan='2' style='text-align:center;' class='vari_` + e.short_code_name + `'><a href='#id_` + e.short_code_name + `' title='More information'>Fixed</a></td>
                `)
        })

        this.elAdvancedError = this.elInfo.append('div').attr('class', 'graph-UI-info-error')





        // Lines are added in addFormula()


        this.makeTableRowDraggable()
    }
    // Adds formula to advanced section
    addAdvancedFormula() {


        let singleImpekt = this.graph.impekts[0]

        if (typeof singleImpekt.formula !== "undefined") {
            // Input JSON formula with name and groups
            // Outputs a Formula with {<hr>+<hr>}
            // In the end formula is like a update


            // elAdvancedForm
            let elementForm = this.elInfo.append('div').attr('class', 'graph-UI-input-block')

            // per group in formula
            for (var k = 0, groups = singleImpekt.formula.length; k < groups; k += 1) {

                

                if (k !== 0) { // Skip first but add + sign
                    this.addAdvancedFormulaPlus()
                }

                this.addAdvancedFormulaPart(k, singleImpekt.formula[k].title, singleImpekt.formula[k].hr);

                this.resizeAllFormulaBlocks() // Update so the HR are not collapsed
            }
        }

    }
    // Adds one formula part
    addAdvancedFormulaPart(k, title,formula ) {
        let group = d3.select('.graph-UI-input-block')
            .append('div')
            .attr('class', 'graph-UI-input-group')
            .attr('data-part', k)


        // Edit section Title
        group
            .append('input')
            .attr('class', 'graph-UI-input-edit ')
            .attr('id', 'graph_ui_input_edit_' + k)
            .attr('data-part', k)
            .style('border-left-color', color[k])
            .property('value', title)
            .on('change', (d, i, arr) => { this.updateFormulaTitle(arr[i].value, arr[i].getAttribute('data-part')) })


        // Add 
        let el = group
            .append('div')
            .attr('class', 'graph-UI-input graph-form-hr')
            .attr('id', 'graph_ui_input_' + k)
            .attr('data-part', k)
            .attr('contenteditable', 'true')
            .attr('spellcheck', 'false')
            .attr('data-title', title)
            .style('border-left', ' solid 6px' + color[k])
            .html(formula)
            .on('keyup paste copy cut'/*, '[contenteditable]' */, () => {
                if ([16, 17, 18, 32, 27, 37, 38, 39, 40].indexOf(d3.event.keyCode) < 0) {
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => { this.decodeFormula(); }, 400);
                }
            })

        this.elAdvancedForm.push(el);
        return group
    }
    addAdvancedFormulaPlus() {
        d3.select('.graph-UI-input-block')
            .append('span')
            .attr('class', 'sign')
            .html('+')
            .style('font-size', '160%')
            .style('color', 'rgba(0,0,0,0.4)')
            .style('display', 'block')
            .style('clear', 'both')
            .style('height', '13px')
            .style('padding-top', '7px')


    }

    // Adds information about impekt
    addImpekt() {
        this.elImpekt.html('')
        // AddExplanation
        let singleImpekt = this.graph.impekts[0]
        if (singleImpekt.descr) {
            this.elImpekt.append('h4').html("Explanation")
            this.elImpekt.append('p').html(singleImpekt.descr).attr('class', 'graph-expl-explanation')//.attr('data-json', 'jsonData[0].explanation')
        }

        // Excluding
        if (singleImpekt.descr) {
            this.elImpekt.append('h4').html("Known exclusions")
            this.elImpekt.append('p').html(singleImpekt.excl).attr('class', 'graph-expl-exclusions')//.attr('data-json', 'jsonData[0].excl')
        }




    }
    addResource() {
        // Get all resources
        let list: string[] = []
        this.graph.impekts.map(impekt => {
            impekt.impactvariables.map((vari) => {
                list.push(vari.short_code_name);
            })
        })
        this.graph.impekts.map(impekt => {
            impekt.subimpact.map((subs) => {
                list.push(subs.short_code_name);
            })
        })

        var inlc = this.elImpekt.append('p').attr('class', 'graph-expl-included').html('<h4>Including</h4>')
        list.map(x => inlc.append('a').html('<a href="#resource_' + x + '">' + x + '</a>'))
    }

    ///////////// Controllers /////////////
    //Show or Hide advanced section
    toggleAdvanced(show?: boolean) {
        if (show) (<HTMLInputElement>this.elUI.select('.settings-toggle-main').node()).checked = true
        if ((<HTMLInputElement>this.elUI.select('.settings-toggle-main').node()).checked) {
            this.elInfo.style('max-height', '999px').transition().duration(500)//.style('margin','0 0 50px 0')
        } else {
            this.elInfo.style('max-height', '0').transition().duration(500)//.style('margin','0 0 0 0')
        }
    }
    // All formulas: make HR blocks right width
    resizeAllFormulaBlocks() {
        this.elUI.selectAll('.graph-form-hr hr').each((d, i, arr) => {
            let hr = <HTMLHRElement>arr[i]
            hr.style.width = (parseInt(window.getComputedStyle(hr, ':before').width.replace('px', '')) + 1) + 'px'
        })

    }
    // Advanced formula: Title change
    updateFormulaTitle(value, id) {
        this.graph.impekts[0].formula[id].title = value;

        this.graph.update(true);

    }
    // Advanced table: drag&drop
    makeTableRowDraggable() {
        // Drag and drop function
        this.elTable
            .selectAll('tr + tr').each(function () { d3.select(this) })
            .call(d3.drag()
                .on("start", (d, i, arr) => {

                    let info = this.elInfo
                    let divFormulas = this.elAdvancedForm//.selectAll('.graph-UI-input')

                    // Add gray blocks in Advanced>Formula>Inputs
                    let divIndex = 1
                    divFormulas.map((divFormula) => {


                        //var divFormula = d3.select(this)
                        var reg = /(<hr.+?>+)/g // optional whitespaces
                        var splits = divFormula.html().replace(/  /g, ' ').split(reg).filter(x => x//*.trim()
                        )

                        // remove empty parts

                        var forhtml = '<div class="div-small" id="X' + divIndex + '">' + '</div>'
                        divIndex += 1

                        for (var i = 0, j = splits.length; i < j; i += 1) {
                            if (splits[i].slice(0, 3) === '<hr') {
                                forhtml += '<p id="X' + divIndex + '">' + splits[i] + '</p>'
                                divIndex += 1
                            }
                            else {
                                var charsplits = splits[i].split(/\b/g).filter(function (x) { return x.trim() !== '' })
                                for (var k = 0, l = charsplits.length; k < l; k += 1) {
                                    forhtml += '<p id="X' + divIndex + '">' + charsplits[k] + '</p>'
                                    divIndex += 1
                                }

                            }
                            forhtml += '<div class="div-small" id="X' + divIndex + '">' + '</div>'
                            divIndex += 1
                        }

                        divFormula.html(forhtml)
                        divFormula.style('min-height', '60px').style('padding', '10px 0')
                        divFormula.selectAll('.div-small').style('width', '')
                    })


                    // First time update mouse
                    let coords = d3.mouse(info.node())
                    let dragable = d3.select(arr[i]).select('.graph-UI-info-copy span')


                    dragable
                        .style('position', "absolute")
                        .style('display', "block")
                        .style('left', coords[0] + "px")
                        .style('top', coords[1] + "px")
                        .style('margin-top', "-40px")

                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                        dragable.style('margin-top', "-30px")
                    }


                    ///////////////// Force New lines ///////////////////////////
                    /*positions=[]
                    info.selectAll('.graph-UI-input>*').each(function(d,i){
                        positions.push(this.getBoundingClientRect().y)
                    })
                    info.selectAll('.graph-UI-input').on('mouseover',function() {
                        // Get breakID	
                        info.selectAll('.graph-UI-input>*').each(function(d,i){
            
                            if (positions[i]+7<this.getBoundingClientRect().y){
                                var smallid = this.id.replace('X','')
                                if ( smallid > 3 && breakID > smallid && this.getAttribute('class') === "div-small"){
                                    breakID = smallid
                                }
                            }
                        })
                        // Remove other breakIDs
                        divFormula.selectAll('.graph-UI-input-break').remove()
                        // New breakID<
                        if(breakID!==999){
                            divFormula.insert('div','#X'+(breakID-1)).attr('class','graph-UI-input-break').html('<br/>')
                            // console.log("break here: X",breakID-1)				
                        }
            
                    })*/
                })
                .on("drag", (d, i, arr) => {

                    let info = this.elInfo

                    let coords = d3.mouse(info.node())
                    // console.log(coords)
                    let dragable = d3.select(arr[i]).select('.graph-UI-info-copy span')
                    dragable.style('margin-top', "-30px")
                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                        dragable.style('margin-top', "-30px")
                    }

                    dragable
                        .style('left', coords[0] + "px")
                        .style('top', coords[1] + "px")
                })
                .on("end", (d, i, arr) => {
                    //console.clear()
                    // Basics and reset
                    let inputBars = (this.elAdvancedForm)//.selectAll('.graph-UI-input') 
                    var dragable = d3.select(arr[i]).select('.graph-UI-info-copy span')

                    dragable
                        .style('position', "relative").style('left', "")
                        .style('top', "")
                        .style('display', "")

                    var targetDiv = <HTMLElement>d3.select('.div-small:hover').node()


                    // If drop on gray area:

                    var regstr = /(<div.+?\/div>)?(<p.+?>)?(<\/p>)?/g
                    if (targetDiv !== null //&& targetDiv.toString().indexOf('<div class="div-small"') ==0
                    ) {
                        // reset breakid
                        //breakID = 999
                        //inputBars.selectAll('.graph-UI-input-break').remove()


                        // Clean up all grey areas
                        inputBars.map((d, i, arr) => { // For each input field		
                            var inputBar = arr[i]
                            var newForm = inputBar.html()
                            if (newForm.split((<HTMLElement>targetDiv).outerHTML).length > 1) { // Only in the right input window
                                // Update html:
                                inputBar.html(newForm.split((<HTMLElement>targetDiv).outerHTML)[0].replace(regstr, '') + dragable.attr('data-drop') + newForm.split((<HTMLElement>targetDiv).outerHTML)[1].replace(regstr, ''))
                                this.decodeFormula()
                            }
                            else {// Other inputs that doesnot contain grey box: rebuilt formula
                                inputBar.html(inputBar.html().replace(regstr, ''))
                            }
                        })
                    }
                    else {
                        // Go back and do nothing (user missed gray boxes)
                        inputBars.map((d, i, arr) => { // For each input field		
                            var inputBar = arr[i]
                            inputBar.html(inputBar.html().replace(regstr, ''))
                        })
                    }


                    // reset layout
                    inputBars.map(function (d, e, i) { d3.select(this).style('min-height', '').transition().duration(500).style('padding', '') })

                    // Update HR blocks
                    this.resizeAllFormulaBlocks();

                })// end click-end
            ); // end call

    }
}


let y

window.onload = () => {
    x = new graph();
    y = new UI(x);
    x.buildGraph().then(() => {
        y.update();
        y.toggleAdvanced(true);
        //console.log(x.stackMax)
        //console.log(x.stackMax)
        //y.pushFormula();
        window.scrollTo(0, 0);
    });
};
