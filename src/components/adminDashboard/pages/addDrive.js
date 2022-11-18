import React , {Component} from 'react';
import {Backdrop, CircularProgress,Button,TextField,Grid,FormLabel,FormControlLabel,FormGroup,Checkbox,Select,MenuItem,Divider,Container,InputLabel,OutlinedInput,FormControl } from '@material-ui/core';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';
import Axios from 'axios';
import './drive.css';
import Autocomplete from '@material-ui/lab/Autocomplete';

class AddDrive extends Component{
    constructor(props){
        super(props)
        this.state={
            user:'',
            org_id:'',
            drive_name:'',
            description:'',
            location:'',
            access_id:'',
            assist_ids:[],
            assist_list:[],
            form_list:[],
            form_id:'',
            state:'',
            district:'',
            block:'',
            state_id:'',
            district_id:'',
            block_id:'',
            backdrop:false,
            state_list:[{"id":"1","name":"ok"}],
            district_list:[],
            block_list:[],
        }
        this.discard_drive=this.discard_drive.bind(this)
        this.create_drive=this.create_drive.bind(this)
        this.handleChange=this.handleChange.bind(this)
        this.handleChange2=this.handleChange2.bind(this)
        this.state_done=this.state_done.bind(this)
        this.district_done=this.district_done.bind(this)
        this.block_done=this.block_done.bind(this)
        this.handleChangeMultiple=this.handleChangeMultiple.bind(this)
        this.handleChangeAss=this.handleChangeAss.bind(this)
    }
    handleChange2 = (event) => {
        console.log(event.target.value)
        this.setState({form_id:event.target.value});
    };
    handleChange = (name,val) => {
        if(name==="drive_name")this.setState({drive_name: val})
        else if(name === "description") this.setState({description: val})
        else this.setState({location: val})
    };
    state_done=async(e,val)=>{
        this.setState({backdrop:true})
        let a=e.target.value
        if(a!==undefined){
            let stid=val
            let stname=val
        // axios call to fetch dist
            var list = ""
            await Axios({
                method:"POST",
                url:"/drive/getdist",
                withCredentials:true,
                data:{state:stname}
            })
            .then(res=>{
                list=res.data.data;
                this.setState({district_list:list})
            })
            .catch(err=>{
                alert("Reload required!")
                window.location.reload()
            })
            this.setState({state_id:stid,state:stname,backdrop:false})
        }
        else{
            this.setState({state_id:"",state:"",backdrop:false})
        }

    }
    district_done=async(e,val)=>{
        this.setState({backdrop:true})
        let a=val
        if(a!==undefined){
            let stid=val
            let stname=val
            // axios call to fetch block
            var list = ""
            await Axios({
                method:"POST",
                url:"/drive/getblocks",
                withCredentials:true,
                data:{district:stname}
            })
            .then(res=>{
                list=res.data.data;
                this.setState({block_list:list})
            })
            .catch(err=>{
                alert("Reload required!")
                window.location.reload()
            })
            this.setState({district_id:stid,district:stname,backdrop:false})
        }
        else{
            this.setState({district_id:"",district:"",backdrop:false})
        }
    }
    block_done=async(e,val)=>{
        let a=val
        if(a!==undefined){
            let stid=val
            let stname=val
            this.setState({block_id:stid,block:stname})
        }
        else{
            this.setState({block_id:"",block:""})
        }
    }
    handleChange3 = (name,val) => {
        if(name==="state")this.setState({state: val})
        else if(name === "district") this.setState({district: val})
        else this.setState({block: val})
    };
    handleChangeMultiple = (e) => {
        console.log(e.target.value)
        this.setState({assist_ids:e.target.value});
    };
    handleChangeAss = (e,val) => {
        console.log(e.target.value)
        console.log(val)
        let dd=[]
        for(let x in val){
            dd.push(val[x].id)
        }
        this.setState({assist_ids:dd});
    };
    discard_drive=()=>{
        window.location = `${process.env.REACT_APP_URL_PREFIX}/admindashboard/drives`;
    }
    async create_drive(e){
        e.preventDefault();
        if(!this.state.org_id ){
            alert("Not Authorized Login Again")
            window.location = `${process.env.REACT_APP_URL_PREFIX}/admin`;
        }
        else{
            var aa="";
            aa+=(this.state.block+", ")
            aa+=(this.state.district+", ")
            aa+=(this.state.state)


            var collected_data ={
                drive_name:this.state.drive_name,
                description:this.state.description,
                org_id:this.state.org_id,
                location:aa,
                medical_assistant:this.state.assist_ids,
                access_id:this.state.form_id,
                timestamp:new Date()
            }
            console.log(collected_data)
            Axios({
                method:"POST",
                url:"/drive/create",
                withCredentials:true,
                data:collected_data
            })
            .then(res=>{
                console.log(res)
                alert("Drive created")
                window.location = `${process.env.REACT_APP_URL_PREFIX}/admindashboard/drives`;
            })
            .catch(err=>{
                console.log(err)
                alert("Can't create Drive. Try again!")
                window.location.reload()
            })
        }
    }
    async componentDidMount(){

        var list = ""
        await Axios({
            method:"GET",
            url:"/drive/getstates",
            withCredentials:true
        })
        .then(res=>{
            list=res.data.data;
            this.setState({state_list:list})
        })
        .catch(err=>{
            alert("Reload required!")
            window.location.reload()
        })

        var user = ""
        await Axios({
            method:"GET",
            url:"/admin/user",
            withCredentials:true
        })
        .then(res=>{
            user=res.data;
            this.setState({user:user,org_id:user.msg.org_id})
        })
        .catch(err=>{
            alert("Not Authorized Login Again")
            window.location = `${process.env.REACT_APP_URL_PREFIX}/admin`;
        })

        var assistlist = ""
        await Axios({
            method:"POST",
            url:"/assist/byorgid",
            withCredentials:true,
            data:{org_id:this.state.org_id}
        })
        .then(res=>{
            assistlist=res.data;
            var dd = [];
            for(let i=0;i<assistlist.length;i++)
            {
                let p = assistlist[i]
                let name="";
                if(p["first_name"]!=="")name+=p["first_name"]+" ";
                if(p["middle_name"]!=="" || p["middle_name"]!==undefined )name+=p["middle_name"]+" ";
                if(p["last_name"]!=="")name+=p["last_name"]+" ";
                let pa = {id:p["_id"],name:name}
                dd.push(pa);
            }
            this.setState({assist_list:dd})
        })
        .catch(err=>{
            alert("Not Authorized Login Again")
            window.location = `${process.env.REACT_APP_URL_PREFIX}/admin`;
        })

            var formlist = ""
            await Axios({
                method:"GET",
                url:"/access/all",
                withCredentials:true,
            })
            .then(res=>{
                formlist=res.data;
                var dd = [];
                for(let i=0;i<formlist.length;i++)
                {
                    let p = formlist[i]

                    let pa = {id:p["_id"],form_name:p["name"]}
                    dd.push(pa);
                }
                this.setState({form_list:dd})
            })
            .catch(err=>{
                alert("Not Authorized Login Again")
                window.location = `${process.env.REACT_APP_URL_PREFIX}/admin`;
            })

    }
    render(){
        return (
            <div className="drive">
                    {
                        this.state.backdrop ? (
                            <Backdrop style={{zIndex:"100"}} open>
                                <CircularProgress color="inherit" />
                            </Backdrop>
                        ) : null
                    }
                    <div className="drive-title">Add Drive</div>
                    <div className="drive-subtitle">Drive Essentials</div>
                    <div className="drive-description" >Fill the listed fields which will help you to identify this drive later and click on <strong>CONFIRM</strong> to add ne Drive.</div>
                    <div className="drive-form-inline">
                        <TextField id="outlined-basic" fullWidth name="drive_name" onChange={(e) => this.handleChange("drive_name",e.target.value)}  label="Drive Name" variant="outlined" /><br/><br/>
                        <TextField id="outlined-basic" fullWidth multiline="true" rows="4" name="description" onChange={(e) => this.handleChange("description",e.target.value)}  label="Description" variant="outlined" /><br/><br/>

                        <Grid container spacing={3}>
                            <Grid item xs={4}>
                                <Autocomplete
                                    id="combo-box-demo"
                                    value={this.state.state_id}
                                    options={this.state.state_list}
                                    onChange={(e,val)=>this.state_done(e,val)}
                                    renderInput={(params) => <TextField fullWidth {...params} label="Choose State" variant="outlined" />}
                                />
                            </Grid>
                            <Grid item xs={4}>
                            <Autocomplete
                                    id="combo-box-demo"
                                    value={this.state.district_id}
                                    options={this.state.district_list}
                                    onChange={(e,val)=>this.district_done(e,val)}
                                    renderInput={(params) => <TextField fullWidth {...params} label="Choose District" variant="outlined" />}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <Autocomplete
                                    id="combo-box-demo"
                                    value={this.state.block_id}
                                    options={this.state.block_list}
                                    onChange={(e,val)=>this.block_done(e,val)}
                                    renderInput={(params) => <TextField fullWidth {...params} label="Choose Block" variant="outlined" />}
                                />
                            </Grid>
                        </Grid>
                        <br/>
                        <Autocomplete
                            multiple
                            id="tags-outlined"
                            options={this.state.assist_list}
                            getOptionLabel={(option) => option.name}
                            filterSelectedOptions
                            // value={this.state.assist_ids}
                            onChange={(e,val)=>this.handleChangeAss(e,val)}
                            renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                label="Medical Assistant"
                                placeholder="Add Medical Assistant"
                            />
                            )}
                        />
                        <br/>
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel id="demo-simple-select-outlined-label">Form Name</InputLabel>
                            <Select
                                labelId="demo-simple-select-outlined-label"
                                id="demo-simple-select-outlined"
                                fullWidth
                                name="medical_assist"
                                variant="outlined"
                                value={this.state.form_id}
                                onChange={this.handleChange2}
                                label="Form Name"
                                >
                                    {/* <MenuItem value={0}>CHOOSE MEDICAL ASSISTANT</MenuItem> */}
                                {
                                    this.state.form_list.map(r =>(
                                        <MenuItem value={r.id}>{r.form_name}</MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl><br/>

                    </div>
                    <div className="drive-subtitle"></div>
                    <div className="drive-description" ></div>
                    <div className="drive-flex-2">
                    </div>
                    <div className="drive-flex-2">
                        <Button variant="contained" onClick={this.create_drive} color="primary" startIcon={<CreateOutlinedIcon />}> confirm </Button>
                        <Button variant="contained" onClick={this.discard_drive} color="secondary" startIcon={<ClearOutlinedIcon />}> Discard </Button>
                    </div>
                </div>
        );
    }
}

export default AddDrive;
