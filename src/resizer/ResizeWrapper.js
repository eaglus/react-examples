import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

import styles from './ResizeWrapper.css';

//в этом режиме блок resizer лежит абсолютом поверх блока target
//и закрывает его (за счёт того, что лежит точно после него, и имеет
//такой же z-index). Поскольку он лежит в том же родителе,
//то и прокручивается он вместе с блоком target без проблем, и z-index у
//него соответствует блоку target, так что он перекрывает ровно то, что и target
const MODE_HINT = Symbol('hover');

//В этом режиме блока resizer в вёрстке нет
const MODE_INACTIVE = Symbol('inactive');

//в этом режиме блок resizer обрабатывает события мыши, и меняет свой размер.
//при этом, чтобы не вызывать никаких изменений в прокрутке родительской иерархии,
//и иметь видимые края для таскания, он должен перекрывать всё в документе -
//поэтому в этом режиме он лежит в body
const MODE_RESIZE = Symbol('resize');

//Это подрежим режима MODE_RESIZE - в этом режиме происходит таскание
//за правый край блока resizer, и меняется только ширина его
const RESIZE_MODE_WIDTH = Symbol('width');

//Это подрежим режима MODE_RESIZE - в этом режиме происходит таскание
//за низ край блока resizer, и меняется только высота его
const RESIZE_MODE_HEIGHT = Symbol('height');

//Это подрежим режима MODE_RESIZE - в этом режиме происходит таскание
//за правый нижний край блока resizer, и меняется и высота, и ширина его
const RESIZE_MODE_BOTH = Symbol('both');

//Минимальные размеры блока resizer (а значит, и блока target)
const MIN_WIDTH = 20;
const MIN_HEIGHT = 20;

function getPosParent(element) {
  var parent = element.parentElement;
  while (parent && parent.tagName.toLowerCase() !== 'body' && window.getComputedStyle(parent).position === 'static') {
    parent = parent.parentElement;
  }
  return parent;
}

const ResizeWrapper = React.createClass({
  propTypes: {
    //свойство включает блок resizer, размеры которого можно менять мышью
    active: React.PropTypes.bool,

    //через это свойство после изменения размеров блока resizer они передаются родителю
    onSetSize: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      active: false
    };
  },

  getInitialState() {
    return {
      //Устанавливаем начальный режим по свойству active
      mode: this.props.active ? MODE_HINT : MODE_INACTIVE
    };
  },

  //блок, лежащий поверх элемента target (оборачиваемого блока).
  //по окончании изменения размера блока resizer размер блока target
  //ставится по размеру блока resizer (через событие onSetSize)
  _resizer: null,

  render() {
    //Render отдаёт вёрстку обёрнутого элемента, элемент resizer добавляется отдельно в методе updateResizer
    //и является "невидимым" для реактовского движка, поскольку "прячется" перед применением изменений (componentWillUpdate)
    const targetChild = React.Children.only(this.props.children);
    return targetChild;
  },

  componentWillReceiveProps(nextProps) {
    const mode = this.state.mode;
    var newMode;

    if (nextProps.active) {
      //включаем режим показа ресайзера, если нужно
      newMode = mode === MODE_INACTIVE ? MODE_HINT : mode;
    } else {
      //выключаем режим показ ресайзера, в каком бы он режиме ни был
      newMode = MODE_INACTIVE;
    }
    if (mode !== newMode) {
      this.setState({mode: newMode});//включаем новый режим, а ресайзер под него подгоним в componentDidUpdate
    }
  },

  componentDidMount() {
    //первый показ компонента - тут надо привести ресайзер в соответствие с режимом
    this.updateResizer(this.state.mode);
  },

  componentWillUpdate() {
    //Если блок resizer лежит в том же узле, что и блок target,
    //то перед обновлением родительского контрола (которое вызовет render у дочернего контрола ResizeWrapper)
    //нужно удалить этот узел из родительского, чтобы не мешать реактовскому обновлению узлов
    //реактовский алгоритм обновления знает только про свои узлы, и может поломаться, если в момент обновления
    //рядом с ними лежат ещё какие-то посторонние
    if (this.state.mode === MODE_HINT && this._resizer) {
      this._resizer.detach();//тут надо делать detach, чтобы jquery события не отцепил
    }
  },

  componentDidUpdate(prevProps, prevState) {
    //Реактовский движок применил изменения, теперь можно вернуть "спрятанный" ресайзер на место
    //и/или привести его в соответствие с режимом.
    //Это нужно делать в том случае, если режим сменился, или режим === MODE_HINT (то есть, ресайзер лежит)
    //в том же родителе, что и target, а значит, был убран в componentWillUpdate, и его надо вернуть обратно
    if (prevState.mode !== this.state.mode || this.state.mode === MODE_HINT) {
      this.updateResizer(this.state.mode);
    }
  },

  componentWillUnmount() {
    this.updateResizer(MODE_INACTIVE);
  },

  //по этому событию начинаем изменение размера ресайзера
  resizerTipMouseDown(resizeMode, event) {
    const resizer = this._resizer;
    const target = $(ReactDOM.findDOMNode(this));

    function getResizingSize(event, allSize) {
      var
        offset = resizer.offset(),
        size = {};

      if (resizeMode === RESIZE_MODE_WIDTH || resizeMode === RESIZE_MODE_BOTH || allSize) {
        size.width = Math.max(MIN_WIDTH, event.pageX - offset.left);
      }

      if (resizeMode === RESIZE_MODE_HEIGHT || resizeMode === RESIZE_MODE_BOTH || allSize) {
        size.height = Math.max(MIN_HEIGHT, event.pageY - offset.top);
      }

      return size;
    }

    function onDocMouseMove(event) {
      //меняем размер блока resizer
      resizer.css(getResizingSize(event));

      //делаем preventDefault, чтобы не происходило выделения текста в документе
      event.preventDefault();
    }

    const onDocMouseUp = (event) => {
      //заканчиваем изменение размера у блока resizer, и устанавливаем
      //размер блока target по окончательному размеру блока resizer

      document.removeEventListener('mousemove', onDocMouseMove);
      document.removeEventListener('mouseup', onDocMouseUp);

      if (this.props.onSetSize) {
        this.props.onSetSize(getResizingSize(event, true));
      }

      this.updateResizer(MODE_HINT);
    };

    //тут переключаемся в режим изменения размера
    this.updateResizer(MODE_RESIZE);

    //mousemove/mouseup надо слушать у документа, чтобы они работали даже
    //при выходе мыши за пределы его
    document.addEventListener('mousemove', onDocMouseMove);
    document.addEventListener('mouseup',   onDocMouseUp);
  },

  updateResizer(newMode) {
    if (newMode !== MODE_INACTIVE) {
      const target = $(ReactDOM.findDOMNode(this));
      const body = $('body');

      //console.log('updateResizer', newMode, target);

      //Если нужно, создаём блок resizer, и блоки внутри него, за которые и будем таскать resizer
      if (!this._resizer) {

        const resizer = $('<div />');
        resizer.attr('class', styles.resizer);
        this._resizer = resizer;

        //это блок на правом крае, "таскание" за который меняет ширину
        const rightTip = $('<div />');
        rightTip.attr('class', styles['right-tip']);
        rightTip.on('mousedown', this.resizerTipMouseDown.bind(this, RESIZE_MODE_WIDTH));

        //это блок на нижнем крае, "таскание" за который меняет высоту
        const bottomTip = $('<div />');
        bottomTip.attr('class', styles['bottom-tip']);
        bottomTip.on('mousedown', this.resizerTipMouseDown.bind(this, RESIZE_MODE_HEIGHT));

        //это блок на нижнем правом углу, "таскание" за который меняет и высоту, и ширину
        const cornerTip = $('<div />');
        cornerTip.attr('class', styles['corner-tip']);
        cornerTip.on('mousedown', this.resizerTipMouseDown.bind(this, RESIZE_MODE_BOTH));

        resizer.append(rightTip);
        resizer.append(bottomTip);
        resizer.append(cornerTip);
      }

      if (newMode === MODE_RESIZE) {
        //режим изменения размера. тут надо resizer положить в body,
    		//чтобы другие блоки не мешали менять его размеры
        body.append(this._resizer);

        const targetPos = target.offset();
  			const css = {
  				left: targetPos.left,
  				top: targetPos.top,
  				width: target.outerWidth() + 'px',
  				height: target.outerHeight() + 'px',
  				'z-index': ''
  			};

        //блок будет последним в body, и будет перекрывать всех, у кого верхний контекст z-index не задан
  			//можно заморочиться и найти максимальный z-index на первом уровне, но для этого примера вряд ли это нужно
        this._resizer.css(css).toggleClass(styles.resizing, true);
      } else if (newMode === MODE_HINT) {
        if (!this._resizer.prev().is(target)) {
          this._resizer.insertAfter(target);
        }

        const targetPos = target.position();
        const zIndex = parseInt(target.css('z-index'), 10);

        const css = {
          width: target.outerWidth(),
          height: target.outerHeight(),
          left: targetPos.left,
          top: targetPos.top
        };

        //z-index должен быть таким же, как у таргета
  			if (!isNaN(zIndex)) {
  				css['z-index'] = zIndex;
  			}

        this._resizer.css(css).toggleClass(styles.resizing, false);
      }

    } else if (this._resizer) {
      this._resizer.remove();
      this._resizer = null;
    }
  }
});

export default ResizeWrapper;
