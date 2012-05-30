/**
*  Roster widget implements a user presence sheet for a ucengine meeting
*  Inspired by the management ucewidget
*  depends :
*  * underscore.js
*  * ucewidget.js
*  * jqueryUI
*
*  Copyright (C) 2011 CommOnEcoute,
*  maintained by Elias Showk <elias.showk@gmail.com>
*  source code at https://github.com/CommOnEcoute/ucengine-widgets
*   
*   Videotag widget is free software: you can redistribute it and/or modify
*   it under the terms of the GNU Affero General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   Videotag is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU Affero General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with the source code.  If not, see <http://www.gnu.org/licenses/>.
*/

$.uce.Roster = function() {};
$.uce.Roster.prototype = {
    options: {
        ucemeeting: null,
        uceclient: null,
        title: "Meeting Roster",
        mode: 'reduced',
        owner: new RegExp("producteur"),
        participant: new RegExp("participant"), 
        speaker: new RegExp("personnalite"), 
        default_avatar: null
    },
    // ucengine events
    meetingsEvents: {
        "internal.roster.add"           : "_handleJoin",
        "internal.roster.delete"        : "_handleLeave"
    },
    _create: function() {
        var that = this;
        this._state.me = {};
        this._state.anonCounter = 1;
        this._updateRoster();
    },

    clear: function() {},
    reduce: function() {},
    expand: function() {},

    /**
     * Internal functions
     */
    _updateRoster: function() {
        this.element.empty();
        var meeting = this.options.ucemeeting;
        var users = [];
        $.each(this._state.users, function(uid, user) {
            if(_.isBoolean(user)===false) {
                users.push(user);
            }
        });
        users = users.sort(function(user1, user2) {
            if (user1.you) {
                return (-1);
            }
            if (user2.you) {
                return (1);
            }
            if (user1.visible) {
                return (-1);
            }
            if (user2.visible) {
                return (1);
            }
            return (0);
        });

        var me = this._state.users[this.options.uceclient.uid];
        var that = this;
        this.options.ucemeeting.getRoster(function(err, roster){
            that._state.roster=roster;
            $.each(users, function(idx, user) {
                var screenname = that.getScreenName(user.uid);
                if(screenname === "" || screenname === "anonymous") {
                    return;
                }
                if($("#"+user.uid).length > 0) {
                    if(user.visible === true) {
                        $("#"+user.uid).show();
                    } else {
                        $("#"+user.uid).hide();
                    }
                    return;
                }
                // appends new user to roster element
                var userField = $('<a>');//.attr('href', '/accounts/'+user.name);
                userField.text(screenname);

                if (user.metadata && user.metadata.mugshot && user.metadata.mugshot !== "") {
                    userField.prepend($("<figure class='user-avatar'>").append(getMugshot(user.metadata.mugshot)));
                } else {
                    userField.prepend($("<figure class='user-avatar'>").append(that.options.default_avatar.clone()));
                }
                // role information
                var roleField = $('<span>');

                var item = $('<li>')
                    .attr("id", user.uid)
                    .addClass('connected-user')
                    .append(userField)
                    .append(roleField);

                if (user.uid == that.options.uceclient.uid) {
                    userField.addClass("ui-roster-user-you");
                } else if (user.metadata.groups && user.metadata.groups.search(that.options.speaker) != -1) {
                    roleField.text(that.options.speaker.source);
                    userField.addClass("ui-roster-user-speaker");
                } else if (user.metadata.groups && user.metadata.groups.search(that.options.owner) != -1) {
                    roleField.text(that.options.owner.source);
                    userField.addClass("ui-roster-user-owner");
                } else {
                    userField.addClass("ui-roster-user-active");
                }
                item.hide();
                item.appendTo(that.element);
            });
            roster.forEach(function(activeuser){
                if($("#"+activeuser.uid).length > 0) {
                    $("#"+activeuser.uid).show();
                }
            });
        });
    },

    destroy: function() {
        this.element.find('*').remove();
        $.Widget.prototype.destroy.apply(this, arguments); // default destroy
    }
};
$.uce.widget("roster", new $.uce.Roster());
