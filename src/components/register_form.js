import React , {Component} from 'react';
import Register from './register';
import Confirm from './confirm';

class RegisterForm extends Component{
constructor(props){
    super(props);

    this.state={
        step: 1,
        patIdenObj: {},
        data: {},
        verified: false,
        minor: ""        
    }

}//end constructor

componentDidMount(){

    
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

handleChange = (input,value) => {
    this.setState({
        data: {
            ...this.state.data,
            [input]: value
        }
    })
}

handleCheckboxChange = (e,name,option) => {
    this.setState({
        data: {
            ...this.state.data,
            [name]: {
                ...this.state.data[name],
                [option]: e.target.checked
            }
        }
    })
}

handleMinor = value => {
    this.setState({
        minor: value
    })
}

handleVerify = value => {
    this.setState({
        verified: value
    })
}

populateData = value => {
    this.setState({
        data: value
    })
}

populatePatIden = value => {
    this.setState({
        patIdenObj: value
    })
}

render(){
    const {step , patIdenObj , data , verified , minor}=this.state;
    const values = { patIdenObj, data , verified, minor};

    switch(step){
        case 1:
            return (
               <Register 
               nextStep={this.nextStep}
               handleChange={this.handleChange}
               handleCheckboxChange={this.handleCheckboxChange}
               populatePatIden={this.populatePatIden}
               populateData={this.populateData}
               handleVerify={this.handleVerify}
               handleMinor={this.handleMinor}
               values={values}
               /> 
            )
        case 2:
            return (
                <Confirm
                prevStep={this.prevStep}
                values={values}
                />
            )
    }

    
}//end render

} // end class RegisterForm

export default RegisterForm;