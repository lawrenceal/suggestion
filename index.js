(function(window){
    var baiduData = null,
        SUGGESTIONBOXNAME = 'suggestion-box',
        SELECTEDCLASSNAME = 'selected';

    function extend(target, source){
        for(var key in source){
            if(source.hasOwnProperty(key)){
                target[key] = source[key];
            }
        }
        return target;
    }

    function getOffset(ele){
        var actualTop = ele.offsetTop, actualLeft = ele.offsetLeft;

        while(ele = ele.offsetParent){
            actualTop += ele.offsetTop;
            actualLeft += ele.offsetLeft;
        }

        return {
            top: actualTop,
            left: actualLeft
        };
    }

    function removeNode(node){
        node.parentNode.removeChild(node);
    }

    function hasClass(ele, cln){
        var classNameArr = ele.className.split(/\s+/).filter(function(c){
            return c === cln;
        });

        return classNameArr.length > 0;

        //return ele.className.split(cln).length >= 2;
    }

    function addClass(ele, cln){
        var arr = ele.className
            .split(/\s+/)
            .filter(function(c){
                return c === cln;
            });

        if(!arr.length){
            ele.className += cln;
        }
    }

    function removeClass(ele, cln){
        ele.className = ele.className
            .split(/\s+/)
            .filter(function(c){return c !== cln})
            .join(' ');
    }

    function removeAllChild(ele){
        while (ele.hasChildNodes()){
            ele.removeChild(ele.firstChild);
        }
    }

    var defaults = {
        minWidth: 250,
        maxHeight: 196,
        dataUrl: ''
    };

    function Suggestion(selector, options){
        return new Suggestion.prototype.init(selector, options);
    }

    Suggestion.prototype.init = function(selector, options){
        var that = this;
        this.element = document.querySelector(selector);
        this.options = extend(defaults, options);

        this.minWidth = this.options.minWidth;
        this.maxHeight = this.options.maxHeight;

        this.value = null;

        this.element.addEventListener('focus', this._focus.bind(this), false);

        //TODO throttle
        this.element.addEventListener('input', this._input.bind(this), false);

        //TODO event target window
        this.element.addEventListener('keydown', this._keyDown.bind(this), false);

        window.addEventListener('click', function(event){
            var target = event.target || event.srcElement;

            if(target === that.element ||
                (target.tagName.toLowerCase() === 'li' && hasClass(target.parentNode, SUGGESTIONBOXNAME))){
                return;
            }

            if(that.box){
                that.box.style.display = 'none';
            }

        }, false);
    };

    Suggestion.prototype.destroy = function(){};

    Suggestion.prototype.selected = function(fn){
        this.selectedFn = fn;
    };

    Suggestion.prototype._focus = function(event){
        var target = event.target || event.srcElement;

        if(target.parentNode.querySelector('.' + SUGGESTIONBOXNAME) === null){
            this.box = this._createBox(target);
            target.parentNode.appendChild(this.box);
            this._addBoxEvent();
        }else{
            this.box.style.display = 'block';
        }

        //TODO when focus the same value
        if(this.element.value && this.box.childNodes.length === 0){
            this._getData(this.element.value);
        }
    };

    Suggestion.prototype._input = function(event){
        var value = event.target.value;
        this.value = value;
        this._getData(value);
    };

    Suggestion.prototype._keyDown = function(event){
        var keyCode = event.keyCode;

        //display none offsetHeight = 0
        if(!this.box || this.box.offsetHeight === 0){
            return;
        }

        if(keyCode === 38 || keyCode === 40 || keyCode === 13){
            event.preventDefault();
        }

        var selected = this.box.getElementsByClassName(SELECTEDCLASSNAME)[0],
            first = this.box.firstElementChild,
            last = this.box.lastElementChild,
            before, next;

        if(keyCode === 38){

            if(selected){
                before = selected.previousElementSibling;
                removeClass(selected, SELECTEDCLASSNAME);

                if(before !== null){
                    addClass(before, SELECTEDCLASSNAME);
                    this._select(before);
                }else{
                    addClass(last, SELECTEDCLASSNAME);
                    this._select(last);
                }
            }else{
                addClass(last, SELECTEDCLASSNAME);
                this._select(last);
            }
        }

        if(keyCode === 40){

            if(selected){
                next = selected.nextElementSibling;
                removeClass(selected, SELECTEDCLASSNAME);

                if(next !== null){
                    addClass(next, SELECTEDCLASSNAME);
                    this._select(next);
                }else{
                    addClass(first, SELECTEDCLASSNAME);
                    this._select(first);
                }
            }else{
                addClass(first, SELECTEDCLASSNAME);
                this._select(first);
            }
        }

        if(keyCode === 13){
            this._closeBox();
        }
    };

    Suggestion.prototype._select = function(target){
        var value = target.dataset.key;
        this.element.value = value;
        this.value = value;
        this.selectedFn(value);
    };

    Suggestion.prototype._getData = function(value){
        var that = this;
        if(this.dataUrl){
            //TODO ajax url

        }else{
            sendBaiduRequest(value, function(){
                that._createList(baiduData);
            });
        }
    };

    Suggestion.prototype._createBox = function(){
        var ul = document.createElement('ul'),
            targetOffset = getOffset(this.element);

        ul.className = SUGGESTIONBOXNAME;
        ul.style.minWidth = this.minWidth + 'px';
        //ul.style.maxHeight = this.maxHeight + 'px'; TODO
        ul.style.top = (this.element.offsetHeight + targetOffset.top + 5) + 'px';
        ul.style.left = targetOffset.left + 'px';
        ul.style.display = 'none';
        return ul;
    };

    Suggestion.prototype._addBoxEvent = function(){
        var that = this;

        that.box.addEventListener('mouseover', function(event){
            var target = event.target || event.srcElement;

            if(target.tagName.toLowerCase() === 'li'){
                addClass(target, SELECTEDCLASSNAME);
            }
        }, false);

        that.box.addEventListener('mouseout', function(event){
            var target = event.target || event.srcElement;

            if(target.tagName.toLowerCase() === 'li'){
                removeClass(target, SELECTEDCLASSNAME);
            }

        }, false);

        that.box.addEventListener('click', function(event){
            event.stopPropagation();
            var target = event.target || event.srcElement;

            if(target.tagName.toLowerCase() === 'li'){
                that._select(target);
                that._closeBox();
            }
        }, false);
    };

    Suggestion.prototype._createList = function(data){
        var html = '';

        data.forEach(function(item){
            html += '<li data-key="' + item + '">' + item + '</li>';
        });

        this.box.innerHTML = html;
        if(html !== ''){
            this.box.style.display = 'block';
        }else{
            this.box.style.display = 'none';
        }
    };

    Suggestion.prototype._closeBox = function(){
        removeAllChild(this.box);
        this.box.style.display = 'none';
    };

    Suggestion.prototype.init.prototype = Suggestion.prototype;

    /**
     * get baidu data
     * @param value
     * @param callback
     */
    function sendBaiduRequest(value, callback){
        var script = document.createElement('script');
        script.setAttribute('baiduData','baiduData');
        script.src = 'http://www.baidu.com/su?&wd=' + encodeURI(value) + '&p=3&cb=fn';

        script.onload = function(){
            if(typeof callback === 'function'){
                callback();
            }
        };

        document.body.appendChild(script);
    }

    /***
     * baidu data callback
     * @param data
     */
    function fn(data){
        removeNode(document.querySelector('script[baiduData="baiduData"]'));
        baiduData = data.s;
    }

    window.Suggestion = Suggestion;
    window.fn = fn;

})(window);