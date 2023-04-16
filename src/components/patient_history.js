import React, { Component } from 'react'
import './patient_history.css';
import BackArrow from './icons/backArrow.png';
//import FormFields from './jsonFiles/medicalHistory.json';
import Navbar from './navbar';
import Axios from 'axios';
import {
    FormLabel, FormControl, FormGroup, FormControlLabel, FormHelperText, Checkbox,
    TextField, OutlinedInput,
    Select, InputLabel, MenuItem,
    RadioGroup, Radio,
    Backdrop, CircularProgress
} from '@material-ui/core';
import * as FiIcons from 'react-icons/fi';
import { withStyles } from "@material-ui/core/styles";
import { useForm, Controller } from 'react-hook-form';
import { minioClient, minioBucket } from './minio';

const styles = theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    root: {
        display: 'flex',
    },
    dropdown: {
        marginTop: "20px",
        width: "250px",
        "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
            color: "#05056B !important"
        }
    },
    selectDropdown: {
        "& .MuiOutlinedInput-notchedOutline": {
            border: "2px solid #1BB55C !important"
        },

        // '& .MuiSelect-select:focus':{
        //     backgroundColor:'unset'
        // }
    },
    checkboxControl: {
        width: "300px",
        marginTop: "10px",
    },
    checkboxLegend: {
        color: "#05056B !important",
        fontWeight: "600",
        fontSize: "small",
        backgroundColor: "#10DDCD",
        width: "100%",
        minHeight: "25px",
        display: "flex",
        alignIitems: "center",
        justifyContent: "center",
        padding: "2%",
        textAlign: "left"
    },
    checkboxLabel: {
        color: "#05056B",
        textAlign: "left"
    },
    textfields: {
        marginTop: "20px",
        width: "250px"
    },
    textfieldBorder: {
        border: "2px solid #1BB55C !important"
    },
    textfieldLabel: {
        color: "#05056B !important"
    },
    radio: {
        marginTop: theme.spacing(2),
    },
    file: {
        marginTop: theme.spacing(2),
        fontSize: "90%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    }
})

class PatientHistoryHook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            disabled: true,
            loading: false,
            FormFields: {},
            patientMedData: {},
            userInfo: props.values.userInfo
        }
    }

    componentDidMount() {
        this.setState({ loading: true })
        this.getPatientInfo();

        Axios({
            method: "GET",
            url: "/access/rendermedhistory",
            withCredentials: true
        })
            .then(res => {
                this.setState({ FormFields: res.data.data })
                Axios({
                    method: "POST",
                    url: "/patient/gethistory",
                    data: {
                        patient: this.props.values.selectedPatientId,
                    },
                    withCredentials: true
                })
                    .then(res => {
                        this.setState({ loading: false })
                        if (res.data.data) {
                            this.initialiseFormHookData(this.state.FormFields, res.data.data)
                            this.setState({ patientMedData: res.data.data })
                        }
                        else {
                            let initialState = {}
                            this.state.FormFields["medical_history"].parameters.map(field => {
                                if (field.field === "text" || field.field === "dropdown" || field.field === "radio" || field.field === "file") {
                                    initialState[field.name] = ""
                                }
                                else if (field.field === "checkbox") {
                                    const checkInitial = {}
                                    field.values.map(opt => {
                                        checkInitial[opt] = false
                                    })
                                    initialState[field.name] = checkInitial
                                }
                            })
                            this.setState({
                                patientMedData: initialState,
                                disabled: false
                            })
                        }
                    })
                    .catch(error => {
                        this.setState({ loading: false })
                        if (error.response) {
                            console.log(error.response.data.msg);
                        }
                    });
            })
            .catch(error => {
                this.setState({ loading: false })
                if (error.response) {
                    console.log(error.response.data.msg);
                }
            });

    }

    initialiseFormHookData = (FormFields, initialState) => {
        FormFields["medical_history"].parameters.map(field => {
            if (field.field === "text" || field.field === "dropdown" || field.field === "radio" || field.field === "file") {
                this.props.setValue(field.name, initialState[field.name])
            }
        })
    }

    next = () => {
        this.setState({ loading: true })
        if (this.state.userInfo.admin) {
            window.location.reload()
        }
        else {
            this.props.nextStep();
        }

    }

    conditionalBack = () => {
        if (this.state.userInfo.admin) {
            window.location.reload()
        }
        else {
            this.setState({ loading: true })
            if (this.props.values.mobile_number) {
                this.props.prevStep()
            }
            else {
                window.location = `${process.env.REACT_APP_DEV === "true" ? process.env.REACT_APP_URL_PREFIX_DEV : process.env.REACT_APP_URL_PREFIX_PROD}/enroll`;
            }
        }
    }

    exit = e => {
        this.setState({ loading: true });
        window.location = `${process.env.REACT_APP_DEV === "true" ? process.env.REACT_APP_URL_PREFIX_DEV : process.env.REACT_APP_URL_PREFIX_PROD}/enroll`;

    }

    getPatientInfo() {
        if (!this.props.values.selectedPatientId) return;
        Axios({
            method: "POST",
            url: "/patient/getpatient",
            data: {
                patient_id: this.props.values.selectedPatientId,
            },
            withCredentials: true
        })
            .then(res => {
                // console.log(res.data.data);
                this.props.handleUserInfo(res.data.data);
                //this.props.handleMobileNumber(res.data.data.mobile_number);
            })
            .catch(error => {
                if (error.response) {
                    console.log(error.response.data.msg);
                }
            });
    }

    handleChange = (name, value) => {
        this.setState({
            patientMedData: {
                ...this.state.patientMedData,
                [name]: value
            }
        })
    }

    handleCheckboxChange = (e, name, option) => {
        this.setState({
            patientMedData: {
                ...this.state.patientMedData,
                [name]: {
                    ...this.state.patientMedData[name],
                    [option]: e.target.checked
                }
            }
        })
    }

    handleEdit = e => {
        this.setState({ disabled: false })
    }

    submitHistory = e => {
        this.setState({ loading: true })
        Axios({
            method: "POST",
            url: "/patient/addhistory",
            data: {
                patient: this.props.values.selectedPatientId,
                history_object: this.state.patientMedData
            },
            withCredentials: true
        })
            .then(res => {
                // console.log(res.data.data);
                this.setState({ loading: false })
                this.props.reset()
                if (this.state.userInfo.admin) {
                    alert("History Submitted");
                }
                this.next();
            })
            .catch(error => {
                alert("Submission failed. Try again")
                this.setState({ loading: false })
                console.log(error);
            });
    }

    getUrl = path => {
        if (!path) return;
        var url;
        minioClient.presignedUrl('GET', minioBucket, path, 1 * 60 * 60, function (err, presignedUrl) {
            if (err) return console.log(err)
            // console.log(presignedUrl)
            url = presignedUrl
        })
        return url;
    }

    uploadImage = async e => {
        const file = e.target.files[0]
        var fileExt = file.name.split('.').pop()
        var orgName = localStorage.getItem("assist_org_name").replace(/ /g, "_").toLowerCase()
        var driveName = localStorage.getItem("drive_selected_name").replace(/ /g, "_").toLowerCase()
        var fieldName = e.target.name.replace(/ /g, "_").toLowerCase()
        var filename = `${this.props.values.selectedPatientId}_${fieldName}.${fileExt}`
        var path = `patient_history/${orgName}/${driveName}/${filename}`

        this.setState({ loading: true })
        minioClient.presignedPutObject(minioBucket, path, 5 * 60, (err, url) => {
            if (err) {
                this.setState({ loading: false })
                return console.log(err);
            }
            Axios.put(url, file)
                .then(res => {
                    this.setState({ loading: false })
                    this.setState({
                        patientMedData: {
                            ...this.state.patientMedData,
                            [e.target.name]: path
                        }
                    })
                })
                .catch(err => {
                    this.setState({ loading: false })
                    console.log(err);
                })
        })

    }

    previewImage = img => {
        var image = new Image();
        image.src = img;
        image.style.cssText = "height: 50vh ; width: 50vw"
        var w = window.open("");
        w.document.write(image.outerHTML);
    }

    rulesRegex = obj => {
        if (!obj?.pattern?.value) return obj;
        obj.pattern.value = new RegExp(obj.pattern.value);
        return obj;
    }

    render() {
        const { classes, values } = this.props;
        const { handleSubmit, register, formState: { errors }, control, reset, clearErrors, setValue } = this.props;
        return (
            <div className="patientHistoryHomeStyle">
                {this.state.userInfo.admin || this.state.userInfo.stationForm ? null : <Navbar />}
                {this.state.userInfo.stationForm ? null :
                    <div className="header">
                        <button style={{ border: "none", background: "none", marginRight: "auto" }} onClick={this.conditionalBack}>
                            <img className="backArrow" src={BackArrow} />
                        </button>
                        <label style={{ marginRight: "auto", fontWeight: "600", fontSize: "24px", wordBreak: "normal" }} className="formHeaders">Patient Medical History</label>
                    </div>
                }

                <label style={{ fontWeight: "400", fontSize: "18px" }} className="formHeaders">
                    {values.userInfo.first_name} {values.userInfo.last_name} | {values.userInfo.patient_id}
                </label>

                {
                    this.state.disabled ? (
                        <button onClick={this.handleEdit} className="historyEdit">Edit</button>
                    ) : null
                }

                <form onSubmit={handleSubmit(this.submitHistory)}>
                    <div className="formFields">
                        {
                            this.state.FormFields["medical_history"]?.parameters?.map(field => {
                                if (field.field === "text") {
                                    return (
                                        <Controller
                                            key={field.name}
                                            name={field.name}
                                            control={control}
                                            defaultValue=""
                                            rules={this.rulesRegex(field.rules)}
                                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                                <TextField
                                                    type={field.type}
                                                    label={field.name.replace(/_/g, ' ').toUpperCase()}
                                                    variant="outlined"
                                                    error={!!error}
                                                    helperText={error ? error.message : null}
                                                    disabled={this.state.disabled}
                                                    className={classes.textfields}
                                                    placeholder="Type here"
                                                    InputLabelProps={{
                                                        shrink: true,
                                                        className: classes.textfieldLabel
                                                    }}
                                                    InputProps={{
                                                        classes: {
                                                            notchedOutline: classes.textfieldBorder
                                                        }
                                                    }}
                                                    value={this.state.patientMedData[field.name] || ""}
                                                    onChange={e => {
                                                        onChange(e);
                                                        this.handleChange(field.name, e.target.value);
                                                    }}
                                                />
                                            )}
                                        />
                                    )
                                }
                                else if (field.field === "dropdown") {
                                    return (
                                        <Controller
                                            key={field.name}
                                            name={field.name}
                                            control={control}
                                            defaultValue=""
                                            rules={field.rules}
                                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                                <FormControl variant="outlined" className={classes.dropdown} error={!!error}>
                                                    <InputLabel shrink>{field.name.replace(/_/g, ' ').toUpperCase()}</InputLabel>
                                                    <Select
                                                        name={field.name}
                                                        value={this.state.patientMedData[field.name] || ""}
                                                        onChange={e => {
                                                            onChange(e);
                                                            this.handleChange(field.name, e.target.value);
                                                        }}
                                                        MenuProps={{
                                                            getContentAnchorEl: null,
                                                            anchorOrigin: {
                                                                vertical: "bottom",
                                                                horizontal: "left",
                                                            },
                                                        }}
                                                        input={<OutlinedInput notched label={field.name.replace(/_/g, ' ').toUpperCase()} />}
                                                        className={classes.selectDropdown}
                                                        displayEmpty
                                                        disabled={this.state.disabled}
                                                    >
                                                        <MenuItem disabled value="">Select One</MenuItem>
                                                        {
                                                            field["values"].map(option => {
                                                                return <MenuItem key={option} value={option}>{option.replace(/_/g, ' ').toUpperCase()}</MenuItem>
                                                            })
                                                        }
                                                    </Select>
                                                    <FormHelperText>{error ? error.message : null}</FormHelperText>
                                                </FormControl>
                                            )}
                                        />
                                    )
                                }
                                else if (field.field === "radio") {
                                    return (
                                        <Controller
                                            key={field.name}
                                            name={field.name}
                                            control={control}
                                            defaultValue=""
                                            rules={field.rules}
                                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                                <FormControl
                                                    className={classes.checkboxControl}
                                                    disabled={this.state.disabled}
                                                    onChange={e => {
                                                        onChange(e);
                                                        this.handleChange(field.name, e.target.value);
                                                    }}
                                                    error={error ? true : false}
                                                >
                                                    <FormLabel component="legend" className={classes.checkboxLegend}>{field.name.toUpperCase()}</FormLabel>
                                                    <RadioGroup>
                                                        {
                                                            field.values.map(option => {
                                                                return (
                                                                    <FormControlLabel
                                                                        classes={{
                                                                            label: classes.checkboxLabel
                                                                        }}
                                                                        checked={this.state.patientMedData[field.name] === option}
                                                                        key={option} value={option} control={<Radio />} label={option} />
                                                                )
                                                            })
                                                        }
                                                    </RadioGroup>
                                                    <FormHelperText>{error ? error.message : null}</FormHelperText>
                                                </FormControl>
                                            )}
                                        />
                                    )
                                }
                                else if (field.field === "file") {
                                    return (
                                        <div className={classes.file} key={field.name}>
                                            <label style={{ marginBottom: "0px", color: "#05056B" }} className="fileLabel">{field.name.replace(/_/g, ' ').toUpperCase()}:</label>
                                            <input
                                                disabled={this.state.disabled}
                                                name={field.name}
                                                style={{ width: "200px", color: "#05056B" }}
                                                type="file" accept="image/*"
                                                {...register(field.name, field.rules)}
                                                onChange={e => {
                                                    register(field.name, field.rules).onChange(e);
                                                    this.uploadImage(e);
                                                }}
                                            />
                                            {
                                                !this.state.patientMedData[field.name] ? null :
                                                    <img src={this.getUrl(this.state.patientMedData[field.name])} style={{ height: "100px", width: "100px", border: "solid 2px", marginTop: "20px" }} alt="preview" onClick={() => this.previewImage(this.getUrl(this.state.patientMedData[field.name]))} />
                                            }
                                            {
                                                !errors[field.name] ? null :
                                                    <>
                                                        <label className="validationError">{errors[field.name] ? errors[field.name].message : null}</label>
                                                    </>
                                            }
                                        </div>
                                    )
                                }
                                else if (field.field === "checkbox")
                                    return (
                                        <FormControl key={field.name} component="fieldset" className={classes.checkboxControl}>
                                            <FormLabel component="legend" className={classes.checkboxLegend}>{field.name.toUpperCase()}</FormLabel>
                                            <FormGroup>
                                                <>
                                                    {
                                                        field.values.map(item => {
                                                            return (
                                                                <FormControlLabel key={item}
                                                                    classes={{
                                                                        label: classes.checkboxLabel
                                                                    }}
                                                                    control={<Checkbox
                                                                        checked={this.state.patientMedData[field.name]?.[item] || false}
                                                                        onChange={e => this.handleCheckboxChange(e, field.name, item)}
                                                                        disabled={this.state.disabled}
                                                                    />}
                                                                    label={item}
                                                                />
                                                            )
                                                        })
                                                    }
                                                </>
                                            </FormGroup>
                                        </FormControl>
                                    )
                            })
                        }
                    </div>
                    {
                        this.state.disabled ? null : <button type="submit" className="historyEdit">Submit</button>
                    }
                </form>



                <div style={{ display: !this.state.userInfo.admin ? "flex" : "none" }}>
                    <button onClick={this.exit} className="historyExitButton">Exit  <FiIcons.FiLogOut /></button>
                    <button onClick={this.next} className="historyLogoutButton">Next</button>
                </div>

                {
                    this.state.loading ? (
                        <Backdrop className={classes.backdrop} open>
                            <CircularProgress color="inherit" />
                        </Backdrop>
                    ) : null
                }
            </div>
        )
    }
}

function PatientHistory(props) {
    const form = useForm()
    return (
        <PatientHistoryHook {...form} {...props} />
    )
}

export default withStyles(styles)(PatientHistory);
