import { Button, CircularProgress, Grid, TextField } from '@material-ui/core';
import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux'
import axios from 'axios';

// const serverUrl = 'http://localhost:8181'
const serverUrl = ''
const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        margin: theme.spacing(3),
        width: '100%',
    },
    button: {
        margin: 'auto',
        display: 'block',
        backgroundColor: '#0c5bac'
    },
    progress: {
        margin: '10px auto',
        display: 'block',
        color: '#0c5bac',

    },
    errorInput: {
        fontSize: '18px',
        color: 'red',
        fontWeight: 600,
        margin: '10px auto',
        display: 'block',
        textAlign: 'center'
    }
}));

export const ActionLog = (props) => {
    const classes = useStyles();
    const [fromDate, setfromDate] = useState(new Date());
    const [toDate, settoDate] = useState(new Date());
    const [loading, setloading] = useState(false)
    const [errorMessage, seterrorMessage] = useState("")

    const userDetails = useSelector(state => state.user.user_details);
    const handleFromDateChange = (date) => {
        setfromDate(date.target.value);
        seterrorMessage("")
    };
    const handleToDateChange = (date) => {
        settoDate(date.target.value);
        seterrorMessage("")
    };

    const handleSubmit = () => {
        setloading(true)
        seterrorMessage("")
        axios.post(serverUrl + '/api/v1/actionData', {
            "fromDate": fromDate,
            "toDate": toDate,
            "loggedinUser": userDetails.username,
            "email": userDetails.userEmail,
        })
            .then((response) => {
                // console.log(response)
                if (response.status === 200 && response.data.message === "Action Log Retreived") {
                    var items = response.data.data.length > 0 ? response.data.data.reverse() : response.data.data;
                    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
                    const header = Object.keys(items[0]);
                    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));

                    csv.unshift(header.join(','));
                    csv = csv.join('\r\n');
                    setloading(false)

                    //Download the file as CSV
                    var downloadLink = document.createElement("a");
                    var blob = new Blob(["\ufeff", csv]);
                    var url = URL.createObjectURL(blob);
                    downloadLink.href = url;
                    downloadLink.download = `WS3 Ticketing ${fromDate} to ${toDate} Action Logs.csv`;  //Name the file here
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
                else {
                    setloading(false);
                    seterrorMessage("Change Date and Try Again");
                }
            }).catch(err => {
                setloading(false);
                seterrorMessage("Change Date and Try Again");
            })
    }
    return (
        <div>
            <div className="card main-card">
                <div className="card-header text-center createheader">Select Date Range To Download Activity Log</div>
                <div className="card-body cardbody">
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                        spacing={4}
                    >
                        <Grid container item xs={3} spacing={0}></Grid>
                        <Grid container item xs={3} spacing={0}>
                            <TextField
                                id="date"
                                label="From Date"
                                type="date"
                                value={fromDate}
                                onChange={handleFromDateChange}
                                className={classes.textField}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid container item xs={3} spacing={0}>
                            <TextField
                                id="date"
                                label="To Date"
                                type="date"
                                value={toDate}
                                onChange={handleToDateChange}
                                className={classes.textField}
                                inputProps={{ min: fromDate }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid container item xs={3} spacing={0}></Grid>
                    </Grid>
                    <Button className={classes.button} onClick={handleSubmit} variant="contained" color="primary">Get Log</Button>
                    {loading === true && <CircularProgress className={classes.progress} />}
                    {errorMessage !== "" && <span className={classes.errorInput}>{errorMessage}</span>}
                </div>
            </div>

        </div >
    )
}
