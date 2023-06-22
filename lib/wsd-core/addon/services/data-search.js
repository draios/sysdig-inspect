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

import { isNone, typeOf } from '@ember/utils';

import { notEmpty, and, readOnly } from '@ember/object/computed';
import Evented from '@ember/object/evented';
import Service from '@ember/service';
import PromiseState from '../utils/promise-state';

const MAX_MATCH_COUNT = 999;

export default Service.extend(Evented, {
    searchDataStore: null,

    isSearchActive: notEmpty('searchDataStore.searchPattern').readOnly(),
    isSearchReady: and('isSearchActive', 'searchDataStore.hasLoaded').readOnly(),

    setSearchPattern(searchPattern) {
        if (this.get('searchDataStore') === null) {
            const searchDataStore = SearchDataStore.create();

            this.set('searchDataStore', searchDataStore);
        }

        if (this.get('searchDataStore.searchPattern') !== searchPattern) {
            if (isNone(searchPattern) === false) {
                this.get('searchDataStore').setSearchPattern(searchPattern);
            } else {
                this.set('searchDataStore', null);
            }

            this.notifySearchPatternChange();
        }
    },

    search(dataStore) {
        if (this.get('searchDataStore') === null) {
            console.assert(false, 'You should set the search pattern before performing the search on the data store');

            return null;
        } else {
            this.get('searchDataStore').search(dataStore);

            const currentSelectedRow = this.get('searchDataStore.selectedRow');
            this.get('searchDataStore.loadPromise').then(() => {
                if (this.get('searchDataStore.selectedRow') !== currentSelectedRow) {
                    this.notifySelectionChange();
                }
            });

            return this.get('searchDataStore');
        }
    },

    selectPreviousMatch() {
        if (this.get('isSearchReady')) {
            this.get('searchDataStore').selectPreviousMatch();
            this.notifySelectionChange();
        }
    },

    selectNextMatch() {
        if (this.get('isSearchReady')) {
            this.get('searchDataStore').selectNextMatch();
            this.notifySelectionChange();
        }
    },

    notifySelectionChange() {
        if (this.get('searchDataStore.selectedRow')) {
            this.trigger('didChangeSelection', this.get('searchDataStore.selectedRow'));
        }
    },

    notifySearchPatternChange() {
        this.trigger('didChangeSearchPattern', this.get('searchDataStore.searchPattern'));
    },
});

const SearchDataStore = PromiseState.extend({
    dataStore: null,

    searchPattern: null,
    selectedMatchIndex: 0,
    selectedRow: null,

    matchCount: null,
    isMatchCountBeyondMax: false,
    rows: null,

    viewId: readOnly('dataStore.viewId'),
    loadingProgress: readOnly('dataStore.loadingProgress'),
    info: readOnly('dataStore.info'),

    search(dataStore) {
        if (this.get('dataStore') !== dataStore) {
            this.set('dataStore', dataStore);

            this.load(
                this.get('dataStore.loadPromise')
                    .then(() => {
                        this.parseData();

                        this.succeedLoad();
                    })
            );
        }
    },

    setSearchPattern(searchPattern) {
        if (this.get('searchPattern') !== searchPattern) {
            this.set('searchPattern', searchPattern);

            if (this.get('dataStore.hasLoaded')) {
                this.setProperties(this.parseData());
            }
        }
    },

    selectPreviousMatch() {
        if (this.get('matchCount') > 0) {
            let selectedMatchIndex;
            if (this.get('selectedMatchIndex') > 0) {
                selectedMatchIndex = this.get('selectedMatchIndex') - 1;
            } else {
                selectedMatchIndex = this.get('matchCount') - 1;
            }

            this.selectMatch(selectedMatchIndex);
        }
    },

    selectNextMatch() {
        if (this.get('matchCount') > 0) {
            let selectedMatchIndex;
            if (this.get('selectedMatchIndex') < this.get('matchCount') - 1) {
                selectedMatchIndex = this.get('selectedMatchIndex') + 1;
            } else {
                selectedMatchIndex = 0;
            }

            this.selectMatch(selectedMatchIndex);
        }
    },

    selectMatch(index) {
        if (this.get('selectedMatchIndex') !== index) {
            const result = updateSelectedMatch(this.get('rows'), index);

            this.setProperties({
                rows: result.rows,
                selectedRow: result.selectedRow,
                selectedMatchIndex: index,
            });
        }
    },

    parseData() {
        const searchResult = searchRows(
            getSearchOptions(this.get('searchPattern')),
            this.get('dataStore.rows'),
            this.get('selectedMatchIndex')
        );

        return {
            matchCount: Math.min(searchResult.matchCount, MAX_MATCH_COUNT),
            isMatchCountBeyondMax: searchResult.matchCount > MAX_MATCH_COUNT,
            rows: searchResult.rows,
            selectedMatchIndex: Math.min(this.get('selectedMatchIndex'), Math.min(searchResult.matchCount, MAX_MATCH_COUNT) - 1),
            selectedRow: searchResult.selectedRow,
        };
    },

    isEmpty() {
        return this.get('dataStore').isEmpty();
    },
});

function updateSelectedMatch(rows, selectedMatchIndex) {
    return rows.reduce((updateResult, row) => {
        const updateRowResult = row.d.reduce((updateRowResult, output) => {
            if (typeOf(output) === 'array') {
                const updateColumnResult = output.reduce((updateColumnResult, token) => {
                    updateColumnResult.isRowSelected = updateColumnResult.isRowSelected || token.matchIndex === selectedMatchIndex;

                    updateColumnResult.tokens.push(Object.assign({}, token, {
                        isMatchSelected: token.matchIndex === selectedMatchIndex,
                    }));

                    return updateColumnResult;
                }, {
                    isRowSelected: false,
                    tokens: [],
                });

                updateRowResult.d.push(updateColumnResult.tokens);
                updateRowResult.isRowSelected = updateColumnResult.isRowSelected;

            } else {
                updateRowResult.d.push(output);
            }

            return updateRowResult;
        }, {
            isRowSelected: false,
            d: [],
        });

        const newRow = Object.assign({}, row, {
            d: updateRowResult.d,
        });

        if (updateRowResult.isRowSelected && updateResult.selectedRow === null) {
            updateResult.selectedRow = newRow;
        }

        updateResult.rows.push(newRow);

        return updateResult;
    }, {
        rows: [],
        selectedRow: null,
    });
}

function searchRows(searchOptions, rows, selectedMatchIndex) {
    return rows.reduce((searchResult, row) => {
        const rowSearchResult = row.d.reduce((rowSearchResult, column) => {
            const columnSearchResult = searchDatum(
                searchOptions,
                column,
                rowSearchResult.matchCount,
                selectedMatchIndex
            );

            rowSearchResult.isRowMatch = rowSearchResult.isRowMatch || columnSearchResult.isRowMatch;
            rowSearchResult.d.push(columnSearchResult.output);
            rowSearchResult.matchCount = columnSearchResult.matchCount;

            return rowSearchResult;
        }, {
            d: [],
            isRowMatch: false,
            matchCount: searchResult.matchCount,
        });

        searchResult.rows.push({
            d: rowSearchResult.d,
            k: row.k,
            meta: {
                isMatch: rowSearchResult.isRowMatch,
            },
        });

        if (rowSearchResult.isRowMatch && searchResult.selectedRow === null) {
            searchResult.selectedRow = row;
        }
        searchResult.matchCount = rowSearchResult.matchCount;

        return searchResult;
    }, {
        rows: [],
        selectedRow: null,
        matchCount: 0,
    });
}

function searchDatum(
    searchOptions,
    datum,
    matchCount,
    selectedMatchIndex
) {
    if (matchCount > MAX_MATCH_COUNT) {
        return {
            output: datum,
            matchCount,
            isRowMatch: false,
        };
    } else {
        let isRowMatch = false;
        const tokens = [];
        const datumString = datum !== null ? datum.toString() : '';

        const iterateResult = searchOptions.iterate(
            datumString,
            matchCount,
            (from, to) => {
                tokens.push({
                    output: datumString.substring(from, to),
                    isMatch: false,
                });
            },
            (match, matchCount) => {
                isRowMatch = true;

                tokens.push({
                    output: match,
                    matchIndex: matchCount,
                    isMatchSelected: matchCount === selectedMatchIndex,
                    isMatch: true,
                });
            }
        );

        if (iterateResult.lastDatumIndex < datumString.length && tokens.length > 0) {
            tokens.push({
                output: datumString.substring(iterateResult.lastDatumIndex, datumString.length),
                isMatch: false,
            });
        }

        return {
            output: tokens.length > 0 ? tokens : datum,
            matchCount: iterateResult.matchCount,
            isRowMatch,
        };
    }
}

function getSearchOptions(searchPattern) {
    try {
        const regExp = new RegExp(searchPattern, 'ig');

        const testInfiniteMatching = regExp.exec('testInfiniteMatching');
        if (testInfiniteMatching !== null && testInfiniteMatching[0].length === 0) {
            return {
                isRegExp: false,
            };
        } else {
            return {
                isRegExp: true,
                iterate(input, matchCount, addNoMatch, addMatch) {
                    const regExp = new RegExp(searchPattern, 'ig');

                    let lastDatumIndex = 0;

                    let match;
                    while ((match = regExp.exec(input)) !== null) {
                        if (match.index > lastDatumIndex) {
                            addNoMatch(lastDatumIndex, match.index);
                        }

                        if (matchCount < MAX_MATCH_COUNT) {
                            addMatch(match[0], matchCount);

                            matchCount++;

                            lastDatumIndex = regExp.lastIndex;
                        } else {
                            // You reached the max number of matches possible. No more evaluation!
                            matchCount++;

                            break;
                        }
                    }

                    return {
                        matchCount,
                        lastDatumIndex,
                    };
                },
            };
        }
    } catch(ex) {
        return {
            isRegExp: false,
            iterate(input, matchCount, addNoMatch, addMatch) {
                let lastDatumIndex = 0;
                let index;
                const lowerCaseInput = input.toLowerCase();
                const lowerCasePattern = searchPattern.toLowerCase();
                while ((index = lowerCaseInput.substring(lastDatumIndex).indexOf(lowerCasePattern)) !== -1) {
                    if (index > 0) {
                        addNoMatch(lastDatumIndex, index + lastDatumIndex);
                    }

                    if (matchCount < MAX_MATCH_COUNT) {
                        addMatch(searchPattern, matchCount);

                        matchCount++;

                        lastDatumIndex += index + lowerCasePattern.length;
                    } else {
                        // You reached the max number of matches possible. No more evaluation!
                        matchCount++;

                        break;
                    }
                }

                return {
                    matchCount,
                    lastDatumIndex,
                };
            },
        };
    }
}
