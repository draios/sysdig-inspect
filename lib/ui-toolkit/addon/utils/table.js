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
        this.properties = properties;
    }

    get name() {
        return this.properties.name || this.id;
    }

    get headComponentName() {
        return this.properties.headComponentName || null;
    }

    get cellComponentName() {
        return this.properties.cellComponentName || null;
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
