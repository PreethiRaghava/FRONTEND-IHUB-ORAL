import React, { Component } from 'react';
import './drive.css';
import { DataGrid, GridColDef, GridApi, GridCellValue } from "@material-ui/data-grid";
import { Button } from '@material-ui/core';
import NoteAddOutlinedIcon from '@material-ui/icons/NoteAddOutlined';
import Axios from 'axios'

const tabledata = [
    { id: 1, drive_name: "name1", location: "wef", access_id: "rhba", description: "ctRHAT", created_on: "25-06-2021" },
    { id: 2, drive_name: "name2", location: "wgr", access_id: "abr", description: "cargr", created_on: "26-06-2021" },
    { id: 3, drive_name: "name3", location: "gwr", access_id: "abea", description: "RGy", created_on: "25-06-2021" },
    { id: 4, drive_name: "name4", location: "wgr", access_id: "baT", description: "xRBa", created_on: "24-06-2021" },
    { id: 5, drive_name: "name", location: "wrhb", access_id: "abeth", description: "xdf", created_on: "20-06-2021" },
]

class Staff extends Component {
    constructor(props) {
        super(props)
        this.state = {
            columndata: [
                { field: 'assist_aid', headerClassName: 'datagrid-header', headerName: 'Assistant ID', headerAlign: 'left', width: 250, align: 'left' },
                { field: 'name', headerClassName: 'datagrid-header', headerName: 'Assistant Name', description: 'Name of Drive', headerAlign: 'left', width: 300, align: 'left' },
                { field: 'mobile_number', headerClassName: 'datagrid-header', headerName: 'Mobile Number', headerAlign: 'left', width: 200, align: 'left' },
                { field: 'email', headerClassName: 'datagrid-header', headerName: 'Email', headerAlign: 'left', width: 350, align: 'left' },
                { field: 'id', headerClassName: 'datagrid-header', headerName: 'Options', hide: true, headerAlign: 'center', width: 0 },
            ],
            tabledata: []
        }
    }
    async componentDidMount() {
        var user = ""
        await Axios({
            method: "GET",
            url: "/admin/user",
            withCredentials: true
        })
            .then(res => {
                user = res.data;
                console.log(user)
                this.setState({ user: user, org_id: user.msg.org_id })
            })
            .catch(err => {
                // alert("not authorized")
                // window.location = `${process.env.REACT_APP_URL_PREFIX}/admin`;
            })
        await Axios({
            method: "POST",
            url: "/assist/byorgid",
            withCredentials: true,
            data: { org_id: user.msg.org_id }
        })
            .then(res => {
                user = res.data;
                console.log(user)
                var dd = [];
                for (let i = 0; i < user.length; i++) {
                    let p = user[i]
                    let name = "";
                    if (p["first_name"] !== "") name += (p["first_name"] + " ");
                    if (p["last_name"] !== "") name += (p["last_name"]);
                    let pa = { id: p["_id"], name: name, mobile_number: p["mobile_number"], assist_aid: p["assist_id"], email: p["email"] }
                    dd.push(pa);
                }
                this.setState({ tabledata: dd })
            })
            .catch(err => {
                // alert("not authorized")
                // window.location = `${process.env.REACT_APP_URL_PREFIX}/admin`;
            })
    }
    render() {
        return (
            <>
                <div className="drive">
                    <div className="df-title">Medical Assistant</div>
                    <div className="df-subtitle" >All Assistants</div>
                    <div className="df-description">List of all Medical Assistant assiociated with this organisation</div>
                    <div className="df-table" ><DataGrid rows={this.state.tabledata} columns={this.state.columndata} pageSize={5} /></div>
                    <div className="df-create-section">
                        <div className='df-subdes'>
                            <div className="df-subtitle">Want to register an Assistant ?</div>
                            <div className="df-description" >Click on <b>ADD Assistant</b> button to add new assistant</div>
                        </div>
                        <div className="df-create"><Button href={`${process.env.REACT_APP_URL_PREFIX}/admindashboard/addassistant`} variant="contained" color="primary" startIcon={<NoteAddOutlinedIcon />}> Add Assistant</Button></div>
                    </div>
                    <div className="df-end" ></div>
                    <div className="df-footer" ></div>
                </div>
            </>
        );
    }
}

export default Staff;
