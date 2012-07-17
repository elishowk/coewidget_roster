module("uce.roster", {});

if (Factories===undefined) {
    var Factories = {};
}

Factories.addRosterEvent = function(from) {
    return {
        type: "internal.roster.add",
        from: from
    };
}

Factories.deleteRosterEvent = function(from) {
    return {
        type: "internal.roster.delete",
        from: from
    };
}

Factories.updateRosterEvent = function(from) {
    return {
        type: "internal.roster.update",
        from: from
    };
}

test("_handleJoin unknown user", function() {
    $('#roster').data("roster")._handleJoin = _.bind($('#roster').data("roster")._handleJoin, {
        options: $('#roster').data("roster").options,
        _state: {
            anonCounter: 0,
            users: {},
            roster: null,
            requestRoster: false
        }
    });
    $('#roster').data("roster")._handleJoin(Factories.addRosterEvent("18030307524559803908973640433151"));
    equal($('#roster').data("roster")._state.users["18030307524559803908973640433151"], undefined);
    equal($("#18030307524559803908973640433151").hasClass("offline-user"), true);
});
