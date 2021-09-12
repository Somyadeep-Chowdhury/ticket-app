import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Snackbar } from '@material-ui/core';
import '../styles/upload.css'
import * as AllActions from '../actions/index';
import * as XLSX from 'xlsx';

class Upload extends Component {
    state = {
        selectedFile: '',
        response: '',
        show: '',
        spinnerFlag: '',
        selectedeSyncFile: '',
        err: false,
        error: ""
    }
    onChangeHandler = event => {
        this.setState({
            selectedFile: event.target.files[0],
            loaded: 0,
        })
    }

    // onChangeeSync = event => {
    //     this.setState({
    //         selectedeSyncFile: event.target.files[0],
    //         loaded: 0,
    //     })
    // }
    handleReset = () => {
        console.log("reset")
        this.setState({
            response: '',
            show: '',
            spinnerFlag: '',
            selectedeSyncFile: '',
            err: false,
            error: ""
        })
    }
    // handleUploadeSync = () => {
    //     this.setState({ spinnerFlag: true });
    //     var dataParsed;
    //     // var files = e.target.files, f = files[0];
    //     var fs = this.state.selectedeSyncFile
    //     var readers = new FileReader();
    //     readers.onload = function (e) {
    //         var result = e.target.result;
    //         let resultData = XLSX.read(result, { type: 'binary' });
    //         const sheetname = resultData.SheetNames[0];
    //         const sheet = resultData.Sheets[sheetname];
    //         /* Convert array to json*/
    //         dataParsed = XLSX.utils.sheet_to_row_object_array(sheet, { defval: "" });
    //         // setFileUploaded(dataParse);
    //     };
    //     setTimeout(() => {
    //         if (dataParsed && dataParsed.length !== 0) {
    //             //  console.log(dataParsed, "insideeee")
    //             // this.props.actions.uploadeSyncExcel(dataParsed)
    //         }
    //     }, 2000)
    //     setTimeout(() => {
    //         console.log(this.props.eSyncData, "backend dataaa")
    //         if (this.props.eSyncData && this.props.eSyncData.status === 200) {
    //             this.setState({ response: this.props.eSyncData, show: false, spinnerFlag: false, errmessage: this.props.eSyncData.data.message, iconColor: "text-success" })
    //             setTimeout(() => {
    //                 this.handleReset()
    //             }, 1500)
    //         }
    //         // window.location.reload()
    //     }, 25000);
    //     readers.readAsBinaryString(fs)
    // }

    //file upload for sst
    onClickHandler = async () => {
        this.setState({ show: true });
        var dataParse;
        // var files = e.target.files, f = files[0];
        var f = this.state.selectedFile
        var reader = new FileReader();
        reader.onload = await function (e) {
            var data = e.target.result;
            let readedData = XLSX.read(data, { type: 'binary' });
            const wsname = readedData.SheetNames[0];
            const ws = readedData.Sheets[wsname];
            /* Convert array to json*/
            dataParse = XLSX.utils.sheet_to_row_object_array(ws, { defval: "" });
        };
        setTimeout(() => {
            if (dataParse && dataParse.length !== 0) {
                // console.log(dataParse, "insideeee")
                this.props.actions.uploadExcel(dataParse, { "loggedinUser": this.props.user_details.username, "email": this.props.user_details.userEmail, })
            }
        }, 2000)
        setTimeout(() => {
            // console.log(this.props.excelData, "backend dataaa")
            if (this.props.excelData && this.props.excelData.status === 200) {
                this.setState({ response: this.props.excelData, show: false, error: this.props.excelData.data.message, err: true, iconColor: "text-success" })
                setTimeout(() => {
                    this.handleReset()
                }, 2500)
            }
            // window.location.reload()
        }, 8000);
        reader.readAsBinaryString(f)
    }

    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col">
                        <div className="card main-card">
                            <div className="card-header text-center createheader">Upload User list</div>
                            <div className="card-body cardbody text-center">
                                <div className="row">
                                    <div className="col">
                                        <div className="row">
                                            <div className="col">
                                                <span>
                                                    <input type="file" name="file" className="btn upload" accept=".xlsx, .xls" onChange={this.onChangeHandler} />
                                                    <button className="btn uploadBtn" onClick={this.onClickHandler}>Upload</button>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {this.state.show === true && <div className="text-center">
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>}
                            </div>
                        </div>
                    </div>
                    {/* <div className="col">
                        <div className="card main-card">
                            <div className="card-header text-center createheader">Upload eSync Data</div>
                            <div className="card-body cardbody text-center">
                                <div className="row">
                                    <div className="col">
                                        <div className="row">
                                            <div className="col">
                                                <input type="file" name="file" className="btn upload" accept=".xlsx, .xls" onChange={this.onChangeeSync} />
                                                <button className="btn uploadBtn" onClick={this.handleUploadeSync}>Upload</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={this.state.err}
                    className='snacking'
                    message={this.state.error}
                />
            </div>
        );
    }
}

// export default Upload;
const mapStateToProps = state => ({
    excelData: state.page.excelData,
    eSyncData: state.page.eSyncData,
    user_details: state.user.user_details,
});

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(AllActions, dispatch)
});
export default connect(mapStateToProps, mapDispatchToProps)(Upload);