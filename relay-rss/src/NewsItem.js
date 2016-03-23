import _ from 'lodash';
import React from 'react';
import {Link} from 'react-router';

const PropTypes = React.PropTypes;

const NewsItem = React.createClass({
  propTypes: {
    id: PropTypes.string.isRequired,
    type: PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string
    }).isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    mode: PropTypes.oneOf(['full', 'short']).isRequired
  },

  render() {
    const {title, id, mode, content, readCount} = this.props;

    const renderShort = () => <Link to={"/news/" + id}>{title} ({readCount})</Link>;
    const renderFull = () => <div>
      <h2>{title}</h2>
      <p>{content} ({readCount})</p>
    </div>;

    const modeFns = {
      full: renderFull,
      short: renderShort
    };

    return modeFns[mode]();
  }
});

export default NewsItem;
