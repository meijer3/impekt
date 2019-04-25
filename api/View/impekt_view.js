function parseURLParams(url) {
    let queryStart = url.indexOf("?") + 1, queryEnd = url.indexOf("#") + 1 || url.length + 1, query = url.slice(queryStart, queryEnd - 1), pairs = query.replace(/\+/g, " ").split("&"), parms = {}, i, n, v, nv;
    if (query === url || query === "")
        return false;
    for (i = 0; i < pairs.length; i++) {
        nv = pairs[i].split("=", 2);
        n = decodeURIComponent(nv[0]);
        v = decodeURIComponent(nv[1]);
        if (!parms.hasOwnProperty(n))
            parms[n] = [];
        parms[n].push(nv.length === 2 ? v : null);
    }
    return parms;
}
function toggleMenu(x) {
    x.parentNode.parentNode.classList.toggle("header-menu-open");
}
class UIlink {
    constructor(UI, link) {
        this.UI = UI;
        this.link = link;
        this.addToTable();
        this.addToResource();
    }
    addToTable() {
        if (this.link.link_type == graph.typeOfLink.subimpekt) {
            let subimpekt = this.link.subimpact;
            let row = this.UI.elTable.append('tr')
                .attr('class', 'graph-UI-table-tr graph-UI-table-impact')
                .attr('title', 'drag me into the formula');
            row.append('td')
                .attr('class', 'graph-UI-info-copy')
                .html(`<span data-type="` + graph.typeOfLink.subimpekt + `" data-name="` + subimpekt.short_code_name + `" data-drop='<hr class="graph-UI-input-tags" data-alias="` + subimpekt.short_code_name + `" data-value="` + this.link.link_uid + `">'>` + subimpekt.short_code_name + `</span>`);
            row.append('td')
                .style('background-image', "url('../img/symbol_impekt.png')")
                .attr('class', 'symbol')
                .style('margin', '9px 14px -9px 0px')
                .attr('title', 'This is an impekt');
            row.append('td')
                .html(subimpekt.title + ` (` + subimpekt.short_code_name + `)`);
            row.append('td').attr('colspan', '2')
                .style('text-align', 'center')
                .html('-');
            row.append('td').append('a')
                .attr('href', '#' + this.link.link_alias)
                .attr('title', 'More information')
                .html('Info');
            row.append('td')
                .style('text-align', 'center')
                .html('-');
        }
        if (this.link.link_type == graph.typeOfLink.variable) {
            let row = this.UI.elTable.append('tr')
                .attr('class', 'graph-UI-table-tr graph-UI-table-variable')
                .attr('title', 'drag me into the formula');
            row.append('td')
                .attr('class', 'graph-UI-info-copy')
                .html(`<span data-type="` + this.link.variable.type + `" data-name="` + this.link.variable.short_code_name + `" data-drop='<hr class="graph-UI-input-tags" data-alias="` + this.link.variable.short_code_name + `" data-value="` + this.link.link_uid + `">'>` + this.link.variable.short_code_name + `</span>`);
            row.append('td')
                .style('background-image', "url('../img/symbol_variabele.png')")
                .attr('class', 'symbol')
                .style('margin', '9px 14px -9px 0px')
                .attr('title', 'This is a variable');
            row.append('td')
                .html(this.link.variable.title + ` (` + this.link.variable.short_code_name + `)`);
            let update = row.append('td')
                .style('text-align', 'right')
                .style('padding-right', '5px')
                .style('width', '50px')
                .html(this.link.variable.value.toString());
            this.link.variable.elUpdate.push(update);
            row.append('td')
                .html(this.link.variable.unit);
            row.append('td').append('a')
                .attr('href', '#' + this.link.link_alias)
                .attr('title', 'More information')
                .html('Info');
            if (this.link.link_advanced) {
                this.link.variable.addConrollers(row.append('td'), () => { this.UI.graph.update(); });
            }
            else {
                row.append('td').html('Change above')
                    .style('text-align', 'center');
                this.link.variable.addConrollers(this.UI.graph.elControllers, () => { this.UI.graph.update(); });
            }
        }
    }
    addToResource() {
        this.resource = new resource();
        this.resource.create(this.link, this.UI.elResource, this.UI.elIncl);
    }
}
class resource {
    create(oneLink, elResource, elIncl) {
        this.elResource = elResource;
        this.elIncl = elIncl;
        this.link_type = oneLink.link_type;
        if (this.link_type === graph.typeOfLink.variable) {
            this.alias = oneLink.variable.short_code_name;
            this.id = this.alias;
            this.addResourceVariable(oneLink);
        }
        if (this.link_type === graph.typeOfLink.subimpekt) {
            this.alias = oneLink.subimpact.short_code_name;
            this.id = this.alias;
            this.addResourceImpekt(oneLink);
        }
        this.elResourceDiv.append('div').attr('class', 'resource-link_descr').html(oneLink.link_descr);
        this.addToIcl();
    }
    addResourceImpekt(oneLink) {
        this.elResourceDiv = this.elResource.append('div').attr('id', this.id).attr('class', 'resource resource-sub');
        this.elResourceDiv.append('div')
            .style('background-image', "url('../img/symbol_impekt.png')")
            .attr('class', 'symbol')
            .style('margin', '2px 0px -2px 0px')
            .style('position', 'absolute')
            .style('width', '30px')
            .style('height', '20px')
            .attr('title', 'This is an impekt');
        this.elResourceDiv.append('div').attr('class', 'resource-title').html(oneLink.subimpact.title);
        this.elResourceDiv.append('div').attr('class', 'resource-sub_title').html(oneLink.subimpact.sub_title);
        this.elResourceDiv.append('span').attr('class', 'resource-long_code_name').html(oneLink.subimpact.long_code_name)
            .attr('title', 'Long code name');
        this.elResourceDiv.append('span').attr('class', 'resource-short_code_name').html(oneLink.subimpact.short_code_name)
            .attr('title', 'Short code name');
        this.elResourceDiv.append('span').attr('class', 'resource-maingroup').html(oneLink.subimpact.maingroup)
            .attr('title', 'Group');
        this.elResourceDiv.append('span').attr('class', 'resource-subgroup').html(oneLink.subimpact.subgroup)
            .attr('title', 'Sub group');
    }
    addResourceVariable(oneLink) {
        this.elResourceDiv = this.elResource.append('div').attr('id', this.id).attr('class', 'resource resource-vari');
        this.elResourceDiv.append('div')
            .style('background-image', "url('../img/symbol_variabele.png')")
            .attr('class', 'symbol')
            .style('margin', '2px 0px -2px 0px')
            .style('position', 'absolute')
            .style('width', '30px')
            .style('height', '20px')
            .attr('title', 'This is a variable');
        this.elResourceDiv.append('div').attr('class', 'resource-title').html(oneLink.variable.title);
        this.elResourceDiv.append('div').attr('class', 'resource-sub_title').html(oneLink.variable.sub_title);
        this.elResourceDiv.append('span').attr('class', 'resource-long_code_name').html(oneLink.variable.long_code_name)
            .attr('title', 'Long code name');
        this.elResourceDiv.append('span').attr('class', 'resource-short_code_name').html(oneLink.variable.short_code_name)
            .attr('title', 'Short code name');
        this.elResourceDiv.append('span').attr('class', 'resource-maingroup').html(oneLink.variable.short_code_name)
            .attr('title', 'Group');
    }
    remove() {
        this.elResourceDiv.remove();
    }
    addToIcl() {
        this.elInclLink = this.elIncl
            .append('a')
            .attr('href', "#" + this.id)
            .html(this.alias);
    }
    removeFromIcl() {
        this.elInclLink.remove();
    }
}
class UI {
    constructor(graph) {
        this.title = '';
        this.subtitle = '';
        this.elAdvancedForm = [];
        this.UIlinks = [];
        this.graph = graph;
        this.elUI = d3.select('#page').append('div').attr('class', 'graph-UI-group');
        this.elAdvanced = this.elUI.append('div').attr('class', 'graph-UI-advanced');
        this.elFormula = this.elUI.append('div').attr('class', 'graph-UI-formula');
        this.elImpekt = this.elUI.append('div').attr('class', 'graph-UI-impekt');
        this.elResource = this.elUI.append('div').attr('class', 'graph-UI-resource');
        this.elResource.append('h4').html("Resources");
        this.elIncl = this.elResource.append('div').attr('class', 'graph-UI-resource-incl');
        this.elTitle = d3.select("#page").insert('h1', '.graph-graph').attr('class', 'graph-title');
    }
    update() {
        this.setTitle();
        this.setSimplifiedMode(false);
        if (this.graph.AmountOfComparison == graph.AmountOfComparison.one) {
            this.createNormalFormula();
            this.addAdvanced();
            this.addAdvancedFormula();
            this.addMoreInformation();
            this.modeSimplified();
        }
        this.graph.impekts.map((impekt) => {
            impekt.links.map((link) => {
                this.UIlinks.push(new UIlink(this, link));
                this.makeTableRowDraggable();
            });
        });
    }
    decodeFormula() {
        let newFormula = [];
        this.elAdvancedForm.map((formulaPart, k) => {
            let HRformula = formulaPart.html();
            let technicalFormula = HRformula
                .replace(/  /g, ' ')
                .split(/(<hr.+?>+)/g)
                .filter(x => x)
                .map((x) => {
                if (x.indexOf('<hr') === 0) {
                    let value = x.match(/data-value=".*?"/g)[0];
                    return ('[' + value.substring(12, value.length - 1) + ']');
                }
                else {
                    return x;
                }
            })
                .join('');
            let newFormulaPart = { title: d3.select('#graph_ui_input_edit_' + k).property('value'), technical: technicalFormula };
            newFormula.push(newFormulaPart);
        });
        this.graph.impekts[0].edited = true;
        this.graph.updateFormula(newFormula);
        this.graph.update();
        if (this.graph.AmountOfComparison == graph.AmountOfComparison.one) {
            this.createNormalFormula();
        }
        else {
            console.log('requested soft data update, but will do a hard one, data changed too much');
            this.update();
        }
    }
    setTitle() {
        let subtitleString = '';
        if (this.graph.AmountOfComparison == graph.AmountOfComparison.one) {
            this.title = this.graph.impekts[0].title;
            this.subtitle = this.graph.impekts[0].sub_title;
            subtitleString = '<div  id="graph-UI-title-sub">' + this.graph.impekts[0].sub_title + '</div>';
        }
        else {
            this.title = this.graph.impekts.map(x => x.title).join(' ');
            this.subtitle = '';
        }
        this.elTitle
            .html('<div id="graph-UI-title-main">' + this.title + '</div>' + subtitleString);
    }
    addAdvanced() {
        this.elAdvanced.html('');
        var block = this.elAdvanced.append('div').attr('id', 'graph-group-main');
        let label = block.append('label')
            .attr('class', 'settings-button');
        label.append('input')
            .attr('class', 'settings-toggle-main')
            .attr('type', 'checkbox');
        label.append('span');
        label.append('span');
        label.append('span');
        label.append('span');
        label.append('div');
        label.on('change', () => { this.toggleAdvanced(); });
        this.elInfo = block.append('div').attr('class', 'graph-UI-info').attr('id', 'graph-UI-info-main');
        this.elInfo.style('max-height', '0px');
        this.elTable = this.elInfo.append('table');
        this.elTable.append('tr').html("<th><!--Drag--></th><th><!--Symbol--></th><th>Item</th><th colspan='2' style='text-align:center;padding: 5px 20px 5px 0;width:30px;'>Value</th><th></th><th></th>");
        this.elAdvancedError = this.elInfo.append('div').attr('class', 'graph-UI-info-error');
    }
    createNormalFormula() {
        this.elFormula.html('');
        this.elFormula.append('h4').html('Formula');
        let singleImpekt = this.graph.impekts[0];
        if (typeof singleImpekt.formula !== "undefined") {
            for (var k = 0, groups = singleImpekt.formula.length; k < groups; k += 1) {
                if (k !== 0) {
                    this.elFormula.append('div').attr('class', 'sign').html('+').style('display', 'inline-block');
                }
                this.elFormula.append('div')
                    .attr('class', 'graph-UI-info-form graph-form-hr')
                    .attr('id', 'graph-UI-info-form-' + k)
                    .attr('title', singleImpekt.formula[k].title)
                    .html(singleImpekt.formula[k].hr)
                    .style('border-bottom', ' solid 2px' + color[k]);
                this.resizeAllFormulaBlocks();
            }
        }
    }
    addMoreInformation() {
        this.elImpekt.html('');
        let singleImpekt = this.graph.impekts[0];
        if (singleImpekt.descr) {
            this.elImpekt.append('h4').html("Explanation");
            this.elImpekt.append('p').html(singleImpekt.descr).attr('class', 'graph-expl-explanation');
        }
        if (singleImpekt.descr) {
            this.elImpekt.append('h4').html("Known exclusions");
            this.elImpekt.append('p').html(singleImpekt.excl).attr('class', 'graph-expl-exclusions');
        }
    }
    setSimplifiedMode(changed) {
        this.simplified = false;
        if (changed) {
            this.simplified = d3.select('#simpleMode').property('checked');
        }
        else {
            this.simplified = false;
            d3.select('#simpleMode').property('checked', false);
        }
        d3.select('body').classed('simplified', this.simplified);
    }
    addAdvancedFormula() {
        let singleImpekt = this.graph.impekts[0];
        if (typeof singleImpekt.formula !== "undefined") {
            let elementForm = this.elInfo.append('div').attr('class', 'graph-UI-input-block');
            for (var k = 0, groups = singleImpekt.formula.length; k < groups; k += 1) {
                if (k !== 0) {
                    this.addAdvancedFormulaPlus();
                }
                this.addAdvancedFormulaPart(k, singleImpekt.formula[k].title, singleImpekt.formula[k].hr);
                this.resizeAllFormulaBlocks();
            }
        }
    }
    addAdvancedFormulaPart(k, title, formula) {
        let group = d3.select('.graph-UI-input-block')
            .append('div')
            .attr('class', 'graph-UI-input-group')
            .attr('data-part', k);
        group
            .append('input')
            .attr('class', 'graph-UI-input-edit ')
            .attr('id', 'graph_ui_input_edit_' + k)
            .attr('data-part', k)
            .style('border-left-color', color[k])
            .property('value', title)
            .on('change', (d, i, arr) => { this.updateFormulaTitle(arr[i].value, arr[i].getAttribute('data-part')); });
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
            .on('keyup paste copy cut', () => {
            if (d3.event.keyCode == 13) {
                el.html(el.html().split('<br>').join(''));
            }
            if ([16,
                17,
                18,
                13,
                32,
                27,
                37, 38, 39, 40
            ].indexOf(d3.event.keyCode) < 0) {
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => { this.decodeFormula(); }, 400);
            }
        });
        this.elAdvancedForm.push(el);
        return group;
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
            .style('padding-top', '7px');
    }
    toggleAdvanced(show) {
        if (show)
            this.elUI.select('.settings-toggle-main').node().checked = true;
        if (this.elUI.select('.settings-toggle-main').node().checked) {
            this.elInfo.style('max-height', '999px').transition().duration(500);
        }
        else {
            this.elInfo.style('max-height', '0').transition().duration(500);
        }
    }
    resizeAllFormulaBlocks() {
        this.elUI.selectAll('.graph-form-hr hr').each((d, i, arr) => {
            let hr = arr[i];
            hr.style.width = (parseInt(window.getComputedStyle(hr, ':before').width.replace('px', '')) + 1) + 'px';
        });
    }
    updateFormulaTitle(value, id) {
        this.graph.impekts[0].formula[id].title = value;
        this.graph.update(true);
    }
    makeTableRowDraggable() {
        console.log('Start dragable');
        this.elTable
            .selectAll('tr + tr>td:nth-child(3)').each(function () { d3.select(this); })
            .call(d3.drag()
            .on("start", (d, i, arr) => {
            let info = this.elInfo;
            let divFormulas = this.elAdvancedForm;
            let coords = d3.mouse(info.node());
            console.log(arr[i]);
            let dragable = d3.select(arr[i].parentElement).select('.graph-UI-info-copy span');
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                let divIndex = 1;
                divFormulas.map((divFormula) => {
                    var reg = /(<hr.+?>+)/g;
                    var splits = divFormula.html().replace(/  /g, ' ').split(reg).filter(x => x);
                    var forhtml = '<div class="div-small" id="X' + divIndex + '">' + '</div>';
                    divIndex += 1;
                    for (var i = 0, j = splits.length; i < j; i += 1) {
                        if (splits[i].slice(0, 3) === '<hr') {
                            forhtml += '<p id="X' + divIndex + '">' + splits[i] + '</p>';
                            divIndex += 1;
                        }
                        else {
                            var charsplits = splits[i].split(/\b/g).filter(function (x) { return x.trim() !== ''; });
                            for (var k = 0, l = charsplits.length; k < l; k += 1) {
                                forhtml += '<p id="X' + divIndex + '">' + charsplits[k] + '</p>';
                                divIndex += 1;
                            }
                        }
                        forhtml += '<div class="div-small" id="X' + divIndex + '">' + '</div>';
                        divIndex += 1;
                    }
                    divFormula.html(forhtml);
                    divFormula.style('min-height', '60px').style('padding', '10px 0');
                    divFormula.selectAll('.div-small').style('width', '');
                });
                dragable
                    .style('position', "absolute")
                    .style('display', "block")
                    .style('left', coords[0] + "px")
                    .style('top', coords[1] + "px")
                    .style('margin-top', "-40px");
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    dragable.style('margin-top', "-30px");
                }
            }, 400);
        })
            .on("drag", (d, i, arr) => {
            let info = this.elInfo;
            let coords = d3.mouse(info.node());
            let dragable = d3.select(arr[i].parentElement).select('.graph-UI-info-copy span');
            dragable.style('margin-top', "-30px");
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                dragable.style('margin-top', "-30px");
            }
            dragable
                .style('left', coords[0] + "px")
                .style('top', coords[1] + "px");
        })
            .on("end", (d, i, arr) => {
            let inputBars = (this.elAdvancedForm);
            var dragable = d3.select(arr[i].parentElement).select('.graph-UI-info-copy span');
            dragable
                .style('position', "relative").style('left', "")
                .style('top', "")
                .style('display', "");
            var targetDiv = d3.select('.div-small:hover').node();
            var regstr = /(<div.+?\/div>)?(<p.+?>)?(<\/p>)?/g;
            if (targetDiv !== null) {
                inputBars.map((d, i, arr) => {
                    var inputBar = arr[i];
                    var newForm = inputBar.html();
                    if (newForm.split(targetDiv.outerHTML).length > 1) {
                        inputBar.html(newForm.split(targetDiv.outerHTML)[0].replace(regstr, '') + dragable.attr('data-drop') + newForm.split(targetDiv.outerHTML)[1].replace(regstr, ''));
                    }
                    else {
                        inputBar.html(inputBar.html().replace(regstr, ''));
                    }
                });
                this.resizeAllFormulaBlocks();
                this.decodeFormula();
            }
            else {
                inputBars.map((d, i, arr) => {
                    var inputBar = arr[i];
                    console.log(3, inputBar.html().replace(regstr, ''));
                    inputBar.html(inputBar.html().replace(regstr, ''));
                });
            }
            inputBars.map(function (d, e, i) { d3.select(this).style('min-height', '').transition().duration(500).style('padding', ''); });
        }));
    }
    modeSimplified() {
        d3.select('#simpleMode').on('change', () => { this.setSimplifiedMode(true); });
    }
}
window.onload = () => {
    let para = parseURLParams(window.location.href);
    if (para == false) { }
    else {
        if (typeof para.id !== 'undefined') {
            let ids = [];
            para.id.map((x) => { x.split(';').map((y) => { ids.push(y); }); });
            settings.ids = ids;
        }
    }
    let newGraph = new graph();
    x = new UI(newGraph);
    newGraph.buildGraph().then(() => {
        x.update();
        x.toggleAdvanced(true);
    });
};
