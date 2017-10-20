import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

export default class Sign extends Component {
  static propTypes = {
    cb: PropTypes.func,
  }

  componentDidMount = () => {
    const cb = this.props.cb;
    if (cb) {
      setTimeout(() => {
        window.location.href = this.props.cb;
      }, 5000);
    }
  };

  render() {
    const { cb } = this.props;
    return (
      <div className="Sign__result-container">
        <div className="Sign__result-title-bg">
          <object data="/img/sign/success.svg" type="image/svg+xml" id="success-icon" />
        </div>
        <h2><FormattedMessage id="congratulations" /></h2>
        <h5><FormattedMessage id="success_operation_broadcasted" /></h5>

        {cb && <p><FormattedMessage id="redirect_ten_seconds" /></p>}
        {cb && <a className="Sign__button" href={cb} target="_blank" rel="noopener noreferrer"><FormattedMessage id="click_here" /></a>}
      </div>
    );
  }
}