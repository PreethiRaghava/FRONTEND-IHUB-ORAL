import React, { Component } from 'react';
import { AppBar, Chip, Checkbox, FormLabel, FormControlLabel, FormHelperText, FormGroup, Card, Paper, Toolbar, Typography, Button, IconButton, Divider, Container, TextField, Grid, FormControl, Select, InputLabel, MenuItem } from '@material-ui/core'
import { DataGrid, GridCellParams } from '@material-ui/data-grid';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Axios from 'axios';
import './driveinfo.css'
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CircularProgress from '@material-ui/core/CircularProgress';
import Modal from '@material-ui/core/Modal';
import PatientForm from '../../patientForm';
import Fuse from 'fuse.js'
import PatientHistory from '../../patient_history';
import AddAssistant from './addAssistant'
import HealthcareIcon from '../../icons/healthcare_icon.png'
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import FaceIcon from '@material-ui/icons/Face';
class DriveInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            drive_id: localStorage.getItem("drive_selected"),
            drive_load: "Loading...",
            load2: "Loading...",
            user: "",
            org_id: localStorage.getItem("iiithcp-orgid"),
            drive_details: [],
            drive_name: '',
            assist_ids: [],
            assist_name: 'NEED BACKEND',
            description: '',
            form_id: '',
            form_name: '',
            location: '',
            timestamp: '',
            patients: [],
            access_col: [],
            access_dd: [],
            modal_data: [],
            modal_data_f: [],
            modal_open_f: false,
            modal_open: false,
            search: false,
            fil_label: [],
            fil_bool: [{ "name": "true" }, { "name": "false" }],
            fil_num: [{ "name": "less than" }, { "name": "equal" }, { "name": "more than" }],
            fil_str: [],
            filter_label: '',
            filter_type: '',
            filter_OP: '',
            filter: false,
            filter_value: '',
            expanded: false,
            loadfil: '',
            medmod: false,
            medmod_data: [],
            assmod: false,
            editmod: false,
            assmod_data: [],
            edit_assist_id: "",
            edit_assist_id_old: [],
            edit_assist_id_new: [],
        }
        this.back = this.back.bind(this)
        this.getinfo = this.getinfo.bind(this)
        this.filtering = this.filtering.bind(this)
        this.fuzzysearch = this.fuzzysearch.bind(this)
        this.close_modal = this.close_modal.bind(this)
        this.close_medmod = this.close_medmod.bind(this)
        this.close_assmod = this.close_assmod.bind(this)
        this.open_medmod = this.open_medmod.bind(this)
        this.openform = this.openform.bind(this)
        this.replace_form = this.replace_form.bind(this)
        this.handleChangelabel = this.handleChangelabel.bind(this)
        this.handleChangelabelcheck = this.handleChangelabelcheck.bind(this)
        this.handleChangelabel2 = this.handleChangelabel2.bind(this)
        this.handleChangetype = this.handleChangetype.bind(this)
        this.handleChangeOP = this.handleChangeOP.bind(this)
        this.handleChangeVal = this.handleChangeVal.bind(this)
        this.handlePanelChange = this.handlePanelChange.bind(this)
        this.edit_modal_close = this.edit_modal_close.bind(this)
        this.clearfil = this.clearfil.bind(this)

    }
    back() {
        window.location = `${process.env.REACT_APP_DEV === "true" ? process.env.REACT_APP_URL_PREFIX_DEV : process.env.REACT_APP_URL_PREFIX_PROD}/admindashboard/drives`;
    }
    close_modal() {
        this.setState({ modal_open: false })
    }
    close_medmod(e) {
        this.setState({ medmod: false })
    }
    close_assmod(e) {
        this.setState({ assmod: false, edit_assist_id: "", edit_assist_id_new: [] })
    }
    open_medmod(e, pa) {
        console.log(pa)
        e.stopPropagation()
        let mobile_number = ''
        let selectedPatientId = pa.id
        let selectedVisit = ''
        let userInfo = {
            first_name: pa.first_name,
            last_name: pa.last_name,
            patient_id: pa.id,
            admin: 'true'
        }
        let values = { mobile_number, selectedPatientId, userInfo, selectedVisit }
        console.log(values)
        let cc = [];
        cc.push(values)
        this.setState({ medmod: true, medmod_data: cc })
    }
    openform() {
        this.setState({ modal_open_f: true })
    }
    edit_modal_close() {
        this.setState({ editmod: false, assmod: true })
        this.getinfo()
    }
    replace_form() {
        localStorage.setItem("iiith_replace_form_id", this.state.form_id)
        localStorage.setItem("iiith_replace_drive_id", this.state.drive_id)
        window.location = `${process.env.REACT_APP_DEV === "true" ? process.env.REACT_APP_URL_PREFIX_DEV : process.env.REACT_APP_URL_PREFIX_PROD}/admindashboard/replacedatafroms`;
    }
    async filtering() {
        let ress = [];
        this.setState({ loadfil: true })
        let data = {
            name: this.state.filter_label.split('#')[0],
            parent: this.state.filter_label.split('#')[2],
            operation: this.state.filter_type,
            value: this.state.filter_value
        }
        if (data.operation === "true" || data.operation === "false") {
            if (data.operation === "true") data.value = true
            else data.value = false
            data.operation = "equal"
        }
        let qq = [];
        qq.push(data)
        console.log(qq)
        await Axios({
            method: "POST",
            url: "/filter/filter",
            withCredentials: true,
            data: { drive_id: this.state.drive_id, queries: qq }
        })
            .then(res => {
                ress = res.data.data;
                console.log(res.data.data)
                let ll = [];
                for (let gg in ress) {
                    let xy = ress[gg]
                    ll.push(xy.patient_id)
                }
                console.log(ll)
                let pp = []
                for (let tx in this.state.patients) {
                    if (ll.includes(this.state.patients[tx].id)) pp.push({ item: this.state.patients[tx] });
                }
                this.setState({ searched_patients: pp, filter: true, search: true, loadfil: false })
                // this.setState({patients:[],loadfil:false})
            })
            .catch(err => {
                alert("Error ocurred while filtering.")
            })
    }
    clearfil() {
        this.setState({ search: false, filter_label: "", filter_type: "", filter_value: "" })
        document.getElementById("serach_fuzzy").value = ""
    }
    handleChangelabel = (e) => {
        let a = e.target.value
        let b = a.split('#')[1]
        this.setState({ filter_label: a, fil_OP: b });
    };
    handleChangelabel2 = (e) => {
        let a = e.target.value
        let b = [];
        console.log(a)
        for (let x in this.state.assist_ids) {
            console.log(this.state.assist_ids[x])
            if (this.state.assist_ids[x]._id === a) {
                b = this.state.assist_ids[x].allowed_fields
                break;
            }
        }
        console.log(b)
        if (b === undefined) b = []
        this.setState({ edit_assist_id: a, edit_assist_id_new: b });
    };
    handleChangelabelcheck = (e) => {
        let a = e.target.name
        let b = this.state.edit_assist_id_new;
        let c = []
        if (!b.includes(a)) {
            b.push(a)
            this.setState({ edit_assist_id_new: b });
        }
        else {
            c = b.filter(aaa => aaa !== a)
            this.setState({ edit_assist_id_new: c });
        }
    };
    updateassist = async (e) => {
        if (!this.state.edit_assist_id) alert("Select an assistant first")
        let data = {
            assist_id: this.state.edit_assist_id,
            allowed_list: this.state.edit_assist_id_new,
            driveID: this.state.drive_id,
        }
        console.log(data)
        await Axios({
            method: "POST",
            url: "/assist/replaceallowed",
            withCredentials: true,
            data: data
        })
            .then(res => {
                alert("Updated")
            })
            .catch(err => {
                alert("Can't update. Try Again.")
            })
        this.setState({ assmod: false, edit_assist_id: "", edit_assist_id_new: [] })
        this.getinfo()
    };
    handleChangetype = (e) => {
        this.setState({ filter_type: e.target.value });
    };
    handleChangeOP = (e) => {
        this.setState({ filter_OP: e.target.value });
    };
    handleChangeVal = (e) => {
        this.setState({ filter_value: e.target.value });
    };
    fuzzysearch(e) {
        if ((e.target.value).trim())
            this.setState({ search: true })
        else
            this.setState({ search: false })

        let zika = [];
        let options = {};
        if (this.state.filter === true) {
            options = {
                includeScore: true,
                shouldSort: true,
                keys: ["name", "id"]
            }
            for (let rr in this.state.searched_patients) zika.push(this.state.searched_patients[rr].item)
            // zika=this.searched_patients
        }
        else {
            options = {
                includeScore: true,
                shouldSort: true,
                keys: ["name", "id"]
            }
            zika = this.state.patients
        }

        const fuse = new Fuse(zika, options)
        const result = fuse.search(e.target.value)
        this.setState({ searched_patients: result })
        console.log(result)
    }
    handlePanelChange = (panel) => (event, isExpanded) => {
        let val = isExpanded ? panel : false
        this.setState({ expanded: val })
    };
    async componentDidMount() {
        this.getinfo()
    }
    async getinfo() {
        let fif = [];
        let ress = [];
        await Axios({
            method: "GET",
            url: "/filter/all",
            withCredentials: true,
        })
            .then(res => {
                ress = res.data.data.filters;
                for (let ggg in ress) {
                    let x = ress[ggg]
                    let b = x["name"] + "#"
                    if (x["field"] === "integer") b += "num"
                    if (x["field"] === "boolean") b += "bool"
                    b += "#"
                    b += x["parent"]
                    let a = { name: x["name"], type: b }
                    fif.push(a)
                }
                this.setState({ fil_label: fif })
            })
            .catch(err => {
                alert("Error ocurred while fetching filtering list.")
            })
        let drive_data;
        let drive_data2;
        let drive_data3;
        await Axios({
            method: "POST",
            url: "/drive/getdrivebyid",
            withCredentials: true,
            data: { drive_id: this.state.drive_id }
        })
            .then(res => {
                drive_data = res.data.data;
                console.log(drive_data.medical_assistant)
                this.setState({ drive_name: drive_data.drive_name, assist_ids: drive_data.medical_assistant, location: drive_data.location, timestamp: drive_data.timestamp, description: drive_data.description })
            })
            .catch(err => {
                alert("Drive not exist or not authorized")
            })
        await Axios({
            method: "POST",
            url: "/access/byid",
            withCredentials: true,
            data: { access_id: drive_data.access_data }
        })
            .then(res => {
                this.setState({ form_id: drive_data.access_data, form_name: res.data.name, drive_load: "" })
            })
            .catch(err => {
                alert("Drive not exist or not authorized")
            })
        let drive_assist_list = [];

        for (let assist in drive_data.medical_assistant) {
            let drive_assist;
            let drive_ass;
            await Axios({
                method: "POST",
                url: "/assist/byid",
                withCredentials: true,
                data: { asst_id: drive_data.medical_assistant[assist] }
            })
                .then(res => {
                    drive_assist = res.data.allowed_fields;
                    for (let st in drive_assist) {
                        let tmmp = drive_assist[st]
                        if (this.state.drive_id === tmmp.drive_id) {
                            drive_ass = tmmp.fields
                            break;
                        }
                    }
                    let new_name = "";
                    if (res.data.first_name !== "") new_name += (res.data.first_name + " ")
                    if (res.data.last_name !== "") new_name += (res.data.last_name + " ")
                    let pp = { _id: res.data._id, assist_id: res.data.assist_id, name: new_name, allowed_fields: drive_ass }
                    drive_assist_list.push(pp)
                })
                .catch(err => {
                    // alert("Drive not exist or not authorized")
                })
        }
        console.log(drive_assist_list)
        this.setState({ assist_ids: drive_assist_list })

        await Axios({
            method: "POST",
            url: "/access/byid",
            withCredentials: true,
            data: { access_id: drive_data.access_data }
        })
            .then(res => {
                drive_data2 = res.data.fields;
                let ncol = [];
                let ncol2 = [];
                let ccc = {
                    field: 'id',
                    headerName: "Visit Number",
                    headerAlign: 'center',
                    width: 180,
                    align: 'center',
                    description: "Visit Number",
                    headerClassName: 'datagrid-header'
                }
                ncol.push(ccc)
                ncol2.push('id')
                ccc = {
                    field: "pika_id",
                    headerName: "Form Details",
                    headerAlign: 'center',
                    width: 200,
                    headeralign: 'center',
                    align: 'center',
                    description: 'Click corresponding button to view this drive',
                    disableClickEventBubbling: true,
                    headerClassName: 'datagrid-header',
                    renderCell: (params) => {
                        const onClick = () => {
                            const api = params.api;
                            const fields = api
                                .getAllColumns()
                                .map((c) => c.field)
                                .filter((c) => c !== "__check__" && !!c);
                            fields.forEach((f) => {
                                let mobile_number = ''
                                let selectedPatientId = params.row.pika_id
                                let selectedVisit = params.row.id
                                let userInfo = {
                                    first_name: '',
                                    last_name: '',
                                    patient_id: selectedPatientId,
                                    admin: 'true'
                                }
                                let values = { mobile_number, selectedPatientId, userInfo, selectedVisit }
                                let cc = [];
                                cc.push(values)
                                this.setState({ modal_data: cc, modal_open: true })
                            });
                        };
                        return <Button onClick={onClick} width='140' color="primary" variant="contained">View</Button>;
                    }
                }
                ncol.push(ccc)
                for (let xx in drive_data2) {
                    let ccc = {
                        field: drive_data2[xx],
                        headerName: drive_data2[xx],
                        headerAlign: 'center',
                        width: 200,
                        align: 'center',
                        headerClassName: 'datagrid-header',
                        description: drive_data2[xx]
                    }
                    ncol.push(ccc)
                    ncol2.push(drive_data2[xx])
                }
                this.setState({ access_col: ncol, access_dd: ncol2 })
            })
            .catch(err => {
                alert("Access Data not exist")
            })
        await Axios({
            method: "POST",
            url: "/drive/getpatients",
            withCredentials: true,
            data: { driveID: this.state.drive_id }
        })
            .then(res => {
                drive_data3 = res.data.data.patient_list;
                let dd = [];
                for (let i = 0; i < drive_data3.length; i++) {
                    let p = drive_data3[i];
                    let ctr = i + 1;
                    let name = ''
                    let idd = p.patient_id
                    if (p.first_name !== "") name += (p.first_name + " ");
                    if (p.last_name !== "") name += (p.last_name);
                    let pp = { ctr: ctr, first_name: p.first_name, last_name: p.last_name, name: name, id: idd, visit: [] }
                    dd.push(pp)
                }
                this.setState({ patients: dd })
            })
            .catch(err => {
                alert("Assist not exist")
            })
        let kitkat = []
        for (let hh in this.state.patients) {
            let gh = this.state.patients[hh]
            // console.log(this.state.patients[hh])
            await Axios({
                method: "POST",
                url: "/patient/getcatlist",
                withCredentials: true,
                data: { patient_id: gh["id"] }
            })
                .then(res => {
                    let drive_data4 = res.data.data;
                    let ppp = [];
                    for (let yy in drive_data4) {
                        let ddd = {}
                        for (let zz in this.state.access_dd) {
                            ddd[this.state.access_dd[zz]] = '❌'
                        }
                        let aa = drive_data4[yy]
                        ddd['id'] = aa["visit_number"]
                        let bb = aa["categories"]
                        for (let gg in bb) {
                            ddd[bb[gg]] = '✔️'
                        }
                        ddd["pika_id"] = gh["id"]
                        ppp.push(ddd)
                    }
                    gh["visit"] = ppp
                })
                .catch(err => {
                })
            kitkat.push(gh)
        }
        this.setState({ patients: kitkat, load2: "" })
    }
    render() {
        return (
            <>
                <div style={{ overflowX: "hidden" }}>
                    <div>
                        <Container>
                            <div className="drive-title">Drive Info</div>
                            <div id="drive-det" style={{ padding: "1%", borderRadius: "15px", border: "1px solid black" }}>
                                <div className="drive-subtitle">Drive Details</div>
                                <br />
                                {
                                    this.state.drive_load === "Loading..." ?
                                        <CircularProgress /> :
                                        <>
                                            <Grid container spacing={3}>
                                                <Grid item xs={6}>
                                                    <TextField
                                                        fullWidth
                                                        id="outlined-read-only-input"
                                                        variant="outlined"
                                                        label="Drive Name"
                                                        defaultValue={this.state.drive_name}
                                                        InputProps={{
                                                            readOnly: true,
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <TextField
                                                        fullWidth
                                                        id="outlined-read-only-input"
                                                        variant="outlined"
                                                        label="Drive Location"
                                                        defaultValue={this.state.location}
                                                        InputProps={{
                                                            readOnly: true,
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={8}>
                                                    <TextField
                                                        fullWidth
                                                        id="outlined-read-only-input"
                                                        variant="outlined"
                                                        label="Form Name"
                                                        defaultValue={this.state.form_name}
                                                        InputProps={{
                                                            readOnly: true,
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <Button variant="contained" fullWidth color="primary" onClick={this.openform} style={{ height: "100%", fontSize: "1.2rem" }}>View form</Button>
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <Button variant="contained" fullWidth color="primary" onClick={this.replace_form} style={{ height: "100%", fontSize: "1.2rem" }}>replace</Button>
                                                </Grid>
                                                <Grid item xs={8}>
                                                    <TextField
                                                        fullWidth
                                                        id="outlined-read-only-input"
                                                        variant="outlined"
                                                        label="Description"
                                                        defaultValue={this.state.description}
                                                        InputProps={{
                                                            readOnly: true,
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <TextField
                                                        fullWidth
                                                        id="outlined-read-only-input"
                                                        variant="outlined"
                                                        label="Created On"
                                                        defaultValue={this.state.timestamp}
                                                        InputProps={{
                                                            readOnly: true,
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <br />
                                            <div style={{ padding: "1%", border: "1px solid grey", borderRadius: "5px" }}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={6}>
                                                        <h5><strong style={{ color: "black", width: "fit-content" }}>Medical Assistants associated with this drive</strong></h5>
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <Button variant="contained" fullWidth color="primary" onClick={(e) => { this.setState({ editmod: true }) }} style={{ height: "100%", fontSize: "1rem" }}>Add/Drop Assistant</Button>
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <Button variant="contained" fullWidth color="primary" onClick={(e) => { this.setState({ assmod: true }) }} style={{ height: "100%", fontSize: "1rem" }}>Edit Assistant Station</Button>
                                                    </Grid>
                                                </Grid>
                                                <br />
                                                {
                                                    this.state.assist_ids.map((assist) => (
                                                        <Chip label={assist.name} size="large" icon={<FaceIcon />} variant="default" style={{ margin: "5px" }} />
                                                    ))
                                                }
                                            </div>
                                        </>
                                }
                            </div>
                            <br />
                            <div style={{ padding: "1%", borderRadius: "15px", border: "1px solid black" }}>
                                <div className="drive-subtitle">Patient Details</div>
                                <div className="drive-description">List of patient enrolled in this drive </div>
                                <br />
                                <div style={{ paddingLeft: "1%", paddingRight: "1%", paddingTop: "0", paddingBottom: "1%", borderRadius: "15px", backgroundColor: "#e3fffe" }}>

                                    <div>
                                        {
                                            this.state.loadfil === true
                                                ?
                                                <><br />
                                                    <CircularProgress /></>
                                                :
                                                <>
                                                    <Grid container spacing={3}>
                                                        <Grid item xs={3}>
                                                            <FormControl variant="outlined" fullWidth>
                                                                <InputLabel id="demo-simple-select-outlined-label">Choose Label</InputLabel>
                                                                <Select
                                                                    labelId="demo-simple-select-outlined-label"
                                                                    id="demo-simple-select-outlined"
                                                                    fullWidth
                                                                    className="op-wh"
                                                                    name="label"
                                                                    variant="outlined"
                                                                    value={this.state.filter_label}
                                                                    onChange={this.handleChangelabel}
                                                                    label="Choose Label"
                                                                >
                                                                    {
                                                                        this.state.fil_label.map(r => (
                                                                            <MenuItem value={r.type}>{r.name}</MenuItem>
                                                                        ))
                                                                    }
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                        <Grid item xs={2}>
                                                            <FormControl variant="outlined" fullWidth>
                                                                <InputLabel id="demo-simple-select-outlined-label">Choose Operation</InputLabel>
                                                                <Select
                                                                    labelId="demo-simple-select-outlined-label"
                                                                    id="demo-simple-select-outlined"
                                                                    className="op-wh"
                                                                    fullWidth
                                                                    name="OP"
                                                                    variant="outlined"
                                                                    value={this.state.filter_type}
                                                                    onChange={this.handleChangetype}
                                                                    label="Choose Operation"
                                                                >
                                                                    {
                                                                        this.state.fil_OP === "bool"
                                                                            ?
                                                                            this.state.fil_bool.map(r => (
                                                                                <MenuItem value={r.name}>{r.name}</MenuItem>
                                                                            ))
                                                                            :
                                                                            this.state.fil_OP === "num"
                                                                                ?
                                                                                this.state.fil_num.map(r => (
                                                                                    <MenuItem value={r.name}>{r.name}</MenuItem>
                                                                                ))
                                                                                :
                                                                                <MenuItem value={null}>Choose Label First</MenuItem>
                                                                    }
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                        <Grid item xs={2}>
                                                            {
                                                                this.state.fil_OP === "bool"
                                                                    ?
                                                                    <TextField fullWidth className="op-wh" variant="outlined" defaultValue={this.state.dis} disabled label="Value"></TextField>
                                                                    :
                                                                    <TextField fullWidth className="op-wh" variant="outlined" onChange={this.handleChangeVal} label="Value"></TextField>
                                                            }
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            <Button variant="contained" fullWidth color="primary" onClick={this.filtering} style={{ height: "100%", fontSize: "1.2rem" }}>Modify Filter</Button>
                                                        </Grid>
                                                        <Grid item xs={2}>
                                                            <Button variant="contained" fullWidth color="primary" onClick={this.clearfil} style={{ height: "100%", fontSize: "1.2rem" }}>Clear</Button>
                                                        </Grid>
                                                    </Grid>
                                                    <br />
                                                    <TextField fullWidth variant="outlined" className="op-wh" id="serach_fuzzy" onChange={this.fuzzysearch} label="Search for Patient Name or Patient ID"></TextField>
                                                </>
                                        }
                                    </div>
                                </div>
                                <br />
                                {
                                    <Modal
                                        open={this.state.modal_open}
                                        onClose={this.close_modal}
                                    >
                                        <div id="modal-div-form">
                                            <h3>Form Details</h3>
                                            <Divider />
                                            <div id="modal-div-form-cont">
                                                <PatientForm
                                                    values={this.state.modal_data[0]}
                                                />
                                            </div>
                                            <br />
                                        </div>
                                    </Modal>
                                }
                                {
                                    <Modal
                                        open={this.state.medmod}
                                        onClose={(e) => this.close_medmod(e)}
                                    >
                                        <div id="modal-div-form">
                                            <h3>Medical History</h3>
                                            <Divider />
                                            <div id="modal-div-form-cont">
                                                <PatientHistory
                                                    values={this.state.medmod_data[0]}
                                                />
                                            </div>
                                            <br />
                                        </div>
                                    </Modal>
                                }
                                {
                                    <Modal
                                        open={this.state.editmod}
                                        onClose={(e) => this.setState({ editmod: false, assmod: true })}
                                    >
                                        <div id="modal-div-form">
                                            <h3>Add a new assistant</h3>
                                            <Divider />
                                            <div id="modal-div-form-cont">
                                                <AddAssistant handler={this.edit_modal_close} drive_id={this.state.drive_id} org_id={this.state.org_id} old={this.state.assist_ids}></AddAssistant>
                                            </div>
                                            <br />
                                        </div>
                                    </Modal>
                                }
                                {
                                    <Modal
                                        open={this.state.modal_open_f}
                                        onClose={() => (this.setState({ modal_open_f: false }))}
                                    >
                                        <div id="modal-div">
                                            <h3>Form Fields</h3>
                                            <Divider />
                                            <br />
                                            <ul style={{ marginLeft: 30 }}>
                                                {
                                                    this.state.access_dd.map((m) => (
                                                        m !== "id" ?
                                                            <li>{m}</li> : null
                                                    ))
                                                }
                                            </ul>
                                            <br />
                                            <br />
                                        </div>
                                    </Modal>
                                }
                                {
                                    <Modal
                                        open={this.state.assmod}
                                        onClose={this.close_assmod}
                                    >
                                        <div id="modal-div-form">
                                            <h3>Medical Assistant</h3>
                                            <Divider />
                                            <div id="modal-div-form-cont">
                                                <br />
                                                <FormControl variant="outlined" fullWidth>
                                                    <InputLabel id="demo-simple-select-outlined-label">Choose Assistant</InputLabel>
                                                    <Select
                                                        labelId="demo-simple-select-outlined-label"
                                                        id="demo-simple-select-outlined"
                                                        fullWidth
                                                        className="op-wh"
                                                        name="label"
                                                        variant="outlined"
                                                        value={this.state.edit_assist_id}
                                                        onChange={this.handleChangelabel2}
                                                        label="Choose Assistant"
                                                    >
                                                        {
                                                            this.state.assist_ids.map(r => (
                                                                <MenuItem value={r._id}>{r.name}</MenuItem>
                                                            ))
                                                        }
                                                    </Select>
                                                </FormControl>
                                                <Container >
                                                    <br />
                                                    <FormControl component="fieldset" style={{ height: "300px", width: "100%", overflowY: "auto" }}>
                                                        <FormLabel component="legend">All possible stations</FormLabel>
                                                        <br />
                                                        <FormGroup>
                                                            {
                                                                this.state.access_dd.map((aa) => (
                                                                    <>
                                                                        <>{
                                                                            aa !== "id" && this.state.edit_assist_id_new.includes(aa) &&
                                                                            <FormControlLabel
                                                                                control={<Checkbox checked={true} onChange={this.handleChangelabelcheck} name={aa} />}
                                                                                label={aa}
                                                                            />}
                                                                        </>
                                                                        <>
                                                                            {aa !== "id" && !this.state.edit_assist_id_new.includes(aa) &&
                                                                                <FormControlLabel
                                                                                    control={<Checkbox checked={false} onChange={this.handleChangelabelcheck} name={aa} />}
                                                                                    label={aa}
                                                                                />}
                                                                        </>
                                                                    </>
                                                                ))
                                                            }
                                                        </FormGroup>
                                                    </FormControl>
                                                    <br />
                                                    <br />
                                                    <Button align="center" variant="contained" fullWidth color="primary" onClick={(e) => { this.updateassist(e) }} style={{ height: "100%", fontSize: "1rem" }}>Update</Button>
                                                </Container>
                                            </div>
                                            <br />
                                        </div>
                                    </Modal>
                                }
                                {
                                    this.state.loadfil === true ? null :
                                        <>
                                            <Divider />
                                            <br />
                                            <div id="drive-pat" style={{ height: "auto" }}>
                                                {
                                                    this.state.load2 === "Loading..." ?
                                                        <CircularProgress /> :
                                                        (this.state.search === false) ?
                                                            <>
                                                                {
                                                                    (this.state.patients.length === 0)
                                                                        ? <div style={{ paddingLeft: "3%", paddingRight: "3%" }}>
                                                                            <h6 style={{ backgroundColor: "#f2aeb3", color: "#ff0000", padding: "1%", borderRadius: "5px" }}>No patient present till now</h6>
                                                                        </div>
                                                                        :
                                                                        this.state.patients.map((pa) => (
                                                                            <>

                                                                                <Accordion style={{ border: "black 2px solid", marginBottom: "1%" }} expanded={this.state.expanded === pa.id} onChange={this.handlePanelChange(pa.id)}>
                                                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ backgroundColor: "#c8f0f7" }} >
                                                                                        <Grid container>
                                                                                            <Grid item xs={1}><b>{pa.ctr}</b></Grid>
                                                                                            <Grid item xs={5}><b>Patient Name : </b>{pa.name}</Grid>
                                                                                            <Grid item xs={3}><b>Patient ID : </b>{pa.id}</Grid>
                                                                                            <Grid item xs={2}><Button variant="contained" color="primary" onClick={(e) => this.open_medmod(e, pa)}>Medical History</Button></Grid>
                                                                                        </Grid>
                                                                                    </AccordionSummary>
                                                                                    <AccordionDetails style={{ backgroundColor: "#e6fffd" }}>
                                                                                        <div style={{ paddingLeft: 50, paddingRight: 50 }}>
                                                                                            <div style={{ height: 350, width: 1100 }}>
                                                                                                <DataGrid rows={pa.visit} columns={this.state.access_col} pageSize={5} style={{ border: "#08039e 1px solid" }}></DataGrid>
                                                                                            </div>
                                                                                        </div>
                                                                                    </AccordionDetails>
                                                                                </Accordion>
                                                                            </>
                                                                        ))
                                                                }
                                                            </>
                                                            :
                                                            <>
                                                                {
                                                                    (this.state.searched_patients.length === 0)
                                                                        ? <div style={{ paddingLeft: "3%", paddingRight: "3%" }}>
                                                                            <h6 style={{ backgroundColor: "#f2aeb3", color: "#ff0000", padding: "1%", borderRadius: "5px" }}>No patient present till now</h6>
                                                                        </div>
                                                                        :
                                                                        this.state.searched_patients.map((pa) => (
                                                                            <>
                                                                                <Accordion style={{ border: "black 2px solid", marginBottom: "1%" }}>
                                                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} expanded={this.state.expanded === pa.item.id} style={{ backgroundColor: "#c8f0f7" }} >
                                                                                        <Grid container>
                                                                                            <Grid item xs={1}><b>{pa.item.ctr}</b></Grid>
                                                                                            <Grid item xs={5}><b>Patient Name : </b>{pa.item.name}</Grid>
                                                                                            <Grid item xs={3}><b>Patient ID : </b>{pa.item.id}</Grid>
                                                                                            <Grid item xs={2}><Button variant="contained" color="primary" onClick={(e) => this.open_medmod(e, pa.item)}>Medical History</Button></Grid>
                                                                                        </Grid>
                                                                                    </AccordionSummary>
                                                                                    <AccordionDetails style={{ backgroundColor: "#e6fffd" }}>
                                                                                        <div style={{ paddingLeft: 50, paddingRight: 50 }}>
                                                                                            <div style={{ height: 350, width: 1100 }}>
                                                                                                <DataGrid rows={pa.item.visit} columns={this.state.access_col} pageSize={5} style={{ border: "#08039e 1px solid" }}></DataGrid>
                                                                                            </div>
                                                                                        </div>
                                                                                    </AccordionDetails>
                                                                                </Accordion>
                                                                            </>
                                                                        ))
                                                                }
                                                            </>
                                                }
                                            </div>
                                            <div><br /><h4 style={{ textAlign: "center" }}>- End of List -</h4><br /></div>
                                        </>
                                }
                            </div>
                            <br />
                        </Container>
                    </div>
                </div>
            </>
        );
    }
}

export default DriveInfo;
