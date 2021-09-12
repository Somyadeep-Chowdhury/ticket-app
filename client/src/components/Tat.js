import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../styles/Color.css';
class Tat extends Component {
    static propTypes = {
        value: PropTypes.string.isRequired,
        index: PropTypes.number.isRequired,
        change: PropTypes.func.isRequired
    };
    render() {
        const { value, index, change } = this.props;
        const colors = {
            "red": "red",
            "black": "black",
            "white": "white"
        }
        var x = +"'" + value + "'";
        let backgroundColor = "";
        let color = colors.black;
        let text = "";
        if (x.includes("+")) {
            backgroundColor = colors.red;
            color = colors.white;
            text = value
        }
        else if (x === undefined) {
            backgroundColor = colors.white;
            text = ""
        }
        else {
            backgroundColor = "";
            color = colors.black;
            text = value
        }
        return (
            <p className="cellColor"
                value={value}
                onChange={event => change(event.target.value, index)}
                style={{
                    backgroundColor: backgroundColor, color: color,
                    // textAlign: 'center',
                    fontWeight: "bold"
                }}>{text}</p>
        )
    }
}

export default Tat;