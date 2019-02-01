/* eslint-env commonjs */

'use strict';

var DataSourceIndexed = require('datasaur-indexed');

var comparatorCouplets = {
    numeric: {
        '1': function(x, y) { return x - y; },
        '-1': function(x, y) { return y - x; }
    },
    string: {
        '1': function(x, y) { return x < y ? -1 : +1; },
        '-1': function(x, y) { return y < x ? -1 : +1; }
    }
};

/**
 * @constructor
 * @extends DataSourceIndexed
 */
var DataSourceSorter = DataSourceIndexed.extend('DataSourceSorter', {
    /**
     * @param {number} columnIndex
     * @param {number} [direction=1] - One of `-1`, `0`, or `1`.
     * @memberOf DataSourceSorter#
     */
    sortOn: function(columnIndex, direction, type) {
        if (direction === 0) {
            this.clearIndex();
            return;
        }

        // set defaults
        direction = direction || 1;

        var index = this.buildIndex(),
            stableValues = new Array(index.length),
            dataSource = this.dataSource,
            columnSchema = dataSource.schema[columnIndex],
            columnName = columnSchema && columnSchema.name,
            calculator = columnSchema && columnSchema.calculator,
            comparatorType = type || columnSchema && columnSchema.type || typeof getValue(0),
            comparatorCouplet = comparatorCouplets[comparatorType] || comparatorCouplets.string, // string when type unknown
            comparator = comparatorCouplet[direction],
            descending = (direction === -1),
            stableComparator = stabilize.bind(this, comparator, descending);


        // create a stable values list of [index,value] couplets
        for (var i = 0; i < index.length; i++) {
            stableValues[i] = [getValue(i), i];
        }

        // sort the stable couplets
        stableValues.sort(stableComparator);

        // copy the sorted values into our index vector
        for (i = 0; i < index.length; i++) {
            index[i] = stableValues[i][1];
        }

        function getValue(rowIdx) {
            var dataRow = dataSource.getRow(rowIdx);
            return DataSourceIndexed.valOrFunc(dataRow, columnName, calculator);
        }
    }
});

/** @typedef {object} sorterSpec
 * @property {number} columnIndex
 * @property {number} direction
 * @property {string} type
 */

/**
 * @constructor
 * @extends DataSourceIndexed
 */
var DataSourceSorterComposite = DataSourceIndexed.extend('DataSourceSorterComposite', {
    /**
     * @memberOf DataSourceSorterComposite#
     */
    initialize: function() {
        /**
         * @type {DataSource}
         * @memberOf DataSourceSorterComposite#
         */
        this.last = this.dataSource;

        this.sorts = [];
    },

    setSorts: function(sorts) {
        this.sorts = sorts;
    },

    /**
     * @memberOf DataSourceSorterComposite#
     * @param {number} y
     * @returns {Object}
     */
    getRow: function(y) {
        return this.last.getRow(y);
    },

    /**
     * @memberOf DataSourceSorterComposite#
     */
    apply: function() {
        var each = this.dataSource;
        this.sorts.forEach(function(sort) {
            each = new DataSourceSorter(each);
            each.sortOn(sort.columnIndex, sort.direction, sort.type);
        });
        this.last = each;
    },

    getDataIndex: function(y) {
        return this.last.getDataIndex(y);
    },

    /**
     * @memberOf DataSourceSorterComposite#
     * @param {number} x
     * @param {number} y
     * @returns {*}
     */
    getValue: function(x, y) {
        return this.last.getValue(x, y);
    },

    /**
     * @memberOf DataSourceSorterComposite#
     * @param {number} x
     * @param {number} y
     * @param {*} value
     */
    setValue: function(x, y, value) {
        this.last.setValue(x, y, value);
    }
});

Object.defineProperty(DataSourceSorterComposite.prototype, 'type', { value: 'sorter' }); // read-only property

DataSourceSorterComposite.addComparator = function(name, ascendingComparator, descendingComparator) {
    comparatorCouplets[name] = {
        '1': ascendingComparator,
        '-1': descendingComparator
    };
};

/**
 * @param {function} comparator
 * @param {boolean} descending
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {function}
 */
function stabilize(comparator, descending, a, b) {
    var result;

    if (a[0] !== b[0]) {
        result = comparator(a[0], b[0]);
    } else if (descending) {
        result = b[1] - a[1];
    } else {
        result = a[1] - b[1];
    }

    return result;
}

module.exports = DataSourceSorterComposite;
