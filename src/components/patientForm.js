import React,{useRef} from 'react';
import Axios from 'axios';
import './patientForm.css';
import BackArrow from './icons/backArrow.png';
import {
    makeStyles,
    TextField, OutlinedInput,
    // Checkbox,FormGroup,FormLabel,FormControlLabel,
    Select, FormControl, InputLabel, MenuItem, FormHelperText,
    Radio, RadioGroup, FormLabel, FormControlLabel,
    FormGroup, Checkbox,
    Backdrop, CircularProgress
    // Button
} from '@material-ui/core';
import * as FiIcons from 'react-icons/fi';
import Navbar from './navbar';
import { useForm, Controller } from 'react-hook-form';
import { minioClient, minioBucket } from './minio';
import { AirlineSeatFlat } from '@material-ui/icons';
import Popup from './popup';

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 200,
        display: "block"
    },
    selectCategory: {
        background: "#10DDCD",
        borderRadius: "32px",
        "& .MuiSelect-selectMenu": {
            color: "#05056B",
            fontWeight: "600",
            paddingLeft: "10px"
        },
        "&&&:before": {
            borderBottom: "none"
        },
        "&&:after": {
            borderBottom: "none"
        },
        '& .MuiSelect-select:focus': {
            backgroundColor: 'unset'
        }
    },
    selectCategoryMenu: {
        marginTop: "5px"
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
}));



const PatientForm = function (props) {
    const classes = useStyles();
    const [selectCategory, setSelectCategory] = React.useState('');
    const [requirement, setRequirement] = React.useState('manual');
    const [FormFields, setFormFields] = React.useState({});
    const [data, setData] = React.useState({});
    const [tempdata, setTempData] = React.useState({});
    const [imgData, setImgData] = React.useState("");
    const [disabled, setDisabled] = React.useState(true);
    const [loading, setLoading] = React.useState(false);
    const userInfo = props.values.userInfo;
    const [stationShow, setStationShow] = React.useState(false);
    const isDataUpdating = React.useRef(false);
    const mandatoryFieldRefs = useRef({});

    function dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    const { handleSubmit, register, formState: { errors }, control, reset, clearErrors, setValue } = useForm();


    React.useEffect(() => {
        if (userInfo.admin) {
            adminGetAllCat();
        }
        else {
            patientGetAllowed();
        }
    }, [props.values]);
    React.useEffect(() => {
        try {
            const miniogetURLs = async (paths) => {

                let final_results = {}
                const requests = paths.map(async path => {
                    if (path !== "") {
                        let formDataflask = new FormData();
                        formDataflask.append("path", path);
                        await Axios({
                            url: process.env.REACT_APP_FLASK_URL + "/get_minio_url",
                            method: "POST",
                            data: formDataflask,
                        })
                            .then((res) => {
                                if (res.data.minio_url !== "") {
                                    final_results[path] = res.data.minio_url;
                                }
                            }).catch((err) => {
                                console.log(err);
                            });
                    }
                })
                const responses = await Promise.all(requests);
                setTempData(final_results);
            };
            let filetypename = [];
            FormFields[Object.keys(FormFields)[0]].parameters.map(field => {
                if (field.field === "file") {
                    if (data.hasOwnProperty(field.name)) {
                        if (data[field.name] !== "") {
                            filetypename.push(data[field.name]);
                        }
                    }
                }
            })
            miniogetURLs(filetypename);
        } catch (error) {
            console.error('Error:', error);
        }
    }, [data]);
    ////////////////////////////////////

    const adminGetAllCat = () => {
        setLoading(true);
        Axios({
            method: "POST",
            url: "/drive/render",
            data: {
                drive_id: localStorage.getItem("drive_selected")
            },
            withCredentials: true
        })
            .then(res => {
                setLoading(false)
                setFormFields(res.data.data);
                setSelectCategory('');
            })
            .catch(error => {
                setLoading(false);
                if (error.response) {
                    console.log(error.response.data.msg);
                }
            });

    }

    const patientGetAllowed = () => {
        setLoading(true);
        Axios({
            method: "POST",
            url: "/assist/renderbymob",
            data: {
                driveID: localStorage.getItem("drive_selected"),
                mobile: localStorage.getItem("assist_mobile_number")
            },
            withCredentials: true
        })
            .then(res => {
                setLoading(false)
                setFormFields(res.data.data);
                setSelectCategory(props.values.userInfo.stationForm ? props.values.userInfo.stationCategory : '');

                if (props.values.userInfo.stationForm) {
                    initialiseData(res.data.data, props.values.userInfo.stationCategory);
                    setStationShow(true);
                    setDisabled(true);
                    return;
                }
            })
            .catch(error => {
                setLoading(false);
                if (error.response) {
                    console.log(error.response.data.msg);
                }
            });

    }

    let category_data = [];
    for (var key in FormFields) {
        if (key !== "patient_identifiers" && key !== "medical_history") {
            category_data.push(key);
        }
    }

    const back = () => {
        setLoading(true);
        props.prevStep();
    }

    const submit = hookFormData => {
        setLoading(true);
        Axios({
            method: "POST",
            url: "/transaction/create",
            data: {
                drive_id: localStorage.getItem("drive_selected"),
                field_name: selectCategory,
                tr_data: requirement === "manual" ? data : imgData,
                patient_id: props.values.selectedPatientId,
                visit_number: props.values.selectedVisit
            },
            withCredentials: true
        })
            .then(res => {
                setLoading(false);
                console.log(res.data)
                setData({})
                setTempData({})
                reset()
                setSelectCategory(userInfo.stationForm ? userInfo.stationCategory : "");
                if (userInfo.admin) {
                    alert("Succesfully Submitted. Reload to see changes in table.");
                } else if (userInfo.stationForm) {
                    setStationShow(false);
                    // alert("Successfully submitted.")
                }
            })
            .catch(error => {
                alert("Submission failed. Try again")
                if (!userInfo.admin) setLoading(false);
                if (error.response) {
                    console.log(error.response.data.msg);
                }
            });
    }

    const initialiseFormHookData = (FormFields, category, initialState) => {
        FormFields[category].parameters.map(field => {
            if (field.field === "text" || field.field === "dropdown" || field.field === "radio" || field.field === "file" || field.field === "pred") {
                setValue(field.name, initialState[field.name])
            }
        })
    }

    const initialiseData = (FormFields, category) => {
        reset();
        clearErrors();
        let initialState = {}
        Axios({
            method: "POST",
            url: "/patient/getcatdata",
            data: {
                patient_id: props.values.selectedPatientId,
                visit_number: props.values.selectedVisit,
                category: category
            },
            withCredentials: true
        })
            .then(res => {
                setLoading(false);

                ///////////////////////
                // let filetypename = [];
                // FormFields[category].parameters.map(field => {
                //     if (field.field === "file") {
                //         if (res.data.data[0]?.["tr_data"].hasOwnProperty(field.name)) {
                //             if (res.data.data[0]?.["tr_data"][field.name] !== "") {
                //                 filetypename.push(res.data.data[0]?.["tr_data"][field.name]);
                //             }
                //         }
                //     }
                // })
                // miniogetURLs(filetypename);
                // Object.keys(res.data.data[0]?.["tr_data"]).map(key => {
                //     if (filetypename.includes(key)) {
                //         console.log(key, res.data.data[0]?.["tr_data"][key]);
                //         miniogetURL(res.data.data[0]?.["tr_data"][key]);
                //     }
                // })
                ///////////////////////

                initialState = res.data.data[0]?.["tr_data"]
                if (initialState && !isString(initialState)) {
                    setData(initialState)
                    initialiseFormHookData(FormFields, category, initialState)
                    return;
                }
                if (initialState && isString(initialState)) {
                    setImgData(initialState);
                }
                initialState = {}
                FormFields[category].parameters.map(field => {
                    if (field.field === "text" || field.field === "dropdown" || field.field === "radio" || field.field === "file" || field.field === "pred") {
                        initialState[field.name] = "";
                    }
                    else if (field.field === "checkbox") {
                        let checkInitial = {}
                        field.values.map(opt => {
                            checkInitial[opt] = false
                        })
                        initialState[field.name] = checkInitial
                    }
                })
                setData(initialState)
                // miniogetURLs(filetypename);

            })
            .catch(error => {
                setLoading(false)
                if (error.response) {
                    console.log(error.response.data.msg);
                }
            });
    }

    const changeCategory = e => {
        if (!e.target.value) return
        setLoading(true);
        setSelectCategory(e.target.value);
        setDisabled(true);
        // INITIALISE THE DATA
        initialiseData(FormFields, e.target.value)

    }

    const handleChange = (name, value) => {
        setData({
            ...data,
            [name]: value
        })
    }

    const handleCheckboxChange = (e, name, option) => {
        setData({
            ...data,
            [name]: {
                ...data[name],
                [option]: e.target.checked
            }
        })
    }

    const handleEdit = e => {
        setDisabled(false);
    }

    const miniogetURL = (path) => {
        console.log("from miniogetURL", path);
        if (!path) return "";
        let imgURL = "";
        let formDataflask = new FormData();
        formDataflask.append("path", path);
        Axios({
            url: process.env.REACT_APP_FLASK_URL + "/get_minio_url",
            method: "POST",
            data: formDataflask,
        })
            .then((res) => {
                setTempData({
                    ...tempdata,
                    [path]: res.data.minio_url,
                })
            }).catch((err) => {
                console.log(err);
            });
    }





    const getUrl = (path) => {
        if (!path) return;
        // var minio_object_url;
        console.log("from getURL");
        let formDataflask = new FormData();
        formDataflask.append("path", path);

        let minio_object_url = Axios({
            url: process.env.REACT_APP_FLASK_URL + "/get_minio_url",
            method: "POST",
            data: formDataflask,
        })
            .then((res) => {
                return res.data.minio_url;
            }).catch((err) => {
                return "";
            });
        return minio_object_url;
    }

    const uploadImage = async (e, varfeildname, vardataname) => {
        if (e.target.files && e.target.files[0]) {

            const file = e.target.files[0]
            let formDataflask = new FormData();

            var fileExt = file.name.split('.').pop()
            var fileExt = "png"

            var orgName = localStorage.getItem("assist_org_name").replace(/ /g, "_").toLowerCase()
            var driveName = localStorage.getItem("drive_selected_name").replace(/ /g, "_").toLowerCase()
            var fieldName = e.target.name.replace(/ /g, "_").toLowerCase()
            var filename = `${props.values.selectedPatientId}_${props.values.selectedVisit}_${fieldName}.${fileExt}`
            var path = `form_data/${orgName}/${driveName}/${selectCategory}/${filename}`

            formDataflask.append("image", file);
            formDataflask.append("name", "oral_cavity");
            formDataflask.append("path", path);

            setLoading(true);

            Axios({
                url: process.env.REACT_APP_FLASK_URL + "/upload",
                method: "POST",
                data: formDataflask,
            })
                .then((res) => {
                    setLoading(false);
                    if (data.hasOwnProperty(e.target.name + "_pred")) {
                        setData({
                            ...data,
                            [e.target.name]: path,
                            [e.target.name + "_pred"]: res.data
                        })
                    }
                    else {
                        setData({
                            ...data,
                            [e.target.name]: path,
                        })
                    }
                    miniogetURL(path);
                })
                .catch((err) => {
                    setLoading(false);
                    console.log(err);
                });
        }
    }

    //upload PDF only
    const uploadOnlyDOC = async (e, varfeildname, vardataname) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            let formDataflask = new FormData()

            // var fileExt = file.name.split('.').pop().toLowerCase();
            const fileExt = "pdf";
            // const fileExt = "pdf"; // Set the file extension as PDF
            
            const orgName = localStorage.getItem("assist_org_name").replace(/ /g, "_").toLowerCase()
            const driveName = localStorage.getItem("drive_selected_name").replace(/ /g, "_").toLowerCase()
            const fieldName = e.target.name.replace(/ /g, "_").toLowerCase()
            const filename = `${props.values.selectedPatientId}_${props.values.selectedVisit}_${fieldName}.${fileExt}`
            const path = `form_data/${orgName}/${driveName}/${selectCategory}/${filename}`

            formDataflask.append("doc", file);
            formDataflask.append("name", "oral_cavity")
            formDataflask.append("path", path)

            setLoading(true)
            minioClient.presignedPutObject(minioBucket, path, 5 * 60, (err, url) => {
                if (err) {
                    setLoading(false);
                    console.log(err);
                    return;
                }
                
                Axios.put(url, file)
                    .then(() => {
                        setLoading(false);
                        setData({
                            ...data,
                            [varfeildname]: path
                        });
                        miniogetURL(path);
                    })
                    .catch(err => {
                        setLoading(false);
                        console.log(err);
                    });
            })
            // try{
            //     Axios({
            //         url: process.env.REACT_APP_FLASK_URL + "/uploadonlyfile",
            //         method: "POST",
            //         data: formDataflask,
            //     })
            //     setLoading(false)

            //     setData({
            //         ...data,
            //         [varfeildname]: path
            //     });
            //     miniogetURL(path)
            // } catch (error) {
            //     setLoading(false)
            //     console.log(error)
            // }
        }
    }

    const isString = (value) => {
        return typeof value === 'string' || value instanceof String;
    }

    const uploadOnlyImage = async e => {
        const file = e.target.files[0]
        var fileExt = file.name.split('.').pop()
        var orgName = localStorage.getItem("assist_org_name").replace(/ /g, "_").toLowerCase()
        var driveName = localStorage.getItem("drive_selected_name").replace(/ /g, "_").toLowerCase()
        var fieldName = e.target.name.replace(/ /g, "_").toLowerCase()
        var filename = `${props.values.selectedPatientId}_${props.values.selectedVisit}_${fieldName}.${fileExt}`
        var path = `form_data/${orgName}/${driveName}/${selectCategory}/${filename}`

        setLoading(true);
        minioClient.presignedPutObject(minioBucket, path, 5 * 60, (err, url) => {
            if (err) {
                setLoading(false);
                return console.log(err);
            }
            Axios.put(url, file)
                .then(res => {
                    setLoading(false);
                    setImgData(path)
                })
                .catch(err => {
                    setLoading(false);
                    console.log(err);
                })
        })

    }

    const previewImage = img => {
        var image = new Image();
        image.src = img;
        image.style.cssText = "height: 50vh ; width: 50vw"
        //console.log(image);
        var w = window.open("");
        w.document.write(image.outerHTML);
    }

    const logout = e => {
        e.preventDefault();
        setLoading(true);
        //logout
        Axios({
            method: "POST",
            url: "/patient/logout",
            withCredentials: true
        })
            //response status 200 meaning successfull logout
            .then(res => {
                console.log(`logout response: ${res.data}`);
                //GO TO SAME MOBILE PAGE AGAIN
                if (props.values.mobile_number) {
                    props.returnHome()
                } else {
                    window.location = `${process.env.REACT_APP_URL_PREFIX}/enroll`;
                }
            })
            //response status 400 meaning error somewhere
            .catch(error => {
                setLoading(false);
                if (error.response) {
                    console.log(error.response.data.msg);
                    this.setState({ show: true, errorMsg: error.response.data.msg });
                }
            });

    }

    const rulesRegex = obj => {
        if (!obj?.pattern?.value) return obj;
        obj.pattern.value = new RegExp(obj.pattern.value);
        return obj;
    }

    const formData = !selectCategory ? null :
        (
            <form onSubmit={handleSubmit(submit)}>
                <div id="form-field" className="formFields" >
                    {
                        FormFields[selectCategory].parameters.map(field => {
                            const isRequired = field.rules && field.rules.required;
                            if (field.field === "text") {
                                return (
                                    <Controller
                                        key={field.name}
                                        name={field.name}
                                        control={control}
                                        defaultValue=""
                                        rules={rulesRegex(field.rules)}
                                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                                            <TextField
                                                type={field.type}
                                                label={
                                                    <span>
                                                      {field.name.replace(/_/g, ' ').toUpperCase()}
                                                      {isRequired && <span style={{ color: 'red' }}> *</span>}
                                                    </span>
                                                }
                                                variant="outlined"
                                                error={!!error}
                                                helperText={isRequired ? "Required" : (error ? error.message : null)}
                                                disabled={disabled}
                                                className={classes.textfields}
                                                placeholder={isRequired ? `${field.name.replace(/_/g, ' ').toUpperCase()} is required` : "Type here"}
                                                InputLabelProps={{
                                                    shrink: true,
                                                    className: classes.textfieldLabel
                                                }}
                                                InputProps={{
                                                    classes: {
                                                        notchedOutline: classes.textfieldBorder
                                                    }
                                                }}
                                                value={data[field.name] || ""}
                                                onChange={e => {
                                                    onChange(e);
                                                    handleChange(field.name, e.target.value);
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
                                                    value={data[field.name] || ""}
                                                    onChange={e => {
                                                        onChange(e);
                                                        handleChange(field.name, e.target.value);
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
                                                    disabled={disabled}
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
                                                disabled={disabled}
                                                onChange={e => {
                                                    onChange(e);
                                                    handleChange(field.name, e.target.value);
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
                                                                    checked={data[field.name] === option}
                                                                    key={option}
                                                                    value={option}
                                                                    control={<Radio />}
                                                                    label={option}
                                                                />
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
                            else if (field.field === "checkbox") {
                                return (
                                    <FormControl key={field.name} component="fieldset" className={classes.checkboxControl}>
                                        <FormLabel component="legend" className={classes.checkboxLegend}>{field.name.toUpperCase()}</FormLabel>
                                        <FormGroup>
                                            {
                                                field["values"].map(item => {
                                                    return (
                                                        <FormControlLabel key={item}
                                                            classes={{
                                                                label: classes.checkboxLabel
                                                            }}
                                                            control={<Checkbox
                                                                disabled={disabled}
                                                                checked={data[field.name]?.[item] || false}
                                                                onChange={e => handleCheckboxChange(e, field.name, item)}
                                                            />}
                                                            label={item}
                                                        />
                                                    )
                                                })
                                            }
                                        </FormGroup>
                                    </FormControl>
                                )
                            }
                            else if (field.field === "pred") {
                                return (
                                    !data[field.name] ? null :
                                        <label style={{ marginBottom: "0px", color: "#05056B" }} className="predLabel">{field.name.replace("_", " ") + " : " + data[field.name]}</label>
                                )
                            }

                            else if (field.field === "doc") {
                                return (
                                    <div className={classes.file} key={field.name}>
                                        <label style={{ marginBottom: "0px", color: "#05056B" }} className="fileLabel">{field.name.replace(/_/g, ' ').toUpperCase()}</label>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            // capture="environment"
                                            {...register(field.name, field.rules)}
                                            onChange={e => {
                                                register(field.name, field.rules).onChange(e);
                                                uploadOnlyDOC(e, field.name, data[field.name]);
                                            }}

                                            disabled={disabled}
                                            name={field.name}
                                            style={{ width: "200px", color: "#05056B" }}
                                        />
                                        {/* {
                                            !data[field.name] ? null :
                                                <img src={tempdata[data[field.name]]} style={{ height: "100px", width: "100px", border: "solid 2px", marginTop: "10px" }} alt="preview" onClick={() => previewImage(tempdata[data[field.name]])} />
                                        } */}
                                        {
                                            !errors[field.name] ? null :
                                                <>
                                                    <label className="validationError">{errors[field.name] ? errors[field.name].message : null}</label>
                                                </>
                                        }
                                    </div>
                                )
                            }

                            else if (field.field === "file") {
                                // if (data[field.name] !== "") {
                                //     if (!tempdata[data[field.name]]) {
                                //         console.log("from initial if 1");
                                //         console.log(data[field.name]);
                                //         setTempData({
                                //             ...tempdata,
                                //             [data[field.name]]: "",
                                //         })
                                //         miniogetURL(data[field.name]);
                                //         console.log("from initial if 2");
                                //     }
                                // }
                                return (
                                    <div className={classes.file} key={field.name}>
                                        <label style={{ marginBottom: "0px", color: "#05056B" }} className="fileLabel">{field.name.replace(/_/g, ' ').toUpperCase()}</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            // capture="environment"
                                            {...register(field.name, field.rules)}
                                            onChange={e => {
                                                register(field.name, field.rules).onChange(e);
                                                uploadImage(e, field.name, data[field.name]);
                                            }}

                                            disabled={disabled}
                                            name={field.name}
                                            style={{ width: "200px", color: "#05056B" }}
                                        />
                                        {
                                            !data[field.name] ? null :
                                                <img src={tempdata[data[field.name]]} style={{ height: "100px", width: "100px", border: "solid 2px", marginTop: "10px" }} alt="preview" onClick={() => previewImage(tempdata[data[field.name]])} />
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
                        })
                    }
                </div>
                {
                    disabled ? null : <button type="submit" className="submitButton">Submit</button>
                }
            </form>


        )

    return (
        <div className="patientFormHomeStyle" style={{
            overflow: userInfo.stationForm && "initial",
            background: userInfo.stationForm && "none",
            height: userInfo.stationForm && "initial"
        }}>
            {userInfo.admin || userInfo.stationForm ? null : <Navbar />}
            {userInfo.stationForm ? null :
                <div className="header" style={{ paddingBottom: "0px" }}>
                    <button style={{ border: "none", background: "none", marginRight: "auto" }} onClick={back}>
                        {userInfo.admin ? null :
                            <img className="backArrow" src={BackArrow} />}
                    </button>
                    <label style={{ marginRight: "auto", fontWeight: "600", fontSize: "24px" }} className="formHeaders">Patient Details</label>
                </div>
            }

            <label style={{ fontWeight: "400", fontSize: "18px", zoom: userInfo.stationForm && "0.8" }} className="formHeaders">
                {userInfo.first_name} {userInfo.last_name} {userInfo.admin ? null : '|'} {userInfo.patient_id}
            </label>

            <div className="dynamicForm">
                {
                    !userInfo.stationForm && <FormControl className={classes.formControl}>
                        <Select
                            onChange={changeCategory}
                            displayEmpty
                            value={selectCategory}
                            className={classes.selectCategory}
                            MenuProps={{
                                getContentAnchorEl: null,
                                anchorOrigin: {
                                    vertical: "bottom",
                                    horizontal: "center",
                                },
                                PaperProps: {
                                    style: {
                                        maxHeight: 300 //for admin side
                                    }
                                },
                                classes: { paper: classes.selectCategoryMenu },
                                transformOrigin: { horizontal: 'center', vertical: 'top' }
                            }}
                        >
                            <MenuItem value="" disabled>Select Category</MenuItem>
                            {
                                category_data.map(category => {
                                    return <MenuItem key={category} value={category}>{category.replace(/_/g, ' ').toUpperCase()}</MenuItem>
                                })
                            }
                        </Select>
                    </FormControl>
                }
                {
                    selectCategory && disabled ? (
                        <button onClick={handleEdit} className="submitButton" style={{ width: "100px", marginRight: "0px" }}>Edit</button>
                    ) : null
                }

                {
                    (userInfo.stationForm && stationShow && selectCategory) || (!userInfo.stationForm && selectCategory) ? (
                        <>
                            {
                                FormFields[selectCategory]["requirement"] === "optional" ? (
                                    <div className="optionalSet">
                                        <FormControl onChange={e => setRequirement(e.target.value)}>
                                            <FormLabel style={{ fontWeight: "600", lineHeight: "40px", color: "#05056B" }}>Select Input Option</FormLabel>
                                            <RadioGroup row >
                                                <FormControlLabel checked={requirement === "manual"} value="manual" control={<Radio />} label="Enter Manually" />
                                                <FormControlLabel checked={requirement === "pic"} value="pic" control={<Radio />} label="Upload Picture" />
                                            </RadioGroup>
                                        </FormControl>

                                        <>
                                            {
                                                requirement === "manual" ? <>{formData}</> : (
                                                    <>
                                                        <input type="file" accept="image/*,.pdf" style={{ marginBottom: "20px", width: "200px", color: "#05056B" }} onChange={uploadOnlyImage} disabled={disabled} />
                                                        {
                                                            !imgData ? null :
                                                                <img src={getUrl(imgData)} style={{ height: "100px", width: "100px", border: "solid 2px", marginBottom: "10px" }} alt="preview" onClick={() => previewImage(getUrl(imgData))} />
                                                        }
                                                        {
                                                            disabled ? null : <button className="submitButton" onClick={submit}>Submit</button>
                                                        }
                                                    </>
                                                )
                                            }
                                        </>
                                    </div>
                                )
                                    : <>{formData}</>
                            }
                        </>
                    ) : null
                }
            </div>
            {userInfo.admin || userInfo.stationForm ? null :
                <button onClick={logout} className="logoutButton">Exit  <FiIcons.FiLogOut /></button>}

            {
                loading ? (
                    <Backdrop className={classes.backdrop} open>
                        <CircularProgress color="inherit" />
                    </Backdrop>
                ) : null
            }

        </div>
    )
}

export default PatientForm;
