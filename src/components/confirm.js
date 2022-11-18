import React,{Component} from 'react';
import Axios from 'axios';
import './confirm.css';
import './register.css';
import BackArrow from './icons/backArrow.png';
import Navbar from './navbar';
import {Container,Button,Row,Col} from 'react-bootstrap';
import {Stepper,Step,StepLabel,Modal} from '@material-ui/core';
import { withStyles } from "@material-ui/core/styles";
import {Backdrop,CircularProgress} from '@material-ui/core';

const styles = theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    alternativeLabel: {
        width: "100%",
        background: "none"
    },
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
      },
  });

class Confirm extends Component {
    constructor(props){
        super(props);
        this.state ={
            show: false,
            errorMsg: '',
            modalOpen: false,
            generatedPatientID: '',
            loading: false
        }

    }//end constructor

    componentDidMount(){

    }//end componentDidMount

    back = () => {
        this.setState({loading: true});
        this.props.prevStep();
    }

    register = (e,values) => {
        e.preventDefault();
        console.log(`Going for Registration`);
        this.setState({loading: true});
        //POST DETAILS TO DATABASE
        Axios({
            method: "POST",
            url: "/patient/register",
            data: {
                drive_id: localStorage.getItem("drive_selected"),
                identifiers: values
            }
          })
          .then(res => {
            this.setState({loading: false});
            console.log(res);
            //alert(`Patient ID generated is ${res.data.patient_id}`);
            this.setState({
                generatedPatientID: res.data.patient_id,
                modalOpen: true
            })
          })
          .catch(error => {
            this.setState({loading: false});
            console.log("Patient Registration error")
            console.log(error.response);
          });

    }

    titleCase = str => {
        return str.toLowerCase().split(' ').map(function(val) { return val.replace(val[0], val[0].toUpperCase()); }).join(' ');
    }

    modalClose = e => {
        this.setState({modalOpen: false})
        this.setState({loading: true});
        window.location = `${process.env.REACT_APP_URL_PREFIX}/enrollReg`;
    }

    previewImage = img => {
        var image = new Image();
        image.src = img;
        //image.style.cssText = "height: 50vh ; width: 50vw"
        //console.log(image);
        var w = window.open("");
        w.document.write(image.outerHTML);
    }

    dateToString = date => {
        var formattedDate = new Date(date)
                            .toLocaleString('en-GB', {year: 'numeric', month: '2-digit', day: '2-digit'})
                            .replace(/(\d+)\/(\d+)\/(\d+)/, '$1/$2/$3');

        return formattedDate;

    }

    render() {
        const {values,classes} = this.props;
        const patIdenObj = values.patIdenObj["patient_identifiers"].parameters;
        return (
            <div className="confirmHomeStyle">
                <Navbar />
                <div className="header">
                    <button style={{border:"none",background:"none",marginRight:"auto"}} onClick={this.back}>
                        <img className="backArrow" src={BackArrow} />
                    </button>
                    <label style={{marginRight:"auto",fontWeight:"600",fontSize:"24px"}} className="formHeaders">Review</label>
                </div>
                <div className="separater"></div>

                <Stepper
            activeStep={1}
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

                <div className="dataSection" >
                    <Container id="confirmContainer">
                        {
                            patIdenObj.map(field => {
                                if(field.field === "text" || field.field === "dropdown" || field.field ==="autocomplete" || field.field === "radio"){
                                    return (
                                        <Row key={field.name}>
                                            <Col className="formHeaders" xs={6}>{`${this.titleCase(field.name.replace(/_/g,' '))}:`}</Col>
                                            <Col className="formValues"  xs={6}>{values.data[field.name]}</Col>
                                        </Row>
                                    )
                                }
                                else if(field.field === "checkbox"){
                                    return (
                                        <Row key={field.name}>
                                            <Col className="formHeaders" xs={6}>{`${this.titleCase(field.name.replace(/_/g,' '))}:`}</Col>
                                            <Col className="formValues"  xs={6}>
                                                {
                                                    Object.entries(values.data[field.name]).map( ([item,checked]) => {
                                                        return (
                                                            <Row key={item} style={{marginTop:"0px"}}>
                                                                <Col xs={6}>{`${item}: `}</Col>
                                                                <Col xs={6}>{this.titleCase(checked.toString())}</Col>
                                                            </Row>
                                                        )
                                                    })
                                                }
                                            </Col>
                                        </Row>
                                    )
                                }
                                else if(field.field === "calendar"){
                                    return (
                                        <Row key={field.name}>
                                            <Col className="formHeaders" xs={6}>{`${this.titleCase(field.name.replace(/_/g,' '))}:`}</Col>
                                            <Col className="formValues"  xs={6}>{this.dateToString(values.data[field.name])}</Col>
                                        </Row>
                                    )
                                }
                                else if(field.field === "file"){
                                    return (
                                        <Row key={field.name}>
                                            <Col className="formHeaders" xs={6}>{`${this.titleCase(field.name.replace(/_/g,' '))}:`}</Col>
                                            <Col className="formValues"  xs={6}>
                                                { !values.data[field.name] ? null : <img src={values.data[field.name]} style={{height:"100px",width:"100px",border:"solid 2px black"}} alt="preview"  onClick={() => this.previewImage(values.data[field.name])} /> }
                                            </Col>
                                        </Row>
                                    )
                                }
                            })
                        }
                    </Container>
                    <button className="submitStyle" onClick={e => this.register(e,values.data)}>Submit</button>
                </div>

                <Modal
                    open={this.state.modalOpen}
                    onClose={this.modalClose}
                >
                 <div id="patientModal" className={classes.paper}>
                     <h3>Generated Patient ID</h3>
                     <h6 style={{fontSize:"24px"}}>{this.state.generatedPatientID}</h6>
                </div>
                </Modal>

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

export default (withStyles)(styles)(Confirm);