/*! UIkit 3.0.0-beta.3 | http://www.getuikit.com | (c) 2014 - 2016 YOOtheme | MIT License */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('uikit')) :
    typeof define === 'function' && define.amd ? define(['uikit'], factory) :
    (factory(global.UIkit));
}(this, (function (uikit) { 'use strict';

var $ = uikit.util.$;
var Transition = uikit.util.Transition;

var containers = {};

UIkit.component('notification', {

    functional: true,

    args: ['message', 'status'],

    defaults: {
        message: '',
        status: '',
        timeout: 5000,
        group: null,
        pos: 'top-center',
        onClose: null
    },

    created: function created() {

        if (!containers[this.pos]) {
            containers[this.pos] = $(("<div class=\"uk-notification uk-notification-" + (this.pos) + "\"></div>")).appendTo(uikit.container);
        }

        this.$mount($(
            ("<div class=\"uk-notification-message" + (this.status ? (" uk-notification-message-" + (this.status)) : '') + "\">\n                <a href=\"#\" class=\"uk-notification-close\" data-uk-close></a>\n                <div>" + (this.message) + "</div>\n            </div>")
        ).appendTo(containers[this.pos].show()));

    },

    ready: function ready() {
        var this$1 = this;


        var marginBottom = parseInt(this.$el.css('margin-bottom'), 10);

        Transition.start(
            this.$el.css({opacity: 0, marginTop: -1 * this.$el.outerHeight(), marginBottom: 0}),
            {opacity: 1, marginTop: 0, marginBottom: marginBottom}
        ).then(function () {
            if (this$1.timeout) {
                this$1.timer = setTimeout(this$1.close, this$1.timeout);
                this$1.$el
                    .on('mouseenter', function () { return clearTimeout(this$1.timer); })
                    .on('mouseleave', function () { return this$1.timer = setTimeout(this$1.close, this$1.timeout); });
            }
        });

    },

    events: {

        click: function click(e) {
            e.preventDefault();
            this.close();
        }

    },

    methods: {

        close: function close(immediate) {
            var this$1 = this;


            var remove = function () {

                this$1.onClose && this$1.onClose();
                this$1.$el.trigger('close', [this$1]).remove();

                if (!containers[this$1.pos].children().length) {
                    containers[this$1.pos].hide();
                }

            };

            if (this.timer) {
                clearTimeout(this.timer);
            }

            if (immediate) {
                remove();
            } else {
                Transition.start(this.$el, {opacity: 0, marginTop: -1 * this.$el.outerHeight(), marginBottom: 0}).then(remove)
            }
        }

    }

});

UIkit.notification.closeAll = function (group, immediate) {

    var notification;
    UIkit.elements.forEach(function (el) {
        if ((notification = UIkit.getComponent(el, 'notification')) && (!group || group === notification.group)) {
            notification.close(immediate);
        }
    });

};

})));