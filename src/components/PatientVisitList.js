import React , { Component } from 'react';
import Axios from 'axios';
import BackArrow from './icons/backArrow.png';
import AddVisit from './icons/addVisit2.png'
import './PatientVisitList.css';
import Navbar from './navbar';
import {Card,Button,Container,Row,Col } from 'react-bootstrap';
import * as FiIcons from 'react-icons/fi';
import {Backdrop,CircularProgress} from '@material-ui/core';
import { withStyles } from "@material-ui/core/styles";

const styles = theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    }
})

class PatientVisitList extends Component {
constructor(props){
    super(props);
    this.state ={
        show: false,
        errorMsg: '',
        loading: false,
        visitList: [],
        colorList: [
            "#FFC895",
            "#FDF6B4",
            "#D1FABD",
            "#F8CBCB",
            "#AFD9FF",
            "#FACDF5",
            "#FFBCD4",
            "#B4FFF6"
        ]
    }

}//end constructor

componentDidMount() {
    this.setState({loading:true})
    Axios({
        method: "POST",
        url: "/patient/getvisitcount",
        data: {
            patient: this.props.values.selectedPatientId,
        },
        withCredentials: true
    })
    .then(res => {
        // console.log(res.data.data);
        this.setState({loading:false})
        const visitList = []
        for(let i=1;i<=res.data.data;i++){
            visitList.push(i.toString())
        }
        this.setState({visitList: visitList})
    })
    .catch(error => {
        this.setState({loading:false})
        if (error.response){
            console.log(error.response.data.msg);
        }
    });

}

viewVisit = (e,num) => {
    e.preventDefault();
    this.setState({loading:true});
    this.props.handleVisit(num);
    this.props.nextStep();
}

exit = () => {
    this.setState({loading:true});
    window.location = `${process.env.REACT_APP_URL_PREFIX}/enroll`;
}

back = () => {
    this.setState({loading:true});
    this.props.prevStep();
}

addVisit = e => {
    this.setState({loading:true})
    e.preventDefault();
    Axios({
        method: "POST",
        url: "/visit/create",
        data: {
            patient: this.props.values.selectedPatientId,
        },
        withCredentials: true
    })
    .then(res => {
        this.setState({loading:false})
        // console.log(res.data.data);
        const visitList = this.state.visitList
        const newCount = visitList.length + 1
        visitList.push(newCount.toString());
        this.setState({visitList: visitList})
        //alert("New Visit Created");
    })
    .catch(error => {
        this.setState({loading:false})
        if (error.response){
            console.log(error.response.data.msg);
        }
    });

}

render () {
    const {classes} = this.props;
    return (
        <div className="patientVisitListHomeStyle">
            <Navbar />
            <div className="header">
                    <button style={{border:"none",background:"none",marginRight:"auto"}} onClick={this.back}>
                        <img className="backArrow" src={BackArrow} />
                    </button>
                    <label style={{marginRight:"auto",fontWeight:"600",fontSize:"24px"}} className="formHeaders">Visit List</label>
            </div>

            <Container className="smallContainer" fluid="sm">
                <Row>
                    <Col xs={6}>
                            <Card className="addVisit">
                            <Card.Body>
                                <Card.Title>Add Visit</Card.Title>
                                <button className="addVisitButton" onClick={this.addVisit}>
                                    <img src={AddVisit} />
                                </button>
                            </Card.Body>
                        </Card>
                    </Col>
                    {
                        this.state.visitList.map((num,index) => {
                            const newIndex = index % this.state.colorList.length
                            const color = this.state.colorList[newIndex];
                            return (
                                <Col xs={6} key={index}>
                                    <Card style={{backgroundColor: "#10DDCD"}} className="visitCard">
                                        <Card.Body>
                                            <Card.Title>{`Visit ${num}`}</Card.Title>
                                            <button className="visitCardButton" onClick={(e) => this.viewVisit(e,num)}>Details</button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            )
                        })
                    }

                </Row>
            </Container>
            <button onClick={this.exit} className="logoutButton">Exit  <FiIcons.FiLogOut/></button>

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

export default withStyles(styles)(PatientVisitList);