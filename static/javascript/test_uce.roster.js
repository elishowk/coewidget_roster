module("uce.roster", {});

var MockEventAdd = {
    datetime: 1338893773158,
    domain: "localhost",
    from: "18888444472920958972084000340434",
    id: "36386467112457370042912441088531",
    location: "demo5",
    type: "internal.roster.add"
};

var MockSpeaker = {
    auth: "password",
    domain: "localhost",
    metadata: {
        first_name: "Super",
        groups: "participant",
        id: "100",
        is_active: "true",
        is_staff: "false",
        is_superuser: "false",
        language: "fr",
        last_name: "Patient",
        md5: "c1b1a75b5512ba49f6ec6228db754784",
        ucengine_uid: "18888504972920958972084000340434",
        user_id: "100",
        username: "QunitSpeaker"
    },
    name: "QunitSpeaker",
    uid: "18888504972920958972084000340434",
    visible: true
};

var MockUser = {
    auth: "password",
    domain: "localhost",
    metadata: {
        first_name: "Ultra",
        groups: "participant",
        id: "101",
        is_active: "true",
        is_staff: "false",
        is_superuser: "false",
        language: "fr",
        last_name: "Cool",
        md5: "c1b1d75b5f12ba49f6ec6228db754984",
        ucengine_uid: "18888444472920958972084000340434",
        user_id: "101",
        username: "QunitUser"
    },
    name: "QunitUser",
    uid: "18888444472920958972084000340434",
    visible: true
};

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

test("user is complete", function() {
    expect(5);
    // nettoyage
    $("#"+MockUser.uid).remove();
    $('#roster').data("roster")._state.users[MockUser.uid]=MockUser;
    // test
    $('#roster').data("roster")._updateUser(MockUser);
    notEqual($("#"+MockUser.uid).length, 0, "User exist");
    equal($("#"+MockSpeaker.uid).hasClass("user-avatar-personality"), false, "User is not in speaker section");
    /// tester la présence d'un nom 
    notEqual($("#"+MockUser.uid).find('a').text().length, 0, "User has a name");
    equal($("#"+MockUser.uid).find('a').text()===MockUser.name, true, "User has the good name");
    /// tester la présence d'un avatar 
    notEqual($("#"+MockUser.uid).find('img').attr('src').length, 0, "User has an avatar");
});

test("speaker is in the right place", function() {
    expect(3);
    // nettoyage
    $("#"+MockSpeaker.uid).remove();
    $('#roster').data("roster")._state.users[MockSpeaker.uid]=MockSpeaker;
    // test
    $('#roster').data("roster").options.speakers.push(MockSpeaker.uid);
    $('#roster').data("roster")._updateUser(MockSpeaker);
    equal($("#"+MockSpeaker.uid).length, 1, "Speaker exist");
    equal($("#"+MockSpeaker.uid).hasClass("user-avatar-personality"), true, "Speaker has class personality");
    equal($("#"+MockSpeaker.uid).find('img').css('box-shadow')==="none", false, "Speaker has blue shadow");
});

test("user connection", function() {
    expect(6);
    // nettoyage
    $("#"+MockUser.uid).remove();
    $('#roster').data("roster")._state.users[MockUser.uid]=MockUser;
    // test
	if ($('#roster').data("roster")._state.roster === null){
        $('#roster').data("roster")._state.roster = [];
    }
	//connecté
    $('#roster').data("roster")._state.roster.push(MockUser);
    $('#roster').data("roster")._state.rosterUidList = $.map($('#roster').data("roster")._state.roster, function(connecteduser){ return connecteduser.uid });
    $('#roster').data("roster")._updateUser(MockUser);
    equal($("#"+MockUser.uid).length, 1, "User is visible (online test)");
    equal($("#"+MockUser.uid).hasClass("connected-user"), true, "User is online (has class online)");
    equal($("#"+MockUser.uid).hasClass("offline-user"), false, "User is online (has not class offline)");
	// déconnecté
	$('#roster').data("roster")._state.roster = jQuery.grep($('#roster').data("roster")._state.roster, function(value) {
          return value != MockUser;
        });
	$('#roster').data("roster")._state.rosterUidList = $.map($('#roster').data("roster")._state.roster, function(connecteduser){ return connecteduser.uid });
	$('#roster').data("roster")._updateUser(MockUser);
	equal($("#"+MockUser.uid).length, 1, "User is visible (offline test)");
    equal($("#"+MockUser.uid).hasClass("connected-user"), false, "User is offline (has not class online)");
    equal($("#"+MockUser.uid).hasClass("offline-user"), true, "User is offline (has class offline)");
});



