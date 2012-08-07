module("uce.roster", {});

if (Factories===undefined) {
    var Factories = {};
}

Factories.getMockUser = function(username, uid, firstname, lastname) {
    return {
        auth: "password",
        domain: "localhost",
        metadata: {
            first_name: firstname,
            groups: "participant",
            language: "fr",
            last_name: lastname,
            md5: "c1b1a75b5512ba49f6ec6228db754784",
            ucengine_uid: uid,
            username: username
        },
        name: username,
        uid: uid
    };
}

Factories.addRosterEvent = function(from) {
    return {
        datetime: Date.now(),
        domain: "localhost",
        from: from,
        id: (Date.now()+Math.random()*2000).toFixed(0).toString(),
        location: "demo5",
        type: "internal.roster.add"
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

test("User is complete", function() {
    expect(6);
    // Initialize
    var MockUser = Factories.getMockUser("QunitUser", "18888444472920958972084000340434", "Ultra", "Cool")
    $('#roster').data("roster")._state.users[MockUser.uid] = MockUser;
    $('#roster').data("roster")._updateUser(MockUser);
    // Testing
    notEqual($("#"+MockUser.uid).length, 0, "User exist");
    equal($("#"+MockUser.uid).hasClass("user-avatar-personality"), false, "User is not in speaker section");
    notEqual($("#"+MockUser.uid).find('a').text().length, 0, "User has a name");
    equal($("#"+MockUser.uid).find('a').text()===MockUser.name, true, "User has the good name");
    notEqual($("#"+MockUser.uid).find('img').attr('src').length, 0, "User has an avatar");
    // Cleaning
    $("#"+MockUser.uid).remove();
	equal($("#"+MockUser.uid).length, 0, "User deleted");
});

test("Speaker is in the right place", function() {
    expect(3);
    // Initialize
    var MockSpeaker = Factories.getMockUser("QunitSpeaker", "18888504972920958972084000340434", "Super", "Patient")
    $('#roster').data("roster")._state.users[MockSpeaker.uid] = MockSpeaker;
    $('#roster').data("roster").options.speakers.push(MockSpeaker.uid);
    $('#roster').data("roster")._updateUser(MockSpeaker);
    // Testing
    equal($("#"+MockSpeaker.uid).length, 1, "Speaker exist");
    equal($("#"+MockSpeaker.uid).hasClass("user-avatar-personality"), true, "Speaker has class personality");
    equal($("#"+MockSpeaker.uid).find('img').css('box-shadow')==="none", false, "Speaker has blue shadow");
    // Cleaning
    $("#"+MockSpeaker.uid).remove();
});
/*
test("User connection", function() {
    expect(6);
    // Initialize
    var MockUser = Factories.getMockUser("QunitUser", "18888444472920958972084000340434", "Ultra", "Cool")
    $('#roster').data("roster")._state.users[MockUser.uid] = MockUser;
    if ($('#roster').data("roster")._state.roster === null){
        $('#roster').data("roster")._state.roster = [];
    }
    // Online
    $('#roster').data("roster")._state.roster.push(MockUser);
    $('#roster').data("roster")._state.rosterUidList = $.map($('#roster').data("roster")._state.roster, function(connecteduser){ return connecteduser.uid });
    $('#roster').data("roster")._updateUser(MockUser);
    equal($("#"+MockUser.uid).length, 1, "User is visible (online test)");
    equal($("#"+MockUser.uid).hasClass("connected-user"), true, "User is online (has class online)");
    equal($("#"+MockUser.uid).hasClass("offline-user"), false, "User is online (has not class offline)");
    // Offline
    $('#roster').data("roster")._state.roster = jQuery.grep($('#roster').data("roster")._state.roster, function(value) {
          return value != MockUser;
        });
    $('#roster').data("roster")._state.rosterUidList = $.map($('#roster').data("roster")._state.roster, function(connecteduser){ return connecteduser.uid });
    $('#roster').data("roster")._updateUser(MockUser);
    equal($("#"+MockUser.uid).length, 1, "User is visible (offline test)");
    equal($("#"+MockUser.uid).hasClass("connected-user"), false, "User is offline (has not class online)");
    equal($("#"+MockUser.uid).hasClass("offline-user"), true, "User is offline (has class offline)");
    // Cleaning
    $("#"+MockUser.uid).remove();
});*/

test("User click test", function() {
    expect(8);
    // Initialize
    $('#player-aside-nav [data-nav="videoticker-users"]').click();
    var MockUser = Factories.getMockUser("QunitUser", "18888444472920958972084000340434", "Ultra", "Cool")
    $('#roster').data("roster")._state.users[MockUser.uid] = MockUser;
    $('#roster').data("roster")._updateUser(MockUser);
    equal($("#"+MockUser.uid).length, 1, "User is visible");
    // Filtering
    $("#"+MockUser.uid).trigger('click');
    equal($('#player-aside-nav [data-nav="videoticker-comments"]').hasClass("active"), true, "Tab switched (comments tab active)");
    equal($('#player-aside-nav [data-nav="videoticker-users"]').hasClass("active"), false, "Tab switched (roster tab not active)");
    equal($(".clone[id='"+MockUser.uid+"']").length, 1, "Clone of selected user exist");
    notEqual($(".clone[id='"+MockUser.uid+"']").find('a').text().length, 0, "Clone has a name");
    equal($(".clone[id='"+MockUser.uid+"']").find('a').text()===MockUser.name, true, "Clone has the good name");
    notEqual($(".clone[id='"+MockUser.uid+"']").find('img').attr('src').length, 0, "Clone has an avatar");
    // Unfiltering
    $(".clone[id='"+MockUser.uid+"']").trigger('click');    
    notEqual($(".clone[id='"+MockUser.uid+"']").length, 1, "Clone of selected user is well suppressed after click");
    // Cleaning
    $("#"+MockUser.uid).remove();
});


