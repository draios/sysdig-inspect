/*
Copyright (C) 2017 Draios inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2 as
published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

export default {
    createColumn(id, isLast, properties) {
        return new ColumnConfiguration(id, isLast, properties);
    },

    createRow(id, sourceData, columnsConfiguration, columnsData, meta, rowActionsComponent) {
        return new RowConfiguration(id, sourceData, columnsConfiguration, columnsData, meta, rowActionsComponent);
    },
};

class ColumnConfiguration {
    constructor(id, isLast, properties) {
        this.id = id;
        this.isLast = isLast;
        this.properties = Object.assign(
            {
                dataType: 'CHARBUF',
                headComponentName: 'sd-table-head-cell',
                cellComponentName: 'sd-table-cell',
            },
            properties
        );
    }

    get name() {
        return this.properties.name || this.id;
    }

    get headComponentName() {
        return this.properties.headComponentName;
    }

    get cellComponentName() {
        return this.properties.cellComponentName;
    }

    get dataType() {
        return this.properties.dataType;
    }

    get alignment() {
        return this.dataType === 'CHARBUF' ? 'LEFT' : 'RIGHT';
    }
}

class RowConfiguration {
    constructor(id, sourceData, columnsConfiguration, columnsData, meta, rowActionsComponent) {
        this.id = id;
        this.sourceData = sourceData;
        this.columnsConfiguration = columnsConfiguration;
        this.columnsData = columnsData;
        this.columns = columnsConfiguration.map((columnConfiguration, i) => {
            return new CellConfiguration(columnConfiguration, columnsData[i]);
        });
        this.meta = meta;
        this.rowActionsComponent = rowActionsComponent;
    }
}

class CellConfiguration {
    constructor(configuration, data) {
        this.configuration = configuration;
        this.data = data;
    }

    get output() {
        return this.data;
    }
}
