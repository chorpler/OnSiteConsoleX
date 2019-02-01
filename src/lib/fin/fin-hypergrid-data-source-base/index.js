'use strict';

function DataSourceBase() {}

DataSourceBase.extend = require('extend-me');
var pubsubstar = require('pubsubstar');

var regexHyphenation = /[-_]\w/g;

DataSourceBase.prototype = {
    constructor: DataSourceBase.prototype.constructor,

    replaceIndent: '_',

    isNullObject: true,

    drillDownCharMap: {
        OPEN: '\u25bc', // BLACK DOWN-POINTING TRIANGLE aka '▼'
        CLOSE: '\u25b6', // BLACK RIGHT-POINTING TRIANGLE aka '▶'
        undefined: '' // for leaf rows
    },

    DataSourceError: DataSourceError,

    initialize: function(dataSource) {
        this.dataSource = dataSource;
    },

    append: function(DataSource) {
        return new DataSource(this);
    },


    // GETTERS/SETTERS

    get schema() {
        if (this.dataSource) {
            return this.dataSource.schema;
        }
    },
    set schema(schema) {
        if (this.dataSource) {
            this.dataSource.schema = schema;
        }
    },


    // "SET" METHODS (ALWAYS HAVE ARGS)

    setSchema: function() {
        if (this.dataSource) {
            return this.dataSource.setSchema.apply(this.dataSource, arguments);
        }
    },

    setData: function() {
        if (this.dataSource) {
            return this.dataSource.setData.apply(this.dataSource, arguments);
        }
    },

    setValue: function() {
        if (this.dataSource) {
            return this.dataSource.setValue.apply(this.dataSource, arguments);
        }
    },


    // "GET" METHODS WITHOUT ARGS

    getSchema: function() {
        if (this.dataSource) {
            return this.dataSource.getSchema();
        }
    },

    getRowCount: function() {
        if (this.dataSource) {
            return this.dataSource.getRowCount();
        }
    },

    getColumnCount: function() {
        if (this.dataSource) {
            return this.dataSource.getColumnCount();
        }
    },

    getGrandTotals: function() {
        //row: Ideally this should be set and get bottom/top totals
        //Currently this function is just sending the same for both in aggregations
        if (this.dataSource) {
            return this.dataSource.getGrandTotals();
        }
    },


    // "GET" METHODS WITH ARGS

    getProperty: function getProperty(propName) {
        if (propName in this) {
            return this[propName];
        }

        if (this.dataSource) {
            return getProperty.call(this.dataSource, propName);
        }
    },

    getDataIndex: function() {
        if (this.dataSource) {
            return this.dataSource.getDataIndex.apply(this.dataSource, arguments);
        }
    },

    getRow: function() {
        if (this.dataSource) {
            return this.dataSource.getRow.apply(this.dataSource, arguments);
        }
    },

    findRow: function() {
        if (this.dataSource) {
            return this.dataSource.findRow.apply(this.dataSource, arguments);
        }
    },

    revealRow: function() {
        if (this.dataSource) {
            return this.dataSource.revealRow.apply(this.dataSource, arguments);
        }
    },

    getValue: function() {
        if (this.dataSource) {
            return this.dataSource.getValue.apply(this.dataSource, arguments);
        }
    },

    click: function() {
        if (this.dataSource) {
            return this.dataSource.click.apply(this.dataSource, arguments);
        }
    },


    // BOOLEAN METHODS

    isDrillDown: function(colIndex) {
        if (this.dataSource) {
            return this.dataSource.isDrillDown(colIndex);
        }
    },

    isDrillDownCol: function(colIndex) {
        if (this.dataSource) {
            return this.dataSource.isDrillDownCol(colIndex);
        }
    },

    isLeafNode: function(y) {
        if (this.dataSource) {
            return this.dataSource.isLeafNode(y);
        }
    },

    viewMakesSense: function() {
        if (this.dataSource) {
            return this.dataSource.viewMakesSense();
        }
    },


    // PUB-SUB

    subscribe: pubsubstar.subscribe,

    unsubscribe: pubsubstar.unsubscribe,

    publish: function(topic, message) {
        var methodName = topic.replace(regexHyphenation, toCamelCase),
            pipes = [],
            results = []; // each element per data source is itself an array for subscriber responses

        if (!(typeof topic === 'string' && topic.indexOf('*') < 0)) {
            throw new TypeError('DataSourceBase#publish expects topic to be a string primitive sans wildcards.');
        }

        for (var pipe = this; pipe.dataSource; pipe = pipe.dataSource) {
            pipes.push(pipe);
        }
        pipes.push(pipe);

        var publishTo = DataSourceBase.publishTo[topic] || 'each';

        if (publishTo === 'eachReverse' || publishTo === 'findReverse') {
            pipes.reverse();
        }

        var loopMethod = publishTo === 'find' || publishTo === 'findReverse' ? 'find' : 'forEach';
        pipes[loopMethod](function(dataSource) {
            if (typeof dataSource[methodName] === 'function') {
                results.push([dataSource[methodName](message)]);
                return true;
            } else {
                var values = pubsubstar.publish.call(dataSource, topic, message);
                results.push(values);
                return values.length > 0;
            }
        });

        return results;
    },


    // DEBUGGING AIDS

    /**
     * Get new object with name and index given the name or the index.
     * @param {string|number} columnOrIndex - Column name or index.
     * @returns {{name: string, index: number}}
     */
    getColumnInfo: function(columnOrIndex) {
        var name, index, result;

        if (typeof columnOrIndex === 'number') {
            index = columnOrIndex;
            name = this.schema[index].name;
        } else {
            name = columnOrIndex;
            index = this.schema.findIndex(function(columnSchema) {
                return columnSchema.name === name;
            });
        }

        if (name && index >= 0) {
            result = {
                name: name,
                index: index
            };
        }

        return result;
    },

    fixIndentForTableDisplay: function(string) {
        var count = string.search(/\S/);
        var end = string.substring(count);
        var result = Array(count + 1).join(this.replaceIndent) + end;
        return result;
    },

    dump: function(max) {
        max = Math.min(this.getRowCount(), max || Math.max(100, this.getRowCount()));
        var data = [];
        var fields = this.schema ? this.schema.map(function(cs) { return cs.name; }) : this.getHeaders();
        var cCount = this.getColumnCount();
        var viewMakesSense = this.viewMakesSense;
        for (var r = 0; r < max; r++) {
            var row = {};
            for (var c = 0; c < cCount; c++) {
                var val = this.getValue(c, r);
                if (c === 0 && viewMakesSense) {
                    val = this.fixIndentForTableDisplay(val);
                }
                row[fields[c]] = val;
            }
            data[r] = row;
        }
        console.table(data);
    }
};

DataSourceBase.publishTo = {
    // key: method name
    // value: 'each' (or undefined) - applied to each data source from tip to origin
    //        'eachReverse' - applied to each data source from origin to tip
    //        'find' - applied to first data source with topic found from tip to origin
    //        'findReverse' - applied to first data source with topic found from origin to tip
    // note: Topic will always be found if defined in DataSourceBase.prototype.
};


function toCamelCase(hyphenAndNextChar) {
    return hyphenAndNextChar[1].toUpperCase();
}

function DataSourceError(message) {
    this.message = message;
}

// extend from `Error`
DataSourceError.prototype = Object.create(Error.prototype);

// override error name displayed in console
DataSourceError.prototype.name = 'DataSourceError';

module.exports = DataSourceBase;
