/* eslint-env browser */

'use strict';

function Hypersorter(grid, targets) {
    this.grid = grid;

    this.install(targets);

    grid.behavior.dataModel.charMap.mixIn({
        ASC: '\u25b2', // UPWARDS_BLACK_ARROW, aka '▲'
        DESC: '\u25bc' // DOWNWARDS_BLACK_ARROW, aka '▼'
    });

    grid.addInternalEventListener('fin-column-sort', function(c, keys){
        grid.toggleSort(c, keys);
    });
}

Hypersorter.prototype.name = 'Hypersorter';

Hypersorter.prototype.install = function(targets) {
    var Hypergrid = this.grid.constructor;
    var Column = this.grid.behavior.columns[-1].constructor;
    Hypergrid.defaults.mixIn(require('./mix-ins/defaults'));
    Hypergrid.prototype.mixIn(require('./mix-ins/grid'));
    targets = targets || {};
    (targets.Behavior && targets.Behavior.prototype || Object.getPrototypeOf(this.grid.behavior)).mixIn(require('./mix-ins/behavior'));
    (targets.Column || Column).prototype.mixIn(require('./mix-ins/column'));
    (targets.DataModel && targets.DataModel.prototype || Object.getPrototypeOf(this.grid.behavior.dataModel)).mixIn(require('./mix-ins/dataModel'));
};

module.exports = Hypersorter;
