import React, { Component } from 'react';
import './dataForm.css';
import { Button, TextField, Select, MenuItem, Divider, Container, InputLabel, OutlinedInput, FormControl } from '@material-ui/core';
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import Axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles((theme) => ({
    root: {
        margin: 'auto',
    },
    cardHeader: {
        padding: theme.spacing(1, 2),
    },
    list: {
        width: 500,
        height: 400,
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
    },
    button: {
        margin: theme.spacing(0.5, 0),
    },
}));

function not(a, b) {
    return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
    return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a, b) {
    return [...a, ...not(b, a)];
}

function TransferList(props) {
    const classes = useStyles();
    const [checked, setChecked] = React.useState([]);
    const [left, setLeft] = React.useState(props.props);
    const [right, setRight] = React.useState([]);
    const [drive_id, setDriveId] = React.useState(null);
    const [form_Name, setFormName] = React.useState(null);
    const [description, setDes] = React.useState(null);
    const [drive_list, setDriveList] = React.useState(props.drive);
    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];
        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setChecked(newChecked);
    };

    const numberOfChecked = (items) => intersection(checked, items).length;

    const handleToggleAll = (items) => () => {
        if (numberOfChecked(items) === items.length) {
            setChecked(not(checked, items));
        } else {
            setChecked(union(checked, items));
        }
    };

    const handleCheckedRight = () => {
        setRight(right.concat(leftChecked));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const discard_form = () => {
        window.location = `${process.env.REACT_APP_URL_PREFIX}/admindashboard/dataforms`;
    }
    const create_form = async () => {
        console.log(right)
        let data_collected = {
            drive_id: drive_id,
            form_name: form_Name,
            timestamp: new Date(),
            description: description,
            paramarray: right,
        }
        console.log(data_collected)
        await Axios({
            method: "POST",
            url: "/access/create",
            withCredentials: true,
            data: data_collected
        })
            .then(res => {
                alert("Dataform Created")
                window.location = `${process.env.REACT_APP_URL_PREFIX}/admindashboard/dataforms`;
            })
            .catch(err => {
                alert("Not Authorized Login Again")
                window.location = `${process.env.REACT_APP_URL_PREFIX}/admin`;
            })
    }
    const handleChange2 = (event) => {
        console.log(event.target.value)
        setDriveId(event.target.value);
    };
    const customList = (title, items) => (
        <Card>
            <CardHeader
                className={classes.cardHeader}
                avatar={
                    <Checkbox
                        onClick={handleToggleAll(items)}
                        checked={numberOfChecked(items) === items.length && items.length !== 0}
                        indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
                        disabled={items.length === 0}
                        inputProps={{ 'aria-label': 'all items selected' }}
                    />
                }
                title={title}
                subheader={`${numberOfChecked(items)}/${items.length} selected`}
            />
            <Divider />
            <List className={classes.list} dense component="div" role="list">
                {items.map((value) => {
                    const labelId = `transfer-list-all-item-${value}-label`;
                    return (
                        <ListItem key={value} role="listitem" button onClick={handleToggle(value)}>
                            <ListItemIcon>
                                <Checkbox
                                    checked={checked.indexOf(value) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText id={value} primary={value} />
                        </ListItem>
                    );
                })}
                <ListItem />
            </List>
        </Card>
    );
    return (
        <>
            <div className="df-title">Add Dataform</div>
            <div className="df-subtitle">Form Essentials</div>
            <div className="df-description" >Fill the listed fields which will help you to identify this form later</div>
            <div className="df-form-ess">
                <Grid container spacing={5}>
                    <Grid item xs={4}>
                        <TextField id="outlined-basic" fullWidth name="form_name" onChange={(e) => setFormName(e.target.value)} label="Form Name" variant="outlined" />
                    </Grid>
                    {/* <Grid item xs={6}>
                <FormControl variant="outlined" fullWidth>
                    <InputLabel id="demo-simple-select-outlined-label">Drive Name</InputLabel>
                    <Select
                        labelId="demo-simple-select-outlined-label"
                        id="demo-simple-select-outlined"
                        fullWidth
                        name="medical_assist"
                        variant="outlined"
                        value={drive_id}
                        onChange={handleChange2}
                        label="Drive Name"
                    >
                        {
                            drive_list.map(r =>(
                                <MenuItem value={r.id}>{r.drive_name}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
                </Grid> */}
                    <Grid item xs={8}>
                        <TextField id="outlined-basic-large" fullWidth name="description" onChange={(e) => setDes(e.target.value)} label="Description" variant="outlined" />
                    </Grid>
                </Grid>
            </div>
            <div className="df-subtitle">Add fields</div>
            <div className="df-description" >Choose the listed fields which will be the part of form created</div>
            <div style={{ paddingLeft: "3%" }}>
                <Grid
                    container
                    spacing={2}
                    justifyContent="center"
                    alignItems="center"
                    className={classes.root}
                >
                    <Grid item xs={5}>{customList('Choices', left)}</Grid>
                    <Grid item xs={2}>
                        <Grid container direction="column" alignItems="center">
                            <Button
                                variant="outlined"
                                size="small"
                                className={classes.button}
                                onClick={handleCheckedRight}
                                disabled={leftChecked.length === 0}
                                aria-label="move selected right"
                            >
                                &gt;
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                className={classes.button}
                                onClick={handleCheckedLeft}
                                disabled={rightChecked.length === 0}
                                aria-label="move selected left"
                            >
                                &lt;
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid item xs={5}>{customList('Chosen', right)}</Grid>
                </Grid>
            </div>
            <br />
            <Grid container spacing={5}>
                <Grid item xs={1}>
                </Grid>
                <Grid item xs={3}>
                    <Button variant="contained" fullWidth color="primary" onClick={create_form} startIcon={<CreateOutlinedIcon />}> Create </Button>
                </Grid>
                <Grid item xs={4}>
                </Grid>
                <Grid item xs={3}>
                    <Button variant="contained" fullWidth color="secondary" onClick={discard_form} startIcon={<ClearOutlinedIcon />}> Discard </Button>
                </Grid>
                <Grid item xs={1}>
                </Grid>
            </Grid>
        </>
    );
}

class AddDataForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: [],
            nodes2: [],
            checked: [],
            expanded: [],
            form_name: '',
            description: '',
            tree: [],
            titles: [],
            selected_fields: [],
            load: "Loading...",
            loader: "true",
            Treedata: [],
        }
        this.onCheck = this.onCheck.bind(this);
        this.onExpand = this.onExpand.bind(this);
        this.preview_form = this.preview_form.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }
    handleChange = (name, val) => {
        if (name === "form_name") this.setState({ form_name: val })
        else this.setState({ description: val })
    };

    preview_form = () => {

    }
    onCheck(checked) {
        this.setState({ checked: checked });
    }
    onExpand(expanded) {
        this.setState({ expanded: expanded });
    }
    async componentDidMount() {
        var tt = await Axios.get("/access/metadata")
        if (!tt.data.data) {
            alert("Fault in MetaData");
            window.location = `${process.env.REACT_APP_URL_PREFIX}/admin`;
        }
        this.setState({ TreeData: tt.data.data })
        var user = ""
        await Axios({
            method: "GET",
            url: "/admin/user",
            withCredentials: true
        })
            .then(res => {
                user = res.data;
                this.setState({ user: user, org_id: user.msg.org_id })
            })
            .catch(err => {
                alert("Not Authorized Login Again")
                window.location = `${process.env.REACT_APP_URL_PREFIX}/admin`;
            })
        var drivelist = ""



        let nodes = [];
        let nodes2 = [];
        for (let x in this.state.TreeData) {
            let c = {
                value: "",
                label: "",
            }
            c.value = x
            c.label = x
            nodes.push(c)
            nodes2.push(x)
        }
        this.setState({ nodes: nodes })
        this.setState({ nodes2: nodes2 })
        console.log(nodes)
        this.setState({ load: '' })
    }
    render() {
        return (
            <>
                <div className="dataform">
                    <div className='df-create-section'>
                        <div className='df-form-gen'>
                            <br />
                            <div style={{ paddingLeft: "6%" }}>
                                {
                                    this.state.load === "Loading..." ? <CircularProgress /> : <TransferList props={this.state.nodes2} />
                                }
                            </div>
                        </div>

                    </div>
                    <div className="df-end" ></div>
                    <div className="df-footer" ></div>
                </div>
            </>
        );
    }
}

export default AddDataForm;
