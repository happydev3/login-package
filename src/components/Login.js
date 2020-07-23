import React, { useContext } from 'react';
import { Row, Col, Alert, Form, Button, Spinner, Modal } from 'react-bootstrap';
import PerfectScrollbar from 'react-perfect-scrollbar'
import { FormattedMessage } from 'react-intl';
import { injectIntl } from 'react-intl';
import Axios from 'axios';
import { Context } from './Wrapper';

const LoadingSpinner = () => {
    return (
        <div className="spinner-container">
            <Spinner animation="border" className="spinner"/>
        </div>
    )
}

const LangSelector = () => {
    const context = useContext(Context);
    return (
        <select value={context.locale} onChange={context.selectLang} >
            <option value="en-US">English</option>
            <option value="es-MX">Spanish</option>
            <option value="pt-BR">Portuguese</option>
        </select>
    )
}

class TimeAlertModal extends React.Component {

    render() {
        return (
            <Modal
                {...this.props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Access Time
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        You are trying to log in outside the allowed hours. Please contact your guardian.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={this.props.onHide}>OK</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

class TermsModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isCheck: false
        }
    }

    componentDidMount() {

    }

    onHandleSubmit = () => {
        Axios.post(`https://api.xpto.ninja/v1/terms/accept/1`, {}, {
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + window.localStorage.getItem('jwt')
            }
        }).then(({data}) => {
            console.log(data);
            if(data.success) {
                window.localStorage.setItem('jwt', data.data.token)
                this.props.onHide();
                console.log(' *********** login successfully ********', data.data.token);
            }
        }).catch((err) => {console.log('error : ', err)})
    }

    render() {
        const { isCheck } = this.state;
        return (
            <Modal
                {...this.props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Privacy Policy and Terms of Service
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <PerfectScrollbar>
                        <div style={{maxHeight: '400px'}}>
                            <p dangerouslySetInnerHTML={{__html: this.props.terms.content}} />
                        </div>
                    </PerfectScrollbar>
                </Modal.Body>
                <Modal.Footer className="terms-footer">
                    <div className="accept-checkbox">
                        <input type="checkbox" name="accept" id="accept" onChange={(event) => { this.setState({ isCheck: true }) }}/>
                        <label htmlFor="accept">I accpet the privacy policy and terms of use</label>
                    </div>
                    <div>
                        <Button onClick={this.props.onHide} variant="light">Back</Button>
                        <Button onClick={this.onHandleSubmit} disabled={!isCheck}>Agree</Button>
                    </div>
                </Modal.Footer>
            </Modal>
        );
    }
}

class SessionAlertModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            terms: {}
        }
    }

    onHandleSubmit = () => {
        const { account, username, password } = this.props.credential;
        Axios.post(`https://api.xpto.ninja/v1/users/token`, {
            "account": account,
            "username": username,
            "password": password,
            "force": 1
        }, { headers: { 'Accept': 'application/json' } })
            .then(({ data }) => {
                this.props.onHide();
                console.log(data);
                const { success } = data;
                if(success) {
                    window.localStorage.setItem('jwt', data.data.token);
                    if(data.data.fail === 'terms') {
                        this.props.getTerms(data.data.token)
                        this.props.opentermsmodal();
                    } else {
                        console.log(' ******* login successfully *********')
                    }
                }
        })
        .catch(err => {
            console.error(" error after modal confirm ----", err);
        });
    }

    render() {
        return (
            <Modal
                {...this.props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                            Session in Progress
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        There is another session in progress with this user. If you continue, the session will be terminated. Do you want to end the other session?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onHide} variant="light">Close</Button>
                    <Button onClick={this.onHandleSubmit}>Confirm</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

class NetworkAlertModal extends React.Component {

    render() {
        return (
            <Modal
                {...this.props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Network Not Allowed
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        You are trying to log into a network without permission. Please contact your guardian.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={this.props.onHide}>OK</Button>
                </Modal.Footer>
            </Modal>
        );
    }

}

class ConfirmCheckCodeModal extends React.Component {
    render() {
        return (
            <Modal
            {...this.props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter">
                {this.props.isResend ? 'Code Resend' : 'Code Sent'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                {
                    this.props.isResend
                    ? `We resend the code to the number ${this.props.account ? this.props.account : ''}. Please check your inbox.`
                    : `We send the code to reset the password via SMS to the registered number. Check the inbox of the number ${this.props.account ? this.props.account : ''}`
                }

              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.props.onHide}>OK</Button>
            </Modal.Footer>
          </Modal>
        );
    }
}

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLogin: true,
            validated: true,
            account: '',
            username: '',
            password: '',
            isSessionModal: false,
            isTermsModal: false,
            loginInvalid: true,
            loading: false,
            terms: {},
            isNetworkModal: false,
            isTimeModal: false,
            isResetPassword: false,
            isForgotPassword: false,
            checkCode: '' ,
            confirmPassword: '',
            confirmCodeModal: false,
            token: '',
            url: '',
            isMatchPassword: true,
            inValidCode: true,
            isResend: false,
            isShownPassword: true,
            isShownConfirmPassword: true
        }
    }

    handleSubmit = (event) => {
        this.loadingSet(true);
        event.preventDefault();
        const { account, username, password } = this.state;
        Axios.post(`https://api.xpto.ninja/v1/users/token`, {
            "account": account,
            "username": username,
            "password": password,
        }, { headers: { 'Accept': 'application/json' } })
            .then(({ data }) => {
                this.loadingSet(false);
                const { fail, token } = data.data;
                if (data.success && token === "" && fail && fail === "session") {
                    this.setState({ isSessionModal: true });
                } else if (data.success && token) {
                    window.localStorage.setItem('jwt', token);
                    if(data.data.fail === 'terms') {
                        this.setIsTermsModal(true);
                        this.getTerms(data.data.token)
                    } else {
                        console.log(' *** success Login *****');
                    }
                }
            })
            .catch(err => {
                if(err.response.status === 401) {
                    console.log(err.response.status)
                    this.setLoginInvalid(true);
                } else if(err.response.status === 403 && err.response.data.data.message === 'network not allowed') {
                    console.log(err.response.data.data.message)
                    this.setNetworkAlertModal();
                } else if(err.response.status === 403 && err.response.data.data.message === 'time not allowed') {
                    console.log(err.response.data.data.message)
                    this.setTimeAlertModal();
                }
                this.loadingSet(false);
            })
    }

    moveReset = () => {
        const { account, username } = this.state;
        if (account !== '' && username !== '') {
            this.loadingSet(true);
            this.setValidated(true);
            const reqData = { account, username }
            Axios.post(`https://api.xpto.ninja/v1/users/recover`, reqData, {
                headers: {
                    'Accept': 'application/json'
                }
            }).then(({ data: { success } }) => {
                this.loadingSet(false);
                if (success) {
                    this.setState({
                        isLogin: false,
                        account: account,
                        username: username,
                        confirmCodeModal: true
                    })
                }
            }).catch((err) => {
                console.error('err: ', err)
            });
        } else {
            this.loadingSet(false);
            this.setValidated(false);
        }
    }

    getTerms = (token) => {
        Axios.get(`https://api.xpto.ninja/v1/terms/1` , {
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            }
        }).then(({data}) => {
            if(data.success) {
                this.setState({ terms: data.data })
            }
        }).catch((err) => { console.log('error : ', err)});
    }

    resetPassword = (event) => {
        event.preventDefault();
        const { password, confirmPassword, url, token } = this.state;
        if(password !== confirmPassword) {
            this.setState({
                isMatchPassword: false
            })
        } else {
            this.loadingSet(true);
            Axios.put('https://api.xpto.ninja' + url, {password}, {
                headers: {
                    'Accept': 'application/json',
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + token
                }
            }).then((res) => {
                this.loadingSet(false);
                if(res.data.success) {
                    this.setIsLogin(true);
                }
            }).catch((err) => {
                this.loadingSet(false);
                console.error('error : ', err)
            });
        }
    }

    checkCode = (event) => {
        event.preventDefault();
        this.loadingSet(true);
        const { account, checkCode } = this.state;
        const reqData = {
            account: account,
            code: checkCode
        }
        Axios.post(`https://api.xpto.ninja/v1/users/check-code`, reqData, {
            headers: {
                'Accept': 'application/json'
            }
        }).then((res) => {
            this.loadingSet(false);
            if(res.data.success) {
                this.setState({
                    isForgotPassword: true,
                    token: res.data.data.token,
                    url: res.data.data.url
                });
            }
        }).catch((err) => {
            this.setState({
                inValidCode: false,
                loading: false
            });
            console.error('err: ', err)
        });
    }

    sendAgain = () => {
        this.loadingSet(true);
        const { account, username } = this.state;
        const reqData = { account, username }
        Axios.post(`https://api.xpto.ninja/v1/users/recover`, reqData, {
            headers: {
                'Accept': 'application/json'
            }
        }).then(({ data }) => {
            this.loadingSet(false);
            this.setState({
                confirmCodeModal: true,
                isResend: true
            })
        }).catch((err) => console.error('err: ', err));

    }

    togglePasswordVisibility = () => {
        const { isShownPassword } = this.state;
        this.setState({ isShownPassword: !isShownPassword });
    }

    componentDidMount() {
    }

    loadingSet = (value) => {
        this.setState({
            loading: value
        })
    }

    setValidated = (value) => {
        this.setState({
            validated: value
        })
    }

    setIsTermsModal = (value) => {
        this.setState({
            isTermsModal: value
        })

    }

    setLoginInvalid = () => {
        this.setState({
            loginInvalid: false
        })
    }

    setNetworkAlertModal = () => {
        this.setState({
            isNetworkModal: true
        })
    }

    setTimeAlertModal = () => {
        this.setState({
            isTimeModal: true
        })
    }

    loadingSet = (value) => {
        this.setState({
            loading: value
        })
    }

    togglePasswordVisibility = () => {
        const { isShownPassword } = this.state;
        this.setState({ isShownPassword: !isShownPassword });
    }

    toggleConfirmPasswordVisibility = () => {
        const { isShownConfirmPassword } = this.state;
        this.setState({ isShownConfirmPassword: !isShownConfirmPassword });
    }

    setIsLogin = (value) => {
        this.setState({ isLogin : value })
    }

    render() {
        const { intl } = this.props;
        const {
            isLogin,
            validated,
            account,
            username,
            password,
            isShownPassword,
            isSessionModal,
            isTermsModal,
            loginInvalid,
            loading,
            terms,
            isNetworkModal,
            isTimeModal,
            isForgotPassword,
            checkCode,
            confirmPassword,
            confirmCodeModal,
            isMatchPassword,
            inValidCode,
            isResend,
            isShownConfirmPassword
        } = this.state;
        return (
            <div>
                <div className="login-wrapper">
                    <div className="login-container">
                        <Row>
                            <Col md={6}>
                                <div className="login-bg">
                                    <div className="text-center login-text">
                                        <h2 className="bg-text-header">Lorem Ipsum</h2>
                                        <p className="bg-text-content">
                                            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
                                        </p>
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                {
                                    loading
                                    ? <LoadingSpinner />
                                    :
                                    <div>
                                        <div className="mt-2 mr-2 float-right langselector">
                                            <LangSelector />
                                        </div>
                                        {
                                            isLogin
                                            ?
                                            <div class="forms">
                                                <div className="login-form">
                                                    <h2 className="login-form-header pb-5"><FormattedMessage id="login"/></h2>
                                                    <div>
                                                        <Alert variant="danger" style={{ display: `${validated ? 'none' : 'block'}` }}>
                                                            <FormattedMessage id="forgot.invalid.data"/>!
                                                        </Alert>
                                                        <Alert variant="danger" style={{ display: `${loginInvalid ? 'none' : 'block'}` }}>
                                                        <FormattedMessage id="login.invalid.data"/>!
                                                        </Alert>
                                                        <Form onSubmit={this.handleSubmit}>
                                                            <Form.Group controlId="formBasicContactId">
                                                                <Form.Label className="font-weight-bold"><FormattedMessage id="contractor"/></Form.Label>
                                                                <Form.Control
                                                                    className={validated ? 'black-border' : 'red-border'}
                                                                    type="text"
                                                                    placeholder={intl.formatMessage({id: "login.contractor.placeholder"})}
                                                                    name="account"
                                                                    value={account}
                                                                    onChange={event => { this.setState({ account: event.target.value }) }}
                                                                />
                                                            </Form.Group>

                                                            <Form.Group controlId="formBasicName">
                                                                <Form.Label className="font-weight-bold"><FormattedMessage id="username"/></Form.Label>
                                                                <Form.Control
                                                                    className={validated ? 'black-border' : 'red-border'}
                                                                    type="text"
                                                                    placeholder={intl.formatMessage({id: "login.username.placeholder"})}
                                                                    name="username"
                                                                    value={username}
                                                                    onChange={event => { this.setState({ username: event.target.value }) }}
                                                                />
                                                            </Form.Group>

                                                            <Form.Group controlId="formBasicPassword">
                                                                <Form.Label className="font-weight-bold"><FormattedMessage id="password"/></Form.Label>
                                                                <Form.Control
                                                                    type={isShownPassword ? "text" : "password"}
                                                                    placeholder={intl.formatMessage({id: "login.password.placeholder"})}
                                                                    name="password"
                                                                    value={password}
                                                                    onChange={event => { this.setState({ password: event.target.value }) }}
                                                                />
                                                                <i
                                                                    className={`fa ${isShownPassword ? 'fa-eye-slash' : 'fa-eye'} password-icon`}
                                                                    aria-hidden="true"
                                                                    onClick={this.togglePasswordVisibility}
                                                                />
                                                            </Form.Group>

                                                            <Form.Group controlId="formBasicCheckbox" className="check-box">
                                                                <Form.Check type="checkbox" label={<FormattedMessage id="remind"/>} />
                                                                <p className="forget-link" onClick={this.moveReset}><FormattedMessage id="forget"/>?</p>
                                                            </Form.Group>

                                                            <Button className="w-100" variant="primary" type="submit" disabled={account !== '' && username !== '' && password !== '' ? false : true}>
                                                                <FormattedMessage id="enter"/>
                                                            </Button>
                                                        </Form>
                                                    </div>
                                                </div>
                                            </div>
                                            :
                                            <div>
                                                <div className="reset-form">
                                                    <div className="reset-form-header pb-5">
                                                        <h2><FormattedMessage id="reset.password"/></h2>
                                                        {
                                                            !isForgotPassword
                                                            ? <p><FormattedMessage id="reset.password.description"/></p>
                                                            : null
                                                        }
                                                    </div>
                                                    {
                                                        isForgotPassword
                                                        ?
                                                        <div>
                                                            <Alert variant="danger" style={{display: `${isMatchPassword ? 'none' : 'block'}`}}>
                                                                <FormattedMessage id="reset.confirm.match"/>!
                                                            </Alert>
                                                            <Form onSubmit={this.resetPassword}>
                                                                <Form.Group controlId="formBasicContactId">
                                                                    <Form.Label className="font-weight-bold"><FormattedMessage id="reset.newpassword"/></Form.Label>
                                                                    <Form.Control
                                                                        type={isShownPassword ? "text" : "password"}
                                                                        placeholder="Enter the Code"
                                                                        name="password"
                                                                        value={password}
                                                                        onChange={event => { this.setState({password: event.target.value})}}
                                                                    />
                                                                    <i
                                                                        className={`fa ${isShownPassword ? 'fa-eye-slash' : 'fa-eye'} password-icon`}
                                                                        aria-hidden="true"
                                                                        onClick={this.togglePasswordVisibility}
                                                                    />
                                                                </Form.Group>
                                                                <Form.Group controlId="formBasicContactId">
                                                                    <Form.Label className="font-weight-bold"><FormattedMessage id="reset.confirmpassword"/></Form.Label>
                                                                    <Form.Control
                                                                        type={isShownConfirmPassword ? "text" : "password"}
                                                                        placeholder="Enter the Code"
                                                                        name="confirmPassword"
                                                                        value={confirmPassword}
                                                                        onChange={event => { this.setState({confirmPassword: event.target.value})}}
                                                                    />
                                                                    <i
                                                                        className={`fa ${isShownConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} password-icon`}
                                                                        aria-hidden="true"
                                                                        onClick={this.toggleConfirmPasswordVisibility}
                                                                    />
                                                                </Form.Group>
                                                                <Button className="w-100" variant="primary" type="submit" disabled={password !== '' && confirmPassword !== '' ? false : true}>
                                                                    <FormattedMessage id="enter" />
                                                                </Button>
                                                            </Form>
                                                        </div>
                                                        :
                                                        <div>
                                                            <Alert variant="danger" style={{ display: `${inValidCode ? 'none' : 'block'}` }}>
                                                                <FormattedMessage id="reset.invalid.code"/>!
                                                            </Alert>
                                                            <Form onSubmit={this.checkCode}>
                                                                <Form.Group controlId="formBasicContactId">
                                                                    <Form.Label className="font-weight-bold"><FormattedMessage id="reset.code"/></Form.Label>
                                                                    <Form.Control
                                                                        type="text"
                                                                        placeholder="Enter the Code"
                                                                        name="checkCode"
                                                                        value={checkCode}
                                                                        onChange={event => { this.setState({checkCode: event.target.value})}}
                                                                    />
                                                                </Form.Group>
                                                                <Button className="w-100" variant="primary" type="submit" disabled={checkCode !== ''  ? false : true}>
                                                                    <FormattedMessage id="reset.confirm"/>
                                                                </Button>
                                                                {
                                                                    inValidCode
                                                                    ? null
                                                                    : <p className="text-center mt-3"><FormattedMessage id="reset.check.code"/>? <span className="resend-code" onClick={this.sendAgain}>Send again</span></p>
                                                                }
                                                            </Form>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        }

                                    </div>
                                }
                            </Col>
                        </Row>
                    </div>
                </div>

                <SessionAlertModal
                    show={isSessionModal}
                    opentermsmodal={() => this.setState({ isTermsModal: true })}
                    getTerms={(token) => this.getTerms(token)}
                    onHide={() => { this.setState({ isSessionModal: false }) }}
                    credential={{
                        account: account,
                        username: username,
                        password: password
                    }}
                />

                <TermsModal
                    terms={terms}
                    show={isTermsModal}
                    onHide={() => { this.setState({ isTermsModal: false }) }}
                />

                <NetworkAlertModal
                    show={isNetworkModal}
                    onHide={() => { this.setState({ isNetworkModal: false }) }}
                />

                <TimeAlertModal
                    show={isTimeModal}
                    onHide={() => { this.setState({ isTimeModal: false }) }}
                />

                <ConfirmCheckCodeModal
                    show={confirmCodeModal}
                    onHide={() => {this.setState({confirmCodeModal: false})}}
                    account={account}
                    isResend={isResend}
                />

            </div>
        )
    }
}

export default injectIntl(Login)


