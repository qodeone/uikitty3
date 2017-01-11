/*! UIkit 3.0.0-beta.2 | http://www.getuikit.com | (c) 2014 - 2016 YOOtheme | MIT License */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('uikit')) :
    typeof define === 'function' && define.amd ? define(['uikit'], factory) :
    (factory(global.UIkit));
}(this, (function (uikit) { 'use strict';

var $ = uikit.util.$;
var doc = uikit.util.doc;
var extend = uikit.util.extend;
var isWithin = uikit.util.isWithin;
var Observer = uikit.util.Observer;
var on = uikit.util.on;
var off = uikit.util.off;
var pointerDown = uikit.util.pointerDown;
var pointerMove = uikit.util.pointerMove;
var pointerUp = uikit.util.pointerUp;
var requestAnimationFrame = uikit.util.requestAnimationFrame;
var win = uikit.util.win;

UIkit.component('sortable', {

    mixins: [uikit.mixin.class],

    props: {
        group: String,
        animation: Number,
        threshold: Number,
        clsItem: String,
        clsPlaceholder: String,
        clsDrag: String,
        clsDragState: String,
        clsBase: String,
        clsNoDrag: String,
        clsEmpty: String,
        clsCustom: String,
        handle: String
    },

    defaults: {
        group: false,
        animation: 150,
        threshold: 5,
        clsItem: 'uk-sortable-item',
        clsPlaceholder: 'uk-sortable-placeholder',
        clsDrag: 'uk-sortable-drag',
        clsDragState: 'uk-drag',
        clsBase: 'uk-sortable',
        clsNoDrag: 'uk-sortable-nodrag',
        clsEmpty: 'uk-sortable-empty',
        clsCustom: '',
        handle: false
    },

    ready: function ready() {
        var this$1 = this;


        ['init', 'start', 'move', 'end'].forEach(function (key) {
            var fn = this$1[key];
            this$1[key] = function (e) {
                e = e.originalEvent || e;
                this$1.scrollY = window.scrollY;
                var ref = e.touches && e.touches[0] || e;
                var pageX = ref.pageX;
                var pageY = ref.pageY;
                this$1.pos = {x: pageX, y: pageY};

                fn(e);
            }
        });

        on(this.$el, pointerDown, this.init);

        if (this.clsEmpty) {
            var empty = function () { return this$1.$el.toggleClass(this$1.clsEmpty, !this$1.$el.children().length); };
            (new Observer(empty)).observe(this.$el[0], {childList: true});
            empty();
        }

    },

    update: {

        write: function write() {
            var this$1 = this;


            if (!this.drag) {
                return;
            }

            this.drag.offset({top: this.pos.y + this.origin.top, left: this.pos.x + this.origin.left});

            var top = this.drag.offset().top, bottom = top + this.drag[0].offsetHeight;

            if (top > 0 && top < this.scrollY) {
                setTimeout(function () { return win.scrollTop(this$1.scrollY - 5); }, 5);
            } else if (bottom < doc[0].offsetHeight && bottom > window.innerHeight + this.scrollY) {
                setTimeout(function () { return win.scrollTop(this$1.scrollY + 5); }, 5);
            }

        }

    },

    methods: {

        init: function init(e) {

            var target = $(e.target), placeholder = this.$el.children().filter(function (i, el) { return isWithin(e.target, el); });

            if (!placeholder.length
                || target.is(':input')
                || this.handle && !isWithin(target, this.handle)
                || e.button && e.button !== 0
                || isWithin(target, ("." + (this.clsNoDrag)))
            ) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            this.touched = [this];
            this.placeholder = placeholder;
            this.origin = extend({target: target, index: this.placeholder.index()}, this.pos);

            doc.on(pointerMove, this.move);
            doc.on(pointerUp, this.end);
            win.on('scroll', this.scroll);

            if (!this.threshold) {
                this.start(e);
            }

        },

        start: function start(e) {

            this.drag = $(this.placeholder[0].outerHTML.replace(/^<li/i, '<div').replace(/li>$/i, 'div>'))
                .attr('uk-no-boot', '')
                .addClass(((this.clsDrag) + " " + (this.clsCustom)))
                .css({
                    boxSizing: 'border-box',
                    width: this.placeholder.outerWidth(),
                    height: this.placeholder.outerHeight()
                })
                .css(this.placeholder.css(['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']))
                .appendTo(uikit.container);

            this.drag.children().first().height(this.placeholder.children().height());

            var ref = this.placeholder.offset();
            var left = ref.left;
            var top = ref.top;
            extend(this.origin, {left: left - this.pos.x, top: top - this.pos.y});

            this.placeholder.addClass(this.clsPlaceholder);
            this.$el.children().addClass(this.clsItem);
            doc.addClass(this.clsDragState);

            this.$el.trigger('start', [this, this.placeholder, this.drag]);

            this.move(e);
        },

        move: function move(e) {

            if (!this.drag) {

                if (Math.abs(this.pos.x - this.origin.x) > this.threshold || Math.abs(this.pos.y - this.origin.y) > this.threshold) {
                    this.start(e);
                }

                return;
            }

            this.update();

            var target = e.type === 'mousemove' ? e.target : document.elementFromPoint(this.pos.x - document.body.scrollLeft, this.pos.y - document.body.scrollTop),
                sortable = getSortable(target),
                previous = getSortable(this.placeholder[0]),
                move = sortable !== previous;

            if (!sortable || isWithin(target, this.placeholder) || move && (!sortable.group || sortable.group !== previous.group)) {
                return;
            }

            target = sortable.$el.is(target.parentNode) && $(target) || sortable.$el.children().has(target);

            if (move) {
                previous.remove(this.placeholder);
            } else if (!target.length) {
                return;
            }

            sortable.insert(this.placeholder, target);

            if (!~this.touched.indexOf(sortable)) {
                this.touched.push(sortable);
            }

        },

        scroll: function scroll() {
            var scroll = window.scrollY;
            if (scroll !== this.scrollY) {
                this.pos.y += scroll - this.scrollY;
                this.scrollY = scroll;
                this.update();
            }
        },

        end: function end(e) {

            doc.off(pointerMove, this.move);
            doc.off(pointerUp, this.end);
            win.off('scroll', this.scroll);

            if (!this.drag) {

                if (e.type !== 'mouseup' && isWithin(e.target, 'a[href]')) {
                    location.href = $(e.target).closest('a[href]').attr('href');
                }

                return;
            }

            preventClick();

            var sortable = getSortable(this.placeholder[0]);

            if (this === sortable) {
                if (this.origin.index !== this.placeholder.index()) {
                    this.$el.trigger('change', [this, this.placeholder, 'moved']);
                }
            } else {
                sortable.$el.trigger('change', [sortable, this.placeholder, 'added']);
                this.$el.trigger('change', [this, this.placeholder, 'removed']);
            }

            this.$el.trigger('stop', [this]);

            this.drag.remove();
            this.drag = null;

            this.touched.forEach(function (sortable) { return sortable.$el.children().removeClass(((sortable.clsPlaceholder) + " " + (sortable.clsItem))); });

            doc.removeClass(this.clsDragState);

        },

        update: function update() {
            this._callUpdate();
        },

        insert: function insert(element, target) {
            var this$1 = this;


            this.$el.children().addClass(this.clsItem);

            var insert = function () {

                if (target.length) {

                    if (!this$1.$el.has(element).length || element.prevAll().filter(target).length) {
                        element.insertBefore(target);
                    } else {
                        element.insertAfter(target);
                    }

                } else {
                    this$1.$el.append(element);
                }

                this$1.$updateParents();
            };

            if (this.animation) {
                this.animate(insert);
            } else {
                insert();
            }

        },

        remove: function remove(element) {
            var this$1 = this;


            if (!this.$el.has(element).length) {
                return;
            }

            var remove = function () {
                element.remove();
                this$1.$updateParents();
            };

            if (this.animation) {
                this.animate(remove);
            } else {
                remove();
            }

        },

        animate: function animate(action) {
            var this$1 = this;


            var props = [],
                children = this.$el.children().toArray().map(function (el) {
                    el = $(el);
                    props.push(extend({
                        position: 'absolute',
                        pointerEvents: 'none',
                        width: el.outerWidth(),
                        height: el.outerHeight()
                    }, el.position()));
                    return el;
                }),
                reset = {position: '', width: '', height: '', pointerEvents: '', top: '', left: ''};

            action();

            children.forEach(function (el) { return el.stop(); });
            this.$el.children().css(reset);
            this.$updateParents();

            requestAnimationFrame(function () {

                this$1.$el.css('min-height', this$1.$el.height());

                var positions = children.map(function (el) { return el.position(); });
                $.when.apply($, children.map(function (el, i) { return el.css(props[i]).animate(positions[i], this$1.animation).promise(); }))
                    .then(function () {
                        this$1.$el.css('min-height', '').children().css(reset);
                        this$1.$updateParents();
                    });
            })
        }

    }

});

function getSortable(element) {
    return UIkit.getComponent(element, 'sortable') || element.parentNode && getSortable(element.parentNode);
}

function preventClick() {
    var timer = setTimeout(function () { return doc.trigger('click'); }, 0),
        listener = function (e) {

            e.preventDefault();
            e.stopPropagation();

            clearTimeout(timer);
            off(doc, 'click', listener, true);
        };

    on(doc, 'click', listener, true);
}

})));