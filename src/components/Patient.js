import React , {Component} from 'react';
import PatientSameMobile from './PatientSameMobile';
import PatientHistory from './patient_history';
import PatientVisitList from './PatientVisitList';
import PatientForm from './patientForm';

class Patient extends Component{
constructor(props){
    super(props);
    this.state={
        step: 1,
        selectedPatientId: props.location.state && props.location.state.patient_id ? props.location.state.patient_id : "",
        mobile_number: props.location.state && props.location.state.mobile_number ? props.location.state.mobile_number : "",
        selectedVisit: "",
        userInfo: {}
    }

}//end constructor

componentDidMount(){
    if(this.state.selectedPatientId && !this.state.mobile_number){
        this.nextStep();
    }
    
}//end componentDidMount


prevStep = () => {
    const {step} = this.state;
    this.setState({
        step: step - 1
    })

}

nextStep = () => {
    const {step} = this.state;
    this.setState({
        step: step + 1
    })

}

returnHome = () => {
    this.setState({
        step: 1
    })
}

handlePatientId = (value) => {
    this.setState({
        selectedPatientId: value
    })
}

handleVisit = (value) => {
    this.setState({
        selectedVisit: value
    })
}

handleMobileNumber = (value) => {
    this.setState({
        mobile_number: value
    })
}

handleUserInfo = (value) => {
    this.setState({
        userInfo: value
    })
}
 
render(){
    const {step}=this.state;
    const {mobile_number,selectedPatientId,userInfo,selectedVisit} = this.state;
    const values = {mobile_number,selectedPatientId,userInfo,selectedVisit};

    switch(step){
        case 1:
            return (
               <PatientSameMobile 
               nextStep={this.nextStep}
               handlePatientId={this.handlePatientId}
               values={values}
               /> 
            )
        case 2:
            return (
                <PatientHistory
                prevStep={this.prevStep}
                nextStep={this.nextStep}
                handleUserInfo={this.handleUserInfo}                
                values={values}
                />
            )
        case 3:
            return (
                <PatientVisitList
                prevStep={this.prevStep}
                nextStep={this.nextStep}
                handleVisit={this.handleVisit}                
                values={values}
                />
            )
        case 4:
            return (
                <PatientForm
                prevStep={this.prevStep}
                returnHome={this.returnHome}
                values={values}
                />
            )
    }

    
}//end render

} // end class Patient

export default Patient;