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
    createColumn(id, properties) {
        return new ColumnConfiguration(id, properties);
    },

    createRow(id, sourceData, columnsConfiguration, columnsData, meta) {
        return new RowConfiguration(id, sourceData, columnsConfiguration, columnsData, meta);
    },
};

class ColumnConfiguration {
    constructor(id, properties) {
        this.id = id;
        this.dataType = properties.dataType;
        this.size = properties.size;
        this.properties = properties;
    }

    get name() {
        return this.properties.name || this.id;
    }

    get headComponentName() {
        return this.properties.headComponentName || 'sd-table-head-cell';
    }

    get cellComponentName() {
        return this.properties.cellComponentName || 'sd-table-cell';
    }

    get alignment() {
        return this.dataType === 'CHARBUF' ? 'LEFT' : 'RIGHT';
    }
}

class RowConfiguration {
    constructor(id, sourceData, columnsConfiguration, columnsData, meta) {
        this.id = id;
        this.sourceData = sourceData;
        this.columnsConfiguration = columnsConfiguration;
        this.columnsData = columnsData;
        this.columns = columnsConfiguration.map((columnConfiguration, i) => {
            return new CellConfiguration(columnConfiguration, columnsData[i]);
        });
        this.meta = meta;
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
