(function(window){

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

    var defaults = {
        width: 200,
        height: 200,
        url: ''
    };

    function Suggestion(selector, options){
        return new Suggestion.prototype.init(selector, options);
    }

    Suggestion.prototype.init = function(selector, options){
        this.element = document.querySelector(selector);
        this.options = extend(defaults, options);

        this.width = this.options.width;
        this.height = this.options.height;

        this.boxClass = 'suggestion-box';
        this.value = null;

        this.element.addEventListener('focus', this._focus.bind(this), false);
        this.element.addEventListener('input', this._input.bind(this), false);

    };

    Suggestion.prototype.destroy = function(){};

    Suggestion.prototype._focus = function(event){
        var target = event.target || event.srcElement;

        if(target.parentNode.querySelector('.' + this.boxClass) === null){
            this.box = this._createBox(target);
            target.parentNode.appendChild(this.box);
        }
    };

    Suggestion.prototype._input = function(event){
        var value = event.target.value;
        this.value = value;

        if(this.url){
            //TODO ajax
        }else{
            sendBaiduRequest(value);
        }

    };

    Suggestion.prototype._createBox = function(){
        var ul = document.createElement('ul'),
            targetOffset = getOffset(this.element);
        ul.className = this.boxClass;
        ul.style.width = this.width + 'px';
        ul.style.height = this.height + 'px';
        ul.style.top = (this.element.offsetHeight + targetOffset.top + 5) + 'px';
        ul.style.left = targetOffset.left + 'px';
        return ul;
    };

    Suggestion.prototype._createList = function(data){
        var that = this;
        that.box.empty();

        data.forEach(function(item){
            var li = document.createElement('li');
            li.textContent = item;
            that.box.appendChild(li);
        });

    };

    Suggestion.prototype.fn = function(data){
        this._createList(data.s);
    };

    Suggestion.prototype.init.prototype = Suggestion.prototype;

    function sendBaiduRequest(value){
        var script = document.createElement('script');
        script.setAttribute('baiduData','baiduData');
        script.src = 'http://www.baidu.com/su?&wd=' + encodeURI(value) + '&p=3&cb=fn';
        document.body.appendChild(script);
    }

    window.Suggestion = Suggestion;
    window.fn = Suggestion.prototype.fn;


})(window);