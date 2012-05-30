/*module("uce.roster", {teardown: function() {
    $('#roster').roster('destroy');
}});

Factories.addRosterEvent = function(from) {
    return {
        type: "internal.roster.add",
        from: from
    };
}

Factories.updateNicknameEvent = function(from, nickname) {
    return {
        type: "roster.nickname.update",
        from: from,
        metadata: {nickname: nickname}
    };
}

Factories.addUserRoleEvent = function(from, user, role) {
    return {
        type: "internal.user.role.add",
        from: from,
        metadata: {user: user,
                   role: role}
    };
}

Factories.deleteUserRoleEvent = function(from, user, role) {
    return {
        type: "internal.user.role.delete",
        from: from,
        metadata: {user: user,
                   role: role}
    };
}

Factories.requestLeadEvent = function(from) {
    return {
        type: "meeting.lead.request",
        from: from,
        metadata: {}
    };
}

Factories.refuseLeadEvent = function(from, user) {
    return {
        type: "meeting.lead.refuse",
        from: from,
        metadata: {user: user}
    };
}

Factories.deleteRosterEvent = function(from) {
    return {
        type: "internal.roster.delete",
        from: from
    };
}

test("create some elements", function() {
    $('#roster').roster();
    ok($('#roster').hasClass("ui-roster"), "should have class ui-roster");
    ok($('#roster').hasClass("ui-widget"), "should have class ui-widget");
    equals($('#roster').children().size(), 2);
    equals($("#roster .ui-widget-content").children().size(), 4);
});

test("destroy delete all elements", function() {
    $('#roster').roster();
    $('#roster').roster("destroy");
    ok(!$('#roster').hasClass("ui-roster"), "should not have class ui-roster");
    ok(!$('#roster').hasClass("ui-widget"), "should not have class ui-widget");
    equals($('#roster > *').size(), 0);
});

module("uce.roster", {
    setup: function() {
        var that = this;
        this.ucemeeting = {
            name: "testmeeting",
            on: function(eventName, callback) {
                if (eventName == "internal.roster.add") {
                    that.callback_roster_add = callback;
                } else if (eventName == "internal.roster.delete") {
                    that.callback_roster_delete = callback;
                } else if (eventName == "internal.user.role.add") {
                    that.callback_role_add = callback;
                } else if (eventName == "internal.user.role.delete") {
                    that.callback_role_delete = callback;
                } else if (eventName == "meeting.lead.request") {
                    that.callback_lead_request = callback;
                } else if (eventName == "meeting.lead.refuse") {
                    that.callback_lead_refuse = callback;
                } else if (eventName == "roster.nickname.update") {
                    that.callback_nickname_update = callback;
                }
            }
        };
        $('#roster').roster({
            ucemeeting: this.ucemeeting,
            uceclient: {uid: 'chuck'},
            url: 'my sweet url',
            code: '1234'
        });
    },
    teardown: function() {
        $('#roster').roster('destroy');
    }});

test("clear the widget", function() {
    $('#roster').roster('clear');
    equals($("#roster .ui-roster-roster").children().size(), 0);
});

test("handle join", function() {
    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    equals($("#roster .ui-roster-roster").children().size(), 1);
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-user").text(), 'Unnamed 1');
});

test("handle duplicate participant", function() {
    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    equals($("#roster .ui-roster-roster").children().size(), 1);
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-user").text(), 'Unnamed 1');
});

test("handle leave", function() {
    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    equals($("#roster .ui-roster-roster").children().size(), 1);
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-user").text(), 'Unnamed 1');

    this.callback_roster_delete(Factories.deleteRosterEvent('chuck'));
    equals($("#roster .ui-roster-roster").children().size(), 0);
});

test("handle internal.user.role.add event", function() {
    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    equals($("#roster .ui-roster-roster").children().size(), 1);
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-user").text(), 'Unnamed 1');
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-role").text(), 'You');

    this.callback_role_add(Factories.addUserRoleEvent('god', 'chuck', 'speaker'));
    equals($("#roster .ui-roster-roster").children().size(), 1);
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-user").text(), 'Unnamed 1');
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-role").text(), 'Speaker');
});

test("handle internal.user.role.delete event", function() {
    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    this.callback_role_add(Factories.addUserRoleEvent('god', 'chuck', 'speaker'));
    equals($("#roster .ui-roster-roster").children().size(), 1);
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-user").text(), 'Unnamed 1');
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-role").text(), 'Speaker');
    this.callback_role_delete(Factories.deleteUserRoleEvent('god', 'chuck', 'speaker'));
    equals($("#roster .ui-roster-roster").children().size(), 1);
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-user").text(), 'Unnamed 1');
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-role").text(), 'You');
});

test("show the number of users", function() {
    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    this.callback_roster_add(Factories.addRosterEvent('brucelee'));
    equals($("#roster .ui-roster-roster-header h1").text(), 'Connected users (2)');

    this.callback_roster_delete(Factories.deleteRosterEvent('chuck'));
    equals($("#roster .ui-roster-roster-header h1").text(), 'Connected users (1)');
});

test("sort roster correctly", function() {
    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    this.callback_roster_add(Factories.addRosterEvent('speaker'));
    this.callback_roster_add(Factories.addRosterEvent('participant1'));
    this.callback_roster_add(Factories.addRosterEvent('participant2'));
    this.callback_roster_add(Factories.addRosterEvent('owner'));

    this.callback_role_add(Factories.addUserRoleEvent('god', 'owner', 'owner'));
    this.callback_role_add(Factories.addUserRoleEvent('god', 'speaker', 'speaker'));

    this.callback_nickname_update(Factories.updateNicknameEvent('chuck', 'Z'));
    this.callback_nickname_update(Factories.updateNicknameEvent('speaker', 'Y'));
    this.callback_nickname_update(Factories.updateNicknameEvent('participant1', 'B'));
    this.callback_nickname_update(Factories.updateNicknameEvent('participant2', 'A'));
    this.callback_nickname_update(Factories.updateNicknameEvent('owner', 'X'));

    equals($("#roster .ui-roster-roster").children().size(), 5);
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-user").text(), 'Z');
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-role").text(), 'You');
    equals($("#roster .ui-roster-roster li:eq(1) .ui-roster-user").text(), 'X');
    equals($("#roster .ui-roster-roster li:eq(1) .ui-roster-role").text(), 'Owner');
    equals($("#roster .ui-roster-roster li:eq(2) .ui-roster-user").text(), 'Y');
    equals($("#roster .ui-roster-roster li:eq(2) .ui-roster-role").text(), 'Speaker');
    equals($("#roster .ui-roster-roster li:eq(3) .ui-roster-user").text(), 'A');
    equals($("#roster .ui-roster-roster li:eq(3) .ui-roster-role").text(), '');
    equals($("#roster .ui-roster-roster li:eq(4) .ui-roster-user").text(), 'B');
    equals($("#roster .ui-roster-roster li:eq(4) .ui-roster-role").text(), '');
});

test("handle roster.nickame.update event", function() {
    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    this.callback_nickname_update(Factories.updateNicknameEvent('chuck', 'Chuck Norris'));
    equals($("#roster .ui-roster-roster").children().size(), 1);
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-user").text(), 'Chuck Norris');
});

jackTest("push a roster.nickname.update event after changing our nickname", function() {
    var ucemeeting = jack.create("ucemeeting", ['push']);
    jack.expect("ucemeeting.push")
        .exactly("1 time")
        .mock(function(type, metadata) {
            equals(type, "roster.nickname.update");
            equals(metadata.nickname, "Chuck Norris");
        });
    ucemeeting.on = this.ucemeeting.on;

    $('#roster').roster({
        ucemeeting: ucemeeting,
        uceclient: {uid: 'chuck'}
    });

    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-user").text(), 'Unnamed 1');
    $("#roster .ui-roster-roster li:eq(0) .ui-roster-user").click();
    $("#roster .ui-roster-roster li:eq(0) .ui-roster-user input").val("Chuck Norris");
    $("#roster .ui-roster-roster li:eq(0) .ui-roster-user input").trigger("blur");
});

jackTest("don't push an event if setting the same nickname or an empty nickname", function() {
    var ucemeeting = jack.create("ucemeeting", ['push']);
    jack.expect("ucemeeting.push")
        .exactly("1 time");
    ucemeeting.on = this.ucemeeting.on;

    $('#roster').roster({
        ucemeeting: ucemeeting,
        uceclient: {uid: 'chuck'}
    });

    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-user").text(), 'Unnamed 1');
    $("#roster .ui-roster-roster li:eq(0) .ui-roster-user").click();
    $("#roster .ui-roster-roster li:eq(0) .ui-roster-user input").val("Chuck Norris");
    $("#roster .ui-roster-roster li:eq(0) .ui-roster-user input").trigger("blur");

    $("#roster .ui-roster-roster li:eq(0) .ui-roster-user").click();
    $("#roster .ui-roster-roster li:eq(0) .ui-roster-user input").val("Chuck Norris");
    $("#roster .ui-roster-roster li:eq(0) .ui-roster-user input").trigger("blur");

    $("#roster .ui-roster-roster li:eq(0) .ui-roster-user").click();
    $("#roster .ui-roster-roster li:eq(0) .ui-roster-user input").val("");
    $("#roster .ui-roster-roster li:eq(0) .ui-roster-user input").trigger("blur");
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-user").text(), 'Chuck Norris');
});

jackTest("send a chat.private.start event when clicking on a user", function() {
    expect(3);
    var ucemeeting = jack.create("ucemeeting", ['trigger']);
    jack.expect("ucemeeting.trigger")
        .exactly("1 time")
        .mock(function(event) {
            equals(event.type, "chat.private.start");
            equals(event.metadata.interlocutor, "brucelee");
        });
    ucemeeting.on = this.ucemeeting.on;

    $('#roster').roster({
        ucemeeting: ucemeeting,
        uceclient: {uid: 'chuck'}
    });

    this.callback_roster_add(Factories.addRosterEvent('brucelee'));
    $("#roster .ui-roster-roster li:eq(0) .ui-roster-user").click();
});

jackTest("send a meeting.lead.request event when clicking on the 'Request Lead' button", function() {
    expect(2);
    var ucemeeting = jack.create("ucemeeting", ['push']);
    jack.expect("ucemeeting.push")
        .exactly("1 time")
        .mock(function(type) {
            equals(type, "meeting.lead.request");
        });
    ucemeeting.on = this.ucemeeting.on;

    $('#roster').roster({
        ucemeeting: ucemeeting,
        uceclient: {uid: 'chuck'}
    });

    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    $("#roster .ui-roster-roster li:eq(0) .ui-roster-lead-button").click();
});

test("display a message after a meeting.lead.request is received from us", function() {
    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    this.callback_lead_request(Factories.requestLeadEvent('chuck'));
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-role").text(), 'Lead Request Pending');
});

test("display a choice after a meeting.lead.request is sent to the owner", function() {
    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    this.callback_role_add(Factories.addUserRoleEvent('god', 'chuck', 'owner'));

    this.callback_roster_add(Factories.addRosterEvent('brucelee'));
    this.callback_lead_request(Factories.requestLeadEvent('brucelee'));

    equals($("#roster .ui-roster-roster li:eq(1) .ui-roster-lead-button").size(), 2);
    ok($("#roster .ui-roster-roster li:eq(1) .ui-roster-lead-button:eq(0) span").hasClass('ui-icon-circle-close'));
    ok($("#roster .ui-roster-roster li:eq(1) .ui-roster-lead-button:eq(1) span").hasClass('ui-icon-circle-check'));
});

jackTest("send a meeting.lead.refuse event when clicking on the refusal pictogram", function() {
    expect(3);
    var ucemeeting = jack.create("ucemeeting", ['push']);
    jack.expect("ucemeeting.push")
        .exactly("1 time")
        .mock(function(type, metadata) {
            equals(type, "meeting.lead.refuse");
            equals(metadata.user, "brucelee");
        });
    ucemeeting.on = this.ucemeeting.on;

    $('#roster').roster({
        ucemeeting: ucemeeting,
        uceclient: {uid: 'chuck'}
    });

    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    this.callback_role_add(Factories.addUserRoleEvent('god', 'chuck', 'owner'));

    this.callback_roster_add(Factories.addRosterEvent('brucelee'));
    this.callback_lead_request(Factories.requestLeadEvent('brucelee'));

    $("#roster .ui-roster-roster li:eq(1) .ui-roster-lead-button:eq(0)").click();
});

test("display back the 'Lead Request' button after the user received a meeting.lead.refuse event", function() {
    this.callback_roster_add(Factories.addRosterEvent('chuck'));

    this.callback_roster_add(Factories.addRosterEvent('brucelee'));
    this.callback_role_add(Factories.addUserRoleEvent('god', 'brucelee', 'owner'));

    this.callback_lead_request(Factories.requestLeadEvent('chuck'));
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-role").text(), 'Lead Request Pending');

    this.callback_lead_refuse(Factories.refuseLeadEvent('brucelee', 'chuck'));
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-role").text(), 'You');
});

test("ignore meeting.lead.refuse event from non-owner", function() {
    this.callback_roster_add(Factories.addRosterEvent('chuck'));

    this.callback_roster_add(Factories.addRosterEvent('brucelee'));

    this.callback_lead_request(Factories.requestLeadEvent('chuck'));
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-role").text(), 'Lead Request Pending');

    this.callback_lead_refuse(Factories.refuseLeadEvent('brucelee', 'chuck'));
    equals($("#roster .ui-roster-roster li:eq(0) .ui-roster-role").text(), 'Lead Request Pending');
});

jackTest("add the 'speaker' role when clicking on the 'Give Lead' button", function() {
    expect(7);
    var userMock = jack.create("user", ['addRole', 'delRole']);
    jack.expect("user.addRole")
        .exactly("1 time")
        .mock(function(uid, role, location, callback) {
            equals(uid, "brucelee");
            equals(role, "speaker");
            equals(location, "testmeeting");
        });
    jack.expect("user.delRole")
        .exactly("1 time")
        .mock(function(uid, role, location, callback) {
            equals(uid, "jcvd");
            equals(role, "speaker");
            equals(location, "testmeeting");
        });
    var uceclient = {uid: "chuck", user: userMock};

    $('#roster').roster({
        ucemeeting: this.ucemeeting,
        uceclient: uceclient
    });

    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    this.callback_role_add(Factories.addUserRoleEvent('god', 'chuck', 'owner'));

    this.callback_roster_add(Factories.addRosterEvent('jcvd'));
    this.callback_role_add(Factories.addUserRoleEvent('god', 'jcvd', 'speaker'));

    this.callback_roster_add(Factories.addRosterEvent('brucelee'));

    $("#roster .ui-roster-roster li:eq(2) .ui-roster-lead-button").click();
});

jackTest("add the 'speaker' role when clicking on the accept pictogram", function() {
    expect(7);
    var userMock = jack.create("user", ['addRole', 'delRole']);
    jack.expect("user.addRole")
        .exactly("1 time")
        .mock(function(uid, role, location, callback) {
            equals(uid, "brucelee");
            equals(role, "speaker");
            equals(location, "testmeeting");
        });
    jack.expect("user.delRole")
        .exactly("1 time")
        .mock(function(uid, role, location, callback) {
            equals(uid, "jcvd");
            equals(role, "speaker");
            equals(location, "testmeeting");
        });

    var uceclient = {uid: "chuck", user: userMock};
    var ucemeeting = jack.create("ucemeeting", ['push']);
    ucemeeting.on = this.ucemeeting.on;
    ucemeeting.name = this.ucemeeting.name;

    $('#roster').roster({
        ucemeeting: ucemeeting,
        uceclient: uceclient
    });

    this.callback_roster_add(Factories.addRosterEvent('chuck'));
    this.callback_role_add(Factories.addUserRoleEvent('god', 'chuck', 'owner'));

    this.callback_roster_add(Factories.addRosterEvent('jcvd'));
    this.callback_role_add(Factories.addUserRoleEvent('god', 'jcvd', 'speaker'));

    this.callback_roster_add(Factories.addRosterEvent('brucelee'));
    this.callback_lead_request(Factories.requestLeadEvent('brucelee'));

    $("#roster .ui-roster-roster li:eq(2) .ui-roster-lead-button:eq(1)").click();
});

test("Switch between views when clicking on the invite or roster link", function() {
    var ucemeeting = jack.create("ucemeeting", ['push']);
    ucemeeting.on = this.ucemeeting.on;
    ucemeeting.name = this.ucemeeting.name;

    $('#roster').roster({
        ucemeeting: ucemeeting,
        uceclient: {uid: 'chuck'}
    });

    equals($('#roster .ui-roster-roster-header').css('display'), 'block');
    equals($('#roster .ui-roster-roster').css('display'), 'block');
    equals($('#roster .ui-roster-invite-header').css('display'), 'none');
    equals($('#roster .ui-roster-invite').css('display'), 'none');

    $('#roster .ui-roster-invite-link').click();

    equals($('#roster .ui-roster-roster-header').css('display'), 'none');
    equals($('#roster .ui-roster-roster').css('display'), 'none');
    equals($('#roster .ui-roster-invite-header').css('display'), 'block');
    equals($('#roster .ui-roster-invite').css('display'), 'block');

    $('#roster .ui-roster-roster-link').click();

    equals($('#roster .ui-roster-roster-header').css('display'), 'block');
    equals($('#roster .ui-roster-roster').css('display'), 'block');
    equals($('#roster .ui-roster-invite-header').css('display'), 'none');
    equals($('#roster .ui-roster-invite').css('display'), 'none');
});

test("Give an url and a code to the widget so the fields will be pre-filled", function() {
    equals($('#roster .ui-roster-url').val(), 'my sweet url');
    equals($('#roster .ui-roster-code').val(), '1234');
});*/
