import React, { Component } from 'react';
import Axios from 'axios'
import { Button, Alert, ThemeProvider } from 'react-bootstrap';
import './register.css';
import BackArrow from './icons/backArrow.png';
import RegDial from './icons/regDial.png';
import Navbar from './navbar';
import VerifyMobile from './icons/verifyMobile.png';
import LockIcon from '@material-ui/icons/Lock';
import {
    Radio, RadioGroup, FormControl, FormLabel, FormControlLabel,
    TextField,
    Select, MenuItem, FormHelperText,
    FormGroup, Checkbox,
    Drawer,
    Stepper, Step, StepLabel,
    Backdrop, CircularProgress
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import { withStyles } from "@material-ui/core/styles";
import { useForm, Controller } from 'react-hook-form';
import firebase from './firebase'

const styles = theme => ({
    paperAnchorBottom: {
        width: "fit-content",
        margin: "auto",
        textAlign: "center",
        borderRadius: "16px"
    },
    alternativeLabel: {
        width: "100%",
        background: "none"
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    dropdown: {
        width: "300px"
    },
    file: {
        width: "300px",
        display: "flex",
        flexDirection: "column",
    },
    checkboxControl: {
        width: "300px"
    },
    checkboxLabel: {
        //color: "#05056B",
    }
});



class RegisterHook extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fieldEmpty: '',
            show: false,
            otpArray: new Array(6).fill(""),
            otpDraw: false,
            loading: false,
            timer_dict: { 0: 30, 1: 60, 2: 180, 3: 300 },
            counter: 0,
            counter_step: parseInt(localStorage.getItem("pat_reg_counter_step")) || 0,
            otp_disable: parseInt(localStorage.getItem("pat_reg_counter_step")) > 3
        }

    }//end constructor

    componentDidMount() {

    }//end componentDidMount

    handleMinorChange = e => {
        this.setState({ loading: true });
        this.props.handleMinor(e.target.value);
        Axios({
            method: "POST",
            url: "/access/renderidentifiers",
            data: {
                ischild: e.target.value
            },
            withCredentials: true
        })
            .then(res => {
                this.setState({ loading: false });
                this.props.populatePatIden(res.data.data);
                let initialState = {}
                res.data.data["patient_identifiers"].parameters.map(field => {
                    if (field.field === "text" || field.field === "dropdown" || field.field === "autocomplete" || field.field === "radio" || field.field === "file" || field.field === "pred") {
                        initialState[field.name] = ""
                    }
                    else if (field.field === "checkbox") {
                        const checkInitial = {}
                        field.values.map(opt => {
                            checkInitial[opt] = false
                        })
                        initialState[field.name] = checkInitial
                    }
                    else if (field.field === "calendar") {
                        initialState[field.name] = new Date('2000-12-31T00:00:00')
                    }
                })
                this.props.populateData(initialState);
                // timer set
                if (localStorage.getItem("pat_reg_counter_step") == null || this.state.counter_step > 3) return
                this.setState({
                    counter: this.state.timer_dict[this.state.counter_step],
                    counter_step: this.state.counter_step + 1
                })
                this.startTimer()

            })
            .catch(error => {
                this.setState({ loading: false });
                if (error.response) {
                    console.log(error.response.data.msg);
                }
            });
    }

    AlertDismissibleExample = (e) => {
        if (this.state.show) {
            return (
                <Alert className="text-center" variant="warning" onClose={() => this.setState({ show: false, fieldEmpty: '' })} dismissible>
                    <p>{this.state.fieldEmpty}</p>
                </Alert>
            );
        }
        return ({})

    }

    back = () => {
        this.setState({ loading: true });
        window.location = `${process.env.REACT_APP_URL_PREFIX}/enrollReg`;
    }

    register = () => {
        this.setState({ loading: true })
        this.props.nextStep();
    }

    setTimer = () => {
        const counter_step = parseInt(localStorage.getItem("pat_reg_counter_step"))
        if (counter_step <= 3) this.setState({ counter: this.state.timer_dict[counter_step] })
        else this.setState({ otp_disable: true })
    }

    startTimer = () => {
        var id = setInterval(() => {
            if (this.state.counter == 0) clearInterval(id);
            else this.setState({ counter: this.state.counter - 1 })
        }, 1000);
    }

    timerToString = secs => {
        var hours = Math.floor(secs / 3600);
        var mins = Math.floor(secs / 60) % 60;
        var seconds = secs % 60

        return [hours, mins, seconds]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":")
    }

    configureCaptcha = () => {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
                this.sendotp();
                console.log("Recaptcha verified")
            },
            defaultCountry: "IN"
        });
    }

    sendotp = e => {
        e.preventDefault();
        if (this.props.values.data["mobile_number"].length !== 10) {
            alert("Enter a 10 digit mobile number");
            return;
        }
        this.setState({ loading: true });
        this.configureCaptcha();
        const appVerifier = window.recaptchaVerifier;
        const mobile_with_code = `+91${this.props.values.data["mobile_number"]}`
        firebase.auth().signInWithPhoneNumber(mobile_with_code, appVerifier)
            .then((confirmationResult) => {
                // SMS sent
                this.setState({ loading: false })
                window.confirmationResult = confirmationResult;
                console.log("OTP has been sent")
                localStorage.removeItem("pat_reg_counter_step")
                //OPEN DRAWER
                this.openOtpDraw();
            })
            .catch(error => {
                this.setState({ loading: false })
                alert("OTP not sent")
                var step = this.state.counter_step
                this.setState({ counter_step: step + 1 })
                localStorage.setItem("pat_reg_counter_step", parseInt(step))
                this.setTimer()
                this.startTimer()
                if (error.response) {
                    console.log(error.response.data);
                }
            });
    }

    verify = e => {
        const otp_code = this.state.otpArray.join("");
        if (otp_code.length !== 6) {
            alert("Enter a valid OTP");
            return;
        }
        this.setState({ loading: true })
        window.confirmationResult.confirm(otp_code)
            .then((result) => {
                this.setState({ loading: false })
                console.log("User is verified");
                this.props.handleVerify(true);
                this.closeOtpDraw();
            })
            .catch((error) => {
                this.setState({ loading: false })
                alert("User verification failed")
                this.setState({
                    otpArray: new Array(6).fill("")
                });
                if (error.response) {
                    console.log(error.response.data);
                }
            });
    }

    handleOtpChange = (element, index) => {
        if (isNaN(element.value) || element.value.length > 1) return false;
        this.setState({
            otpArray: [...this.state.otpArray.map((d, idx) => (idx === index ? element.value : d))]
        })

        if (!element.value) {
            if (element.previousSibling) element.previousSibling.focus();
            else return false;
        }
        //Focus next input
        else if (element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    openOtpDraw = () => {
        this.setState({ otpDraw: true })
    }

    closeOtpDraw = () => {
        this.setState({ otpDraw: false })
    }

    convertToBase64 = file => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);

            fileReader.onload = () => {
                resolve(fileReader.result);
            }

            fileReader.onerror = error => {
                reject(error);
            }
        })
    }

    uploadImage = async (e, name) => {
        const file = e.target.files[0]
        const base64Encoding = await this.convertToBase64(file);
        this.props.handleChange(name, base64Encoding);
    }

    previewImage = img => {
        var image = new Image();
        image.src = img;
        image.style.cssText = "height: 50vh ; width: 50vw"
        //console.log(image);
        var w = window.open("");
        w.document.write(image.outerHTML);
    }

    rulesRegex = obj => {
        if (!obj?.pattern?.value) return obj;
        obj.pattern.value = new RegExp(obj.pattern.value);
        return obj;
    }

    render() {
        const { values, handleChange, handleCheckboxChange, classes } = this.props;
        const { handleSubmit, control, register, formState: { errors }, reset, clearErrors, setValue } = this.props;
        return (
            <div className="regHomeStyle">
                <Navbar />
                <div className="header">
                    <button style={{ border: "none", background: "none", marginRight: "auto" }} onClick={this.back}>
                        <img className="backArrow" src={BackArrow} />
                    </button>
                    <label style={{ marginRight: "auto", fontWeight: "600", fontSize: "24px" }} className="formHeaders">Patient Registration</label>
                </div>
                <div className="separater"></div>

                <Stepper
                    activeStep={0}
                    alternativeLabel
                    classes={{
                        alternativeLabel: classes.alternativeLabel
                    }}>
                    <Step>
                        <StepLabel>Register</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Confirm</StepLabel>
                    </Step>
                </Stepper>

                <div className="separater"></div>

                <div style={{ textAlign: "center", marginTop: "5px" }}>
                    <label className="fieldLabelStyle">IS THE PATIENT A MINOR ?</label><br />
                    <FormControl onChange={this.handleMinorChange}>
                        <RadioGroup row >
                            <FormControlLabel checked={values.minor === "yes"} value="yes" control={<Radio />} label="YES" />
                            <FormControlLabel checked={values.minor === "no"} value="no" control={<Radio />} label="NO" />
                        </RadioGroup>
                    </FormControl>
                </div>

                <form onSubmit={handleSubmit(this.register)}>
                    {
                        values.patIdenObj["patient_identifiers"]?.parameters?.map(field => {
                            if (field.field === "text" && field.name !== "mobile_number") {
                                return (
                                    <div style={{ textAlign: "left" }} key={field.name}>
                                        <label className="fieldLabelStyle">{field.name.replace(/_/g, ' ').toUpperCase()}</label><br />
                                        <input
                                            defaultValue={values.data[field.name]}
                                            type={field.type}
                                            className="regInputField"
                                            placeholder="Type here"
                                            {...register(field.name, this.rulesRegex(field.rules))}
                                            onChange={e => {
                                                register(field.name, this.rulesRegex(field.rules)).onChange(e);
                                                handleChange(field.name, e.target.value);
                                            }}
                                        />
                                        {
                                            !errors[field.name] ? null :
                                                <>
                                                    <br />
                                                    <label className="validationError">{errors[field.name] ? errors[field.name].message : null}</label>
                                                </>
                                        }
                                    </div>
                                )
                            }
                            else if (field.field === "dropdown") {
                                return (
                                    <div style={{ textAlign: "left" }} key={field.name}>
                                        <label className="fieldLabelStyle">{field.name.replace(/_/g, ' ').toUpperCase()}</label><br />
                                        <Controller
                                            name={field.name}
                                            control={control}
                                            defaultValue=""
                                            rules={field.rules}
                                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                                <FormControl variant="outlined" error={!!error}>
                                                    <Select
                                                        onChange={e => {
                                                            onChange(e);
                                                            handleChange(field.name, e.target.value);
                                                        }}
                                                        value={values.data[field.name] || ""}
                                                        MenuProps={{
                                                            getContentAnchorEl: null,
                                                            anchorOrigin: {
                                                                vertical: "bottom",
                                                                horizontal: "left",
                                                            },
                                                        }}
                                                        className={classes.dropdown}
                                                        displayEmpty
                                                    >
                                                        <MenuItem disabled value="">Select Option</MenuItem>
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
                                    </div>

                                )

                            }
                            else if (field.field === "radio") {
                                return (
                                    <div style={{ textAlign: "left", marginTop: "5px", width: "300px" }} key={field.name}>
                                        <label className="fieldLabelStyle">{field.name.replace(/_/g, ' ').toUpperCase()}</label><br />
                                        <Controller
                                            key={field.name}
                                            name={field.name}
                                            control={control}
                                            defaultValue=""
                                            rules={field.rules}
                                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                                <FormControl
                                                    onChange={e => {
                                                        onChange(e);
                                                        handleChange(field.name, e.target.value);
                                                    }}
                                                    error={error ? true : false}
                                                >
                                                    <RadioGroup row >
                                                        {
                                                            field.values.map(option => {
                                                                return (
                                                                    <FormControlLabel checked={values.data[field.name] === option} key={option} value={option} control={<Radio />} label={option} />
                                                                )
                                                            })
                                                        }
                                                    </RadioGroup>
                                                    <FormHelperText>{error ? error.message : null}</FormHelperText>
                                                </FormControl>
                                            )}
                                        />
                                    </div>
                                )
                            }
                            else if (field.field === "checkbox") {
                                return (
                                    <div key={field.name} style={{ textAlign: "left" }}>
                                        <label className="fieldLabelStyle">{field.name.replace(/_/g, ' ').toUpperCase()}</label><br />
                                        <FormControl component="fieldset" className={classes.checkboxControl}>
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
                                                                        checked={values.data[field.name]?.[item] || false}
                                                                        onChange={e => handleCheckboxChange(e, field.name, item)}
                                                                    />}
                                                                    label={item}
                                                                />
                                                            )
                                                        })
                                                    }
                                                </>
                                            </FormGroup>
                                        </FormControl>
                                    </div>
                                )
                            }
                            else if (field.field === "file") {
                                return (
                                    <div style={{ textAlign: "left" }} className={classes.file} key={field.name}>
                                        <label className="fieldLabelStyle">{field.name.replace(/_/g, ' ').toUpperCase()}</label>
                                        <input
                                            style={{ width: "200px", color: "#05056B" }}
                                            type="file" accept="image/*"
                                            {...register(field.name, field.rules)}
                                            onChange={e => {
                                                register(field.name, field.rules).onChange(e);
                                                this.uploadImage(e, field.name);
                                            }}
                                        />
                                        {
                                            !values.data[field.name] ? null :
                                                <img src={values.data[field.name]} style={{ height: "100px", width: "100px", border: "solid 2px", marginTop: "15px" }} alt="preview" onClick={() => this.previewImage(values.data[field.name])} />
                                        }
                                        {
                                            !errors[field.name] ? null :
                                                <>
                                                    <br />
                                                    <label className="validationError">{errors[field.name] ? errors[field.name].message : null}</label>
                                                </>
                                        }
                                    </div>
                                )

                            }
                            else if (field.field === "calendar") {
                                return (
                                    <div key={field.name} style={{ textAlign: "left", width: "300px" }}>
                                        <label className="fieldLabelStyle">{field.name.replace(/_/g, ' ').toUpperCase()}</label><br />
                                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                            <KeyboardDatePicker
                                                margin="normal"
                                                label="dd/mm/yyyy"
                                                format="dd/MM/yyyy"
                                                value={values.data[field.name] || new Date('2000-12-31T00:00:00')}
                                                onChange={(date) => handleChange(field.name, date)}
                                                KeyboardButtonProps={{
                                                    'aria-label': 'change date',
                                                }}
                                            />
                                        </MuiPickersUtilsProvider>
                                    </div>
                                )
                            }
                            else if (field.field === "autocomplete") {
                                return (
                                    <div key={field.name} style={{ textAlign: "left", width: "300px" }}>
                                        <label className="fieldLabelStyle">{field.name.replace(/_/g, ' ').toUpperCase()}</label><br />
                                        <Autocomplete
                                            options={!field.dependent ? ["Select One"].concat(field.values || []) : ["Select One"].concat(field.values[values.data[field.dependent]] || []) || ["Select One"]}
                                            value={values.data[field.name] || "Select One"}
                                            renderInput={(params) => <TextField {...params} />}
                                            onChange={(e, newValue) => handleChange(field.name, newValue)}
                                        />
                                    </div>
                                )

                            }
                        })
                    }

                    {/* MOBILE NUMBER ALWAYS LAST */}
                    {
                        !values.patIdenObj["patient_identifiers"] ? null :
                            <div className="mobileSet">
                                <div style={{ textAlign: "left" }}>
                                    <label className="fieldLabelStyle">{"mobile_number".replace(/_/g, ' ').toUpperCase()}</label><br />
                                    <input type="number" onChange={e => handleChange("mobile_number", e.target.value)} defaultValue={values.data["mobile_number"]} className="regInputField" placeholder="Type here" /><br />
                                </div>
                                {
                                    !values.verified ?
                                        <button id="sign-in-button" disabled={this.state.otp_disable || this.state.counter > 0} onClick={this.sendotp} style={{ background: "none", border: "none" }}>
                                            <LockIcon color={this.state.otp_disable || this.state.counter > 0 ? "inherit" : "primary"} fontSize="large" />
                                        </button>
                                        :
                                        <img src={VerifyMobile} id="mobileVerifyIcon" style={{ height: "fitContent", borderRadius: "50%", marginLeft: "5px" }} />
                                }
                            </div>
                    }

                    {this.state.counter > 0 && <><label style={{ marginTop: "10px" }} className="formHeaders">Resend in {this.timerToString(this.state.counter)}</label><br /></>}

                    <button className="submitStyle" type="submit">Submit</button>

                </form>

                <Drawer anchor="bottom"
                    classes={{
                        paperAnchorBottom: classes.paperAnchorBottom
                    }}
                    open={this.state.otpDraw} onClose={this.closeOtpDraw}>
                    <div className="otpDraw" role="presentation" >
                        <div className="regDialSet">
                            <img src={RegDial} />
                            <label style={{ marginTop: "5px", fontWeight: "600", fontSize: "24px" }} className="formHeaders">OTP</label>
                        </div>
                        <label style={{ fontWeight: "600", fontSize: "24px" }} className="formHeaders">Enter Verification Code</label>
                        <label style={{ fontWeight: "400", fontSize: "18px" }} className="formHeaders">Please enter the verification code sent to +91{values.data["mobile_number"]}</label>
                        <div style={{ display: "flex", marginTop: "20px" }}>
                            {
                                this.state.otpArray.map((data, index) => {
                                    return (
                                        <input
                                            className="regOtpField"
                                            type="number"
                                            key={index}
                                            value={data}
                                            onChange={e => this.handleOtpChange(e.target, index)}
                                            onFocus={e => e.target.select()}
                                        />
                                    );
                                })
                            }
                        </div>

                        <button disabled={this.state.loading} className="verifyButton" onClick={this.verify}>Verify</button>
                    </div>
                </Drawer>

                {
                    this.state.loading ? (
                        <Backdrop className={classes.backdrop} open>
                            <CircularProgress color="inherit" />
                        </Backdrop>
                    ) : null
                }

            </div>
        )
    }//end render

} // end class RegisterHook;

function Register(props) {
    const form = useForm()
    return (
        <RegisterHook {...form} {...props} />
    )
}

export default withStyles(styles)(Register);