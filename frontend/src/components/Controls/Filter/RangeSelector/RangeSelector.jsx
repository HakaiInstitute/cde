import React from "react";
import PropTypes from 'prop-types'
import Slider from "rc-slider";
import './styles.css'

export default class RangeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dynamicKey: Date.now(),
    };
  }

  onSliderChange = value => {
    this.props.setStartDepth(value[0])
    this.props.setEndDepth(value[1])
  };

  onInputChange = (value, index) => {
    // When an input changes we set the dynamicKey
    this.setState({
      dynamicKey: Date.now()
    });

    if (value >= this.state.min && value <= this.state.max) {
      this.setState(state => {
        state.value[index] = Number(value);
        return {
          value: state.value.sort((x, y) => x - y)
        };
      });
    }
  };

  render() {
    return (
      <div className='rangeSelector'>
        <Slider.Range
          key={this.state.dynamicKey}
          min={0}
          max={12000}
          value={[this.props.startDepth, this.props.endDepth]}
          onChange={this.onSliderChange}
          railStyle={{
            height: 2
          }}
          handleStyle={{
            height: 28,
            width: 28,
            marginLeft: -14,
            marginTop: -14,
            // backgroundColor: "red",
            border: 0
          }}
          trackStyle={{
            background: "none"
          }}
          marks={{
            // "-100": '-100',
            0: '0m',
            // 1000: '1000m',
            2000: '2000m',
            // 3000: '3000m',
            4000: '4000m',
            // 5000: '5000m',
            6000: '6000m',
            // 7000: '7000m',
            8000: '8000m',
            // 9000: '9000m',
            10000: '10000m',
            // 11000: '11000m',
            12000: '12000m'
          }}
        />
      </div>
    );
  }
}

RangeSelector.propTypes = {
  startDepth: PropTypes.number.isRequired,
  endDepth: PropTypes.number.isRequired,
  setStartDepth: PropTypes.func.isRequired,
  setEndDepth: PropTypes.func.isRequired
}