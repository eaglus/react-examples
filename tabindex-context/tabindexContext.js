var
  NODE_NODE_TYPE = 1;

  FOCUSABLE_ELEMENTS = {
      'a': true,
      'link': true,
      'button': true,
      'input': true,
      'select': true,
      'textarea': true
   },
   CLASS_HIDDEN_FLAG = 1,
   CLASS_DISABLED_FLAG = 2,
   CLASS_DELEGATES_TAB_FLAG = 4,
   CLASS_NAME_TO_FLAG = {
      hidden: CLASS_HIDDEN_FLAG,
      disabled: CLASS_DISABLED_FLAG,
      'delegates-tabfocus': CLASS_DELEGATES_TAB_FLAG
   },
   ELEMENTS_PROPS_CLASS_RE = /\cls-(hidden|disabled|delegates-tabfocus)\b/g;

 function getStyle(element, style) {
    function winGetStyle(element, style) {
       return window.getComputedStyle(element)[style];
    }

    function jqGetStyle(element, style) {
       return $(element).css(style);
    }

    var getStyleImpl = window.getComputedStyle ? winGetStyle : jqGetStyle

    return getStyleImpl(element, style);
 }

function assert(cond) {
  if (!cond) {
    throw new Error('Assert');
  }
}

//Функции для переносимости кода - сюда надо будет
function firstElementChild(element) {
  return element.firstElementChild;
}

function lastElementChild(element) {
  return element.lastElementChild;
}

function previousElementSibling(element) {
  return element.previousElementSibling;
}

function nextElementSibling(element) {
  return element.nextElementSibling;
}

/**
 * Функция, выдающая свойства элементов в обходе по умолчанию.  См. {@link findWithContexts}
 * @param {HTMLElement} Элемент, свойства которого надо узнать
 * @returns {TabTraverseProps} свойства элемента в обходе
 */
function getElementPropsDef(element) {
   var
      className = element.getAttribute('class'),
      classes, tabIndex, tabIndexAttr, validTabIndex, flags, enabled, result;

   flags = 0;
   while (classes = (className && ELEMENTS_PROPS_CLASS_RE.exec(className))) {
      flags |= CLASS_NAME_TO_FLAG[classes[1]];
   }

   enabled = (flags & (CLASS_HIDDEN_FLAG | CLASS_DISABLED_FLAG)) === 0;
   if (enabled) {
      enabled = getStyle(element, 'display') !== 'none' && getStyle(element, 'visibility') !== 'invisible';
   }
   if (enabled) {
      tabIndexAttr = element.getAttribute('tabindex');
      tabIndex = parseInt(tabIndexAttr, 10);
      validTabIndex = !isNaN(tabIndex);

      result = {
         enabled: true,
         tabStop: (validTabIndex && tabIndex >= 0) || (tabIndexAttr === null && FOCUSABLE_ELEMENTS.hasOwnProperty(element.tagName.toLowerCase())),
         createsContext: tabIndexAttr !== null,
         tabIndex: tabIndex || 0, //обязательно хоть 0
         delegateFocusToChildren: (flags & CLASS_DELEGATES_TAB_FLAG) !== 0
      };
   } else {
      result = {
         enabled: false,
         tabStop: false,
         createsContext: false,
         tabIndex: 0,
         delegateFocusToChildren: false
      };
   }

   return result;
}

/**
* Обходит DOM, обход осуществляется в пределах rootElement. При этом, если находит элемент, в который может провалиться,
* проваливается и ищет там.
*/
function find(contextElement, fromElement, fromElementTabIndex, reverse, getElementProps) {

  assert(contextElement && (fromElement || fromElementTabIndex !== undefined) && getElementProps && contextElement !== fromElement);

  /**
   * сравнивает табиндексы по величине
   * @param i1
   * @param i2
   * @returns {number}
   * @param reverse
   */
  function compareIndexes(i1, i2, reverse) {
     var res;
     assert(typeof(i1) === 'number' && typeof(i2) === 'number');

     i1 = i1 === 0 ? Infinity : (i1 > 0 ? i1 : -1);
     i2 = i2 === 0 ? Infinity : (i2 > 0 ? i2 : -1);

     if (i1 > i2) {
        res = reverse ? -1 : 1;
     } else if (i1 < i2) {
        res = reverse ? 1 : -1;
     } else {
        res = 0;
     }

     return res;
  }

  function findNextElement(element, props, reverse) {
     var
        stepInto = props.enabled && !props.tabStop && !props.createsContext,
        next, parent;

     if (stepInto) {
        next = reverse ? lastElementChild(element) : firstElementChild(element);
     }

     if (!next) {
        next = reverse ? previousElementSibling(element) : nextElementSibling(element);
        if (!next) {
           parent = element.parentNode;
           while (parent !== contextElement && !next) {
              next = reverse ? previousElementSibling(parent) : nextElementSibling(parent);
              if (!next) {
                 parent = parent.parentNode;
              }
           }
        }
     }

     return next || contextElement;
  }

  function startChildElement(parent) {
     return reverse ? lastElementChild(parent) : firstElementChild(parent);
  }

  var
     next, nextProps,
     stage, result, cmp, props, insideElement,
     nearestElement = null, nearestElementStage, nearestTabIndex = null;

  if (fromElement) {
     props = getElementProps(fromElement);
     fromElementTabIndex = props.tabIndex;
     next = findNextElement(fromElement, props, reverse);
  } else {
     next = reverse ? lastElementChild(contextElement) : firstElementChild(contextElement);
  }

  for (stage = 0; stage !== 2 && !result; stage++) {
     while (next !== contextElement && next !== fromElement && !result) {
        nextProps = getElementProps(next);

        if (nextProps.enabled && nextProps.tabStop) {
           cmp = compareIndexes(nextProps.tabIndex, fromElementTabIndex, reverse);
           if (cmp === 0) {
              result = next;
           }

           //обновляем ближайший, если ti у next больше fromElement.ti, но меньше ti ближайшего
           if (!result && cmp > 0 && (nearestElement === null || compareIndexes(nextProps.tabIndex, nearestElement.tabIndex, reverse) < 0)) {
              nearestElement = next;
              nearestTabIndex = nextProps.tabIndex;
              nearestElementStage = stage;
           }
        }

        if (!result ) {
           next = findNextElement(next, nextProps, reverse);
        }
     }

     if (next === contextElement) { //завершение stage=0, элемент не найден
        assert(stage === 0);
        if (fromElementTabIndex > 0 && fromElement) {
           next = startChildElement(contextElement);
        } else {
           stage = 1;//для нулевого
        }
     }
  }

  assert(!!result || next === fromElement || next === contextElement);

  if (!result && nearestElement) {
     assert(fromElementTabIndex > 0 || (reverse && fromElementTabIndex === 0));
     if (nearestTabIndex > 0 || nearestElementStage === 0) {
        result = nearestElement;
     }
  }

  if (result) {
     // ищем подходящий элемент для всех элементов, пока можем проваливаться внутрь нового контекста
     insideElement = result;
     props = getElementProps(insideElement);
     while (insideElement && props.delegateFocusToChildren) {
        insideElement = find(insideElement, undefined, reverse ? 0 : 1, reverse, getElementProps);
        if (insideElement) {
           result = insideElement;
           props = getElementProps(insideElement);
        }
     }
  }

  return result;
}

/**
* Функция ищет первый элемент в _иерархическом_ порядке обхода по табу, заданном атрибутами tabindex и порядком элементов в дереве.
* См. документацию по функции {@link findWithContexts}.
* @param {HTMLElement} contextElement Родительский элемент, внутри кторого нужно искать.
* @param {boolean}  Порядок обхода: false - вперёд, true - назад.
* @param {getElementPropsCbk} Функция, определяющая свойства элементов в обходе. По умолчанию используется функция {@link getElementPropsDef}.
* Свойства см. в типе {@link TabTraverseProps}.
*/
function findFirstInContext(contextElement, reverse, getElementProps) {
  return find(contextElement, undefined, reverse ? 0 : 1, reverse, getElementProps || getElementPropsDef);
}

/**
* @typedef TabTraverseProps Этот тип описывает роль элемента в порядке обхода элементов по табу.
* @type {object}
* @property {boolean} enabled Разрешён ли элемент (нет ли не нём класса, обозначающего его "выключенность").
* Запрещённый элемент не участвует в обходе, а также не участвуют в обходе его дочерние элементы.
* @property {boolean} tabStop - Принимает ли элемент фокус. Если да, то на нём можно остановиться, иначе
* нужно искать следующий в его дочерних элементах (а после них в его соседях, или родителях - в порядке обхода дерева).
* @property {boolean} createsContext - Создаёт ли этот элемент свой контекст таб-индекса. Обычно это элемент с установленным атрибутом tabindex,
* и имеющий дочерние элементы.
* @property {Number} tabIndex - Таб-индекс элемента, определяющий его приоритет в обходе. У элементов типа input при незаданном атрибуте tabindex это свойство
* будет нулём.
* @property {boolean} delegateFocusToChildren - Свойство показывает, что элемент не принимает фокус при переходе по табу, а отдаёт своему дочернему элементу - первому
* в порядке обхода в контексте, заданном элементом со свойством delegateFocusToChildren.
*/

/**
 * Определение функции-пареметра у {@link findWithContexts}
 * @callback getElementPropsCbk
 * @param {HTMLElement} Элемент, свойства которого надо узнать
 * @returns {TabTraverseProps} свойства элемента в обходе
 */

/**
* Функция ищет следующий элемент в _иерархическом_ порядке обхода по табу, заданном атрибутами tabindex и порядком элементов в дереве.
* Особенность её в том, что она обходит элементы с учётом того, что родительские элементы, имеющие атрибут tabindex, создают свой "контекст"
* таб-индекса, так, что элементы с одинаковым таб-индексом, лежащие в разных родителях, задающих свой контекст таб-индекса, не перемешиваются в обходе, как в
* обычно в HTML. Это позволяет задавать порядок обхода в вёрстке компонента, не боясь, что фокус уйдёт в другой компонент, в котором есть элемент с таким же таб-индексом,
* как и у кого-то в этом компоненте.
*
* @param {HTMLElement} rootElement Корневой узел, в пределах которого возможен обход. Если функция не находит следующий узел для перехода от
* элемента {@link fromElement} в рамках элемента в её иерархии, задающего контекст таб-индекса, то она пытается перейти от родительского элемента,
* имеющего таб-индекс, на следующий элемент. Если не может, то переходит от родителя выше (имеющего таб-индекс).
* Если же переход будет невозможен (то есть, {@link fromElement} является последним в иерархическом порядке обхода в пределах {@link rootElement}), функция отдаёт null.
*
* @param {HTMLElement} Узел, от которого ищется следующий в иерархическом обходе. Должен лежать в иерархии, задаваемой узлом {@link rootElement}.

* @param {boolean} Порядок обхода: false - вперёд, true - назад.
* @param {getElementPropsCbk} Функция, определяющая свойства элементов в обходе. По умолчанию используется функция {@link getElementPropsDef}.
* Свойства см. в типе {@link TabTraverseProps}.
*/
function findWithContexts(rootElement, fromElement, reverse, getElementProps) {

  /** Получаю родительский элемент, задающий контекст таб-индекса, также валидирую element:
  * если он лежит внутри невидимого/запрещённого элемента, то ищу первый разрешённый родитель, и отдаю его в
  * в качестве element, и элемент, задающий контекст таб-индекса, ищу уже у него.
  * @param {HTMLElement} см {@fromElement}
  * @returns {{element: HTMLElement, context: HTMLElement}} Возвращает отвалидированный узел для начала обхода (element),
  * и узел, задающий контекст таб-индекса. Если вся иерархия узла element не подходит для обхода (невидимая, например), то
  * в качестве element отдаётся {@rootElement}
  */
  function getValidatedWithContext(element) {
     var
        context, lastInvalid = null, validatedElement, parent = element;

     if (!getElementProps) {
       getElementProps = getElementPropsDef;
     }

     while (parent && parent !== rootElement) {
        if (!getElementProps(parent).enabled) {
           lastInvalid = parent;
        }
        parent = parent.parentElement;
     }

     if (!parent) {
        throw new Error('Узел fromElement должен лежать внутри узла rootElement');
     }

     validatedElement = lastInvalid || element;

     if (validatedElement !== rootElement) {
        parent = validatedElement.parentElement;
        while (parent !== rootElement && !getElementProps(parent).createsContext) {
           parent = parent.parentElement;
        }
        context = parent;
     }

     return {
        element: element, //разрешённый/запрещённый, и лежит в разрешённой иерархии, лежит точно в элементе context
        context: context  //разрешённый, и лежит в разрешённой иерархии
     };
  }

  function checkElement(element, paramName) {
     if (!element || !element.ownerDocument || !element.parentElement || element.nodeType !== NODE_NODE_TYPE) {
        throw new Error('Плохой параметр ' + paramName);
     }
  }

  //Проверка параметров
  checkElement(fromElement, 'fromElement');
  checkElement(rootElement, 'rootElement');

  var
     validated = getValidatedWithContext(fromElement),
     result = null;

   while (!result && validated.element !== rootElement) {
      //ищу следующий элемент в обходе в текущем контексте
      result = find(validated.context, validated.element, undefined, reverse, getElementProps);
      if (!result) {
         //если не нахожу в этом контексте - ищу в родительском
         validated = getValidatedWithContext(validated.context);
      }
   };

  return result;
}

export {findWithContexts, findFirstInContext, getElementPropsDef};
