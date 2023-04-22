import React, { Component } from 'react';
import './dataForm.css';
import './admin.css';
import { Button, Divider } from '@material-ui/core';
import NoteAddOutlinedIcon from '@material-ui/icons/NoteAddOutlined';
import { DataGrid } from '@material-ui/data-grid';
import Axios from 'axios'
import Modal from '@material-ui/core/Modal';

function parse_date(a) {
    var d = new Date(a),
        dformat = [d.getFullYear(), ("00" + (d.getMonth() + 1)).slice(-2), ("00" + (d.getDate() + 1)).slice(-2),].join('/') + ' ' +
            [("00" + (d.getHours() + 1)).slice(-2),
            ("00" + (d.getMinutes() + 1)).slice(-2),
            ("00" + (d.getSeconds() + 1)).slice(-2)].join(':');
    return dformat
}
function dateToString(date) {
    var formattedDate = new Date(date)
        .toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
        .replace(/(\d+)\/(\d+)\/(\d+)/, '$3/$2/$1');
    return formattedDate;
}
class DataForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            load: "wdlknv",
            columndata: [
                { field: 'form_name', headerName: 'Form Name', description: 'Name of form', headerAlign: 'left', width: 200, align: 'left', headerClassName: 'datagrid-header' },
                { field: 'description', headerName: 'Description', headerAlign: 'left', width: 350, align: 'left', headerClassName: 'datagrid-header' },
                { field: 'created_on', headerName: 'Created On (YYYY/MM/DD)', headerAlign: 'left', width: 300, description: 'Timestamp of form creation  (YYYY/MM/DD)', align: 'left', headerClassName: 'datagrid-header' },
                { field: 'id', headerName: 'Options', hide: true, headerAlign: 'center', headerClassName: 'datagrid-header' },
                {
                    field: "access_data",
                    headerName: "Options",
                    headerAlign: 'left',
                    width: 150,
                    headerClassName: 'datagrid-header',
                    align: 'left',
                    description: 'Click corresponding button to view this drive',
                    disableClickEventBubbling: true,
                    renderCell: (params) => {
                        const onClick = () => {
                            const api = params.api;
                            const fields = api
                                .getAllColumns()
                                .map((c) => c.field)
                                .filter((c) => c !== "__check__" && !!c);
                            const thisRow = {};
                            let app_drivedata;
                            fields.forEach((f) => {
                                app_drivedata = params.row.access_data;
                            });
                            this.setState({ modal_data: app_drivedata, modal_open: true })
                        };
                        return <Button onClick={onClick} width='140' color="primary" variant="contained">View</Button>;
                    }
                },
            ],
            tabledata: [],
            modal_data: [],
            modal_open: false,
        }
    }

    async componentDidMount() {
        var formlist = ""
        await Axios({
            method: "GET",
            url: "/access/all",
            withCredentials: true,
        })
            .then(res => {
                formlist = res.data;
                var dd = [];
                for (let i = 0; i < formlist.length; i++) {
                    let p = formlist[i]

                    let pa = { id: p["_id"], form_name: p["name"], description: p["description"], created_on: dateToString(p["timestamp"]), access_data: p["fields"] }
                    dd.push(pa);
                }
                dd.sort(function (a, b) {
                    return b.created_on.localeCompare(a.created_on);
                });
                this.setState({ tabledata: dd })
            })
            .catch(err => {
                alert("Not Authorized Login Again")
                window.location = `${process.env.REACT_APP_URL_PREFIX}/admin`;
            })
    }
    render() {
        return (
            <>
                <div className="dataform">
                    <div className="df-title">Dataform</div>
                    <div className="df-subtitle">All Forms</div>
                    <div className="df-description" >Here are the lists of form you created earlier</div>
                    <div className="df-table" ><DataGrid rows={this.state.tabledata} columns={this.state.columndata} pageSize={5} /></div>
                    {
                        <Modal
                            open={this.state.modal_open}
                            onClose={() => (this.setState({ modal_open: false }))}
                        >
                            <div id="modal-div">
                                <h3>Form Fields</h3>
                                <Divider />
                                <br />
                                <ul style={{ marginLeft: 30 }}>
                                    {
                                        this.state.modal_data.map((m) => (
                                            <li>{m}</li>
                                        ))
                                    }
                                </ul>
                                <br />
                                <br />
                            </div>
                        </Modal>
                    }
                    <div className="df-create-section">
                        <div className='df-subdes'>
                            <div className="df-subtitle">Can't find form full filing your requirements ?</div>
                            <div className="df-description" >Click on <b>ADD FORM</b> button to create new form</div>
                        </div>
                        <div className="df-create"><Button href={`${process.env.REACT_APP_URL_PREFIX}/admindashboard/createdataform`} variant="contained" color="primary" startIcon={<NoteAddOutlinedIcon />}> Add form </Button></div>
                    </div>
                    <div className="df-end" ></div>
                    <div className="df-footer" ></div>
                </div>
            </>
        );
    }
}

export default DataForm;
