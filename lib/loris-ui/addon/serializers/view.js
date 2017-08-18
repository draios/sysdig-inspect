import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
    normalizeFindAllResponse(store, modelClass, payload) {
        // TODO Gotta find a less crazy way to handle a slightly non-standard payload...
        return {
            data: payload.map((record) => ({
                id: record.id,
                attributes: {
                    name: record.name,
                },
                type: 'view',
            })),
        };
    },
});
