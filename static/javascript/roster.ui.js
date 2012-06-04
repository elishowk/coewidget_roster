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
        default_avatar: null,
        speaker_users: $('.users-list:first'),
        active_users: $('ul.[data-user-list="online"]'),
        inactive_users: $('ul.[data-user-list="offline"]'),
        speakers: [],
        updateInterval: 30000
    },
    // ucengine events
    meetingsEvents: {
        "internal.roster.add"           : "_handleJoin",
        "internal.roster.delete"        : "_handleLeave",
        "internal.roster.update"        : "_updateRoster"
    },
    _create: function() {
        this._state = {
            anonCounter: 0,
            users: {},
            roster: null,
            requestRoster: false
        };
        var that = this;
        this._updateLoop = window.setInterval(function(){
                that._updateRoster();
            }, this.options.updateInterval);
    },
    /*
     * Users' state object
     */
    getUsersState: function() {
        return this._state.users;
    },

    /**
     * UCE Event handler
     * "internal.roster.add" Event handler
    */
    _handleJoin: function(event) {
        if (this._state.users[event.from]!==undefined && _.isBoolean(this._state.users[event.from]) === false) {
            // come back of an old friend
            this._state.users[event.from].visible = true;
            return;
        } 
        if (_.isBoolean(this._state.users[event.from]) === false) {
            // first time for this new user
            // boolean value indicates a request is pending
            this._state.users[event.from] = true;
            var that = this;
            this.options.uceclient.user.get(event.from, function(err, result, xhr) {
                var visible = that._state.users[event.from];
                if (err !== null) {
                    return;
                }
                if(result === null) {
                    return;
                }
                that._state.users[event.from] = result.result;
                that._state.users[event.from].visible = visible;
                that._state.users[event.from].you = false;
                that._state.users[event.from].owner = false;
                that._state.users[event.from].speaker = false;

                if (event.from == that.options.uceclient.uid) {
                    that._state.users[event.from].you = true;
                }
                for (var i=0; i < that.options.speakers.length; i++) {
                    if (that._state.users[event.from].uid == that.options.speakers[i]){
                        that._state.users[event.from].speaker = true;
                    }
                }
                event.type = "internal.roster.update";
                that.options.ucemeeting.trigger(event);
            });
            return;
        }
    },

    /**
    * "internal.roster.delete" Event handler
    */
    _handleLeave: function(event) {
        if (this._state.users[event.from]!==undefined && _.isBoolean(this._state.users[event.from]) === false) {
            this._state.users[event.from].visible = false;
            return;
        } 
        if (_.isBoolean(this._state.users[event.from]) === false) {
            // Lock but indicates absence
            this._state.users[event.from] = false;
        }
    },

    getScreenName: function(uid) {
        var user = ( this._state.users[uid] !== undefined ) ? this._state.users[uid] : { name: ""};
        var screenname = user.name;
        if (user.metadata !== undefined && user.metadata.username !== undefined) {
            screenname = user.metadata.username;
        }
        return screenname;
    },
    
    _sortRoster: function() {
        this.options.active_users.find('li').sort(function(a, b){
            return $(a).text() > $(b).text() ? 1 : -1;
        }).remove().appendTo(this.options.active_users);
        
        this.options.inactive_users.find('li').sort(function(a, b){
            return $(a).text() > $(b).text() ? 1 : -1;
        }).remove().appendTo(this.options.inactive_users);
        
    },

    _updatePosition: function(item) {
        
        if ((item.hasClass("user-avatar-personality")) && (item.hasClass("offline-user"))){
            item.appendTo(this.options.speaker_users);
        }
        else if (item.hasClass("user-avatar-personality")){
            item.prependTo(this.options.speaker_users);
        }
        else if (item.hasClass("ui-roster-user-you")){
           item.prependTo(this.options.active_users);
        }
         else if (item.hasClass("connected-user")){
           item.appendTo(this.options.active_users);
        }
        else item.appendTo(this.options.inactive_users);
    },

    _updateUserState: function(user , useritem){
        var that = this;
        for (i=0;i<that._state.roster.length;i++){
            if (that._state.roster[i].uid==user.uid) {
                useritem.removeClass("offline-user");
                useritem.addClass("connected-user");
                that._updatePosition(useritem);
                return;
            }else {
                useritem.removeClass("connected-user");
                useritem.addClass("offline-user");
                that._updatePosition(useritem);
            }
        }    
    },
    /**
     * Internal method updating display
     */
    _updateRoster: function(event) {
        
        this.element.addClass("ui-roster");
        var meeting = this.options.ucemeeting;
        var users = [];
        $.each(this._state.users, function(uid, user) {
            if(_.isBoolean(user)===false) {
                users.push(user);
            }
        });
        
        var me = this._state.users[this.options.uceclient.uid];
        var that = this;

        // requête Async uce
        this.options.ucemeeting.getRoster(function(err, roster){
            if (err!==null){
                return;
            }
            that._state.roster=roster;
            $.each(users, function(idx, user) {
                // Si c'est anonymous on le mets au placard avec Mr Pignon
                var screenname = that.getScreenName(user.uid);
                if(screenname === "" || screenname === "anonymous") {
                    return;
                }
                /* if user already in the roster block */
                if($("#"+user.uid).length > 0) {
                    that._updateUserState(user, $("#"+user.uid), $("#"+user.uid).children("a"));
                    that._sortRoster();
                    return;
                }
                // appends new user to roster element
                var userField = $('<a>');//.attr('href', '/accounts/'+user.name);
                    userField.text(screenname)
                    .attr("href","#");

                if (user.metadata && user.metadata.mugshot && user.metadata.mugshot !== "") {
                    userField.prepend($("<figure class='user-avatar'>").append(getMugshot(user.metadata.mugshot)));
                } else {
                    // FIXME
                    //userField.prepend($("<figure class='user-avatar'>").append(that.options.default_avatar.clone()));
                }
                // role information
                var imgField = $('<img>')
                    .attr("alt", "")
                    .attr("src", "");
                var figureField = $('<figure>')
                    .attr("uid", user.uid)
                    .addClass('user-avatar')
                    .append(imgField)
                    .prependTo(userField);
                var item = $('<li>')
                    .attr("id", user.uid)
                    .addClass('connected-user')
                    .append(userField)
                    .click(function(evt) {
                        evt.preventDefault();
                    });
                
                for (var i=0; i < that.options.speakers.length; i++) {
                    if (user.uid == that.options.speakers[i]){
                        user.speaker = true;
                    }
                }
                if (user.speaker == true) {
                    item.addClass("user-avatar-personality");
                }
                else if (user.uid == that.options.uceclient.uid) {
                    item.addClass("ui-roster-user-you");
                }
                that._updateUserState(user, item);
                that._sortRoster();
            });
        });
    },
    destroy: function() {
        this.element.removeClass("ui-roster");
        this.element.find('li').remove();
        $.Widget.prototype.destroy.apply(this, arguments); // default destroy
    }
};
$.uce.widget("roster", new $.uce.Roster());
