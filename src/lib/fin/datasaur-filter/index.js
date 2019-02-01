/* eslint-env commonjs */

'use strict';

var DataSourceIndexed = require('datasaur-indexed');

/**
 * @interface filterInterface
 */

/**
 * @name filterInterface#test
 * @method
 * @param {object} dataRow - Object representing a row in the grid containing all the fields listed in {@link DataSource#fields|fields}.
 * @returns {boolean}
 * * `true` - include in grid (row passes through filter)
 * * `false` - exclude from grid (row is blocked by filter)
 */

/**
 * Before calling {@link filterInterface#test} on the grid (_i.e.,_ on every row), it is worth calling `enabled`.
 * @name filterInterface#enabled
 * @type {boolean}
 * * `true` - Filter expression is non null (for filter-tree this means that it contains one or more leaf nodes)
 * * `false` - Filter expression is null
 */

/**
 * @name controller
 * @implements filterInterface
 * @memberOf DataSourceGlobalFilter#
 */

/**
 * @constructor
 * @extends DataSourceIndexed
 */
var DataSourceGlobalFilter = DataSourceIndexed.extend('DataSourceGlobalFilter', {

    /**
     * @memberOf DataSourceSorterComposite#
     */
    initialize: function() {
        this.filter = {};
    },

    setFilter: function(filter) {
        this.filter = filter;
    },

    /**
     * @memberOf DataSourceGlobalFilter#
     */
    apply: function() {
        if (this.filter.enabled) {
            this.buildIndex(function(r, rowObject) {
                return this.filter.test(rowObject);
            });
        } else {
            this.clearIndex();
        }
    },

    /**
     *
     * @memberOf DataSourceGlobalFilter#
     * @returns {number}
     */
    getRowCount: function() {
        return this.filter.enabled ? this.index.length : this.dataSource.getRowCount();
    }
});

Object.defineProperty(DataSourceGlobalFilter.prototype, 'type', { value: 'filter' }); // read-only property

module.exports = DataSourceGlobalFilter;
