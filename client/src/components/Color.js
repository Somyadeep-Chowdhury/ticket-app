import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../styles/Color.css';


class Color extends Component {
    static propTypes = {
        value: PropTypes.string.isRequired,
        index: PropTypes.number.isRequired,
        change: PropTypes.func.isRequired
    };

    render() {
        const { value, index, change } = this.props;
        const colors = {
            "green": "#24a148",
            "orange": "#ff8533",
            "yellow": "#f1c21b",
            "red": "#da1e28"
        }
        let backgroundColor = colors.white;
        if (value === "Closed") {
            backgroundColor = colors.green;

        } else if (value === "WIP") {
            backgroundColor = colors.yellow;
        }
        else if (value === "New") {
            backgroundColor = colors.red;
        }
        else if (value === "Open") {
            backgroundColor = colors.orange;
        }
        return (
            <p className="cellClass"
                value={value}
                onChange={event => change(event.target.value, index)}
                style={{
                    backgroundColor: backgroundColor, color: 'white',
                    fontWeight: 'bold'
                }}>{value}</p>

        )
    }
}

export default Color;