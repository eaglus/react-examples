import React from 'react';
import ResizeWrapper from './ResizeWrapper';
import styles from './ResizeWrapperDemo.css';

const ResizeWrapperDemo = React.createClass({
  getInitialState() {
    return {
      resizingActive: false,//активны ресайзеры или нет

      sizes: {}, //размеры ячеек, установленные пользователем с помощью ресайзеров (ResizeWrapper)

      //просто свойство, вызывающее перестроение родительского компонента.
      //нужно, чтобы показать, что перестроение родителя не ломает ресайзеры (и они ему не мешают)
      otherProp: false
    };
  },

  render() {
    const resizingActive = this.state.resizingActive;
    const toggleStateClick = (name) => {
      return (e) => {
        e.preventDefault();
        this.setState({ [name]: !this.state[name] });
      };
    };

    //Обрабатываем событие от ресайзера - устанавливаем размер заданной ячейке,
    //и вызываем перестроение (setState)
    const onSetSize = (rowIdx, colIdx, size) => {
      let newSizes = Object.assign({}, this.state.sizes);

      if (!newSizes[rowIdx]) {
        newSizes[rowIdx] = {};
      }
      newSizes[rowIdx][colIdx] = size;
      this.setState({sizes: newSizes});
    };

    const renderTrs = (rowsCnt, colsCnt) => {
      const renderTds = (trIdx, colsCnt) => {
        var i, tds = [];

        for (i = 0; i !== colsCnt; i++) {
          let style = {}, classNames = [styles.resizingTd], className;
          const sizes = this.state.sizes;
          const size = sizes[trIdx] && sizes[trIdx][i];
          if (size) {
            //если блоку установлен размер (с помощью ресайзера, из события onSetSize), то добавить его в вёрстку
            style.width = size.width;
            style.height = size.height;
            style.position = 'relative';
            classNames.push(styles.resized);
          }

          //ResizeWrapper управляет блоком, размеры которого нужно менять
          //при этом ResizeWrapper не оборачивает этот блок ни во что -
          //блок - ресайзер он кладёт рядом с ним, и на время применения движком изменений
          //в родителе убирает блок-ресайзер из DOM-а, чтобы не мешать алгоритму применения
          className = classNames.join(' ');
          tds.push(
            <td className={className} key={i}>
              <ResizeWrapper active={resizingActive} onSetSize={onSetSize.bind(this, trIdx, i)}>
                <div className={styles.className} style={style}>Cell to resize</div>
              </ResizeWrapper>
            </td>);
        }

        return tds;
      };

      var i, trs = [];
      for (i = 0; i !== rowsCnt; i++) {
        trs.push(<tr key={i}>
          {renderTds(i, colsCnt)}
        </tr>);
      }

      return trs;
    };


    //Здесь ссылка "Toggle resizers" включает ресайзеры, которые меняют размеры ячеек таблицы,
    //а кнопка "Toggle other parent prop" меняет ненужное свойство, вызывая перестроение контрола,
    //чтобы показать, что перестроение родителя не ломает ресайзеры (и они ему не мешают)
    return <div>
      <div className={styles.root}>
        <a href="#" onClick={toggleStateClick('resizingActive')} className={styles.toggleLink}>Toggle resizers</a>
        <a href="#" onClick={toggleStateClick('otherProp')} className={styles.toggleLink}>Toggle other parent prop</a>

        <div className={styles.bigBlock}>
          <table cellPadding="0" cellSpacing="0">
            <tbody>
              {renderTrs(10, 4)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
  }
});

export default ResizeWrapperDemo;
