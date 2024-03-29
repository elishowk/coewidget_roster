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
        user_list: $('.users-list'),
        speaker_users: $('.users-list:first'),
        active_users: $('ul.[data-user-list="online"]'),
        inactive_users: $('ul.[data-user-list="offline"]'),
        speakers: [],
        updateInterval: 15000,
        selected_list : $(".selected-users-list"),
        filters: $('#filters')
    },

    // ucengine suscribed events
    meetingsEvents: {
        "internal.roster.add"           : "_handleJoin",
        "internal.roster.update"        : "_handleUserData"
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
            }, that.options.updateInterval);
    },

    /*
     * Public method returning
     * the users' data list
     */
    getUsersState: function() {
        return this._state.users;
    },

    /*
     * Public method giving the user's nickname
     */
    getScreenName: function(uid) {
        var user = ( this._state.users[uid] !== undefined ) ? this._state.users[uid] : { name: "" };
        var screenname = user.name;
        if (user.metadata !== undefined && user.metadata.username !== undefined) {
            screenname = user.metadata.username;
        }
        return screenname;
    },
    
    
    /**
     * UCE GET user request
     * then triggers the event notifying any widget waiting for the user's data
    */
    _getUserData: function(event) {
        var that = this;
        this.options.uceclient.user.get(event.from, function(err, result, xhr) {
            if (err !== null || result === null) {
                return;
            }
            that._state.users[event.from] = result.result;
            that.options.ucemeeting.trigger({
                type: "internal.roster.update",
                from: event.from
            });
        });
    }, 
    
    /**
     * UCE Event handler
     * "internal.roster.add" Event handler
    */
    _handleJoin: function(event) {
        if (typeof this._state.users[event.from] === "undefined") {
            // boolean value indicates a request is pending
            this._state.users[event.from] = true;
            var that = this,
                ev = event;
            _.defer( function() { that._getUserData(ev) } );
            return;
        }
    },
    /**
     * UCE Event handler
     * "internal.roster.update" Event handler
    */
    _handleUserData: function(event) {
        this._updateUser(this._state.users[event.from]);
    },

    /*  Cette fonction attache au clic sur les utilisateurs
     *  les fonctions de filtrage
     */

    _attachClick: function(item) {
        var that = this;
        item.on("click", function(evt){
            evt.preventDefault();
            // on vérifie si l'item n'est pas actif -> dans ce cas on le 'désactive'
            if(item.find('a').hasClass('active')){
                that.options.filters.data('filters')._refreshTicker($(this).attr('id'), "useruid", "all", that.options.user_list , that.options.selected_list);
            }
            // sinon on l'ajoute 
            else {
                if(that.options.selected_list.parent().find('li a').text() === ""){
                    that.options.filters.data('filters')._showFilterlist();
                }
                that.options.filters.data('filters').filterMessagesAdvanced(true, $(this).attr('id'), "useruid", "all");
                $(this).find('a').addClass('active');
                // on créé un clone dans la zone de filtres
                $(this).clone().appendTo(that.options.selected_list).addClass('clone').on("click", function(evt) {
                    evt.preventDefault();
                    that.options.filters.data('filters')._refreshTicker($(this).attr('id'), "useruid", "all", that.options.user_list , that.options.selected_list);
                });
                // on mets en forme le clone pour qu'il n'apparaisse pas grisé
                that.options.selected_list.find("li").removeClass("offline-user");
                that.options.selected_list.find("li").addClass("connected-user");
                
                // on change d'onglet
                var $nav   = $('#player-aside-nav'),
                    $links = $nav.find('a'),
                    $tabs  = $('div.player-aside-box-tab'),
                    box  = "videoticker-comments";
                        
                $links.removeClass('active');
                $links.filter("[data-nav='"+box+"']").addClass('active');
                
                $tabs.addClass('hide');
                $('div.'+box).removeClass('hide');
            }
        });
    },
    
    
    _updateUser: function(user) {
        var that = this;
        // if user's already displayed
        if($("#"+user.uid).length > 0) {
            that._updateUserState(user, $("#"+user.uid), $("#"+user.uid).children("a"));
            return;
        }
        // if its anonymous, we return
        var screenname = that.getScreenName(user.uid);
        if(screenname === "" || screenname === "anonymous") {
            return;
        }
        // finally displays the new user
        var userField = $('<a>').attr("href","#").text(screenname);//.attr('href', '/accounts/'+user.name);

            // role information
        var imgField = $('<img>')
            .attr("alt", "")
            .attr("src", "http://www.gravatar.com/avatar/"+user.metadata.md5+"?d=retro");

        var figureField = $('<figure>')
            .attr("uid", user.uid)
            .addClass('user-avatar')
            .append(imgField)
            .prependTo(userField);

        var item = $('<li>')
            .attr("id", user.uid)
            .append(userField);

        that._attachClick(item);

        if ($.inArray(user.uid, that.options.speakers) > -1) {
            item.addClass("user-avatar-personality");
        }
        if (user.uid == that.options.uceclient.uid) {
            item.addClass("ui-roster-user-you");
            if ($(".form-comment-avatar").hasClass("form-comment-avatar-you")===false){
                $(".form-comment-avatar").attr("src", "http://www.gravatar.com/avatar/"+user.metadata.md5+"?d=retro");
                $(".form-comment-avatar").addClass("form-comment-avatar-you");
            }
        }
        that._updateUserState(user, item);
    },

    /*
     * Switch classes depending on the user's status
     */
    _updateUserState: function(user , useritem){
        var that = this;
        if (that._state.roster === null){
            useritem.removeClass("connected-user");
            useritem.addClass("offline-user");
            that._updatePosition(useritem);
        } else {
            if ($.inArray(user.uid, that._state.rosterUidList)>-1) {
                useritem.removeClass("offline-user");
                useritem.addClass("connected-user");
                that._updatePosition(useritem);
            } else {
                useritem.removeClass("connected-user");
                useritem.addClass("offline-user");
                that._updatePosition(useritem);
            }
        }
    },

    /*
     * Position the user
     */
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
    
    /**
     * Periodic method updating display
     * for all users
     */
    _updateRoster: function() {
        var users = [];
        $.each(this._state.users, function(uid, user) {
            if(_.isBoolean(user)===false) {
                users.push(user);
            }
        });
        var me = this._state.users[this.options.uceclient.uid];
        var that = this;
        // requete Async uce
        this.options.ucemeeting.getRoster(function(err, roster){
            if (err!==null){
                that.autoReconnectUser();
                return;
            }
            that._state.roster=roster;
            that._state.rosterUidList = $.map(roster, function(connecteduser){ return connecteduser.uid });
            $.each(users, function(idx, user) {
                that._updateUser(user);
            });
        });
    },
    reconnectUser: function() {
        var that = this;
        that.options.uceclient.auth(
            // TODO trash these crappy functions
            getUsername(),
            getUcenginePassword(),
            function(err, result, xhr) {
                if (err<500 && err >= 400) {
                    that.options.uceclient.auth(
                        'anonymous',
                        '',
                        function(err, result, xhr) {
                            that.options.ucemeeting.join({}, function(err, result, xhr) {
                                if(err) {
                                    // TODO notify
                                }
                            });
                        });
                } else if (err>=500) {
                    /* server error, then retry every second */
                    window.setTimeout(that.autoReconnectUser, 1000);
                } else {
                    that.options.ucemeeting.join({}, function(err, result, xhr) {
                        if(err!==null) {
                            // TODO notify
                        }
                    });
                }
        });
    },
    autoReconnectUser: function() {
        var that = this;
        this.options.uceclient.presence(function(err, presence) {
            if (err!==null) {
                that.reconnectUser();
            }
        });
    },
    
    destroy: function() {
        this.element.find('li').remove();
        this.element.removeClass("ui-roster");
        $.Widget.prototype.destroy.apply(this, arguments); // default destroy
    }
};
$.uce.widget("roster", new $.uce.Roster());
